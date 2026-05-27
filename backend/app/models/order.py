from datetime import datetime
from app import db

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    table_number = db.Column(db.Integer, default=1)
    customer_name = db.Column(db.String(100))
    customer_phone = db.Column(db.String(30))
    note = db.Column(db.Text)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    order_status = db.Column(db.String(30), default='new_order')
    # pending_payment, waiting_cash_payment, new_order, accepted, preparing, ready, served, paid, cancelled
    payment_status = db.Column(db.String(20), default='unpaid')
    # unpaid, pending, paid, failed, refunded
    payment_method = db.Column(db.String(20), default='cash')
    # cash, online
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    VALID_ORDER_STATUSES = [
        'pending_payment', 'waiting_cash_payment', 'new_order', 
        'accepted', 'preparing', 'ready', 'served', 'paid', 'cancelled'
    ]
    VALID_PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'failed', 'refunded']
    
    # Relationships
    restaurant = db.relationship('Restaurant', back_populates='orders')
    items = db.relationship('OrderItem', back_populates='order', lazy='dynamic',
                           cascade='all, delete-orphan')
    feedback = db.relationship('Feedback', back_populates='order', uselist=False)
    
    def to_dict(self, include_items=False, include_restaurant=False):
        data = {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'table_number': self.table_number,
            'customer_name': self.customer_name,
            'customer_phone': self.customer_phone,
            'note': self.note,
            'total_price': float(self.total_price) if self.total_price else 0,
            'order_status': self.order_status,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
            'updated_at': (self.updated_at.isoformat() + 'Z') if self.updated_at else None
        }
        
        if include_items:
            data['items'] = [item.to_dict() for item in self.items]
        
        if include_restaurant and self.restaurant:
            data['restaurant'] = {
                'id': self.restaurant.id,
                'name': self.restaurant.name,
                'slug': self.restaurant.slug
            }
        
        return data
    
    def __repr__(self):
        return f'<Order #{self.id} - Table {self.table_number}>'


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_items.id'), nullable=False)
    item_name = db.Column(db.String(150), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    note = db.Column(db.Text)
    
    # Relationships
    order = db.relationship('Order', back_populates='items')
    menu_item = db.relationship('MenuItem')
    
    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'menu_item_id': self.menu_item_id,
            'item_name': self.item_name,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price) if self.unit_price else 0,
            'total_price': float(self.total_price) if self.total_price else 0,
            'note': self.note
        }
