from datetime import datetime
from app import db


class ServiceRequest(db.Model):
    """Model for Call Waiter / Request Bill notifications"""
    __tablename__ = 'service_requests'

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    table_number = db.Column(db.Integer, nullable=False)
    request_type = db.Column(db.String(30), nullable=False)  # 'call_waiter', 'request_bill'
    status = db.Column(db.String(20), default='pending')  # pending, acknowledged, done
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    acknowledged_at = db.Column(db.DateTime, nullable=True)

    # Relationship
    restaurant = db.relationship('Restaurant', back_populates='service_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'table_number': self.table_number,
            'request_type': self.request_type,
            'status': self.status,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
            'acknowledged_at': (self.acknowledged_at.isoformat() + 'Z') if self.acknowledged_at else None,
        }

    def __repr__(self):
        return f'<ServiceRequest {self.request_type} Table {self.table_number}>'


class Feedback(db.Model):
    """Model for customer feedback and ratings"""
    __tablename__ = 'feedback'

    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    table_number = db.Column(db.Integer)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text, nullable=True)
    customer_name = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = db.relationship('Restaurant', back_populates='feedback')
    order = db.relationship('Order', back_populates='feedback')

    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'order_id': self.order_id,
            'table_number': self.table_number,
            'rating': self.rating,
            'comment': self.comment,
            'customer_name': self.customer_name,
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
        }

    def __repr__(self):
        return f'<Feedback {self.rating}★ Order#{self.order_id}>'
