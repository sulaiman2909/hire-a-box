# Hire A Box — Developer Trial: Notes, Reasoning & Assumptions

## 1. Guiding Principle
The core philosophy driving this implementation was to build a system optimized for maintainability and transferability. The architecture strictly isolates complex business logic from the UI layer, ensuring that a new developer inheriting the codebase can easily locate, test, and modify core rules without unraveling tangled components. I prioritized clean, self-documenting code and standard Next.js conventions over premature optimization.

## 2. How I Met the Four Non-Negotiables
1. **Customer places an order:** The customer flow is fully implemented across `/hire` and `/buy`, culminating in a checkout process (`src/components/customer/CheckoutClient.tsx`) that creates a comprehensive order record via `src/app/actions/createOrder.ts`.
2. **Order lands in the backend:** All orders immediately appear on the secure Admin Dashboard (`/admin/orders`) and are stored reliably in the Neon Postgres database.
3. **Auto-allocated by postcode:** The system uses the business rules in `src/lib/domain/allocation.ts` to automatically assign the order to an available driver based on the delivery postcode mapping and current slot capacity.
4. **Emails client + driver:** The `sendOrderConfirmationEmail` and `sendDriverAllocationEmail` functions (in `src/lib/domain/emails.ts`) automatically trigger via Resend upon successful checkout, notifying both parties.

## 3. How I Approached the Week (Day 1–7)
*   **Days 1-2 (Foundation):** Designed the database schema in Prisma to accommodate complex relationships (Orders, Drivers, Availabilities, Postcode Mappings) and set up the Next.js App Router boilerplate.
*   **Days 3-4 (Domain Logic & Customer Flow):** Built the pure TypeScript domain functions (pricing, deposits, allocation) and wrapped them in a comprehensive unit test suite. Developed the customer-facing storefront and segmented cart.
*   **Days 5-6 (Operations & Admin):** Built the secure admin dashboard, including order management, calendar views, and complex state changes (re-allocation, deposit resolution).
*   **Day 7 (Polish & Deploy):** Conducted full end-to-end testing, handled edge cases (e.g., eWay refund mocks, mobile responsiveness), finalized documentation, and deployed to Vercel.

## 4. How I Used AI (Workflow & Disclosure)
I utilized the Antigravity AI coding assistant to accelerate the implementation of boilerplate code, UI scaffolding, and test generation. My workflow involved explicitly defining the architecture, domain logic, and required edge cases first, and then using the AI to execute the coding tasks in reviewable chunks. I reviewed, verified, and manually tested all AI outputs to ensure they adhered to the business rules. This allowed me to deliver a robust prototype quickly while maintaining complete understanding and control of the codebase.

## 5. Tech Stack & Why
*   **Next.js (App Router):** Provides a robust full-stack framework with built-in API routes and server actions, allowing for a cohesive codebase without needing a separate backend repository.
*   **TypeScript:** Enforces strict typing, drastically reducing runtime errors and improving developer experience, especially when dealing with complex data models like orders and allocations.
*   **Prisma:** A type-safe ORM that makes interacting with the database intuitive and secure, preventing SQL injection by design.
*   **Neon Postgres:** A serverless PostgreSQL provider that pairs perfectly with Vercel, offering excellent performance and scalability.
*   **NextAuth.js (Auth.js):** Provides secure, industry-standard authentication for the admin portal.
*   **Resend:** A modern, developer-friendly email API for reliable transactional email delivery.
*   **Tailwind CSS:** Enables rapid, consistent UI development without context switching between CSS files.
*   **Vercel:** Offers seamless, zero-config deployment optimized specifically for Next.js applications.
*   **Why not WordPress/PHP?** While WordPress is great for content-heavy sites, a custom logistics and order management platform requires complex, custom database relationships, strict typing, and specialized API interactions that become difficult to maintain securely within the constraints of WordPress plugins and PHP themes.

## 6. Architecture & Structure (Maintainability)
The architecture isolates pure domain logic into the `src/lib/domain/` directory (e.g., `allocation.ts`, `pricing.ts`, `deposits.ts`). This means the core business rules are decoupled from React components and the database layer, making them easy to unit test and modify. Server components handle read operations for fast rendering, while Server Actions (in `src/app/actions/`) handle mutations, keeping the UI layer thin. The same `allocateDriver` function is used for both new customer checkouts and manual admin re-assignments, ensuring a single source of truth for availability.

## 7. Testing — What I Chose to Test & Why
I focused my automated testing efforts heavily on the most complex and critical business logic:
*   **Allocation (`tests/domain/allocation.test.ts`):** I wrote extensive tests covering edge cases for driver availability, postcode mapping, and multi-driver priority sorting to ensure orders are never assigned to unavailable or incorrect drivers.
*   **Pricing and Deposits (`tests/domain/pricing.test.ts`):** I verified that cart totals, promotional discounts, and refundable deposit calculations are pixel-perfect, as financial correctness is non-negotiable.
I prioritized these pure domain functions over brittle UI tests, as they represent the core intellectual property and risk areas of the application.

