import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.seeds.seed_data import seed_all

app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Auto-seed on first run
    with app.app_context():
        try:
            seed_all()
        except Exception as e:
            print(f"Seed warning (may already be seeded): {e}")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
