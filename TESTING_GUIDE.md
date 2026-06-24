# Hire A Box — Comprehensive End-to-End Testing Guide

This document outlines how to test every feature and edge case built into the custom logistics and ordering engine.

## 1. Customer Storefront & Checkout

### 1.1 The Segmented Cart Logic
Because "Hire" orders and "Buy" orders have fundamentally different financial and logistical rules (bonds, collection pickups), the system keeps them separated.
*   **How to test:** Go to `/hire` and add a "1 Bedroom Package". Go to `/buy` and add "10 Standard Boxes". Open your cart. You will see two distinct tabs.
*   **The Consumable Exception:** Go back to `/hire` and add "Tape" or "Bubblewrap". Notice how these are added *directly into the Hire cart* as standard items (without a deposit) so the customer doesn't have to checkout twice.

### 1.2 Free Delivery Thresholds
*   **How to test:** Ensure your Hire cart is below $65. Proceed to checkout and verify the $35 delivery fee is applied. Go back, increase the cart total over $65, and verify the fee drops to $0.00. (The threshold is $99 for the Buy cart).

### 1.3 Serviceable Postcodes & Logging
*   **How to test:** At the checkout delivery step, enter an unmapped postcode like `9999`. 
*   **Result:** The system will block you from selecting a delivery slot. Behind the scenes, the system quietly logs this attempt into the `PostcodeSearchLog` database table to provide the business with market expansion data.

### 1.4 Sydney Driver Fallover & Strict Capacity
This is the core of the automated routing engine.
1.  **Book Driver 1:** Checkout using postcode `2000` (Sydney). Select tomorrow's date and the `08:00-10:00` slot. Pay using the test card. This locks in Sydney Driver 1.
2.  **The Fallover Check:** Open a new incognito window. Checkout again with postcode `2000`, selecting the *exact same* date and slot. 
    *   *Result:* The system detects Driver 1 is busy, automatically fails-over to the backup driver (Sydney Driver 2), and accepts the order.
3.  **The Lockout Check:** Try to checkout a third time for that exact same slot. 
    *   *Result:* Because both Sydney drivers are fully booked, the `08:00-10:00` slot disappears entirely from the dropdown.

### 1.5 Mock Payment Gateway Simulation
*   **How to test:** At payment, enter an invalid 16-digit card. The system will run a mathematical **Luhn Algorithm** check and immediately reject it. 
*   **Success Path:** Enter the standard test card `4111 1111 1111 1111`. You will experience a simulated 1.5-second to 2.5-second network latency delay before the order confirms.

---

## 2. Admin Operations Dashboard

### 2.1 Secure Login
*   **URL:** `/admin/login`
*   **Credentials:** Ensure you use the seeded admin credentials.

### 2.2 Financial Aggregations (Revenue vs Liabilities)
*   **How to test:** Look at the top-level widgets. Place a new Hire order on the storefront. Refresh the dashboard. Notice how the "Hire Fee" correctly routes to total revenue, but the "Deposit" strictly routes to the outstanding liability widget.

### 2.3 Calendar Blocking (Driver Sick Leave)
*   **How to test:** Navigate to the **Calendar**. Select a driver (e.g., Driver 3 in Melbourne). Click on tomorrow's `14:00-16:00` slot and click **Block Slot**. 
*   *Result:* The slot immediately turns grey. If a customer in Melbourne tries to check out, this slot will no longer exist.

### 2.4 Creating Manual Orders (Bypassing Capacity)
*   **How to test:** Go to **Orders -> New Manual Order**. Book an order for a time slot that is already fully booked. 
*   *Result:* Manual admin orders intentionally bypass the strict web capacity limits, allowing staff to force a booking through for VIP clients.

### 2.5 Marking Manual Orders as Paid
*   **How to test:** Open the manual order you just created. Because it was placed without a credit card gateway, it correctly shows an outstanding balance.
*   *Result:* Click **Edit Amount Paid**, type in the total (simulating a cleared bank transfer). The balance will mathematically recalculate to $0.00.

### 2.6 Forcing an Order to 'Unallocated'
An order becomes 'Unallocated' when human intervention is required (e.g., a race condition during checkout, or a staff error).
*   **How to test:** Open an existing, fully-allocated order. Use the "Change Delivery Address" action. Change the postcode to `9999` (unserviceable).
*   *Result:* The system saves the new address but immediately strips the driver from the order, flashing a red **UNALLOCATED** badge to alert staff to resolve the conflict.

### 2.7 Deposit Forfeiture (Damaged Goods)
*   **How to test:** Open a Hire order. Navigate to the "Deposits" section. Simulate a damaged box by entering `$20` into the Forfeit action.
*   *Result:* The system calculates the remaining deposit liability, logs the forfeit permanently into the `DepositResolution` ledger, and seamlessly moves that $20 into standard Revenue on the dashboard.

### 2.8 Email Fallbacks & Resends
*   **How to test:** Use the "Resend Email" buttons on the order details page to fire a copy of the Client Confirmation or the internal Driver Manifest.
*   *Fault Tolerance:* The codebase intentionally wraps the third-party Resend API in `try/catch` blocks. If the external email server crashes, the system gracefully handles the error, logging it for IT but allowing the customer's checkout to succeed seamlessly.
