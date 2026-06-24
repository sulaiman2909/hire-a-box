# Hire A Box — Developer Trial: Technical Implementation Notes

## 1. Architectural Guiding Principle: Domain Isolation Pattern
The core architectural philosophy is strict Domain-Driven Design (DDD) isolation. In many Next.js applications, business logic becomes tightly coupled to Server Actions or React Components. To ensure testability and maintainability, I instituted a strict boundary:

**The Pattern:**
- `src/lib/domain/`: Contains 100% of the business logic (`allocation.ts`, `pricing.ts`, `deposits.ts`). These are pure, framework-agnostic TypeScript functions. They do not know about HTTP requests, Next.js, or React. They take typed inputs and return deterministic outputs or throw typed errors.
- `src/app/actions/`: The Next.js translation layer. Server Actions (e.g., `createOrder.ts`) simply parse FormData, authenticate the user session, call the pure domain functions, and return serialized JSON.
- `src/components/`: The UI layer. Purely responsible for rendering state and triggering server actions.

*Why this matters:* A reviewing developer can open `tests/domain/allocation.test.ts` and test the entire postcode routing and slot availability engine in milliseconds using Vitest, without needing to spin up a mock Next.js server or mock the `headers()` object.

## 2. Exact Database Schema & Relational Design
The database was modeled in PostgreSQL via Prisma to enforce strict relational integrity. The schema is highly normalized to prevent data anomalies during high-concurrency checkout events.

**Core Entities & Relationships:**
- `Order` & `OrderItem`: One-to-Many. The `Order` table acts as the financial source of truth, storing `grandTotal`, `depositTotal`, and `amountPaid` as `Decimal` types to prevent floating-point precision loss. It uses a discriminated column `type` (`HIRE` vs `BUY`).
- `Product` & `PackageItem`: Many-to-Many via explicit join table (`PackageItem`). Packages (e.g., "1 Bedroom Package") resolve to core products (boxes, tape) dynamically, enabling accurate per-unit deposit calculations without duplicating product data.
- `Driver`, `PostcodeMapping`, & `DriverAvailability`: A `Driver` has a One-to-Many relationship with `PostcodeMapping` (defining their service zone) and a One-to-Many relationship with `DriverAvailability` (defining their calendar slots).
- `DepositResolution`: One-to-Many with `Order`. Provides an immutable, append-only ledger for deposit refunds and forfeitures, tracking exactly how much of a liability has been resolved.

## 3. Performance Optimizations & N+1 Elimination
During development, a critical performance bottleneck was identified in the Operations Dashboard: the calculation of historical revenue and outstanding liabilities.

**The Problem (N+1 Memory Bloat):**
The initial naive approach fetched every non-cancelled order into the Node.js runtime memory (`await prisma.order.findMany()`) to run a JavaScript `reduce()` loop to calculate total revenue. At 10,000+ orders, this would exhaust Vercel Serverless memory limits and cause massive latency.

**The Optimization:**
I refactored the data-fetching layer to utilize database-engine mathematical aggregations:
```typescript
const financials = await prisma.order.aggregate({
  where: { status: { not: 'CANCELLED' } },
  _sum: { grandTotal: true, amountPaid: true }
});
```
This shifts the O(N) computational complexity from the Node.js server down to the PostgreSQL engine, which computes the sum natively via internal indices and returns an O(1) JSON object. For historical trend graphs, the `findMany` query was aggressively time-bounded to only fetch the trailing 14 days of data, capping the maximum memory footprint regardless of database age.

## 4. Concurrency & Race Condition Handling
Handling inventory and booking slots requires strict concurrency control.
- **Current Mitigation:** When an order is placed, the `allocateDriver` function checks availability. If two users click 'Checkout' on the exact same millisecond for the final slot, the Prisma transaction isolates the check. If the slot is claimed mid-transaction, the system catches the failure, accepts the financial payment, but safely flags the order as `UNALLOCATED` in the dashboard rather than throwing a 500 Server Error to the customer.
- **Future Production Hardening:** For a high-scale production rollout, this should be hardened using explicit pessimistic row-level locking (`SELECT ... FOR UPDATE` via `$queryRaw`) on the `DriverAvailability` record to serialize concurrent checkout requests and guarantee no overbooking is physically possible.

## 5. Security Vectors Mitigated
- **SQL Injection:** All inputs are passed through Prisma's query builder, which intrinsically parameterizes statements, neutralizing SQLi vectors.
- **Cross-Site Request Forgery (CSRF):** Next.js Server Actions enforce strictly validated `Origin` and `Host` headers automatically on all POST mutations.
- **Authentication:** Admin routes are secured using Auth.js with HTTP-only, secure JWT session cookies. Passwords in the database are hashed via `bcrypt`.
- **Payment Compliance:** The mock eWay gateway enforces algorithmic validation (Luhn check) on the client, deliberately ensuring raw PAN/CVV data is never serialized or transmitted to the database, mimicking a true PCI-compliant iframe architecture.

## 6. Technical Stack Selection
- **Next.js (App Router):** Selected for its unified Server Components / Server Actions paradigm, allowing seamless RPC-style communication between client and database without the latency and maintenance overhead of a decoupled Express backend.
- **TypeScript (Strict Mode):** Mandatory for a system handling financial calculations and complex relational data. Type safety prevents runtime errors during order serialization.
- **Neon Serverless PostgreSQL:** Selected for its transactional integrity (ACID compliance required for order/allocation commits) and compatibility with Vercel's serverless edge functions via connection pooling (`?pgbouncer=true`).
- **Vitest:** Chosen over Jest for native ESM and TypeScript support, enabling blazing-fast unit testing of the domain layer without brittle Babel/ts-jest configurations.

## 7. Beyond Scope Engineering
*   **Gateway Simulation:** Engineered a mock payment gateway that deliberately injects randomized network latency and a 5% failure rate to rigorously test UI loading states and error boundary handling.
*   **Fault-Tolerant Integrations:** Third-party API calls (Resend) are wrapped in comprehensive `try/catch` blocks ensuring graceful degradation—if the external email server fails, the transaction still commits and the user successfully checks out without seeing an error.
