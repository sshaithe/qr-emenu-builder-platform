from flask import Blueprint, request, jsonify
from sqlalchemy import func, desc
from app import db
from app.models.user import User
from app.models.restaurant import Restaurant, RestaurantDesign, Staff
from app.models.menu import Category, MenuItem, Template
from app.models.order import Order, OrderItem
from app.models.analytics import MenuView, QRCode
from app.utils.auth import super_admin_required, login_required
from app.utils.validators import validate_email, validate_password, validate_name, validate_slug, generate_slug

admin_bp = Blueprint('admin', __name__)

# ============ STATS ============
@admin_bp.route('/stats', methods=['GET'])
@super_admin_required
def get_stats():
    """Get platform-wide statistics"""
    total_restaurants = Restaurant.query.count()
    active_restaurants = Restaurant.query.filter_by(status='active').count()
    suspended_restaurants = Restaurant.query.filter_by(status='suspended').count()
    total_orders = Order.query.count()
    total_views = MenuView.query.count()
    total_users = User.query.count()
    
    # Today's stats
    from datetime import datetime, timedelta
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    orders_today = Order.query.filter(Order.created_at >= today_start).count()
    sales_today = db.session.query(func.sum(Order.total_price)).filter(
        Order.created_at >= today_start,
        Order.order_status != 'cancelled'
    ).scalar() or 0
    views_today = MenuView.query.filter(MenuView.viewed_at >= today_start).count()
    
    # Most viewed restaurant
    most_viewed = db.session.query(
        Restaurant.id, Restaurant.name, func.count(MenuView.id).label('views')
    ).join(MenuView).group_by(Restaurant.id).order_by(desc('views')).first()
    
    # Most ordered item
    most_ordered = db.session.query(
        MenuItem.id, MenuItem.name, func.count(OrderItem.id).label('order_count')
    ).join(OrderItem).group_by(MenuItem.id).order_by(desc('order_count')).first()
    
    return jsonify({
        'success': True,
        'data': {
            'total_restaurants': total_restaurants,
            'active_restaurants': active_restaurants,
            'suspended_restaurants': suspended_restaurants,
            'total_orders': total_orders,
            'total_views': total_views,
            'total_users': total_users,
            'orders_today': orders_today,
            'sales_today': float(sales_today),
            'views_today': views_today,
            'most_viewed_restaurant': {
                'id': most_viewed[0],
                'name': most_viewed[1],
                'views': most_viewed[2]
            } if most_viewed else None,
            'most_ordered_item': {
                'id': most_ordered[0],
                'name': most_ordered[1],
                'order_count': most_ordered[2]
            } if most_ordered else None
        }
    })


# ============ RESTAURANTS ============
@admin_bp.route('/restaurants', methods=['GET'])
@super_admin_required
def get_restaurants():
    """Get all restaurants with filtering"""
    status = request.args.get('status')
    search = request.args.get('search', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = Restaurant.query
    
    if status:
        query = query.filter_by(status=status)
    
    if search:
        query = query.filter(
            db.or_(
                Restaurant.name.ilike(f'%{search}%'),
                Restaurant.slug.ilike(f'%{search}%'),
                Restaurant.phone.ilike(f'%{search}%')
            )
        )
    
    pagination = query.order_by(Restaurant.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'restaurants': [r.to_dict(include_owner=True, include_stats=True) for r in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    })


@admin_bp.route('/restaurants', methods=['POST'])
@super_admin_required
def create_restaurant():
    """Create a new restaurant with owner account"""
    data = request.get_json() or {}
    
    # Required fields
    name = data.get('name', '').strip()
    owner_name = data.get('owner_name', '').strip()
    owner_email = data.get('owner_email', '').strip().lower()
    owner_password = data.get('owner_password', '')
    
    if not name:
        return jsonify({'success': False, 'message': 'Restaurant name is required'}), 400
    
    # Generate slug
    slug = generate_slug(name)
    base_slug = slug
    counter = 1
    while Restaurant.query.filter_by(slug=slug).first():
        slug = f'{base_slug}-{counter}'
        counter += 1
    
    # Check if owner email exists
    owner = None
    if owner_email:
        owner = User.query.filter_by(email=owner_email).first()
        if owner:
            return jsonify({'success': False, 'message': 'Owner email already exists'}), 409
    
    # Create owner user
    if owner_email and owner_password:
        valid, msg = validate_email(owner_email)
        if not valid:
            return jsonify({'success': False, 'message': msg}), 400
        valid, msg = validate_password(owner_password)
        if not valid:
            return jsonify({'success': False, 'message': msg}), 400
        
        owner = User(
            name=owner_name or 'Restaurant Owner',
            email=owner_email,
            role='restaurant_owner'
        )
        owner.set_password(owner_password)
        db.session.add(owner)
        db.session.flush()  # Get the owner ID
    
    # Create restaurant
    restaurant = Restaurant(
        owner_id=owner.id if owner else None,
        name=name,
        slug=slug,
        description=data.get('description'),
        phone=data.get('phone'),
        whatsapp=data.get('whatsapp'),
        address=data.get('address'),
        currency=data.get('currency', 'DA'),
        status=data.get('status', 'active'),
        payment_mode=data.get('payment_mode', 'cash_after_service'),
        table_count=data.get('table_count', 10)
    )
    db.session.add(restaurant)
    db.session.flush()
    
    # Create default design
    design = RestaurantDesign(
        restaurant_id=restaurant.id,
        template_key='modern',
        status='published',
        settings_json=RestaurantDesign.DEFAULT_SETTINGS
    )
    db.session.add(design)
    db.session.flush()
    
    restaurant.active_design_id = design.id
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Restaurant created successfully',
        'data': restaurant.to_dict(include_owner=True)
    }), 201


