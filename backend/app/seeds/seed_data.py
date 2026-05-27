from app import db, create_app
from app.models.user import User
from app.models.restaurant import Restaurant, RestaurantDesign, Staff
from app.models.menu import Category, MenuItem, Template
from app.models.order import Order, OrderItem
from app.models.analytics import MenuView, QRCode
from datetime import datetime, timedelta
import random

def seed_all():
    """Seed all demo data"""
    app = create_app()
    
    with app.app_context():
        print("Starting database seeding...")
        
        # Check if already seeded
        if User.query.filter_by(email='admin@emenue.com').first():
            print("Database already seeded. Skipping...")
            return
        
        seed_templates()
        seed_users()
        seed_restaurant()
        seed_categories_and_items()
        seed_orders()
        seed_menu_views()
        seed_qr_codes()
        
        print("Database seeding completed!")
        print("\n=== TEST CREDENTIALS ===")
        print("Super Admin: admin@emenue.com / Admin@12345")
        print("Restaurant Owner: restaurant@emenue.com / Restaurant@12345")
        print("Demo Menu: http://localhost:3000/r/demo-restaurant?table=1")
        print("========================\n")


def seed_templates():
    """Seed design templates"""
    print("Seeding templates...")
    
    templates = [
        {
            'name': 'Modern Restaurant',
            'key': 'modern',
            'description': 'Clean, modern design with card-based layout',
            'preview_image': '/images/template-modern.jpg',
            'default_settings_json': {
                'template': 'modern',
                'primaryColor': '#F59E0B',
                'backgroundColor': '#FFFFFF',
                'textColor': '#111827',
                'font': 'Inter',
                'buttonStyle': 'rounded',
                'cardStyle': 'shadow',
                'menuLayout': 'grid',
                'categoryStyle': 'pills',
                'imageShape': 'rounded',
                'welcomeText': 'Welcome! Enjoy our delicious menu.',
                'offerBanner': '',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Luxury Black & Gold',
            'key': 'luxury_black_gold',
            'description': 'Premium dark theme with gold accents',
            'preview_image': '/images/template-luxury.jpg',
            'default_settings_json': {
                'template': 'luxury_black_gold',
                'primaryColor': '#D4AF37',
                'backgroundColor': '#0A0A0A',
                'textColor': '#FFFFFF',
                'font': 'Playfair Display',
                'buttonStyle': 'pill',
                'cardStyle': 'bordered',
                'menuLayout': 'list',
                'categoryStyle': 'tabs',
                'imageShape': 'circle',
                'welcomeText': 'Experience culinary excellence.',
                'offerBanner': 'Fine Dining Experience',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Fast Food',
            'key': 'fast_food',
            'description': 'Bold, energetic design for quick service',
            'preview_image': '/images/template-fastfood.jpg',
            'default_settings_json': {
                'template': 'fast_food',
                'primaryColor': '#EF4444',
                'backgroundColor': '#FFFBEB',
                'textColor': '#1E1E1E',
                'font': 'Poppins',
                'buttonStyle': 'rounded-lg',
                'cardStyle': 'shadow-lg',
                'menuLayout': 'grid',
                'categoryStyle': 'chips',
                'imageShape': 'rounded-lg',
                'welcomeText': 'Fast, fresh, delicious!',
                'offerBanner': 'Combo Deals Available!',
                'showLogo': True,
                'showCover': False,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': False},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Pizza Style',
            'key': 'pizza_style',
            'description': 'Italian-inspired warm design',
            'preview_image': '/images/template-pizza.jpg',
            'default_settings_json': {
                'template': 'pizza_style',
                'primaryColor': '#EA580C',
                'backgroundColor': '#FFF7ED',
                'textColor': '#431407',
                'font': 'Inter',
                'buttonStyle': 'rounded-full',
                'cardStyle': 'shadow',
                'menuLayout': 'grid',
                'categoryStyle': 'pills',
                'imageShape': 'rounded',
                'welcomeText': 'Authentic Italian flavors!',
                'offerBanner': 'Free Delivery on Orders Over 2000 DA',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Coffee Shop',
            'key': 'coffee_shop',
            'description': 'Cozy, warm design for cafes',
            'preview_image': '/images/template-coffee.jpg',
            'default_settings_json': {
                'template': 'coffee_shop',
                'primaryColor': '#92400E',
                'backgroundColor': '#FEF3C7',
                'textColor': '#451A03',
                'font': 'Georgia',
                'buttonStyle': 'rounded',
                'cardStyle': 'bordered',
                'menuLayout': 'list',
                'categoryStyle': 'tabs',
                'imageShape': 'rounded',
                'welcomeText': 'Brewed with love.',
                'offerBanner': '',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': False,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': False},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Dark Mode Menu',
            'key': 'dark_mode',
            'description': 'Sleek dark theme for modern restaurants',
            'preview_image': '/images/template-dark.jpg',
            'default_settings_json': {
                'template': 'dark_mode',
                'primaryColor': '#8B5CF6',
                'backgroundColor': '#111827',
                'textColor': '#F9FAFB',
                'font': 'Inter',
                'buttonStyle': 'pill',
                'cardStyle': 'bordered',
                'menuLayout': 'grid',
                'categoryStyle': 'pills',
                'imageShape': 'rounded-lg',
                'welcomeText': 'Welcome to the dark side of flavor.',
                'offerBanner': '',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Minimal Menu',
            'key': 'minimal',
            'description': 'Ultra clean, minimal design',
            'preview_image': '/images/template-minimal.jpg',
            'default_settings_json': {
                'template': 'minimal',
                'primaryColor': '#000000',
                'backgroundColor': '#FFFFFF',
                'textColor': '#171717',
                'font': 'Inter',
                'buttonStyle': 'square',
                'cardStyle': 'flat',
                'menuLayout': 'list',
                'categoryStyle': 'simple',
                'imageShape': 'square',
                'welcomeText': 'Simple. Delicious.',
                'offerBanner': '',
                'showLogo': False,
                'showCover': False,
                'showWelcome': False,
                'showPopular': False,
                'sections': [
                    {'type': 'cover', 'enabled': False},
                    {'type': 'welcome', 'enabled': False},
                    {'type': 'popular_items', 'enabled': False},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Burger House',
            'key': 'burger_house',
            'description': 'Bold and juicy design for burger joints',
            'preview_image': '/images/template-burger.jpg',
            'default_settings_json': {
                'template': 'burger_house',
                'primaryColor': '#F97316',
                'backgroundColor': '#FFF7ED',
                'textColor': '#431407',
                'font': 'Poppins',
                'buttonStyle': 'rounded-lg',
                'cardStyle': 'shadow',
                'menuLayout': 'grid',
                'categoryStyle': 'chips',
                'imageShape': 'rounded-lg',
                'welcomeText': 'Burgers that blow your mind!',
                'offerBanner': 'Double Patty Tuesday!',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Dessert Shop',
            'key': 'dessert_shop',
            'description': 'Sweet, pastel design for dessert shops',
            'preview_image': '/images/template-dessert.jpg',
            'default_settings_json': {
                'template': 'dessert_shop',
                'primaryColor': '#EC4899',
                'backgroundColor': '#FDF2F8',
                'textColor': '#831843',
                'font': 'Georgia',
                'buttonStyle': 'pill',
                'cardStyle': 'shadow-sm',
                'menuLayout': 'grid',
                'categoryStyle': 'pills',
                'imageShape': 'circle',
                'welcomeText': 'Life is short, eat dessert first!',
                'offerBanner': '',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Traditional Algerian',
            'key': 'traditional_algerian',
            'description': 'Warm, earthy design inspired by Algerian cuisine',
            'preview_image': '/images/template-algerian.jpg',
            'default_settings_json': {
                'template': 'traditional_algerian',
                'primaryColor': '#B45309',
                'backgroundColor': '#FEF3C7',
                'textColor': '#451A03',
                'font': 'Georgia',
                'buttonStyle': 'rounded',
                'cardStyle': 'bordered',
                'menuLayout': 'list',
                'categoryStyle': 'tabs',
                'imageShape': 'rounded',
                'welcomeText': 'Welcome to the taste of Algeria!',
                'offerBanner': 'Couscous Friday Special',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Seafood',
            'key': 'seafood',
            'description': 'Ocean-inspired fresh design',
            'preview_image': '/images/template-seafood.jpg',
            'default_settings_json': {
                'template': 'seafood',
                'primaryColor': '#0EA5E9',
                'backgroundColor': '#F0F9FF',
                'textColor': '#0C4A6E',
                'font': 'Inter',
                'buttonStyle': 'rounded-full',
                'cardStyle': 'shadow',
                'menuLayout': 'grid',
                'categoryStyle': 'pills',
                'imageShape': 'rounded',
                'welcomeText': 'Fresh from the ocean to your plate.',
                'offerBanner': 'Daily Fresh Catch!',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        },
        {
            'name': 'Family Restaurant',
            'key': 'family',
            'description': 'Warm, welcoming design for family dining',
            'preview_image': '/images/template-family.jpg',
            'default_settings_json': {
                'template': 'family',
                'primaryColor': '#22C55E',
                'backgroundColor': '#F0FDF4',
                'textColor': '#14532D',
                'font': 'Inter',
                'buttonStyle': 'rounded-lg',
                'cardStyle': 'shadow',
                'menuLayout': 'grid',
                'categoryStyle': 'pills',
                'imageShape': 'rounded',
                'welcomeText': 'A place for the whole family!',
                'offerBanner': 'Kids Eat Free on Sundays!',
                'showLogo': True,
                'showCover': True,
                'showWelcome': True,
                'showPopular': True,
                'sections': [
                    {'type': 'cover', 'enabled': True},
                    {'type': 'welcome', 'enabled': True},
                    {'type': 'popular_items', 'enabled': True},
                    {'type': 'categories', 'enabled': True},
                    {'type': 'full_menu', 'enabled': True},
                    {'type': 'contact', 'enabled': True}
                ]
            }
        }
    ]
    
    for t in templates:
        template = Template(**t)
        db.session.add(template)
    
    db.session.commit()
    print(f"  - Created {len(templates)} templates")


def seed_users():
    """Seed users (super admin and restaurant owner)"""
    print("Seeding users...")
    
    # Super Admin
    admin = User(
        name='Super Admin',
        email='admin@emenue.com',
        role='super_admin',
        is_active=True
    )
    admin.set_password('Admin@12345')
    db.session.add(admin)
    
    # Restaurant Owner
    owner = User(
        name='Restaurant Owner',
        email='restaurant@emenue.com',
        role='restaurant_owner',
        is_active=True
    )
    owner.set_password('Restaurant@12345')
    db.session.add(owner)
    
    db.session.commit()
    print("  - Created super admin: admin@emenue.com")
    print("  - Created restaurant owner: restaurant@emenue.com")


def seed_restaurant():
    """Seed demo restaurant"""
    print("Seeding restaurant...")
    
    owner = User.query.filter_by(email='restaurant@emenue.com').first()
    
    restaurant = Restaurant(
        owner_id=owner.id,
        name='Aurum Kitchen & Bar',
        slug='demo-restaurant',
        description='Experience the finest dining with our carefully crafted menu. From gourmet burgers to authentic pasta, we serve passion on every plate.',
        logo_url='/images/restaurant-logo.jpg',
        cover_image_url='/images/restaurant-cover.jpg',
        phone='+213 555 123 456',
        whatsapp='+213 555 123 456',
        address='123 Boulevard Mohamed VI, Algiers, Algeria',
        currency='DA',
        status='active',
        payment_mode='cash_after_service',
        table_count=15
    )
    db.session.add(restaurant)
    db.session.flush()
    
    # Create published design
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
    
    print(f"  - Created demo restaurant: {restaurant.name} (slug: {restaurant.slug})")


def seed_categories_and_items():
    """Seed categories and menu items"""
    print("Seeding categories and menu items...")
    
    restaurant = Restaurant.query.filter_by(slug='demo-restaurant').first()
    
    categories_data = [
        {'name': 'Starters', 'description': 'Begin your meal with our delicious appetizers'},
        {'name': 'Burgers', 'description': 'Juicy gourmet burgers made with premium beef'},
        {'name': 'Pizza', 'description': 'Authentic wood-fired pizzas'},
        {'name': 'Pasta', 'description': 'Fresh pasta dishes from Italy'},
        {'name': 'Salads', 'description': 'Fresh and healthy salads'},
        {'name': 'Desserts', 'description': 'Sweet treats to end your meal'},
        {'name': 'Drinks', 'description': 'Refreshing beverages'},
        {'name': 'Coffee', 'description': 'Premium coffee and hot drinks'},
    ]
    
    categories = []
    for i, cat_data in enumerate(categories_data):
        cat = Category(
            restaurant_id=restaurant.id,
            name=cat_data['name'],
            description=cat_data['description'],
            position=i + 1
        )
        db.session.add(cat)
        categories.append(cat)
    
    db.session.flush()
    
    # Menu items mapped by category
    menu_items_data = [
        # Starters (category 0)
        [
            {'name': 'Loaded Nachos', 'description': 'Crispy tortilla chips topped with melted cheese, jalapenos, sour cream, guacamole and salsa', 'price': 450, 'image_url': '/images/food-starter.jpg', 'is_popular': True},
            {'name': 'Bruschetta', 'description': 'Toasted bread topped with fresh tomatoes, basil, garlic and olive oil', 'price': 350, 'image_url': None, 'is_popular': False},
            {'name': 'Chicken Wings (6 pcs)', 'description': 'Crispy buffalo wings served with celery sticks and ranch dip', 'price': 550, 'image_url': '/images/food-wings.jpg', 'is_popular': True},
            {'name': 'Onion Rings', 'description': 'Golden crispy onion rings with BBQ dip', 'price': 280, 'image_url': None, 'is_popular': False},
        ],
        # Burgers (category 1)
        [
            {'name': 'Classic Beef Burger', 'description': 'Premium beef patty, cheddar cheese, lettuce, tomato, onion, pickles, special sauce', 'price': 650, 'image_url': '/images/food-burger.jpg', 'is_popular': True},
            {'name': 'Double Cheeseburger', 'description': 'Two beef patties, double cheddar, caramelized onions, brioche bun', 'price': 850, 'image_url': None, 'is_popular': True},
            {'name': 'Chicken Burger', 'description': 'Crispy fried chicken breast, coleslaw, spicy mayo, sesame bun', 'price': 550, 'image_url': None, 'is_popular': False},
            {'name': 'Veggie Burger', 'description': 'Plant-based patty, avocado, sprouts, vegan mayo, whole wheat bun', 'price': 500, 'image_url': None, 'is_popular': False},
        ],
        # Pizza (category 2)
        [
            {'name': 'Margherita Pizza', 'description': 'Classic tomato sauce, fresh mozzarella, basil, olive oil', 'price': 500, 'image_url': None, 'is_popular': False},
            {'name': 'Pepperoni Pizza', 'description': 'Tomato sauce, mozzarella, double pepperoni, oregano', 'price': 650, 'image_url': '/images/food-pizza.jpg', 'is_popular': True},
            {'name': 'Four Cheese Pizza', 'description': 'Mozzarella, cheddar, parmesan, blue cheese, white sauce', 'price': 700, 'image_url': None, 'is_popular': False},
            {'name': 'BBQ Chicken Pizza', 'description': 'BBQ sauce, grilled chicken, red onion, cilantro, mozzarella', 'price': 750, 'image_url': None, 'is_popular': False},
        ],
        # Pasta (category 3)
        [
            {'name': 'Carbonara', 'description': 'Spaghetti with crispy bacon, egg yolk, parmesan, black pepper', 'price': 600, 'image_url': '/images/food-pasta.jpg', 'is_popular': True},
            {'name': 'Bolognese', 'description': 'Spaghetti with slow-cooked beef ragù, tomato sauce, parmesan', 'price': 550, 'image_url': None, 'is_popular': False},
            {'name': 'Alfredo Pasta', 'description': 'Fettuccine with creamy parmesan sauce, grilled chicken', 'price': 650, 'image_url': None, 'is_popular': True},
            {'name': 'Seafood Pasta', 'description': 'Linguine with shrimp, calamari, mussels in garlic white wine sauce', 'price': 800, 'image_url': None, 'is_popular': False},
        ],
        # Salads (category 4)
        [
            {'name': 'Caesar Salad', 'description': 'Romaine lettuce, parmesan croutons, Caesar dressing, grilled chicken', 'price': 450, 'image_url': '/images/food-salad.jpg', 'is_popular': True},
            {'name': 'Greek Salad', 'description': 'Cucumber, tomato, red onion, olives, feta cheese, olive oil', 'price': 380, 'image_url': None, 'is_popular': False},
            {'name': 'Cobb Salad', 'description': 'Mixed greens, avocado, bacon, egg, blue cheese, grilled chicken', 'price': 550, 'image_url': None, 'is_popular': False},
        ],
        # Desserts (category 5)
        [
            {'name': 'Chocolate Lava Cake', 'description': 'Warm chocolate cake with molten center, vanilla ice cream', 'price': 400, 'image_url': '/images/food-dessert.jpg', 'is_popular': True},
            {'name': 'Tiramisu', 'description': 'Italian coffee-flavoured dessert with mascarpone and cocoa', 'price': 350, 'image_url': None, 'is_popular': True},
            {'name': 'Cheesecake', 'description': 'New York style cheesecake with berry compote', 'price': 380, 'image_url': None, 'is_popular': False},
            {'name': 'Ice Cream (3 scoops)', 'description': 'Choice of vanilla, chocolate, or strawberry', 'price': 250, 'image_url': None, 'is_popular': False},
        ],
        # Drinks (category 6)
        [
            {'name': 'Fresh Orange Juice', 'description': 'Freshly squeezed oranges', 'price': 200, 'image_url': None, 'is_popular': False},
            {'name': 'Coca Cola / Pepsi', 'description': '500ml with ice and lemon', 'price': 150, 'image_url': '/images/food-drink.jpg', 'is_popular': True},
            {'name': 'Lemon Mint', 'description': 'Fresh lemon juice with mint leaves', 'price': 180, 'image_url': None, 'is_popular': False},
            {'name': 'Water (500ml)', 'description': 'Still mineral water', 'price': 80, 'image_url': None, 'is_popular': False},
        ],
        # Coffee (category 7)
        [
            {'name': 'Espresso', 'description': 'Single shot of premium espresso', 'price': 120, 'image_url': None, 'is_popular': False},
            {'name': 'Cappuccino', 'description': 'Espresso with steamed milk and foam art', 'price': 180, 'image_url': '/images/food-coffee.jpg', 'is_popular': True},
            {'name': 'Latte', 'description': 'Espresso with velvety steamed milk', 'price': 200, 'image_url': None, 'is_popular': False},
            {'name': 'Turkish Coffee', 'description': 'Traditional Turkish coffee', 'price': 100, 'image_url': None, 'is_popular': False},
        ],
    ]
    
    item_count = 0
    for cat_idx, items in enumerate(menu_items_data):
        category = categories[cat_idx]
        for item_idx, item_data in enumerate(items):
            item = MenuItem(
                restaurant_id=restaurant.id,
                category_id=category.id,
                name=item_data['name'],
                description=item_data['description'],
                price=item_data['price'],
                image_url=item_data['image_url'],
                is_available=True,
                is_popular=item_data['is_popular'],
                position=item_idx + 1
            )
            db.session.add(item)
            item_count += 1
    
    db.session.commit()
    print(f"  - Created {len(categories)} categories")
    print(f"  - Created {item_count} menu items")


def seed_orders():
    """Seed sample orders"""
    print("Seeding orders...")
    
    restaurant = Restaurant.query.filter_by(slug='demo-restaurant').first()
    menu_items = MenuItem.query.filter_by(restaurant_id=restaurant.id).all()
    
    order_statuses = ['new_order', 'accepted', 'preparing', 'ready', 'served', 'paid']
    customer_names = ['Ahmed', 'Fatima', 'Karim', 'Amina', 'Omar', 'Lina', 'Youssef', 'Sara', 'Mohamed', 'Nadia']
    
    for i in range(30):
        # Random items for this order
        num_items = random.randint(1, 4)
        selected_items = random.sample(menu_items, num_items)
        
        total = sum(item.price for item in selected_items) * random.randint(1, 2)
        
        order_date = datetime.utcnow() - timedelta(days=random.randint(0, 14), 
                                                     hours=random.randint(0, 23))
        
        order = Order(
            restaurant_id=restaurant.id,
            table_number=random.randint(1, 15),
            customer_name=random.choice(customer_names),
            customer_phone=f"+213 555 {random.randint(100000, 999999)}",
            note=random.choice(['', 'Extra spicy please', 'No onions', 'Table near window']),
            total_price=total,
            order_status=random.choice(order_statuses),
            payment_status='paid' if random.random() > 0.3 else 'unpaid',
            created_at=order_date
        )
        db.session.add(order)
        db.session.flush()
        
        for item in selected_items:
            qty = random.randint(1, 2)
            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=item.id,
                item_name=item.name,
                quantity=qty,
                unit_price=item.price,
                total_price=float(item.price) * qty
            )
            db.session.add(order_item)
    
    db.session.commit()
    print(f"  - Created 30 sample orders")


def seed_menu_views():
    """Seed menu view analytics"""
    print("Seeding menu views...")
    
    restaurant = Restaurant.query.filter_by(slug='demo-restaurant').first()
    devices = ['mobile', 'mobile', 'mobile', 'desktop', 'tablet']
    
    for i in range(200):
        view_date = datetime.utcnow() - timedelta(days=random.randint(0, 30),
                                                    hours=random.randint(0, 23),
                                                    minutes=random.randint(0, 59))
        
        view = MenuView(
            restaurant_id=restaurant.id,
            table_number=random.randint(1, 15),
            visitor_id=f"visitor_{i}",
            device_type=random.choice(devices),
            viewed_at=view_date
        )
        db.session.add(view)
    
    db.session.commit()
    print(f"  - Created 200 menu view records")


def seed_qr_codes():
    """Seed QR codes"""
    print("Seeding QR codes...")
    
    restaurant = Restaurant.query.filter_by(slug='demo-restaurant').first()
    
    # General QR
    general_qr = QRCode(
        restaurant_id=restaurant.id,
        table_number=0,
        qr_url=f'/r/{restaurant.slug}',
        qr_image_url='/uploads/qr_codes/qr_demo_general.png'
    )
    db.session.add(general_qr)
    
    # Table QRs
    for table in range(1, restaurant.table_count + 1):
        qr = QRCode(
            restaurant_id=restaurant.id,
            table_number=table,
            qr_url=f'/r/{restaurant.slug}?table={table}',
            qr_image_url=f'/uploads/qr_codes/qr_demo_{table}.png'
        )
        db.session.add(qr)
    
    db.session.commit()
    print(f"  - Created {restaurant.table_count + 1} QR code records")


if __name__ == '__main__':
    seed_all()
