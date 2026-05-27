import os
from flask import Flask, send_from_directory, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config_by_name

db = SQLAlchemy()
migrate = Migrate()
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per minute"])


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # ── Extensions ────────────────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            "supports_credentials": True
        }
    })

    # ── Upload directories ────────────────────────────────
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['QR_CODE_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'logos'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'covers'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'menu_items'), exist_ok=True)

    # ── Security Headers ──────────────────────────────────
    @app.after_request
    def set_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=()'
        # Remove server fingerprint
        response.headers.pop('Server', None)
        return response

    # ── Request size guard ────────────────────────────────
    @app.before_request
    def limit_request_size():
        # Reject non-JSON bodies that are suspiciously large
        if request.content_length and request.content_length > app.config['MAX_CONTENT_LENGTH']:
            return jsonify({'success': False, 'message': 'Request too large'}), 413

    # ── Blueprints ────────────────────────────────────────
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.public import public_bp
    from app.routes.uploads import uploads_bp
    from app.routes.service import service_bp
    from app.routes.admin import admin_bp
    # Import new models so db.create_all() sees the tables
    from app.models import service  # noqa: F401

    # Apply stricter rate limits to auth endpoints
    limiter.limit("10 per minute")(auth_bp)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(public_bp, url_prefix='/api/public')
    app.register_blueprint(uploads_bp, url_prefix='/api/uploads')
    app.register_blueprint(service_bp, url_prefix='/api')

    # ── Stealth Admin Path ────────────────────────────────
    # The admin panel is ONLY accessible via /api/<secret>/admin-ops
    # Anyone hitting /api/admin gets a 404 (looks like a normal missing page)
    admin_path = app.config.get('ADMIN_SECRET_PATH', 'control-panel-8x7k2m')
    app.register_blueprint(admin_bp, url_prefix=f'/api/{admin_path}')

    # Decoy trap: return 404 (not 401) for /api/admin to confuse scanners
    @app.route('/api/admin', defaults={'path': ''})
    @app.route('/api/admin/<path:path>')
    def admin_decoy(path):
        return jsonify({'error': 'Not found'}), 404

    # ── Static file serving for uploads ──────────────────
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        # Security: block path traversal (works on both Windows and Linux)
        # Use forward slashes only — reject any backslash attempts
        clean = filename.replace('\\', '/').strip('/')
        if '..' in clean or clean == '':
            return jsonify({'error': 'Not found'}), 404
        # Build full path and verify it stays inside UPLOAD_FOLDER
        full_path = os.path.realpath(os.path.join(app.config['UPLOAD_FOLDER'], clean))
        upload_root = os.path.realpath(app.config['UPLOAD_FOLDER'])
        if not full_path.startswith(upload_root):
            return jsonify({'error': 'Not found'}), 404
        # Serve the file using the folder + relative path split
        folder = os.path.dirname(full_path)
        fname = os.path.basename(full_path)
        return send_from_directory(folder, fname)

    # ── Health check ──────────────────────────────────────
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'ok', 'message': 'QR E-Menu API is running'})

    # ── Global error handlers ────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'success': False, 'message': 'Method not allowed'}), 405

    @app.errorhandler(429)
    def rate_limit_hit(e):
        return jsonify({'success': False, 'message': 'Too many requests. Please slow down.'}), 429

    @app.errorhandler(500)
    def internal_error(e):
        # Never expose stack traces to client
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    # ── Create tables ─────────────────────────────────────
    with app.app_context():
        db.create_all()

    return app
