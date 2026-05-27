from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import func, desc
from app import db
from app.models.user import User
from app.models.restaurant import Restaurant, RestaurantDesign, Staff
from app.models.menu import Category, MenuItem, Template
from app.models.order import Order, OrderItem
from app.models.analytics import MenuView, QRCode
from app.utils.auth import login_required, owner_required, get_owner_restaurant, staff_or_owner_required, get_staff_restaurant
from app.utils.validators import validate_slug, generate_slug
import qrcode
import os
from io import BytesIO
import base64
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)


def get_restaurant_or_403(restaurant_id=None):
    """Get restaurant with permission check.
    - Super admin: uses restaurant_id query param
    - Owner: returns their own restaurant
    - Staff: returns their linked restaurant ONLY (cannot access other restaurants)
    """
    user = request.current_user

    if user.is_super_admin():
        rid = restaurant_id or request.args.get('restaurant_id', type=int)
        if not rid:
            return None, ('Please specify restaurant_id', 400)
        restaurant = Restaurant.query.get(rid)
        if not restaurant:
            return None, ('Restaurant not found', 404)
        return restaurant, None

    if user.is_owner():
        restaurant = user.restaurant
        if not restaurant:
            return None, ('No restaurant found for this account', 404)
        return restaurant, None

    # Staff member — find THEIR restaurant via Staff table
    staff_record = user.staff_memberships.first()
    if not staff_record:
        return None, ('Your account is not linked to any restaurant', 403)
    restaurant = Restaurant.query.get(staff_record.restaurant_id)
    if not restaurant:
        return None, ('Restaurant not found', 404)
    return restaurant, None


@dashboard_bp.route('/stats', methods=['GET'])
@staff_or_owner_required
def get_dashboard_stats():
    """Get dashboard statistics for the restaurant"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    month_start = today_start - timedelta(days=30)
    
    total_orders = Order.query.filter_by(restaurant_id=restaurant.id).count()
    orders_today = Order.query.filter(
        Order.restaurant_id == restaurant.id,
        Order.created_at >= today_start
    ).count()
    
    total_sales = db.session.query(func.sum(Order.total_price)).filter(
        Order.restaurant_id == restaurant.id,
        Order.order_status != 'cancelled'
    ).scalar() or 0
    
    sales_today = db.session.query(func.sum(Order.total_price)).filter(
        Order.restaurant_id == restaurant.id,
        Order.created_at >= today_start,
        Order.order_status != 'cancelled'
    ).scalar() or 0
    
    total_views = MenuView.query.filter_by(restaurant_id=restaurant.id).count()
    views_today = MenuView.query.filter(
        MenuView.restaurant_id == restaurant.id,
        MenuView.viewed_at >= today_start
    ).count()
    
    total_menu_items = MenuItem.query.filter_by(restaurant_id=restaurant.id).count()
    total_categories = Category.query.filter_by(restaurant_id=restaurant.id).count()
    
    # Recent orders
    recent_orders = Order.query.filter_by(restaurant_id=restaurant.id).order_by(
        Order.created_at.desc()
    ).limit(5).all()
    
    # Popular items
    popular_items = MenuItem.query.filter_by(
        restaurant_id=restaurant.id, is_popular=True, is_available=True
    ).limit(5).all()
    
    return jsonify({
        'success': True,
        'data': {
            'total_orders': total_orders,
            'orders_today': orders_today,
            'total_sales': float(total_sales),
            'sales_today': float(sales_today),
            'total_views': total_views,
            'views_today': views_today,
            'total_menu_items': total_menu_items,
            'total_categories': total_categories,
            'table_count': restaurant.table_count,
            'recent_orders': [o.to_dict(include_items=True) for o in recent_orders],
            'popular_items': [i.to_dict() for i in popular_items]
        }
    })


# ============ RESTAURANT PROFILE ============
@dashboard_bp.route('/restaurant', methods=['GET'])
@owner_required
def get_restaurant():
    """Get restaurant profile"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    return jsonify({
        'success': True,
        'data': restaurant.to_dict()
    })


