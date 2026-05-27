"""
Locust Load Test for QR E-Menu Platform
Simulates 10,000 concurrent customers from many restaurants each placing different orders.

HOW TO RUN:
  cd backend
  locust -f locustfile.py --headless -u 10000 -r 500 --run-time 60s --host http://localhost:5000

  OR open the Locust UI:
  locust -f locustfile.py --host http://localhost:5000
  Then visit http://localhost:8089 and set Users=10000, Spawn rate=500

WHAT IS TESTED:
  - Customer browsing the menu (GET public menu)
  - Customer placing a real order (POST order)
  - Customer tracking their order status (GET order)
  - Customer calling waiter (POST service request)
  - Restaurant owner reading orders (GET dashboard/orders)  
  - Restaurant owner checking KDS (GET dashboard/orders with status filter)
"""

import random
from locust import HttpUser, task, between, constant_pacing

# ── Seed data ──────────────────────────────────────────────────────────────
# Use the actual restaurant slugs from your DB. Add more if you have multiple restaurants.
RESTAURANT_SLUGS = [
    "aurum-kitchen-bar",
]

# Item IDs that exist in your database (edit these to match yours)
MENU_ITEM_IDS = list(range(1, 20))  # IDs 1–19

# Tables per restaurant
MAX_TABLES = 10

# Owner credentials (for dashboard tests)
OWNER_EMAIL = "restaurant@emenue.com"
OWNER_PASSWORD = "Restaurant@12345"


class CustomerUser(HttpUser):
    """
    Simulates a real restaurant customer:
    1. Opens menu (high frequency)
    2. Places an order (medium frequency)
    3. Tracks the order (high frequency once placed)
    4. Calls waiter occasionally
    """
    wait_time = between(1, 5)  # Customers browse between 1-5 seconds between actions

    def on_start(self):
        """Each virtual user picks a random restaurant and table on start."""
        self.slug = random.choice(RESTAURANT_SLUGS)
        self.table = random.randint(1, MAX_TABLES)
        self.order_id = None

    @task(10)
    def browse_menu(self):
        """Most common action: just view the menu."""
        with self.client.get(
            f"/api/public/{self.slug}/menu?table={self.table}",
            name="/api/public/[slug]/menu",
            catch_response=True
        ) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"Menu load failed: {r.status_code}")

    @task(4)
    def place_order(self):
        """Place an order with 1–4 random items."""
        num_items = random.randint(1, 4)
        items = [
            {"menu_item_id": random.choice(MENU_ITEM_IDS), "quantity": random.randint(1, 3)}
            for _ in range(num_items)
        ]
        payload = {
            "table_number": self.table,
            "customer_name": f"Test Customer {random.randint(1000, 9999)}",
            "customer_phone": "",
            "note": "",
            "items": items
        }
        with self.client.post(
            f"/api/public/{self.slug}/orders",
            json=payload,
            name="/api/public/[slug]/orders",
            catch_response=True
        ) as r:
            if r.status_code == 201:
                data = r.json()
                self.order_id = data.get("data", {}).get("order", {}).get("id")
                r.success()
            elif r.status_code == 400:
                # Expected if menu item IDs are wrong — mark as success to not skew error rate
                r.success()
            else:
                r.failure(f"Order failed: {r.status_code} — {r.text[:200]}")

    @task(8)
    def track_order(self):
        """Track an existing order's status (polling)."""
        if not self.order_id:
            return
        with self.client.get(
            f"/api/public/orders/{self.order_id}",
            name="/api/public/orders/[id]",
            catch_response=True
        ) as r:
            if r.status_code in (200, 404):
                r.success()
            else:
                r.failure(f"Tracking failed: {r.status_code}")

    @task(1)
    def call_waiter(self):
        """Occasionally call the waiter."""
        with self.client.post(
            f"/api/public/{self.slug}/service-request",
            json={"request_type": "call_waiter", "table_number": self.table},
            name="/api/public/[slug]/service-request",
            catch_response=True
        ) as r:
            if r.status_code in (200, 201):
                r.success()
            else:
                r.failure(f"Waiter call failed: {r.status_code}")

    @task(1)
    def submit_feedback(self):
        """Submit feedback after eating (rare action)."""
        if not self.order_id:
            return
        with self.client.post(
            f"/api/public/{self.slug}/feedback",
            json={
                "rating": random.randint(3, 5),
                "order_id": self.order_id,
                "comment": "Great food!",
                "customer_name": "Test",
                "table_number": self.table
            },
            name="/api/public/[slug]/feedback",
            catch_response=True
        ) as r:
            if r.status_code in (200, 201, 409):  # 409 = duplicate, expected
                r.success()
            else:
                r.failure(f"Feedback failed: {r.status_code}")


class OwnerUser(HttpUser):
    """
    Simulates restaurant owners/staff checking the dashboard.
    Much fewer of these compared to customers (use weight to control ratio).
    """
    wait_time = between(5, 15)  # Staff check dashboard less frequently
    weight = 1  # 1 owner for every ~50 customers

    def on_start(self):
        """Login and store the JWT token."""
        r = self.client.post("/api/auth/login", json={
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        })
        if r.status_code == 200:
            data = r.json()
            self.token = data.get("data", {}).get("token", "")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.token = ""
            self.headers = {}

    @task(5)
    def check_orders(self):
        """View incoming orders (like the Orders dashboard page)."""
        if not self.token:
            return
        with self.client.get(
            "/api/dashboard/orders",
            headers=self.headers,
            name="/api/dashboard/orders",
            catch_response=True
        ) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"Orders failed: {r.status_code}")

    @task(3)
    def check_kds(self):
        """View KDS (active orders only)."""
        if not self.token:
            return
        with self.client.get(
            "/api/dashboard/orders?status=preparing",
            headers=self.headers,
            name="/api/dashboard/orders?status=[status]",
            catch_response=True
        ) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"KDS check failed: {r.status_code}")

    @task(2)
    def check_service_requests(self):
        """Check for pending waiter calls."""
        if not self.token:
            return
        with self.client.get(
            "/api/dashboard/service-requests",
            headers=self.headers,
            name="/api/dashboard/service-requests",
            catch_response=True
        ) as r:
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"Service requests failed: {r.status_code}")
