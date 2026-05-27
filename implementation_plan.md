# Comprehensive Feature Implementation Plan

Because the scope of your request is massive and involves deep changes to the database, backend APIs, Dashboard UI, and Public Menu UI, we must implement these features in phases to ensure stability and code quality. 

I propose the following 4-Phase rollout. 

> [!IMPORTANT]
> **I will start executing Phase 1 immediately upon your approval.** Once Phase 1 is complete and tested, we can move to Phase 2, and so on.

## Phase 1: Database Foundation & Core Menu Features

### 1. Dietary Filters & Tags
- **Database:** Update `MenuItem` in `models/menu.py` to include a `tags` column (JSON or array format) to store things like "Spicy", "Vegan", "Halal".
- **Dashboard:** Add a multi-select tagging UI in the Menu Editor (`MenuManager.tsx`).
- **Public Menu:** Add a filter bar to `PublicMenu.tsx` so customers can toggle specific dietary tags.

### 2. Inventory & Auto-Sold Out
- **Database:** Add a `stock_count` (Integer, nullable) to `MenuItem`.
- **Backend Logic:** When an order is placed, decrement the `stock_count`. If it hits 0, `is_available` becomes false.
- **Dashboard:** Add stock management inputs to the Menu Editor.

### 3. Kitchen Display System (KDS) Timers
- **Dashboard UI:** Update `KitchenDisplay.tsx` to calculate and display the time elapsed since the order was `created_at`.
- **Visual Cues:** Orders older than 15 minutes will turn yellow; older than 25 minutes will turn red to alert staff.

## Phase 2: Complex Ordering (Modifiers & Specific Requests)

### 1. Item Modifiers & Add-ons
- **Database:** Create new tables `ItemModifierGroup` (e.g., "Size", "Extras") and `ItemModifierOption` (e.g., "Large (+50 DA)", "Extra Cheese (+100 DA)").
- **Dashboard:** Build a complex nested UI in the Menu Editor to manage modifiers.
- **Public Menu:** When a user taps a menu item, open a modal to select required/optional modifiers before adding to cart.
- **Order Logic:** Update the `Order` models and API to capture modifier choices and calculate the updated total price.

### 2. "Call Waiter" Specific Requests
- **Database/API:** Update the `/api/public/service-request` endpoint to accept a `request_type` (e.g., "water", "clean_table", "bill").
- **Dashboard:** Update the Staff Dashboard to display the specific request type.
- **Public Menu:** Change the "Call Waiter" button into a dialog with quick options.

## Phase 3: Marketing & Export

### 1. Advanced Promotions & Happy Hours
- **Database:** Create a `Promotions` table linking to restaurants and specific items, with start/end times and discount percentages.
- **Dashboard:** Add a "Promotions" tab for owners to schedule discounts.
- **Public Menu:** Dynamically calculate the discounted price if the current time falls within an active promotion window.

### 2. Exportable PDF Menus
- **Dashboard:** Integrate a library (like `jspdf` or `html2pdf.js`) to generate a printable PDF version of the restaurant's active menu directly from the dashboard.

### 3. Customer Loyalty Points
- **Database:** Create a `Customer` model linked to a phone number. Create a `loyalty_points` column.
- **Order Logic:** Add points to the customer profile upon successful order completion.
- **Public Menu:** Allow customers to "Sign In" with their phone number to track points.

## Phase 4: Advanced Infrastructure

### 1. White-Label Custom Domain
- **Database:** Add a `custom_domain` column to the `Restaurant` model.
- **Backend Routing:** Configure middleware to intercept hostnames and route to the correct restaurant slug automatically.

---

## User Review Required

Does this 4-Phase approach look good to you? If so, I will begin executing **Phase 1** immediately.