@dashboard_bp.route('/restaurant', methods=['PUT'])
@owner_required
def update_restaurant_profile():
    """Update restaurant profile"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    data = request.get_json() or {}
    
    updatable = ['name', 'description', 'phone', 'whatsapp', 'address',
                 'currency', 'payment_mode', 'table_count', 'instagram_handle',
                 'website', 'logo_url', 'cover_image_url']
    
    for field in updatable:
        if field in data:
            setattr(restaurant, field, data[field])
    
    # Handle slug update
    if 'name' in data:
        new_slug = generate_slug(data['name'])
        existing = Restaurant.query.filter_by(slug=new_slug).first()
        if not existing or existing.id == restaurant.id:
            restaurant.slug = new_slug
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Restaurant updated',
        'data': restaurant.to_dict()
    })


# ============ CATEGORIES ============
@dashboard_bp.route('/categories', methods=['GET'])
@owner_required
def get_categories():
    """Get all categories for the restaurant"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    categories = Category.query.filter_by(restaurant_id=restaurant.id).order_by(Category.position).all()
    
    return jsonify({
        'success': True,
        'data': [c.to_dict(include_items=True) for c in categories]
    })


@dashboard_bp.route('/categories', methods=['POST'])
@owner_required
def create_category():
    """Create a new category"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    
    if not name:
        return jsonify({'success': False, 'message': 'Category name is required'}), 400
    
    # Get next position
    max_pos = db.session.query(func.max(Category.position)).filter_by(
        restaurant_id=restaurant.id
    ).scalar() or 0
    
    category = Category(
        restaurant_id=restaurant.id,
        name=name,
        description=data.get('description'),
        position=max_pos + 1
    )
    db.session.add(category)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Category created',
        'data': category.to_dict()
    }), 201


@dashboard_bp.route('/categories/<int:category_id>', methods=['PUT'])
@owner_required
def update_category(category_id):
    """Update category"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    category = Category.query.filter_by(id=category_id, restaurant_id=restaurant.id).first()
    if not category:
        return jsonify({'success': False, 'message': 'Category not found'}), 404
    
    data = request.get_json() or {}
    
    if 'name' in data:
        category.name = data['name'].strip()
    if 'description' in data:
        category.description = data['description']
    if 'position' in data:
        category.position = data['position']
    if 'is_active' in data:
        category.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Category updated',
        'data': category.to_dict()
    })


@dashboard_bp.route('/categories/<int:category_id>', methods=['DELETE'])
@owner_required
def delete_category(category_id):
    """Delete category"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    category = Category.query.filter_by(id=category_id, restaurant_id=restaurant.id).first()
    if not category:
        return jsonify({'success': False, 'message': 'Category not found'}), 404
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Category deleted'
    })


# ============ MENU ITEMS ============
@dashboard_bp.route('/items', methods=['GET'])
@owner_required
def get_items():
    """Get all menu items for the restaurant"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    category_id = request.args.get('category_id', type=int)
    query = MenuItem.query.filter_by(restaurant_id=restaurant.id)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    items = query.order_by(MenuItem.position).all()
    
    return jsonify({
        'success': True,
        'data': [item.to_dict(include_category=True) for item in items]
    })


