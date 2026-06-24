# Hire A Box

## 1. Project Overview
Hire A Box is a modern web application for hiring and buying moving boxes and packing supplies, with free next-day delivery in Sydney, Melbourne, Perth, and Adelaide. 

The application is split into two main experiences:
- **Customer-Facing Ordering Site:** A clean, conversion-optimized storefront where customers can browse box packages or individual items, choose between hiring (with refundable deposits) or buying outright, select a 2-hour delivery window, and complete a simulated checkout process.
- **Ops Backend (Admin):** A secure dashboard for operators to manage incoming orders. It includes automated driver allocation based on delivery postcodes (with failover rules for busy drivers), a calendar view of driver schedules, tools to manually reassign drivers or update delivery details, deposit resolution processing (refund/forfeit), and email resending capabilities.

## 2. Tech Stack
This application is built with a modern, type-safe stack designed for performance, rapid iteration, and serverless deployment:

- **Framework:** [Next.js 16.2.9 (App Router)](https://nextjs.org/) & [React 19.2.4](https://react.dev/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Database ORM:** [Prisma 6.19.3](https://www.prisma.io/)
- **Database:** [PostgreSQL via Neon](https://neon.tech/) (Serverless Postgres with connection pooling)
- **Authentication:** [NextAuth.js / Auth.js (v5 beta)](https://authjs.dev/) for secure admin login via bcrypt
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Email:** [Resend](https://resend.com/) for transactional emails (customer confirmation & driver notifications)
- **Testing:** [Vitest](https://vitest.dev/) for domain business logic
- **Deployment:** Designed for [Vercel](https://vercel.com/)

*Why this stack?* The Next.js App Router pairs seamlessly with Prisma and serverless Postgres (Neon), allowing data-fetching and server actions to happen instantly without a separate backend API. It's the industry standard for modern React applications, making the codebase highly transferable.

## 3. Project Structure
The codebase follows standard Next.js App Router conventions with a strict separation between UI, server actions, and pure domain logic.

```text
hire-a-box/
├── prisma/                 # Database schema (schema.prisma) and seed data script (seed.ts)
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── (customer)/     # Customer-facing storefront pages (hire, buy, checkout)
│   │   ├── admin/          # Ops backend dashboard pages (protected via middleware)
│   │   ├── actions/        # Next.js Server Actions (database mutations, admin ops)
│   │   └── api/            # API Routes (NextAuth configuration)
│   ├── components/         # Reusable React components
│   │   ├── admin/          # Ops dashboard UI components (tables, order details)
│   │   └── customer/       # Storefront UI components (cart, product cards, layout)
│   └── lib/                # Shared utilities and core logic
│       ├── domain/         # Pure business logic (pricing, deposits, driver allocation)
│       ├── email/          # Resend email templates and sending logic
│       └── prisma.ts       # Prisma Client singleton instantiation
├── tests/                  # Vitest test suites covering domain business logic
└── package.json            # Dependencies and NPM scripts
```

## 4. Prerequisites
To run this project locally, you will need:
- **Node.js:** v18 or v20+
- **Package Manager:** npm (or yarn/pnpm)
- **Database:** A [Neon PostgreSQL](https://neon.tech/) database (or any standard Postgres database)
- **Email:** A [Resend](https://resend.com/) account and API Key

## 5. Setup & Installation
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd hire-a-box
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Copy the example environment file and fill in your actual credentials (see section 6).
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations:**
   Push the Prisma schema to your connected database.
   ```bash
   npx prisma db push
   ```

5. **Seed the database:**
   Populate the database with the core catalogue, drivers, time slots, postcode mappings, and the admin user.
   ```bash
   npm run prisma seed
   ```

## 6. Environment Variables
You must configure the following variables in a `.env` file at the root of the project. A `.env.example` file is provided with the required keys.

- `DATABASE_URL`: The pooled connection string for Neon Postgres (used by the Prisma Client for app queries). Must include `&pgbouncer=true`.
  - *Example:* `postgresql://user:pass@ep-cool-db-pooler.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true`
- `DIRECT_URL`: The direct connection string for Neon Postgres (used by Prisma CLI for migrations).
  - *Example:* `postgresql://user:pass@ep-cool-db.region.aws.neon.tech/neondb?sslmode=require`
- `AUTH_SECRET`: A random 32+ character string used by NextAuth to encrypt session cookies.
  - *Example:* `f8a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e`
- `AUTH_URL`: The base URL of the application (required for NextAuth).
  - *Example:* `http://localhost:3000`
- `AUTH_TRUST_HOST`: Required by Auth.js when deployed behind a proxy like Vercel.
  - *Example:* `true`
- `RESEND_API_KEY`: Your API key for sending transactional emails via Resend.
  - *Example:* `re_123456789...`

## 7. Database — Migrations and Seed
**Pushing the schema:**
Whenever you change `prisma/schema.prisma`, sync the database by running:
```bash
npx prisma db push
```

**Seeding the database:**
Run the exact seed command configured in `package.json`:
```bash
npm run prisma seed
```
*What the seed does:*
- Creates the System Admin user.
- Creates 5 mock drivers across Sydney, Melbourne, Perth, and Adelaide.
- Maps hundreds of postcodes to their respective primary drivers.
- Generates available 2-hour time slots for the next 7 days for all drivers.
- Creates the core product catalogue (boxes, tape, accessories) and predefined 1 to 5-bedroom moving packages.

## 8. Running the App
Use the exact npm scripts defined in `package.json`.

**Development Mode:**
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

**Production Build:**
```bash
npm run build
npm run start
```

## 9. Running Tests
The core business logic (pricing calculations, deposit calculations, and driver auto-allocation) is fully unit-tested to ensure resilience.

**Run tests via Vitest:**
```bash
npm run test
```
*Test coverage:* Validates that package hire prices and deposit totals compute correctly, and ensures the auto-allocation logic successfully fails over to backup drivers or correctly flags orders as `UNALLOCATED` when capacity is reached.

## 10. Admin Access
The Ops Backend is protected by NextAuth middleware. 

- **Login URL:** `http://localhost:3000/admin/login`
- **Seeded Admin Email:** `admin@hireabox.com.au`
- **Seeded Admin Password:** `Admin@123`

## 11. Key Features / How it works
- **Hire vs Buy:** Customers can choose to hire boxes (paying a hire fee + refundable deposit) or buy new/used boxes outright. The cart automatically separates and calculates deposits.
- **Driver Auto-Allocation:** Upon checkout, the system reads the customer's delivery postcode and assigns the primary driver for that zone. If the primary driver is fully booked for the chosen time slot, it automatically fails over to an available backup driver in the same city (e.g., Sydney). If no drivers are available, the order is flagged as `UNALLOCATED` for admin review.
- **Slot Availability:** Real-time checking of 2-hour delivery windows.
- **Transactional Emails:** Two emails are fired instantly on checkout via Resend: a branded HTML receipt to the customer, and a job notification email to the assigned driver containing the delivery address, time slot, and itemized order summary.
- **Ops Backend:** Administrators can view order statuses, manually edit delivery addresses or driver assignments (with strict city-boundary validation), resend emails, manage a unified delivery calendar, and process deposit refunds/forfeits.
- **Checkout:** The checkout flow simulates a payment step before saving the order and firing emails.

## 12. Deployment
This application is fully optimized for **Vercel**. 

1. Push your code to GitHub.
2. Import the repository into Vercel.
3. In the Vercel project settings, add all the environment variables listed in Section 6.
4. Deploy.

*Note on Prisma:* Because Next.js serverless functions spin up and down rapidly, a pooled connection (`DATABASE_URL` with `?pgbouncer=true`) is required in production to prevent connection exhaustion on the Neon PostgreSQL database.

## 13. System Diagrams

### System Architecture
```mermaid
flowchart TD
    %% Define Styles
    classDef client fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a
    classDef server fill:#fdf4ff,stroke:#c026d3,stroke-width:2px,color:#0f172a
    classDef domain fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#0f172a
    classDef database fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#0f172a
    classDef external fill:#f8fafc,stroke:#94a3b8,stroke-width:2px,color:#0f172a,stroke-dasharray: 5 5

    %% Actors / External
    User((Customer / Admin)):::client
    Resend[Resend API\nEmail Delivery]:::external
    eWay[eWay API\nPayment Gateway Mock]:::external

    %% Client Layer (Browser)
    subgraph ClientLayer ["Client Layer (Browser)"]
        direction TB
        CC[React Client Components\nInteractive UI, Forms, Cart State]:::client
    end

    %% Next.js Server Layer (Node.js Edge/Runtime)
    subgraph ServerLayer ["Next.js App Router (Server)"]
        direction TB
        SC[React Server Components\nInitial Data Fetching, SSR]:::server
        SA[Server Actions\nMutations, API endpoints]:::server
        Auth[Auth.js\nSession Management]:::server
    end

    %% Pure Domain Logic (Business Rules)
    subgraph DomainLayer ["Domain Layer (src/lib/domain)"]
        direction LR
        Pricing[pricing.ts\nTotals, Promos]:::domain
        Alloc[allocation.ts\nDriver Auto-assignment]:::domain
        Deposits[deposits.ts\nRefunds, Forfeits]:::domain
    end

    %% Database Layer
    subgraph DBLayer ["Data Layer"]
        Prisma[Prisma ORM\nType-safe Client]:::database
        Neon[(Neon Postgres DB)]:::database
    end

    %% Connections
    User -- Interacts with --> CC
    User -- Initial Page Load --> SC
    
    CC -- Calls async mutations --> SA
    SC -- Renders initial state --> CC
    
    SA -- Enforces Auth --> Auth
    
    %% Domain integration
    SA -- Computes Rules --> Pricing
    SA -- Computes Rules --> Alloc
    SA -- Computes Rules --> Deposits
    
    %% DB Integration
    SC -- Reads Data --> Prisma
    SA -- Writes Data --> Prisma
    Prisma -- SQL Queries --> Neon
    
    %% External Integrations
    SA -- Triggers Emails --> Resend
    SA -- Simulates Requests --> eWay
```

### Entity-Relationship (ER) Diagram
```mermaid
erDiagram
    AdminUser {
        String id PK
        String email UK
        String passwordHash
        String name
        DateTime createdAt
        DateTime updatedAt
    }
    Product {
        String id PK
        String name
        String description
        ProductRole role
        Boolean availableForHire
        Boolean availableForBuy
        Decimal hirePrice
        Decimal buyPriceNew
        Decimal buyPriceUsed
        Decimal depositPerUnit
        String dimensions
        String spec
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
    }
    PackageItem {
        String id PK
        String packageId FK
        String productId FK
        Int quantity
    }
    Order {
        String id PK
        String orderNumber UK
        OrderType type
        OrderStatus status
        OrderSource source
        String customerName
        String customerEmail
        String customerPhone
        String deliveryAddress
        String deliverySuburb
        String deliveryPostcode
        String pickupPostcode
        DateTime deliveryDate
        String deliverySlot
        Decimal hireTotal
        Decimal buyTotal
        Decimal depositTotal
        Decimal depositRefunded
        Decimal depositForfeited
        Decimal deliveryFee
        Decimal discountAmount
        Decimal grandTotal
        Decimal amountPaid
        String driverId FK
        DateTime createdAt
        DateTime updatedAt
    }
    OrderItem {
        String id PK
        String orderId FK
        String productId FK
        Int quantity
        Decimal price
        Decimal depositPerUnit
        Boolean isUsed
    }
    Driver {
        String id PK
        String name
        String email UK
        String phone
        String city
        Boolean isActive
    }
    DriverAvailability {
        String id PK
        String driverId FK
        DateTime date
        String timeSlot
        String status
    }
    PostcodeMapping {
        String id PK
        String postcode UK
        String driverId FK
    }
    EmailLog {
        String id PK
        String orderId FK
        String toEmail
        String templateType
        String status
        DateTime sentAt
    }
    PostcodeSearchLog {
        String id PK
        String postcode
        String context
        DateTime createdAt
    }
    DepositResolution {
        String id PK
        String orderId FK
        Decimal amount
        DepositResolutionType type
        String reason
        DateTime processedAt
    }
    Product ||--o{ PackageItem : "packageContents"
    Product ||--o{ PackageItem : "includedIn"
    Order ||--o{ OrderItem : "items"
    Product ||--o{ OrderItem : "orderItems"
    Driver ||--o{ Order : "orders"
    Driver ||--o{ DriverAvailability : "availabilities"
    Driver ||--o{ PostcodeMapping : "postcodes"
    Order ||--o{ EmailLog : "emailLogs"
    Order ||--o{ DepositResolution : "depositResolutions"
```

### Use Case Diagram
```mermaid
flowchart LR
    Customer((Customer))
    Admin((System Admin))
    
    subgraph Storefront ["Customer Storefront"]
        direction TB
        UC1([Browse Products & Packages])
        UC1_1([Compare Hire vs Buy Pricing])
        UC2([Manage Cart & Select Delivery])
        UC3([Secure Checkout & Payment])
        UC4([Receive Auto-Confirmation Email])
    end
    
    subgraph OpsDashboard ["Ops Dashboard (Backend)"]
        direction TB
        
        subgraph OrderManagement ["Order Management"]
            direction TB
            UC5([View & Search All Orders])
            UC_NEW([Create Manual Order])
            UC6([Change Order Status])
            UC7([Edit Delivery Address])
            UC8([Delete Invalid Orders])
        end
        
        subgraph Logistics ["Driver Logistics"]
            direction TB
            UC9([View Master Driver Calendar])
            UC10([Manual Driver Re-allocation])
            UC11([Modify Delivery Dates & Slots])
        end
        
        subgraph Financials ["Financials & Comms"]
            direction TB
            UC12([Process Deposit Refunds via Gateway])
            UC13([Capture Deposit Forfeits to Revenue])
            UC14([Mark Payments as Paid / Update Amount])
            UC15([Resend Customer & Driver Emails])
        end
        
        subgraph Analytics ["Business Analytics"]
            UC16([Record Unserviceable Postcode Logs])
        end
    end
    
    Customer --> UC1
    Customer --> UC1_1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    
    Admin --> UC_NEW
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    
    Admin --> UC16
```

