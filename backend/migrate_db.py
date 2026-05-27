"""Run this script once to add the new columns to the database."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app, db

app = create_app('development')

with app.app_context():
    with db.engine.connect() as conn:
        # Add instagram_handle to restaurants if missing
        try:
            conn.execute(db.text("ALTER TABLE restaurants ADD COLUMN instagram_handle VARCHAR(100)"))
            conn.commit()
            print("Added instagram_handle column to restaurants")
        except Exception as e:
            conn.rollback()
            print(f"instagram_handle already exists or error: {e}")

        # Create service_requests table if missing
        try:
            conn.execute(db.text("""
                CREATE TABLE IF NOT EXISTS service_requests (
                    id SERIAL PRIMARY KEY,
                    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
                    table_number INTEGER NOT NULL,
                    request_type VARCHAR(30) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT NOW(),
                    acknowledged_at TIMESTAMP
                )
            """))
            conn.commit()
            print("service_requests table ensured")
        except Exception as e:
            conn.rollback()
            print(f"service_requests error: {e}")

        # Create feedback table if missing
        try:
            conn.execute(db.text("""
                CREATE TABLE IF NOT EXISTS feedback (
                    id SERIAL PRIMARY KEY,
                    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
                    order_id INTEGER REFERENCES orders(id),
                    table_number INTEGER,
                    rating INTEGER NOT NULL,
                    comment TEXT,
                    customer_name VARCHAR(100),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            conn.commit()
            print("feedback table ensured")
        except Exception as e:
            conn.rollback()
            print(f"feedback error: {e}")

    print("Database migration complete!")