@dashboard_bp.route('/items', methods=['POST'])
@owner_required
def create_item():
    """Create a new menu item"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    price = data.get('price')
    category_id = data.get('category_id')
    
    if not name:
        return jsonify({'success': False, 'message': 'Item name is required'}), 400
    if not price:
        return jsonify({'success': False, 'message': 'Price is required'}), 400
    if not category_id:
        return jsonify({'success': False, 'message': 'Category is required'}), 400
    
    # Verify category belongs to restaurant
    category = Category.query.filter_by(id=category_id, restaurant_id=restaurant.id).first()
    if not category:
        return jsonify({'success': False, 'message': 'Invalid category'}), 400
    
    try:
        price_val = float(price)
    except (ValueError, TypeError):
        return jsonify({'success': False, 'message': 'Invalid price'}), 400
    
    max_pos = db.session.query(func.max(MenuItem.position)).filter_by(
        restaurant_id=restaurant.id
    ).scalar() or 0
    
    item = MenuItem(
        restaurant_id=restaurant.id,
        category_id=category_id,
        name=name,
        description=data.get('description'),
        price=price_val,
        image_url=data.get('image_url'),
        is_available=data.get('is_available', True),
        is_popular=data.get('is_popular', False),
        position=max_pos + 1
    )
    db.session.add(item)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Menu item created',
        'data': item.to_dict()
    }), 201


@dashboard_bp.route('/items/<int:item_id>', methods=['PUT'])
@owner_required
def update_item(item_id):
    """Update menu item"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    item = MenuItem.query.filter_by(id=item_id, restaurant_id=restaurant.id).first()
    if not item:
        return jsonify({'success': False, 'message': 'Item not found'}), 404
    
    data = request.get_json() or {}
    
    updatable = ['name', 'description', 'price', 'image_url', 
                 'is_available', 'is_popular', 'position', 'category_id']
    
    for field in updatable:
        if field in data:
            if field == 'price':
                try:
                    setattr(item, field, float(data[field]))
                except (ValueError, TypeError):
                    return jsonify({'success': False, 'message': 'Invalid price'}), 400
            else:
                setattr(item, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Item updated',
        'data': item.to_dict()
    })


@dashboard_bp.route('/items/<int:item_id>', methods=['DELETE'])
@owner_required
def delete_item(item_id):
    """Delete menu item"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    item = MenuItem.query.filter_by(id=item_id, restaurant_id=restaurant.id).first()
    if not item:
        return jsonify({'success': False, 'message': 'Item not found'}), 404
    
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Item deleted'
    })


# ============ ORDERS ============
@dashboard_bp.route('/orders', methods=['GET'])
@staff_or_owner_required
def get_orders():
    """Get orders for the restaurant"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    query = Order.query.filter_by(restaurant_id=restaurant.id)
    
    if status:
        query = query.filter_by(order_status=status)
    
    pagination = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'orders': [o.to_dict(include_items=True) for o in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        }
    })


@dashboard_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@staff_or_owner_required
def update_order_status(order_id):
    """Update order status"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    order = Order.query.filter_by(id=order_id, restaurant_id=restaurant.id).first()
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404
    
    data = request.get_json() or {}
    new_status = data.get('order_status')
    
    if new_status not in Order.VALID_ORDER_STATUSES:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400
    
    order.order_status = new_status
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Order status updated to {new_status}',
        'data': order.to_dict(include_items=True)
    })


@dashboard_bp.route('/orders/<int:order_id>/payment', methods=['PUT'])
@owner_required
def update_order_payment(order_id):
    """Update order payment status"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    order = Order.query.filter_by(id=order_id, restaurant_id=restaurant.id).first()
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404
    
    data = request.get_json() or {}
    new_status = data.get('payment_status')
    
    if new_status not in Order.VALID_PAYMENT_STATUSES:
        return jsonify({'success': False, 'message': 'Invalid payment status'}), 400
    
    order.payment_status = new_status
    if new_status == 'paid':
        order.order_status = 'paid'
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Payment status updated to {new_status}',
        'data': order.to_dict(include_items=True)
    })