@admin_bp.route('/restaurants/<int:restaurant_id>', methods=['GET'])
@super_admin_required
def get_restaurant(restaurant_id):
    """Get restaurant details"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    return jsonify({
        'success': True,
        'data': restaurant.to_dict(include_owner=True, include_stats=True)
    })


@admin_bp.route('/restaurants/<int:restaurant_id>', methods=['PUT'])
@super_admin_required
def update_restaurant(restaurant_id):
    """Update restaurant"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    data = request.get_json() or {}
    
    updatable = ['name', 'description', 'phone', 'whatsapp', 'address', 
                 'currency', 'status', 'payment_mode', 'table_count',
                 'logo_url', 'cover_image_url']
    
    for field in updatable:
        if field in data:
            setattr(restaurant, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Restaurant updated',
        'data': restaurant.to_dict(include_owner=True)
    })


@admin_bp.route('/restaurants/<int:restaurant_id>', methods=['DELETE'])
@super_admin_required
def delete_restaurant(restaurant_id):
    """Delete restaurant and all associated data"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    db.session.delete(restaurant)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Restaurant deleted'
    })


@admin_bp.route('/restaurants/<int:restaurant_id>/reset-password', methods=['POST'])
@super_admin_required
def reset_owner_password(restaurant_id):
    """Reset restaurant owner password"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    
    if not restaurant.owner:
        return jsonify({'success': False, 'message': 'No owner found'}), 404
    
    data = request.get_json() or {}
    new_password = data.get('new_password', 'Restaurant@123')
    
    restaurant.owner.set_password(new_password)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Owner password reset successfully',
        'data': {
            'new_password': new_password
        }
    })


@admin_bp.route('/restaurants/<int:restaurant_id>/staff', methods=['GET'])
@super_admin_required
def get_restaurant_staff(restaurant_id):
    """Get all staff members for a specific restaurant"""
    restaurant = Restaurant.query.get_or_404(restaurant_id)
    
    staff_members = Staff.query.filter_by(restaurant_id=restaurant.id).all()
    
    return jsonify({
        'success': True,
        'data': [s.to_dict() for s in staff_members]
    })


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@super_admin_required
def update_user_details(user_id):
    """Update any user's details (name, email, password) by super admin"""
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if name:
        valid, msg = validate_name(name)
        if not valid:
            return jsonify({'success': False, 'message': msg}), 400
        user.name = name
        
    if email and email != user.email:
        valid, msg = validate_email(email)
        if not valid:
            return jsonify({'success': False, 'message': msg}), 400
        
        # Check if new email is already taken by another user
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != user.id:
            return jsonify({'success': False, 'message': 'Email is already registered to another user'}), 409
            
        user.email = email
        
    if password:
        valid, msg = validate_password(password)
        if not valid:
            return jsonify({'success': False, 'message': msg}), 400
        user.set_password(password)
        
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'User updated successfully',
        'data': user.to_dict()
    })



