import re
import html
from email.utils import parseaddr

try:
    import bleach
    _BLEACH_AVAILABLE = True
except ImportError:
    _BLEACH_AVAILABLE = False


def sanitize_text(value: str, max_len: int = 500) -> str:
    """Strip all HTML tags and escape special chars. Use for plain text fields."""
    if not value:
        return ''
    # Strip HTML with bleach if available, otherwise use html.escape
    if _BLEACH_AVAILABLE:
        cleaned = bleach.clean(str(value), tags=[], strip=True)
    else:
        cleaned = html.escape(str(value))
    return cleaned[:max_len].strip()


def sanitize_slug(value: str) -> str:
    """Ensure slug contains only safe characters — no injection possible."""
    return re.sub(r'[^a-z0-9\-]', '', str(value).lower())[:150]


def validate_email(email):
    """Validate email format"""
    if not email or len(email) > 120:
        return False, 'Email is required and must be less than 120 characters'
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, 'Invalid email format'
    
    return True, None

def validate_password(password):
    """Validate password strength"""
    if not password:
        return False, 'Password is required'
    
    if len(password) < 6:
        return False, 'Password must be at least 6 characters'
    
    return True, None

def validate_name(name):
    """Validate name"""
    if not name or len(name.strip()) < 2:
        return False, 'Name must be at least 2 characters'
    
    if len(name) > 100:
        return False, 'Name must be less than 100 characters'
    
    return True, None

def validate_price(price):
    """Validate price"""
    try:
        p = float(price)
        if p < 0:
            return False, 'Price cannot be negative'
        return True, None
    except (ValueError, TypeError):
        return False, 'Invalid price format'

def validate_quantity(qty):
    """Validate quantity"""
    try:
        q = int(qty)
        if q < 1:
            return False, 'Quantity must be at least 1'
        return True, None
    except (ValueError, TypeError):
        return False, 'Invalid quantity'

def validate_slug(slug):
    """Validate restaurant slug"""
    if not slug or len(slug) < 3:
        return False, 'Slug must be at least 3 characters'
    
    pattern = r'^[a-z0-9-]+$'
    if not re.match(pattern, slug):
        return False, 'Slug can only contain lowercase letters, numbers, and hyphens'
    
    return True, None

def generate_slug(name):
    """Generate a slug from a name"""
    slug = name.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug[:150]
