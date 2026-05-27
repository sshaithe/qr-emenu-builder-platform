import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from app.utils.auth import login_required
try:
    from PIL import Image as PILImage
    _PIL_AVAILABLE = True
except ImportError:
    _PIL_AVAILABLE = False

uploads_bp = Blueprint('uploads', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB from phone

# Max dimensions per type — keeps delivery fast without visible quality loss
MAX_DIMENSIONS = {
    'logo': (400, 400),
    'cover': (1200, 500),
    'menu_item': (800, 800),
    'general': (1200, 1200),
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def compress_image(filepath, upload_type):
    """Resize & compress image with Pillow to keep sizes web-friendly."""
    if not _PIL_AVAILABLE:
        return
    try:
        max_w, max_h = MAX_DIMENSIONS.get(upload_type, (1200, 1200))
        with PILImage.open(filepath) as img:
            # Convert RGBA/P to RGB for JPEG compatibility
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            # Resize if larger than max
            img.thumbnail((max_w, max_h), PILImage.LANCZOS)
            # Save with optimized quality
            save_kwargs = {'optimize': True}
            ext = os.path.splitext(filepath)[1].lower()
            if ext in ('.jpg', '.jpeg'):
                save_kwargs['quality'] = 82
            img.save(filepath, **save_kwargs)
    except Exception:
        pass  # If Pillow fails, keep original file

@uploads_bp.route('/image', methods=['POST'])
@login_required
def upload_image():
    """Upload an image file from phone or desktop"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file provided'}), 400

    file = request.files['file']
    upload_type = request.form.get('type', 'general')

    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return jsonify({'success': False, 'message': f'File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB'}), 400

    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f'{upload_type}_{uuid.uuid4().hex[:12]}.{ext}'

    folder_map = {'logo': 'logos', 'cover': 'covers', 'menu_item': 'menu_items', 'general': 'general'}
    folder = folder_map.get(upload_type, 'general')
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], folder)
    os.makedirs(upload_dir, exist_ok=True)

    filepath = os.path.join(upload_dir, unique_filename)
    file.save(filepath)

    # Auto-compress/resize
    compress_image(filepath, upload_type)

    # Return compressed file size
    compressed_size = os.path.getsize(filepath)
    file_url = f'/uploads/{folder}/{unique_filename}'

    return jsonify({
        'success': True,
        'message': 'File uploaded successfully',
        'data': {
            'url': file_url,
            'filename': unique_filename,
            'original_size': file_size,
            'compressed_size': compressed_size,
        }
    })



@uploads_bp.route('/delete', methods=['DELETE'])
@login_required
def delete_image():
    """Delete an uploaded image"""
    data = request.get_json() or {}
    file_path = data.get('file_path', '')
    
    if not file_path:
        return jsonify({'success': False, 'message': 'File path is required'}), 400
    
    # Security: block path traversal (works on both Windows and Linux)
    # Use forward slashes only — reject any backslash attempts
    clean = file_path.replace('\\', '/').strip('/')
    # If it starts with uploads/, strip it to inspect the folder relative path
    if clean.startswith('uploads/'):
        clean = clean[len('uploads/'):].strip('/')
        
    if '..' in clean or clean == '':
        return jsonify({'success': False, 'message': 'Invalid file path'}), 400
        
    # Build full path and verify it stays inside UPLOAD_FOLDER
    full_path = os.path.realpath(os.path.join(current_app.config['UPLOAD_FOLDER'], clean))
    upload_root = os.path.realpath(current_app.config['UPLOAD_FOLDER'])
    
    if not full_path.startswith(upload_root):
        return jsonify({'success': False, 'message': 'Invalid file path'}), 400
    
    if os.path.exists(full_path) and os.path.isfile(full_path):
        os.remove(full_path)
        return jsonify({
            'success': True,
            'message': 'File deleted'
        })
    
    return jsonify({
        'success': False,
        'message': 'File not found'
    }), 404
