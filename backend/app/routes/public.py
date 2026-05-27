from flask import Blueprint, request, jsonify
from sqlalchemy import func
from app import db
from app.models.restaurant import Restaurant, RestaurantDesign
from app.models.menu import Category, MenuItem
from app.models.order import Order, OrderItem
from app.models.analytics import MenuView
from app.utils.validators import validate_quantity, sanitize_text
from datetime import datetime
import uuid

public_bp = Blueprint('public', __name__)


@public_bp.route('/restaurants/<string:slug>/menu', methods=['GET'])
def get_public_menu(slug):
    """Get public menu for a restaurant by slug"""
    restaurant = Restaurant.query.filter_by(slug=slug).first()
    
    if not restaurant:
        return jsonify({'success': False, 'message': 'Restaurant not found'}), 404
    
    if restaurant.status != 'active':
        return jsonify({'success': False, 'message': 'This restaurant is currently unavailable'}), 403
    
    # Track menu view
    table_number = request.args.get('table', type=int)
    visitor_id = request.args.get('visitor_id') or str(uuid.uuid4())
    
    menu_view = MenuView(
        restaurant_id=restaurant.id,
        table_number=table_number,
        visitor_id=visitor_id,
        device_type=_detect_device(request.user_agent.string if request.user_agent else '')
    )
    db.session.add(menu_view)
    db.session.commit()
    
    # Get design settings
    design_settings = RestaurantDesign.DEFAULT_SETTINGS
    if restaurant.active_design_id:
        design = RestaurantDesign.query.get(restaurant.active_design_id)
        if design and design.settings_json:
            design_settings = design.settings_json
    
    # Get categories with items
    categories = Category.query.filter_by(
        restaurant_id=restaurant.id, 
        is_active=True
    ).order_by(Category.position).all()
    
    menu_data = []
    for cat in categories:
        items = MenuItem.query.filter_by(
            category_id=cat.id,
            is_available=True
        ).order_by(MenuItem.position).all()
        
        if items:  # Only include categories that have available items
            menu_data.append({
                'category': cat.to_dict(),
                'items': [item.to_dict() for item in items]
            })
    
    # Get popular items
    popular_items = MenuItem.query.filter_by(
        restaurant_id=restaurant.id,
        is_popular=True,
        is_available=True
    ).limit(6).all()
    
    return jsonify({
        'success': True,
        'data': {
            'restaurant': {
                'id': restaurant.id,
                'name': restaurant.name,
                'slug': restaurant.slug,
                'description': restaurant.description,
                'logo_url': restaurant.logo_url,
                'cover_image_url': restaurant.cover_image_url,
                'phone': restaurant.phone,
                'whatsapp': restaurant.whatsapp,
                'address': restaurant.address,
                'currency': restaurant.currency,
                'payment_mode': restaurant.payment_mode
            },
            'design': design_settings,
            'categories': menu_data,
            'popular_items': [item.to_dict() for item in popular_items],
            'table_number': table_number,
            'visitor_id': visitor_id
        }
    })


@public_bp.route('/restaurants/<string:slug>/orders', methods=['POST'])
def create_order(slug):
    """Create a new order from customer"""
    restaurant = Restaurant.query.filter_by(slug=slug).first()
    
    if not restaurant:
        return jsonify({'success': False, 'message': 'Restaurant not found'}), 404
    
    if restaurant.status != 'active':
        return jsonify({'success': False, 'message': 'Restaurant is currently unavailable'}), 403
    
    data = request.get_json() or {}
    items_data = data.get('items', [])
    
    if not items_data:
        return jsonify({'success': False, 'message': 'Order must contain at least one item'}), 400
    
    # Validate and calculate prices from database
    total_price = 0
    order_items = []
    
    for item_data in items_data:
        menu_item_id = item_data.get('menu_item_id')
        quantity = item_data.get('quantity', 1)
        note = sanitize_text(item_data.get('note', ''), max_len=500)
        
        valid, msg = validate_quantity(quantity)
        if not valid:
            return jsonify({'success': False, 'message': msg}), 400
        
        menu_item = MenuItem.query.filter_by(
            id=menu_item_id,
            restaurant_id=restaurant.id,
            is_available=True
        ).first()
        
        if not menu_item:
            return jsonify({
                'success': False, 
                'message': f'Menu item with ID {menu_item_id} not found or unavailable'
            }), 400
        
        item_total = float(menu_item.price) * int(quantity)
        total_price += item_total
        
        order_items.append({
            'menu_item_id': menu_item.id,
            'item_name': menu_item.name,
            'quantity': int(quantity),
            'unit_price': float(menu_item.price),
            'total_price': item_total,
            'note': note
        })
    
    # Determine order status based on payment mode
    payment_mode = restaurant.payment_mode
    order_status = 'new_order'
    payment_status = 'unpaid'
    
    if payment_mode == 'cash_before_service':
        order_status = 'waiting_cash_payment'
    elif payment_mode == 'online_required':
        order_status = 'pending_payment'
        payment_status = 'pending'
    
    # Create order
    order = Order(
        restaurant_id=restaurant.id,
        table_number=data.get('table_number', 1),
        customer_name=sanitize_text(data.get('customer_name', 'Guest'), max_len=100),
        customer_phone=sanitize_text(data.get('customer_phone', ''), max_len=30),
        note=sanitize_text(data.get('note', ''), max_len=1000),
        total_price=total_price,
        order_status=order_status,
        payment_status=payment_status,
        payment_method='cash'  # Default, can be updated
    )
    db.session.add(order)
    db.session.flush()  # Get order ID
    
    # Create order items
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            **item_data
        )
        db.session.add(order_item)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Order placed successfully',
        'data': {
            'order': order.to_dict(include_items=True),
            'payment_instructions': _get_payment_instructions(payment_mode)
        }
    }), 201


@public_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get order details by ID (used for live tracking)."""
    order = Order.query.get_or_404(order_id)
    data = order.to_dict(include_items=True, include_restaurant=True)

    # Add full restaurant info needed for receipt/tracking page
    if order.restaurant:
        data['restaurant'] = {
            'id': order.restaurant.id,
            'name': order.restaurant.name,
            'slug': order.restaurant.slug,
            'phone': order.restaurant.phone,
            'address': order.restaurant.address,
            'logo_url': order.restaurant.logo_url,
            'currency': order.restaurant.currency,
        }

    # Indicate whether feedback has been submitted
    data['feedback_submitted'] = order.feedback is not None

    return jsonify({
        'success': True,
        'data': data
    })


def _detect_device(user_agent_string):
    """Detect device type from user agent"""
    ua = user_agent_string.lower()
    if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
        return 'mobile'
    elif 'tablet' in ua or 'ipad' in ua:
        return 'tablet'
    return 'desktop'


def _get_payment_instructions(payment_mode):
    """Get payment instructions based on payment mode"""
    instructions = {
        'menu_only': 'This restaurant only offers menu viewing. No ordering available.',
        'cash_after_service': 'Your order has been placed. Please pay after your meal is served.',
        'cash_before_service': 'Please proceed to the cashier to complete payment before your order is prepared.',
        'online_optional': 'Your order has been placed. You can pay cash or use online payment.',
        'online_required': 'Please complete the online payment to confirm your order.'
    }
    return instructions.get(payment_mode, 'Order placed successfully.')