# ============ DESIGN ============
@dashboard_bp.route('/design', methods=['GET'])
@owner_required
def get_design():
    """Get current design (published or draft)"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    # Get published design or the most recent one
    design = None
    if restaurant.active_design_id:
        design = RestaurantDesign.query.get(restaurant.active_design_id)
    
    if not design:
        design = RestaurantDesign.query.filter_by(
            restaurant_id=restaurant.id
        ).order_by(RestaurantDesign.created_at.desc()).first()
    
    if not design:
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
        'data': design.to_dict()
    })


@dashboard_bp.route('/design/draft', methods=['PUT'])
@owner_required
def save_design_draft():
    """Save design as draft"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    data = request.get_json() or {}
    settings = data.get('settings_json', {})
    template_key = data.get('template_key', 'modern')
    
    # Find or create draft design
    design = RestaurantDesign.query.filter_by(
        restaurant_id=restaurant.id,
        status='draft'
    ).first()
    
    if not design:
        design = RestaurantDesign(
            restaurant_id=restaurant.id,
            template_key=template_key,
            status='draft',
            settings_json=settings
        )
        db.session.add(design)
    else:
        design.template_key = template_key
        design.settings_json = settings
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Design draft saved',
        'data': design.to_dict()
    })


@dashboard_bp.route('/design/publish', methods=['POST'])
@owner_required
def publish_design():
    """Publish the current design"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    data = request.get_json() or {}
    settings = data.get('settings_json', {})
    template_key = data.get('template_key', 'modern')
    
    # Unpublish current active design
    if restaurant.active_design_id:
        current = RestaurantDesign.query.get(restaurant.active_design_id)
        if current:
            current.status = 'archived'
    
    # Create new published design
    design = RestaurantDesign(
        restaurant_id=restaurant.id,
        template_key=template_key,
        status='published',
        settings_json=settings
    )
    db.session.add(design)
    db.session.flush()
    
    restaurant.active_design_id = design.id
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Design published',
        'data': design.to_dict()
    })


# ============ QR CODES ============
@dashboard_bp.route('/qr-codes', methods=['GET'])
@owner_required
def get_qr_codes():
    """Get QR codes for the restaurant"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    qr_codes = QRCode.query.filter_by(restaurant_id=restaurant.id).order_by(QRCode.table_number.asc()).all()
    
    return jsonify({
        'success': True,
        'data': [qr.to_dict() for qr in qr_codes]
    })


