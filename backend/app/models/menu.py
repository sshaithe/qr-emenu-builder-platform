from datetime import datetime
from app import db

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    position = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    restaurant = db.relationship('Restaurant', back_populates='categories')
    items = db.relationship('MenuItem', back_populates='category', lazy='dynamic',
                           cascade='all, delete-orphan')
    
    def to_dict(self, include_items=False):
        data = {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'name': self.name,
            'description': self.description,
            'position': self.position,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_items:
            data['items'] = [item.to_dict() for item in self.items.order_by(MenuItem.position)]
        return data
    
    def __repr__(self):
        return f'<Category {self.name}>'


class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    image_url = db.Column(db.String(255))
    is_available = db.Column(db.Boolean, default=True)
    is_popular = db.Column(db.Boolean, default=False)
    position = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    restaurant = db.relationship('Restaurant', back_populates='menu_items')
    category = db.relationship('Category', back_populates='items')
    
    def to_dict(self, include_category=False):
        data = {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'category_id': self.category_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price) if self.price else 0,
            'image_url': self.image_url,
            'is_available': self.is_available,
            'is_popular': self.is_popular,
            'position': self.position,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_category and self.category:
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name
            }
        return data
    
    def __repr__(self):
        return f'<MenuItem {self.name}>'


class Template(db.Model):
    __tablename__ = 'templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    key = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    preview_image = db.Column(db.String(255))
    default_settings_json = db.Column(db.JSON, default=dict)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'key': self.key,
            'description': self.description,
            'preview_image': self.preview_image,
            'default_settings_json': self.default_settings_json,
            'is_active': self.is_active
        }
    
    def __repr__(self):
        return f'<Template {self.name}>'
