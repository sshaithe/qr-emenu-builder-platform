from datetime import datetime
from app import db

class MenuView(db.Model):
    __tablename__ = 'menu_views'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    table_number = db.Column(db.Integer)
    visitor_id = db.Column(db.String(100))  # Simple visitor tracking
    device_type = db.Column(db.String(50))  # mobile, tablet, desktop
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Relationship
    restaurant = db.relationship('Restaurant', back_populates='menu_views')
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'table_number': self.table_number,
            'visitor_id': self.visitor_id,
            'device_type': self.device_type,
            'viewed_at': self.viewed_at.isoformat() if self.viewed_at else None
        }


class QRCode(db.Model):
    __tablename__ = 'qr_codes'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    table_number = db.Column(db.Integer, default=0)  # 0 = general menu QR
    qr_url = db.Column(db.String(500), nullable=False)
    qr_image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    restaurant = db.relationship('Restaurant', back_populates='qr_codes')
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'table_number': self.table_number,
            'qr_url': self.qr_url,
            'qr_image_url': self.qr_image_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
