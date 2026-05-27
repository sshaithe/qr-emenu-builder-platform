from flask import Blueprint, request, jsonify
from app import db
from app.models.restaurant import Restaurant
from app.models.order import Order
from app.models.service import ServiceRequest, Feedback
from app.utils.auth import login_required, owner_required, get_owner_restaurant, staff_or_owner_required
from app.utils.validators import sanitize_text
from datetime import datetime

service_bp = Blueprint('service', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC: Call Waiter / Request Bill (no auth needed – customer facing)
# ─────────────────────────────────────────────────────────────────────────────

@service_bp.route('/public/<string:slug>/service-request', methods=['POST'])
def create_service_request(slug):
    """Customer calls waiter or requests the bill."""
    restaurant = Restaurant.query.filter_by(slug=slug, status='active').first()
    if not restaurant:
        return jsonify({'success': False, 'message': 'Restaurant not found'}), 404

    data = request.get_json() or {}
    request_type = data.get('request_type')
    table_number = data.get('table_number')

    if request_type not in ('call_waiter', 'request_bill'):
        return jsonify({'success': False, 'message': 'Invalid request type'}), 400
    if not table_number:
        return jsonify({'success': False, 'message': 'Table number is required'}), 400

    # Prevent duplicate pending requests for same table+type
    existing = ServiceRequest.query.filter_by(
        restaurant_id=restaurant.id,
        table_number=table_number,
        request_type=request_type,
        status='pending'
    ).first()
    if existing:
        return jsonify({'success': True, 'message': 'Request already pending', 'data': existing.to_dict()})

    sr = ServiceRequest(
        restaurant_id=restaurant.id,
        table_number=table_number,
        request_type=request_type
    )
    db.session.add(sr)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Request sent', 'data': sr.to_dict()}), 201


# ─────────────────────────────────────────────────────────────────────────────
# PUBLIC: Customer submits feedback after order
# ─────────────────────────────────────────────────────────────────────────────

@service_bp.route('/public/<string:slug>/feedback', methods=['POST'])
def submit_feedback(slug):
    """Customer submits a star rating + comment."""
    restaurant = Restaurant.query.filter_by(slug=slug).first()
    if not restaurant:
        return jsonify({'success': False, 'message': 'Restaurant not found'}), 404

    data = request.get_json() or {}
    rating = data.get('rating')
    order_id = data.get('order_id')
    comment = sanitize_text(data.get('comment', ''), max_len=1000)
    customer_name = sanitize_text(data.get('customer_name', ''), max_len=100)
    table_number = data.get('table_number')

    if not rating or int(rating) not in range(1, 6):
        return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400

    # Prevent duplicate feedback per order
    if order_id:
        dupe = Feedback.query.filter_by(order_id=order_id).first()
        if dupe:
            return jsonify({'success': False, 'message': 'Feedback already submitted for this order'}), 409

    fb = Feedback(
        restaurant_id=restaurant.id,
        order_id=order_id,
        table_number=table_number,
        rating=int(rating),
        comment=comment.strip(),
        customer_name=customer_name.strip()
    )
    db.session.add(fb)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Thank you for your feedback!', 'data': fb.to_dict()}), 201


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD: Service request management (owner/staff)
# ─────────────────────────────────────────────────────────────────────────────

@service_bp.route('/dashboard/service-requests', methods=['GET'])
@staff_or_owner_required
def get_service_requests():
    """Get pending service requests for the restaurant."""
    restaurant, error = _get_restaurant()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]

    status_filter = request.args.get('status', 'pending')
    query = ServiceRequest.query.filter_by(restaurant_id=restaurant.id)
    if status_filter != 'all':
        query = query.filter_by(status=status_filter)

    requests_list = query.order_by(ServiceRequest.created_at.desc()).all()
    return jsonify({'success': True, 'data': [r.to_dict() for r in requests_list]})


@service_bp.route('/dashboard/service-requests/<int:req_id>/acknowledge', methods=['PUT'])
@owner_required
def acknowledge_request(req_id):
    """Mark a service request as acknowledged."""
    restaurant, error = _get_restaurant()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]

    sr = ServiceRequest.query.filter_by(id=req_id, restaurant_id=restaurant.id).first()
    if not sr:
        return jsonify({'success': False, 'message': 'Request not found'}), 404

    sr.status = 'acknowledged'
    sr.acknowledged_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'success': True, 'data': sr.to_dict()})


@service_bp.route('/dashboard/service-requests/<int:req_id>/done', methods=['PUT'])
@owner_required
def complete_request(req_id):
    """Mark a service request as done."""
    restaurant, error = _get_restaurant()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]

    sr = ServiceRequest.query.filter_by(id=req_id, restaurant_id=restaurant.id).first()
    if not sr:
        return jsonify({'success': False, 'message': 'Request not found'}), 404

    sr.status = 'done'
    db.session.commit()
    return jsonify({'success': True, 'data': sr.to_dict()})


# ─────────────────────────────────────────────────────────────────────────────
# DASHBOARD: Feedback management (owner)
# ─────────────────────────────────────────────────────────────────────────────

@service_bp.route('/dashboard/feedback', methods=['GET'])
@owner_required
def get_feedback():
    """Get all customer feedback/reviews for the restaurant."""
    restaurant, error = _get_restaurant()
    if error:
        return jsonify({'success': False, 'message': error[0]}), error[1]

    feedback_list = Feedback.query.filter_by(restaurant_id=restaurant.id).order_by(
        Feedback.created_at.desc()
    ).all()

    total = len(feedback_list)
    avg_rating = round(sum(f.rating for f in feedback_list) / total, 1) if total else 0

    return jsonify({
        'success': True,
        'data': {
            'feedback': [f.to_dict() for f in feedback_list],
            'stats': {'total': total, 'average_rating': avg_rating}
        }
    })


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def _get_restaurant():
    """Reuse dashboard helper pattern."""
    from app.routes.dashboard import get_restaurant_or_403
    return get_restaurant_or_403(request.args.get('restaurant_id', type=int))
