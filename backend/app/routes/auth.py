from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User
from app.utils.auth import generate_token, login_required, get_current_user
from app.utils.validators import validate_email, validate_password, validate_name

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new restaurant owner"""
    data = request.get_json() or {}
    
    # Validate required fields
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    valid, msg = validate_name(name)
    if not valid:
        return jsonify({'success': False, 'message': msg}), 400
    
    valid, msg = validate_email(email)
    if not valid:
        return jsonify({'success': False, 'message': msg}), 400
    
    valid, msg = validate_password(password)
    if not valid:
        return jsonify({'success': False, 'message': msg}), 400
    
    # Check if email exists
    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'Email already registered'}), 409
    
    # Create user
    user = User(name=name, email=email, role='restaurant_owner')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    # Generate token
    token = generate_token(user.id, user.role)
    
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'data': {
            'user': user.to_dict(),
            'token': token
        }
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user (owner or admin)"""
    data = request.get_json() or {}
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    
    if not user.is_active:
        return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
    
    token = generate_token(user.id, user.role)
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': {
            'user': user.to_dict(include_restaurant=True),
            'token': token
        }
    })


@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout - client-side token removal"""
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })


@auth_bp.route('/me', methods=['GET'])
@login_required
def get_me():
    """Get current authenticated user"""
    user = request.current_user
    return jsonify({
        'success': True,
        'data': {
            'user': user.to_dict(include_restaurant=True)
        }
    })


@auth_bp.route('/change-password', methods=['PUT'])
@login_required
def change_password():
    """Change user password"""
    user = request.current_user
    data = request.get_json() or {}
    
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    
    if not user.check_password(current_password):
        return jsonify({'success': False, 'message': 'Current password is incorrect'}), 400
    
    valid, msg = validate_password(new_password)
    if not valid:
        return jsonify({'success': False, 'message': msg}), 400
    
    user.set_password(new_password)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Password changed successfully'
    })