@dashboard_bp.route('/qr-codes/generate', methods=['POST'])
@owner_required
def generate_qr_codes():
    """Generate QR codes for tables"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    data = request.get_json() or {}
    table_count = data.get('table_count', restaurant.table_count)
    base_url = data.get('base_url', f'/r/{restaurant.slug}')
    
    generated = []
    
    # Generate general menu QR (table 0)
    general_url = f'{base_url}'
    general_qr = _create_qr_code(restaurant.id, 0, general_url, restaurant.logo_url)
    generated.append(general_qr.to_dict())
    
    # Generate table-specific QRs
    for table_num in range(1, table_count + 1):
        table_url = f'{base_url}?table={table_num}'
        qr = _create_qr_code(restaurant.id, table_num, table_url, restaurant.logo_url)
        generated.append(qr.to_dict())
        
    # Delete excess QR codes
    excess_qrs = QRCode.query.filter(
        QRCode.restaurant_id == restaurant.id,
        QRCode.table_number > table_count
    ).all()
    for eqr in excess_qrs:
        try:
            filename = eqr.qr_image_url.split('/')[-1]
            filepath = os.path.join(current_app.config['QR_CODE_FOLDER'], filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass
        db.session.delete(eqr)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Generated {len(generated)} QR codes',
        'data': generated
    })


def _create_qr_code(restaurant_id, table_number, url, logo_url=None):
    """Helper to create QR code with image and optional logo"""
    import urllib.request
    import io
    from PIL import Image

    # Generate QR image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    
    # Add logo if provided
    if logo_url:
        try:
            logo = None
            if logo_url.startswith('/uploads/'):
                relative_path = logo_url.replace('/uploads/', '')
                if relative_path.startswith('/'):
                    relative_path = relative_path[1:]
                local_path = os.path.join(current_app.config['UPLOAD_FOLDER'], relative_path)
                if os.path.exists(local_path):
                    with Image.open(local_path) as logo_file:
                        logo = logo_file.copy()
            elif logo_url.startswith('/images/'):
                frontend_public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'app', 'public'))
                local_path = os.path.join(frontend_public_dir, logo_url.lstrip('/'))
                if os.path.exists(local_path):
                    with Image.open(local_path) as logo_file:
                        logo = logo_file.copy()
            elif logo_url.startswith('http'):
                req = urllib.request.Request(logo_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    with Image.open(io.BytesIO(response.read())) as logo_file:
                        logo = logo_file.copy()
            
            if logo:
                img_w, img_h = img.size
                logo_max_size = int(img_w / 4.0)
                
                # Convert thumbnail correctly
                if hasattr(Image, 'Resampling'):
                    logo.thumbnail((logo_max_size, logo_max_size), Image.Resampling.LANCZOS)
                else:
                    logo.thumbnail((logo_max_size, logo_max_size), Image.ANTIALIAS)
                    
                logo_w, logo_h = logo.size
                
                pos_w = (img_w - logo_w) // 2
                pos_h = (img_h - logo_h) // 2
                
                if logo.mode == 'RGBA':
                    logo_bg = Image.new('RGB', logo.size, 'white')
                    logo_bg.paste(logo, (0, 0), logo)
                    img.paste(logo_bg, (pos_w, pos_h))
                else:
                    img.paste(logo, (pos_w, pos_h))
        except Exception as e:
            print(f"Error adding logo to QR code: {e}")
            pass

    # Save image
    filename = f'qr_{restaurant_id}_{table_number}.png'
    filepath = os.path.join(current_app.config['QR_CODE_FOLDER'], filename)
    img.save(filepath)
    
    # Check if QR code already exists
    existing = QRCode.query.filter_by(
        restaurant_id=restaurant_id, 
        table_number=table_number
    ).first()
    
    if existing:
        existing.qr_url = url
        existing.qr_image_url = f'/uploads/qr_codes/{filename}'
        return existing
    
    qr_code = QRCode(
        restaurant_id=restaurant_id,
        table_number=table_number,
        qr_url=url,
        qr_image_url=f'/uploads/qr_codes/{filename}'
    )
    db.session.add(qr_code)
    return qr_code


# ============ ANALYTICS ============
@dashboard_bp.route('/analytics', methods=['GET'])
@owner_required
def get_analytics():
    """Get restaurant analytics"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    days = request.args.get('days', 30, type=int)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Views over time
    views_data = db.session.query(
        func.date(MenuView.viewed_at).label('date'),
        func.count(MenuView.id).label('views')
    ).filter(
        MenuView.restaurant_id == restaurant.id,
        MenuView.viewed_at >= start_date
    ).group_by(func.date(MenuView.viewed_at)).order_by('date').all()
    
    # Orders over time
    orders_data = db.session.query(
        func.date(Order.created_at).label('date'),
        func.count(Order.id).label('orders'),
        func.sum(Order.total_price).label('revenue')
    ).filter(
        Order.restaurant_id == restaurant.id,
        Order.created_at >= start_date,
        Order.order_status != 'cancelled'
    ).group_by(func.date(Order.created_at)).order_by('date').all()
    
    # Top ordered items
    top_items = db.session.query(
        MenuItem.id,
        MenuItem.name,
        func.count(OrderItem.id).label('order_count'),
        func.sum(OrderItem.quantity).label('total_qty')
    ).join(OrderItem).join(Order).filter(
        Order.restaurant_id == restaurant.id,
        Order.created_at >= start_date
    ).group_by(MenuItem.id).order_by(desc('order_count')).limit(10).all()
    
    # Peak hours
    peak_hours = db.session.query(
        func.extract('hour', Order.created_at).label('hour'),
        func.count(Order.id).label('order_count')
    ).filter(
        Order.restaurant_id == restaurant.id,
        Order.created_at >= start_date
    ).group_by('hour').order_by(desc('order_count')).all()
    
    return jsonify({
        'success': True,
        'data': {
            'views_chart': [{'date': str(v[0]), 'views': v[1]} for v in views_data],
            'orders_chart': [{'date': str(o[0]), 'orders': o[1], 'revenue': float(o[2] or 0)} for o in orders_data],
            'top_items': [{'id': i[0], 'name': i[1], 'orders': i[2], 'quantity': int(i[3] or 0)} for i in top_items],
            'peak_hours': [{'hour': int(h[0]), 'orders': h[1]} for h in peak_hours],
            'period': {'days': days, 'start': start_date.isoformat(), 'end': end_date.isoformat()}
        }
    })


