import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from app.models.user import User
from app import db

def generate_token(user_id, role, expires_in_days=7):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=expires_in_days),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    return token

def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_auth_token():
    """Extract token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None
    
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == 'bearer':
        return parts[1]
    return None

def get_current_user():
    """Get current authenticated user from token"""
    token = get_auth_token()
    if not token:
        return None
    
    payload = decode_token(token)
    if not payload:
        return None
    
    user = User.query.get(payload.get('user_id'))
    return user

def login_required(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        user = User.query.get(payload.get('user_id'))
        if not user or not user.is_active:
            return jsonify({'success': False, 'message': 'User not found or inactive'}), 401
        
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def super_admin_required(f):
    """Decorator to require super admin role"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        user = User.query.get(payload.get('user_id'))
        if not user or not user.is_active:
            return jsonify({'success': False, 'message': 'User not found or inactive'}), 401
        
        if not user.is_super_admin():
            return jsonify({'success': False, 'message': 'Super admin access required'}), 403
        
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def owner_required(f):
    """Decorator to require restaurant owner role"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        user = User.query.get(payload.get('user_id'))
        if not user or not user.is_active:
            return jsonify({'success': False, 'message': 'User not found or inactive'}), 401
        
        if not (user.is_super_admin() or user.is_owner()):
            return jsonify({'success': False, 'message': 'Restaurant owner access required'}), 403
        
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def staff_or_owner_required(f):
    """Decorator to require restaurant owner OR staff member role.
    Allows cashier, kitchen, waiter, manager to access their restaurant's data."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return jsonify({'success': False, 'message': 'Authentication required'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'success': False, 'message': 'Invalid or expired token'}), 401
        
        user = User.query.get(payload.get('user_id'))
        if not user or not user.is_active:
            return jsonify({'success': False, 'message': 'User not found or inactive'}), 401
        
        staff_roles = ['restaurant_owner', 'manager', 'cashier', 'kitchen', 'waiter', 'super_admin']
        if user.role not in staff_roles:
            return jsonify({'success': False, 'message': 'Access denied'}), 403
        
        request.current_user = user
        return f(*args, **kwargs)
    return decorated

def get_owner_restaurant():
    """Get the restaurant owned by the current user"""
    user = getattr(request, 'current_user', None)
    if not user:
        return None
    
    if user.is_super_admin():
        # Super admin can pass restaurant_id in query params
        restaurant_id = request.args.get('restaurant_id', type=int)
        if restaurant_id:
            from app.models.restaurant import Restaurant
            return Restaurant.query.get(restaurant_id)
        return None
    
    return user.restaurant


def get_staff_restaurant():
    """Get the restaurant for the current user — works for owners AND staff members.
    Staff members find their restaurant through the Staff table."""
    user = getattr(request, 'current_user', None)
    if not user:
        return None
    
    # Super admin: use restaurant_id query param
    if user.is_super_admin():
        restaurant_id = request.args.get('restaurant_id', type=int)
        if restaurant_id:
            from app.models.restaurant import Restaurant
            return Restaurant.query.get(restaurant_id)
        return None
    
    # Owner: direct relationship
    if user.is_owner():
        return user.restaurant
    
    # Staff (cashier, kitchen, waiter, manager): look up through Staff table
    from app.models.restaurant import Staff
    staff = user.staff_memberships.first()
    if staff:
        from app.models.restaurant import Restaurant
        return Restaurant.query.get(staff.restaurant_id)
    
    return None
