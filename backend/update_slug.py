import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app, db
from app.models.restaurant import Restaurant

app = create_app('development')
with app.app_context():
    r = Restaurant.query.first()
    print("Restaurant Name:", r.name)
    print("Restaurant Slug:", r.slug)
    
    r.slug = 'aurum-kitchen-bar'
    db.session.commit()
    print("Updated to aurum-kitchen-bar")