## 8. Assumptions Log
*   **Allocation & Slots:** Assumed one delivery per driver, per date, per slot. If a single-driver city (like Perth) has no availability, the system gracefully leaves the order 'Unallocated' for admin intervention rather than failing the checkout. Postcode ranges (e.g., 2000-2999) accurately map to drivers.
*   **Hire vs Buy & Deposits:** Assumed "Hire" orders require the customer to be in the same city as the depot to facilitate return pickups. Deposits are strictly tracked as liabilities, not revenue, until explicitly forfeited by an admin. "Buy" orders share the same local service areas (no postal shipping implemented for this prototype).
*   **Cart & Checkout:** Assumed users should have segmented carts (Hire vs. Buy) to prevent conflicting checkout requirements. Added Next-Day delivery as the earliest possible date to prevent logistical impossibilities. Implemented the brief's $65/$99 free delivery thresholds and assumed a standard $35 delivery fee otherwise.
*   **Operations:** Assumed order contents are immutable once placed to maintain strict audit trails; any changes require a partial refund or top-up payment. Manual admin allocations deliberately bypass capacity checks to allow for edge-case overrides.
*   **Payment & Scope:** Assumed the payment gateway (mocked eWay) handles the actual PCI compliance. The system validates the Luhn algorithm but never stores raw credit card data. Out-of-scope items (like complex multi-state logistics) were noted but excluded per the brief.
*   **Data:** Used placeholder data for product dimensions and specific deposit values (e.g., Porta-Robe) to facilitate a working prototype. Added logging for unserviceable postcodes to inform future expansion.

## 9. Backup & Recovery
In a production deployment, the Neon PostgreSQL database handles backups automatically. Neon utilizes a point-in-time recovery (PITR) system, continuously backing up the write-ahead log (WAL). This allows the database to be restored to any exact second within the retention window (typically 7-30 days). A restore involves spinning up a new branch from the specified timestamp, minimizing downtime.

## 10. Security — What's Handled & How
*   **Admin Auth:** Handled via Auth.js with bcrypt-hashed passwords in the database (`src/auth.ts`).
*   **Secrets:** All sensitive keys (DB, email) are stored in secure environment variables, with only a safe `.env.example` committed to version control.
*   **Injection:** Prisma ORM automatically parameterizes all queries, neutralizing SQL injection vectors.
*   **XSS:** React automatically escapes all rendered variables, preventing Cross-Site Scripting.
*   **HTTPS:** Enforced by Vercel for all traffic in production.
*   **Payment Data:** The mock payment implementation strictly avoids logging or storing any credit card numbers.
*   *(Note: For full production, I would add rate limiting to API routes, CSRF tokens for sensitive mutations, and comprehensive audit logging for admin actions).*

## 11. Hosting & Deployment
The application is deployed on Vercel, providing edge caching and seamless CI/CD. Pushing to the `main` branch automatically triggers a Vercel build and deployment. The database is hosted on Neon (Serverless Postgres). All environment variables (`DATABASE_URL`, `RESEND_API_KEY`, `AUTH_SECRET`) are securely configured within the Vercel project dashboard.

## 12. From Prototype to Production
To transition this prototype to a scalable production system, the first step is swapping the simulated eWay mock for the real eWay SDK, implementing robust webhooks for async payment confirmations. The driver postcode mappings and product catalog need to be migrated from seed data to dynamic admin-manageable tables. For reliability, I would implement a queuing system (like Upstash/Redis) for transactional emails to handle retries gracefully. Concurrency handling on the database level (unique constraints on driver+date+slot) would prevent race conditions during high-traffic checkouts. The current decoupled architecture is specifically designed to absorb these additions without requiring a rewrite.

## 13. If I Had More Time
*   Implement real eWay payment and refund integrations.
*   Build an analytics UI for the "unserviceable postcode" logs to visualize missed sales opportunities.
*   Add comprehensive pagination to the admin order list.
*   Consolidate the various status badge logic into a unified, reusable UI component.
*   Expand the unit test suite to cover all Server Actions.

## 14. Built Out of Curiosity (Beyond Scope)
While building the core requirements, I added a few features that reflect how I think about solving real business problems:
*   **Deposit Forfeit-to-Revenue:** Added a flow to explicitly forfeit damaged box deposits into revenue, complete with a mocked pre-auth capture simulation.
*   **Unserviceable Postcode Logging:** Built a mechanism to track when users check postcodes outside our zones, providing actionable business intelligence for expansion.
*   **Admin Re-allocation:** Implemented a robust UI for admins to override and manually reassign drivers and slots when operational reality dictates.
*   **Resend Graceful Degradation:** Added a fallback interceptor so the application continues to function perfectly even if the 3rd-party email provider API goes down.

## 15. What I Learnt
This project reinforced the critical distinction between "unallocated" (a state requiring human resolution) and "capacity reached" (a state preventing checkout entirely). I learned the importance of explicitly modeling deposits as liabilities rather than standard revenue to keep financial reporting accurate. Working with Next.js Server Actions highlighted the need for careful error handling (returning error objects rather than throwing exceptions) to prevent production UI crashes. Most importantly, I solidified my approach to AI-assisted development: architecting the domain logic first and using AI as an execution engine leads to significantly higher quality code than relying on it for fundamental design decisions.