# ============ TEMPLATES ============
@dashboard_bp.route('/templates', methods=['GET'])
@owner_required
def get_available_templates():
    """Get available design templates"""
    templates = Template.query.filter_by(is_active=True).all()
    return jsonify({
        'success': True,
        'data': [t.to_dict() for t in templates]
    })


# ============ STAFF ============
@dashboard_bp.route('/staff', methods=['GET'])
@owner_required
def get_staff():
    """Get staff members for the restaurant"""
    restaurant, error = get_restaurant_or_403(request.args.get('restaurant_id', type=int))
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    staff = Staff.query.filter_by(restaurant_id=restaurant.id).all()
    
    return jsonify({
        'success': True,
        'data': [s.to_dict() for s in staff]
    })


@dashboard_bp.route('/staff', methods=['POST'])
@owner_required
def add_staff():
    """Add staff member to the restaurant.
    - If email already exists as a user, links them as staff (if they aren’t already).
    - Prevents linking super admins or owners of other restaurants.
    - Prevents duplicate staff entries.
    """
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]

    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    name  = data.get('name',  '').strip()
    role  = data.get('role',  'waiter')
    password = data.get('password', 'Staff@123')

    if not email or not name:
        return jsonify({'success': False, 'message': 'Email and name are required'}), 400

    if role not in Staff.VALID_ROLES:
        return jsonify({'success': False, 'message': 'Invalid role'}), 400

    # Check if a user with this email already exists
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        # Block linking super-admins or other restaurant owners
        if existing_user.is_super_admin():
            return jsonify({'success': False, 'message': 'Cannot add a super admin as staff'}), 400
        if existing_user.is_owner() and existing_user.id != request.current_user.id:
            # They own a DIFFERENT restaurant — don’t allow cross-restaurant linking
            return jsonify({'success': False, 'message': 'This email belongs to another restaurant owner'}), 409

        # Check if already staff at THIS restaurant
        already = Staff.query.filter_by(restaurant_id=restaurant.id, user_id=existing_user.id).first()
        if already:
            return jsonify({
                'success': False,
                'message': f'{existing_user.name} is already a staff member at this restaurant'
            }), 409

        # Update their role to match the new staff role (only if they aren't already an owner or super admin)
        if not (existing_user.is_owner() or existing_user.is_super_admin()):
            existing_user.role = role
        user = existing_user
    else:
        # New user — validate email format
        from app.utils.validators import validate_email as _ve
        valid, msg = _ve(email)
        if not valid:
            return jsonify({'success': False, 'message': msg}), 400

        user = User(name=name, email=email, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()   # get user.id without committing

    staff = Staff(restaurant_id=restaurant.id, user_id=user.id, role=role)
    db.session.add(staff)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'{user.name} added as {role}',
        'data': staff.to_dict()
    }), 201


@dashboard_bp.route('/staff/<int:staff_id>', methods=['DELETE'])
@owner_required
def remove_staff(staff_id):
    """Remove staff member"""
    restaurant, error = get_restaurant_or_403()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]
    
    staff = Staff.query.filter_by(id=staff_id, restaurant_id=restaurant.id).first()
    if not staff:
        return jsonify({'success': False, 'message': 'Staff not found'}), 404
    
    db.session.delete(staff)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Staff removed'
    })
