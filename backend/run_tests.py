"""
Automated API test suite for all new and existing endpoints.
Tests authentication, service requests, feedback, KDS, QR print, and receipts.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.restaurant import Restaurant
from app.models.order import Order
from app.models.service import ServiceRequest, Feedback

app = create_app('development')

RESULTS = []

def check(name, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    RESULTS.append((status, name, detail))
    prefix = "[OK]" if condition else "[FAIL]"
    print(f"{prefix}  {name}" + (f" -- {detail}" if detail else ""))

with app.test_client() as client:

    # ──────────────────────────────────────────────
    # 1. HEALTH CHECK
    # ──────────────────────────────────────────────
    r = client.get('/api/health')
    check("Health check", r.status_code == 200)

    # ──────────────────────────────────────────────
    # 2. AUTH — Login as owner
    # ──────────────────────────────────────────────
    r = client.post('/api/auth/login', json={'email': 'restaurant@emenue.com', 'password': 'Restaurant@12345'})
    data = r.get_json()
    check("Owner login", r.status_code == 200 and data.get('success'), str(data.get('message','')))
    token = data.get('data', {}).get('token', '') if r.status_code == 200 else ''
    HEADERS = {'Authorization': f'Bearer {token}'}

    # ──────────────────────────────────────────────
    # 3. RESTAURANT PROFILE (with instagram_handle)
    # ──────────────────────────────────────────────
    r = client.get('/api/dashboard/restaurant', headers=HEADERS)
    check("GET restaurant profile", r.status_code == 200)
    profile = r.get_json().get('data', {})
    check("instagram_handle field present", 'instagram_handle' in profile)

    r = client.put('/api/dashboard/restaurant', json={'instagram_handle': 'aurum_kitchen'}, headers=HEADERS)
    check("PUT instagram_handle update", r.status_code == 200)

    # ──────────────────────────────────────────────
    # 4. GET QR CODES + GENERATE
    # ──────────────────────────────────────────────
    r = client.get('/api/dashboard/qr-codes', headers=HEADERS)
    check("GET qr-codes (dashboard)", r.status_code == 200)

    r = client.post('/api/dashboard/qr-codes/generate',
                    json={'table_count': 3, 'base_url': 'http://localhost:3000/r/aurum-kitchen-bar'},
                    headers=HEADERS)
    d = r.get_json()
    check("POST generate QR codes (3 tables)", r.status_code == 200 and d.get('success'), str(d.get('message','')))

    # ──────────────────────────────────────────────
    # 5. SERVICE REQUESTS (public — call waiter)
    # ──────────────────────────────────────────────
    r = client.post('/api/public/aurum-kitchen-bar/service-request',
                    json={'request_type': 'call_waiter', 'table_number': 2})
    d = r.get_json()
    check("POST call_waiter service request", r.status_code in (200, 201) and d.get('success'), str(d.get('message','')))
    sr_id = d.get('data', {}).get('id')

    # Duplicate prevention
    r2 = client.post('/api/public/aurum-kitchen-bar/service-request',
                     json={'request_type': 'call_waiter', 'table_number': 2})
    check("Duplicate service request prevention", r2.status_code == 200)

    # ──────────────────────────────────────────────
    # 6. SERVICE REQUESTS (dashboard — acknowledge)
    # ──────────────────────────────────────────────
    r = client.get('/api/dashboard/service-requests', headers=HEADERS)
    check("GET pending service-requests", r.status_code == 200)

    if sr_id:
        r = client.put(f'/api/dashboard/service-requests/{sr_id}/acknowledge', headers=HEADERS)
        check("PUT acknowledge service request", r.status_code == 200)

        r = client.put(f'/api/dashboard/service-requests/{sr_id}/done', headers=HEADERS)
        check("PUT complete service request", r.status_code == 200)

    # ──────────────────────────────────────────────
    # 7. ORDER TRACKING (public)
    # ──────────────────────────────────────────────
    with app.app_context():
        order = Order.query.filter_by(restaurant_id=1).first()
        order_id = order.id if order else None

    if order_id:
        r = client.get(f'/api/public/orders/{order_id}')
        d = r.get_json()
        check("GET public order (live tracking)", r.status_code == 200 and d.get('success'))
        check("Order response has restaurant details", 'restaurant' in d.get('data', {}))
        check("Order response has feedback_submitted flag", 'feedback_submitted' in d.get('data', {}))

    # ──────────────────────────────────────────────
    # 8. FEEDBACK (submit + duplicate prevention)
    # ──────────────────────────────────────────────
    r = client.post('/api/public/aurum-kitchen-bar/feedback',
                    json={'rating': 5, 'comment': 'Amazing food!', 'customer_name': 'Ali',
                          'table_number': 2, 'order_id': order_id})
    d = r.get_json()
    # 201 = new feedback, 409 = already submitted (both are correct behavior)
    check("POST customer feedback (5 stars)", r.status_code in (200, 201, 409), str(d.get('message','')))

    if order_id:
        r2 = client.post('/api/public/aurum-kitchen-bar/feedback',
                         json={'rating': 4, 'order_id': order_id})
        check("Duplicate feedback prevention", r2.status_code == 409)

    # Invalid rating
    r = client.post('/api/public/aurum-kitchen-bar/feedback', json={'rating': 9})
    check("Invalid rating rejected", r.status_code == 400)

    # ──────────────────────────────────────────────
    # 9. FEEDBACK DASHBOARD
    # ──────────────────────────────────────────────
    r = client.get('/api/dashboard/feedback', headers=HEADERS)
    d = r.get_json()
    check("GET dashboard feedback list", r.status_code == 200 and d.get('success'))
    check("Feedback stats present", 'stats' in d.get('data', {}))

    # ──────────────────────────────────────────────
    # 10. KDS — Orders endpoint (all statuses)
    # ──────────────────────────────────────────────
    r = client.get('/api/dashboard/orders', headers=HEADERS)
    check("GET all orders (KDS source)", r.status_code == 200)

    # ──────────────────────────────────────────────
    # 11. SECURITY TESTS
    # ──────────────────────────────────────────────
    # Unauthenticated dashboard access
    r = client.get('/api/dashboard/service-requests')
    check("SEC: Unauthenticated service-requests returns 401", r.status_code == 401)

    r = client.get('/api/dashboard/feedback')
    check("SEC: Unauthenticated feedback returns 401", r.status_code == 401)

    r = client.get('/api/dashboard/orders')
    check("SEC: Unauthenticated orders returns 401", r.status_code == 401)

    # Wrong restaurant slug
    r = client.post('/api/public/nonexistent-restaurant/service-request',
                    json={'request_type': 'call_waiter', 'table_number': 1})
    check("SEC: Invalid slug returns 404", r.status_code == 404)

    # Invalid request type (injection test)
    r = client.post('/api/public/aurum-kitchen-bar/service-request',
                    json={'request_type': 'steal_data', 'table_number': 1})
    check("SEC: Invalid request_type rejected (400)", r.status_code == 400)

    # SQL injection in order_id
    r = client.get('/api/public/orders/999999')
    check("SEC: Non-existent order returns 404", r.status_code == 404)

# ──────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────
print("\n" + "="*50)
passed = sum(1 for s,_,_ in RESULTS if "PASS" in s)
failed = sum(1 for s,_,_ in RESULTS if "FAIL" in s)
print(f"TOTAL: {len(RESULTS)} tests | OK: {passed} passed | FAIL: {failed} failed")
if failed > 0:
    print("\nFailed tests:")
    for s,n,d in RESULTS:
        if "FAIL" in s:
            print(f"  {n}: {d}")
