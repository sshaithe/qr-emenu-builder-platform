from datetime import datetime
from app import db
import bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False, default='restaurant_owner')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    restaurant = db.relationship('Restaurant', back_populates='owner', uselist=False, foreign_keys='Restaurant.owner_id')
    staff_memberships = db.relationship('Staff', back_populates='user', lazy='dynamic')
    
    # Valid roles
    VALID_ROLES = ['super_admin', 'restaurant_owner', 'manager', 'cashier', 'kitchen', 'waiter']
    
    def set_password(self, password):
        """Hash and set password"""
        salt = bcrypt.gensalt(rounds=12)
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Verify password"""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def is_super_admin(self):
        return self.role == 'super_admin'
    
    def is_owner(self):
        return self.role == 'restaurant_owner'
    
    def to_dict(self, include_restaurant=False):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_restaurant and self.restaurant:
            data['restaurant'] = self.restaurant.to_dict()
        return data
    
    def __repr__(self):
        return f'<User {self.email} - {self.role}>'