# ============ ORDERS ============
@admin_bp.route('/orders', methods=['GET'])
@super_admin_required
def get_all_orders():
    """Get all orders across all restaurants"""
    status = request.args.get('status')
    restaurant_id = request.args.get('restaurant_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    query = Order.query
    
    if status:
        query = query.filter_by(order_status=status)
    if restaurant_id:
        query = query.filter_by(restaurant_id=restaurant_id)
    
    pagination = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'orders': [o.to_dict(include_items=True, include_restaurant=True) for o in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    })


# ============ ANALYTICS ============
@admin_bp.route('/analytics', methods=['GET'])
@super_admin_required
def get_analytics():
    """Get platform-wide analytics"""
    from datetime import datetime, timedelta
    
    days = request.args.get('days', 30, type=int)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Views over time
    views_data = db.session.query(
        func.date(MenuView.viewed_at).label('date'),
        func.count(MenuView.id).label('views')
    ).filter(
        MenuView.viewed_at >= start_date
    ).group_by(func.date(MenuView.viewed_at)).order_by('date').all()
    
    # Orders over time
    orders_data = db.session.query(
        func.date(Order.created_at).label('date'),
        func.count(Order.id).label('orders'),
        func.sum(Order.total_price).label('revenue')
    ).filter(
        Order.created_at >= start_date,
        Order.order_status != 'cancelled'
    ).group_by(func.date(Order.created_at)).order_by('date').all()
    
    # Top restaurants by orders
    top_restaurants = db.session.query(
        Restaurant.id,
        Restaurant.name,
        func.count(Order.id).label('order_count'),
        func.sum(Order.total_price).label('revenue')
    ).join(Order).filter(
        Order.created_at >= start_date
    ).group_by(Restaurant.id).order_by(desc('order_count')).limit(10).all()
    
    # Top items
    top_items = db.session.query(
        MenuItem.id,
        MenuItem.name,
        func.count(OrderItem.id).label('order_count')
    ).join(OrderItem).join(Order).filter(
        Order.created_at >= start_date
    ).group_by(MenuItem.id).order_by(desc('order_count')).limit(10).all()
    
    return jsonify({
        'success': True,
        'data': {
            'views_chart': [{'date': str(v[0]), 'views': v[1]} for v in views_data],
            'orders_chart': [{'date': str(o[0]), 'orders': o[1], 'revenue': float(o[2] or 0)} for o in orders_data],
            'top_restaurants': [{'id': r[0], 'name': r[1], 'orders': r[2], 'revenue': float(r[3] or 0)} for r in top_restaurants],
            'top_items': [{'id': i[0], 'name': i[1], 'orders': i[2]} for i in top_items]
        }
    })


# ============ TEMPLATES ============
@admin_bp.route('/templates', methods=['GET'])
@super_admin_required
def get_templates():
    """Get all menu templates"""
    templates = Template.query.all()
    return jsonify({
        'success': True,
        'data': [t.to_dict() for t in templates]
    })


@admin_bp.route('/templates', methods=['POST'])
@super_admin_required
def create_template():
    """Create a new template"""
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    key = data.get('key', '').strip()
    
    if not name or not key:
        return jsonify({'success': False, 'message': 'Name and key are required'}), 400
    
    if Template.query.filter_by(key=key).first():
        return jsonify({'success': False, 'message': 'Template key already exists'}), 409
    
    template = Template(
        name=name,
        key=key,
        description=data.get('description'),
        preview_image=data.get('preview_image'),
        default_settings_json=data.get('default_settings_json', {}),
        is_active=data.get('is_active', True)
    )
    db.session.add(template)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Template created',
        'data': template.to_dict()
    }), 201


@admin_bp.route('/templates/<int:template_id>', methods=['PUT'])
@super_admin_required
def update_template(template_id):
    """Update template"""
    template = Template.query.get_or_404(template_id)
    data = request.get_json() or {}
    
    for field in ['name', 'description', 'preview_image', 'default_settings_json', 'is_active']:
        if field in data:
            setattr(template, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Template updated',
        'data': template.to_dict()
    })
