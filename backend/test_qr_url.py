from app import create_app
app = create_app()
c = app.test_client()
r = c.get('/uploads/qr_codes/qr_1_1.png')
print(f"STATUS: {r.status_code}, SIZE: {len(r.data)} bytes")
r2 = c.get('/uploads/qr_codes/qr_1_0.png')
print(f"General menu QR STATUS: {r2.status_code}, SIZE: {len(r2.data)} bytes")
