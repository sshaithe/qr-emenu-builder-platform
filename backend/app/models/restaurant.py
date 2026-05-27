from datetime import datetime
from app import db

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(150), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    logo_url = db.Column(db.String(255))
    cover_image_url = db.Column(db.String(255))
    phone = db.Column(db.String(30))
    whatsapp = db.Column(db.String(30))
    address = db.Column(db.Text)
    currency = db.Column(db.String(10), default='DA')
    status = db.Column(db.String(20), default='active')  # active, suspended
    payment_mode = db.Column(db.String(30), default='cash_after_service')
    # menu_only, cash_after_service, cash_before_service, online_optional, online_required
    table_count = db.Column(db.Integer, default=10)
    instagram_handle = db.Column(db.String(100), nullable=True)  # for QR print layout
    active_design_id = db.Column(db.Integer, db.ForeignKey('restaurant_designs.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = db.relationship('User', back_populates='restaurant', foreign_keys=[owner_id])
    designs = db.relationship('RestaurantDesign', back_populates='restaurant', 
                              foreign_keys='RestaurantDesign.restaurant_id',
                              lazy='dynamic', cascade='all, delete-orphan')
    categories = db.relationship('Category', back_populates='restaurant', lazy='dynamic',
                                cascade='all, delete-orphan')
    menu_items = db.relationship('MenuItem', back_populates='restaurant', lazy='dynamic',
                                cascade='all, delete-orphan')
    orders = db.relationship('Order', back_populates='restaurant', lazy='dynamic',
                            cascade='all, delete-orphan')
    staff = db.relationship('Staff', back_populates='restaurant', lazy='dynamic',
                           cascade='all, delete-orphan')
    menu_views = db.relationship('MenuView', back_populates='restaurant', lazy='dynamic',
                                cascade='all, delete-orphan')
    qr_codes = db.relationship('QRCode', back_populates='restaurant', lazy='dynamic',
                              cascade='all, delete-orphan')
    active_design = db.relationship('RestaurantDesign', foreign_keys=[active_design_id],
                                   post_update=True)
    service_requests = db.relationship('ServiceRequest', back_populates='restaurant',
                                       lazy='dynamic', cascade='all, delete-orphan')
    feedback = db.relationship('Feedback', back_populates='restaurant',
                               lazy='dynamic', cascade='all, delete-orphan')
    
    VALID_STATUSES = ['active', 'suspended']
    VALID_PAYMENT_MODES = ['menu_only', 'cash_after_service', 'cash_before_service', 
                          'online_optional', 'online_required']
    
    def to_dict(self, include_owner=False, include_stats=False):
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'logo_url': self.logo_url,
            'cover_image_url': self.cover_image_url,
            'phone': self.phone,
            'whatsapp': self.whatsapp,
            'address': self.address,
            'currency': self.currency,
            'status': self.status,
            'payment_mode': self.payment_mode,
            'table_count': self.table_count,
            'instagram_handle': self.instagram_handle,
            'active_design_id': self.active_design_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_owner and self.owner:
            data['owner'] = {
                'id': self.owner.id,
                'name': self.owner.name,
                'email': self.owner.email
            }
        
        if include_stats:
            data['stats'] = {
                'total_orders': self.orders.count(),
                'total_views': self.menu_views.count(),
                'total_menu_items': self.menu_items.count(),
                'total_categories': self.categories.count()
            }
        
        return data
    
    def __repr__(self):
        return f'<Restaurant {self.name} ({self.slug})>'


class RestaurantDesign(db.Model):
    __tablename__ = 'restaurant_designs'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    template_key = db.Column(db.String(50), default='modern')
    status = db.Column(db.String(20), default='draft')  # draft, published
    settings_json = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    restaurant = db.relationship('Restaurant', back_populates='designs', 
                                foreign_keys=[restaurant_id])
    
    DEFAULT_SETTINGS = {
        'template': 'modern',
        'primaryColor': '#F59E0B',
        'backgroundColor': '#FFFFFF',
        'textColor': '#111827',
        'font': 'Inter',
        'buttonStyle': 'rounded',
        'cardStyle': 'shadow',
        'menuLayout': 'grid',
        'categoryStyle': 'pills',
        'imageShape': 'rounded',
        'welcomeText': 'Welcome to our restaurant!',
        'offerBanner': '',
        'showLogo': True,
        'showCover': True,
        'showWelcome': True,
        'showPopular': True,
        'sections': [
            {'type': 'cover', 'enabled': True},
            {'type': 'welcome', 'enabled': True},
            {'type': 'popular_items', 'enabled': True},
            {'type': 'categories', 'enabled': True},
            {'type': 'full_menu', 'enabled': True},
            {'type': 'contact', 'enabled': True}
        ],
        'socialLinks': {
            'facebook': '',
            'instagram': '',
            'whatsapp': ''
        }
    }
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'template_key': self.template_key,
            'status': self.status,
            'settings_json': self.settings_json or self.DEFAULT_SETTINGS,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Staff(db.Model):
    __tablename__ = 'staff'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(30), default='waiter')  # manager, cashier, kitchen, waiter
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    restaurant = db.relationship('Restaurant', back_populates='staff')
    user = db.relationship('User', back_populates='staff_memberships')
    
    VALID_ROLES = ['manager', 'cashier', 'kitchen', 'waiter']
    
    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'user_id': self.user_id,
            'role': self.role,
            'user': {
                'id': self.user.id,
                'name': self.user.name,
                'email': self.user.email
            } if self.user else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
