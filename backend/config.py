import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

class Config:
    # ─── Core ───────────────────────────────────────────────
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'CHANGE-ME-IN-PRODUCTION-USE-32-CHARS-MIN'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://postgres:postgres@localhost:5432/qr_emenu'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_timeout': 20,
        'pool_recycle': 300,
        'max_overflow': 20,
    }

    # ─── JWT ────────────────────────────────────────────────
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'CHANGE-ME-JWT-USE-32-CHARS-MIN'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # ─── Files ──────────────────────────────────────────────
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    QR_CODE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'qr_codes')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # ─── Admin stealth path ─────────────────────────────────
    # Hackers scanning for /admin will get 404. Only this secret path works.
    ADMIN_SECRET_PATH = os.environ.get('ADMIN_SECRET_PATH') or 'control-panel-8x7k2m'

    # ─── Rate Limiting ──────────────────────────────────────
    RATELIMIT_STORAGE_URI = 'memory://'
    RATELIMIT_DEFAULT = '200 per minute'
    RATELIMIT_HEADERS_ENABLED = True

    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
    RATELIMIT_DEFAULT = '100 per minute'


config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
