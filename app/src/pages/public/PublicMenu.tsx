import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ShoppingCart, Plus, Minus, X, Send, User, Phone, FileText,
  UtensilsCrossed, Search, Bell, Receipt, MessageCircle,
} from 'lucide-react';
import {
  type LangCode, getTranslations, buildWhatsAppMessage, buildWhatsAppUrl,
} from '@/data/i18n';

const LANG_LABELS: Record<LangCode, string> = { en: 'EN', fr: 'FR', ar: 'عر', tr: 'TR' };

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  category_id: number;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  note: string;
}

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // table=0 or no table param → general menu mode (WhatsApp/call)
  const rawTable = searchParams.get('table');
  const tableNumber = rawTable ? parseInt(rawTable, 10) : 0;
  const isGeneralMenu = tableNumber === 0 || !rawTable;

  const [lang, setLang] = useState<LangCode>(() => {
    return (localStorage.getItem('menu_lang') as LangCode) || 'en';
  });
  const t = getTranslations(lang);
  const isRTL = lang === 'ar';

  const [restaurant, setRestaurant] = useState<any>(null);
  const [design, setDesign] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [serviceLoading, setServiceLoading] = useState<string | null>(null);

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrderTable, setActiveOrderTable] = useState<string | null>(null);

  const changeLang = (l: LangCode) => {
    setLang(l);
    localStorage.setItem('menu_lang', l);
  };

  const handleWhatsApp = () => {
    const phone = restaurant?.whatsapp || restaurant?.phone || '';
    if (!phone) { toast.error('No WhatsApp number configured'); return; }
    const currency = restaurant?.currency || 'DA';
    const message = cart.length > 0
      ? buildWhatsAppMessage(t, cart, cartTotal, customerName || 'Customer', currency)
      : t.whatsAppMessage.replace('{items}', t.cartEmpty).replace('{total}', '0').replace('{name}', '');
    window.open(buildWhatsAppUrl(phone, message), '_blank');
  };

  const handleCall = () => {
    const phone = restaurant?.phone || restaurant?.whatsapp || '';
    if (!phone) { toast.error('No phone number configured'); return; }
    window.location.href = `tel:${phone}`;
  };

  useEffect(() => {
    loadMenu();
    if (slug) {
      setActiveOrderId(localStorage.getItem(`active_order_${slug}`));
      setActiveOrderTable(localStorage.getItem(`active_order_table_${slug}`));
    }
  }, [slug]);

  const loadMenu = async () => {
    if (!slug) return;
    try {
      const visitorId = localStorage.getItem(`visitor_${slug}`) || undefined;
      const response = await api.getPublicMenu(slug, tableNumber, visitorId);
      if (response?.success && response?.data) {
        setRestaurant(response.data.restaurant);
        setDesign(response.data.design || {});
        setCategories(response.data.categories || []);
        setPopularItems(response.data.popular_items || []);
        if (response.data.visitor_id) {
          localStorage.setItem(`visitor_${slug}`, response.data.visitor_id);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply design settings
  const bgColor = design?.backgroundColor || '#FFFFFF';
  const textColor = design?.textColor || '#111827';
  const primaryColor = design?.primaryColor || '#F59E0B';
  const fontFamily = design?.font || 'Inter';
  const imageShape = design?.imageShape || 'rounded';
  const welcomeText = design?.welcomeText || `Welcome to ${restaurant?.name || 'our restaurant'}!`;

  const getImageClass = () => {
    switch (imageShape) {
      case 'circle': return 'rounded-full aspect-square';
      case 'square': return 'rounded-none';
      case 'rounded-lg': return 'rounded-xl';
      default: return 'rounded-lg';
    }
  };

  const getButtonStyle = () => {
    const style = design?.buttonStyle || 'rounded';
    switch (style) {
      case 'pill': return 'rounded-full';
      case 'rounded-lg': return 'rounded-xl';
      case 'square': return 'rounded-none';
      default: return 'rounded-lg';
    }
  };

  // Filter and search items
  const allItems = useMemo(() => {
    const items: MenuItem[] = [];
    categories.forEach((cat: any) => {
      cat.items?.forEach((item: MenuItem) => items.push(item));
    });
    return items;
  }, [categories]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category_id === parseInt(activeCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [allItems, activeCategory, searchQuery]);

  // Cart functions
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { item, quantity: 1, note: '' }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.item.id === itemId) {
            return { ...ci, quantity: Math.max(0, ci.quantity + delta) };
          }
          return ci;
        })
        .filter((ci) => ci.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);

  const placeOrder = async () => {
    if (!slug || cart.length === 0) return;
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        table_number: tableNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        note: orderNote,
        items: cart.map((ci) => ({
          menu_item_id: ci.item.id,
          quantity: ci.quantity,
          note: ci.note,
        })),
      };

      const response = await api.createOrder(slug, orderData);
      if (response?.success) {
        toast.success('Order placed successfully!');
        setCart([]);
        setIsCartOpen(false);
        const newOrderId = String(response.data.order.id);
        localStorage.setItem(`active_order_${slug}`, newOrderId);
        localStorage.setItem(`active_order_table_${slug}`, String(tableNumber));
        setActiveOrderId(newOrderId);
        setActiveOrderTable(String(tableNumber));
        navigate(`/r/${slug}/order-success/${newOrderId}?table=${tableNumber}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleServiceRequest = async (type: 'call_waiter' | 'request_bill') => {
    if (!slug) return;
    setServiceLoading(type);
    try {
      const fn = type === 'call_waiter' ? api.callWaiter : api.requestBill;
      await fn.call(api, slug, tableNumber);
      toast.success(type === 'call_waiter' ? t.waiterComing : t.billSent);
    } catch (err: any) {
      toast.error(err.message || 'Request failed');
    } finally {
      setServiceLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Restaurant not found</h2>
          <p className="text-sm text-gray-500 mt-1">This menu is no longer available</p>
        </div>
      </div>
    );
  }

  const showCart = restaurant.payment_mode !== 'menu_only';

  return (
    <div
      className="min-h-screen pb-24"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: isRTL ? '"Noto Sans Arabic", sans-serif' : fontFamily,
      }}
    >
      {/* Cover Image */}
      {design?.showCover !== false && restaurant.cover_image_url && (
        <div className="relative h-48 sm:h-56">
          <img
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className={`px-4 ${design?.showCover !== false ? '-mt-16 relative z-10' : 'pt-4'}`}>
        <div className="flex items-center gap-3">
          {design?.showLogo !== false && restaurant.logo_url && (
            <img
              src={restaurant.logo_url}
              alt="Logo"
              className="w-16 h-16 rounded-2xl object-cover border-4 shadow-lg"
              style={{ borderColor: bgColor }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white drop-shadow-lg" style={{ color: design?.showCover !== false ? 'white' : textColor }}>
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: primaryColor, color: 'white' }}
              >
                {isGeneralMenu ? t.noTableMode : `${t.table} ${tableNumber}`}
              </span>
              {restaurant.currency && (
                <span className="text-xs opacity-80" style={{ color: design?.showCover !== false ? 'white' : textColor }}>
                  {restaurant.currency}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Language Selector */}
            <div className="flex gap-0.5 bg-black/20 rounded-full p-0.5">
              {(['en','fr','ar','tr'] as LangCode[]).map((l) => (
                <button key={l} onClick={() => changeLang(l)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${
                    lang === l ? 'bg-white text-gray-800' : 'text-white/80 hover:text-white'
                  }`}>
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Search className="w-5 h-5" style={{ color: primaryColor }} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Order Banner */}
      {activeOrderId && !isGeneralMenu && (
        <div className="px-4 mt-4">
          <div className="bg-amber-100 text-amber-800 rounded-2xl p-3 flex items-center justify-between shadow-sm border border-amber-200">
            <span className="text-sm font-semibold">{t.activeOrder}</span>
            <Button 
              size="sm" 
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl h-8 px-3 text-xs shadow-sm"
              onClick={() => navigate(`/r/${slug}/order-success/${activeOrderId}?table=${activeOrderTable}`)}
            >
              {t.trackOrder}
            </Button>
          </div>
        </div>
      )}

      {/* WhatsApp / Call Banner — shown only in General Menu mode (no table) */}
      {isGeneralMenu && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-4 border-2" style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}08` }}>
            <p className="text-sm font-semibold mb-0.5" style={{ color: primaryColor }}>{t.contactRestaurant}</p>
            <p className="text-xs opacity-70 mb-3">{t.noTableHint}</p>
            <div className="flex gap-2">
              {(restaurant?.phone || restaurant?.whatsapp) && (
                <button
                  onClick={handleCall}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {t.callUs}
                </button>
              )}
              {(restaurant?.whatsapp || restaurant?.phone) && (
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.orderViaWhatsApp}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              style={{ backgroundColor: bgColor, color: textColor, borderColor: `${primaryColor}40` }}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Welcome Text */}
      {design?.showWelcome !== false && (
        <div className="px-4 mt-4">
          <p className="text-sm opacity-80">{welcomeText}</p>
        </div>
      )}

      {/* Offer Banner */}
      {design?.offerBanner && (
        <div className="px-4 mt-3">
          <div
            className="rounded-xl px-4 py-2.5 text-xs font-medium text-center"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            {design.offerBanner}
          </div>
        </div>
      )}

      {/* Popular Items */}
      {design?.showPopular !== false && popularItems.length > 0 && activeCategory === 'all' && !searchQuery && (
        <div className="mt-6">
          <h2 className="px-4 text-base font-bold mb-3">Popular</h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x">
            {popularItems.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-36 snap-start"
              >
                <div className={`overflow-hidden ${getImageClass()}`}>
                  <img
                    src={item.image_url || '/images/food-burger.jpg'}
                    alt={item.name}
                    className="w-full h-28 object-cover"
                  />
                </div>
                <p className="text-xs font-medium mt-1.5 truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold" style={{ color: primaryColor }}>
                    {item.price} {restaurant.currency}
                  </span>
                  {showCart && (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="mt-6">
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 snap-x scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium snap-start transition-all ${
                activeCategory === 'all'
                  ? 'text-white shadow-md'
                  : 'border opacity-70 hover:opacity-100'
              }`}
              style={
                activeCategory === 'all'
                  ? { backgroundColor: primaryColor }
                  : { borderColor: `${textColor}20`, color: textColor }
              }
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category.id}
                onClick={() => setActiveCategory(String(cat.category.id))}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium snap-start transition-all ${
                  activeCategory === String(cat.category.id)
                    ? 'text-white shadow-md'
                    : 'border opacity-70 hover:opacity-100'
                }`}
                style={
                  activeCategory === String(cat.category.id)
                    ? { backgroundColor: primaryColor }
                    : { borderColor: `${textColor}20`, color: textColor }
                }
              >
                {cat.category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="mt-4 px-4 space-y-4">
        {(activeCategory === 'all' && !searchQuery
          ? categories
          : [{ category: { id: 0, name: 'Search Results' }, items: filteredItems }]
        ).map((cat: any) => {
          const items = activeCategory === 'all' && !searchQuery ? cat.items || [] : filteredItems;
          if (items.length === 0) return null;

          return (
            <div key={cat.category.id}>
              {activeCategory === 'all' && !searchQuery && (
                <h2 className="text-base font-bold mb-3">{cat.category.name}</h2>
              )}
              <div className="space-y-3">
                {items.map((item: MenuItem) => {
                  const cartItem = cart.find((ci) => ci.item.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: `${textColor}05` }}
                    >
                      {item.image_url && (
                        <div className={`flex-shrink-0 w-20 h-20 overflow-hidden ${getImageClass()}`}>
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{item.name}</h3>
                        <p className="text-xs opacity-70 mt-0.5 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-bold" style={{ color: primaryColor }}>
                            {item.price} {restaurant.currency}
                          </span>
                          {showCart && (
                            <div className="flex items-center gap-2">
                              {cartItem ? (
                                <>
                                  <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center border"
                                    style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="text-sm font-medium w-4 text-center">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => addToCart(item)}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-transform ${getButtonStyle()}`}
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Request FABs (Call Waiter / Bill) */}
      <div className="fixed bottom-6 left-4 z-40 flex flex-col gap-2">
        <button
          onClick={() => handleServiceRequest('call_waiter')}
          disabled={serviceLoading === 'call_waiter'}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl text-white text-sm font-medium active:scale-95 transition-all bg-indigo-500 hover:bg-indigo-600 disabled:opacity-70"
          title="Call Waiter"
        >
          <Bell className="w-4 h-4" />
          {serviceLoading === 'call_waiter' ? '...' : t.callWaiter}
        </button>
        <button
          onClick={() => handleServiceRequest('request_bill')}
          disabled={serviceLoading === 'request_bill'}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl text-white text-sm font-medium active:scale-95 transition-all bg-green-600 hover:bg-green-700 disabled:opacity-70"
          title="Request Bill"
        >
          <Receipt className="w-4 h-4" />
          {serviceLoading === 'request_bill' ? '...' : t.requestBill}
        </button>
      </div>

      {/* Cart FAB */}
      {showCart && cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-4 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-2xl text-white active:scale-95 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-sm font-bold">{cartCount}</span>
          <span className="text-sm">{cartTotal} {restaurant.currency}</span>
        </button>
      )}

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl" style={{ backgroundColor: bgColor }}>
          <SheetHeader className="text-left pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle style={{ color: textColor }}>{t.cart}</SheetTitle>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(85vh-180px)] mt-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{t.cartEmpty}</p>
                <p className="text-xs text-gray-400 mt-1">{t.cartEmptyHint}</p>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {cart.map((ci) => (
                  <div key={ci.item.id} className="flex gap-3 items-start">
                    {ci.item.image_url && (
                      <img
                        src={ci.item.image_url}
                        alt={ci.item.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{ci.item.name}</h4>
                      <p className="text-xs" style={{ color: primaryColor }}>
                        {ci.item.price} {restaurant.currency}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(ci.item.id, -1)}
                        className="w-7 h-7 rounded-full border flex items-center justify-center"
                        style={{ borderColor: `${primaryColor}40` }}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{ci.quantity}</span>
                      <button
                        onClick={() => updateQuantity(ci.item.id, 1)}
                        className="w-7 h-7 rounded-full text-white flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                <Separator className="my-4" />

                {/* Customer Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Your Details</h3>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Your name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone number (optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    />
                  </div>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      placeholder="Special requests (optional)"
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 resize-none"
                      style={{ backgroundColor: bgColor, color: textColor }}
                      rows={2}
                    />
                  </div>
                </div>

                {/* Payment Mode Info */}
                {restaurant.payment_mode === 'cash_before_service' && (
                  <div
                    className="rounded-xl p-3 text-xs"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    Please pay at the cashier. Your order will start after payment confirmation.
                  </div>
                )}

                {restaurant.payment_mode === 'online_required' && (
                  <div
                    className="rounded-xl p-3 text-xs"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                  >
                    Online payment is required. Please complete payment to confirm your order.
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white/95 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">{t.total}</span>
                <span className="text-lg font-bold" style={{ color: primaryColor }}>
                  {cartTotal} {restaurant.currency}
                </span>
              </div>
              {/* WhatsApp button for general menu users (no table) */}
              {isGeneralMenu && (restaurant?.whatsapp || restaurant?.phone) && (
                <button
                  onClick={handleWhatsApp}
                  className="w-full h-12 mb-2 rounded-xl text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  {t.orderViaWhatsApp}
                </button>
              )}
              <Button
                onClick={placeOrder}
                disabled={isPlacingOrder || cart.length === 0 || isGeneralMenu}
                className="w-full h-12 text-white font-semibold"
                style={{ backgroundColor: isGeneralMenu ? '#9CA3AF' : primaryColor }}
                title={isGeneralMenu ? 'Use WhatsApp to send your order' : ''}
              >
                {isPlacingOrder ? t.placingOrder : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {isGeneralMenu ? t.orderViaWhatsApp : (
                      restaurant.payment_mode === 'cash_before_service'
                        ? 'Send Order - Pay at Cashier'
                        : restaurant.payment_mode === 'online_required'
                        ? 'Pay & Place Order'
                        : t.placeOrder
                    )}
                  </>
                )}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Contact Section */}
      {(design?.sections || []).find((s: any) => s.type === 'contact' && s.enabled !== false) && (
        <div className="mt-10 px-4 pb-8">
          <Separator className="mb-6" />
          <h2 className="text-base font-bold mb-4">Contact Us</h2>
          <div className="space-y-2 text-sm opacity-80">
            {restaurant.phone && <p>Phone: {restaurant.phone}</p>}
            {restaurant.whatsapp && <p>WhatsApp: {restaurant.whatsapp}</p>}
            {restaurant.address && <p>Address: {restaurant.address}</p>}
          </div>
          {design?.socialLinks && (
            <div className="flex gap-3 mt-4">
              {design.socialLinks.whatsapp && (
                <a
                  href={`https://wa.me/${design.socialLinks.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
