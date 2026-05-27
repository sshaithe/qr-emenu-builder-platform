/**
 * Multi-language translations for the Public Customer Menu
 * Supports: English (en), French (fr), Arabic (ar), Turkish (tr)
 */

export type LangCode = 'en' | 'fr' | 'ar' | 'tr';

export interface Translations {
  // Menu header
  welcome: string;
  searchPlaceholder: string;
  allCategories: string;
  popular: string;

  // Cart
  cart: string;
  cartEmpty: string;
  cartEmptyHint: string;
  total: string;
  placeOrder: string;
  placingOrder: string;
  yourName: string;
  yourPhone: string;
  orderNote: string;
  orderNotePlaceholder: string;

  // Order actions
  addToCart: string;
  soldOut: string;
  remove: string;
  activeOrder: string;
  trackOrder: string;

  // Service
  callWaiter: string;
  requestBill: string;
  waiterComing: string;
  billSent: string;

  // WhatsApp (general menu / no table)
  contactRestaurant: string;
  callUs: string;
  orderViaWhatsApp: string;
  whatsAppMessage: string; // template — use {name}, {items}, {total}
  noTableMode: string;
  noTableHint: string;

  // Misc
  table: string;
  currency: string;
}

const translations: Record<LangCode, Translations> = {
  en: {
    welcome: 'Welcome',
    searchPlaceholder: 'Search the menu...',
    allCategories: 'All',
    popular: 'Popular',
    cart: 'Your Order',
    cartEmpty: 'Your cart is empty',
    cartEmptyHint: 'Add items from the menu to start ordering',
    total: 'Total',
    placeOrder: 'Place Order',
    placingOrder: 'Placing order...',
    yourName: 'Your Name',
    yourPhone: 'Phone (optional)',
    orderNote: 'Note for kitchen',
    orderNotePlaceholder: 'Any allergies, preferences...',
    addToCart: 'Add',
    soldOut: 'Sold Out',
    remove: 'Remove',
    activeOrder: 'Active Order Found',
    trackOrder: 'Track Order',
    callWaiter: 'Call Waiter',
    requestBill: 'Request Bill',
    waiterComing: '🛎️ Waiter is on the way!',
    billSent: '🧾 Bill request sent!',
    contactRestaurant: 'Contact Restaurant',
    callUs: '📞 Call Us',
    orderViaWhatsApp: '💬 Order via WhatsApp',
    whatsAppMessage: 'Hello! I would like to order:\n\n{items}\n\n*Total: {total}*\n\nMy name: {name}',
    noTableMode: 'Browse Our Menu',
    noTableHint: 'You can call us or send your order directly via WhatsApp',
    table: 'Table',
    currency: 'DA',
  },

  fr: {
    welcome: 'Bienvenue',
    searchPlaceholder: 'Rechercher dans le menu...',
    allCategories: 'Tout',
    popular: 'Populaires',
    cart: 'Votre commande',
    cartEmpty: 'Votre panier est vide',
    cartEmptyHint: 'Ajoutez des articles pour commencer',
    total: 'Total',
    placeOrder: 'Commander',
    placingOrder: 'En cours...',
    yourName: 'Votre nom',
    yourPhone: 'Téléphone (optionnel)',
    orderNote: 'Note pour la cuisine',
    orderNotePlaceholder: 'Allergies, préférences...',
    addToCart: 'Ajouter',
    soldOut: 'Épuisé',
    remove: 'Retirer',
    activeOrder: 'Commande en cours',
    trackOrder: 'Suivre la commande',
    callWaiter: 'Appeler le serveur',
    requestBill: 'Demander l\'addition',
    waiterComing: '🛎️ Le serveur arrive!',
    billSent: '🧾 Demande envoyée!',
    contactRestaurant: 'Contacter le restaurant',
    callUs: '📞 Nous appeler',
    orderViaWhatsApp: '💬 Commander via WhatsApp',
    whatsAppMessage: 'Bonjour! Je voudrais commander:\n\n{items}\n\n*Total: {total}*\n\nMon nom: {name}',
    noTableMode: 'Parcourir notre menu',
    noTableHint: 'Appelez-nous ou envoyez votre commande via WhatsApp',
    table: 'Table',
    currency: 'DA',
  },

  ar: {
    welcome: 'أهلاً وسهلاً',
    searchPlaceholder: 'ابحث في القائمة...',
    allCategories: 'الكل',
    popular: 'الأكثر طلباً',
    cart: 'طلبك',
    cartEmpty: 'سلة الطلبات فارغة',
    cartEmptyHint: 'أضف عناصر من القائمة لبدء الطلب',
    total: 'المجموع',
    placeOrder: 'تأكيد الطلب',
    placingOrder: 'جاري الإرسال...',
    yourName: 'اسمك',
    yourPhone: 'رقم الهاتف (اختياري)',
    orderNote: 'ملاحظة للمطبخ',
    orderNotePlaceholder: 'حساسية، تفضيلات...',
    addToCart: 'أضف',
    soldOut: 'نفد المخزون',
    remove: 'إزالة',
    activeOrder: 'تم العثور على طلب نشط',
    trackOrder: 'تتبع الطلب',
    callWaiter: 'استدعاء النادل',
    requestBill: 'طلب الحساب',
    waiterComing: '🛎️ النادل في الطريق!',
    billSent: '🧾 تم إرسال طلب الحساب!',
    contactRestaurant: 'تواصل مع المطعم',
    callUs: '📞 اتصل بنا',
    orderViaWhatsApp: '💬 اطلب عبر واتساب',
    whatsAppMessage: 'مرحباً! أريد الطلب:\n\n{items}\n\n*المجموع: {total}*\n\nاسمي: {name}',
    noTableMode: 'تصفح قائمتنا',
    noTableHint: 'يمكنك الاتصال بنا أو إرسال طلبك مباشرة عبر واتساب',
    table: 'طاولة',
    currency: 'دج',
  },

  tr: {
    welcome: 'Hoş Geldiniz',
    searchPlaceholder: 'Menüde ara...',
    allCategories: 'Tümü',
    popular: 'Popüler',
    cart: 'Siparişiniz',
    cartEmpty: 'Sepetiniz boş',
    cartEmptyHint: 'Sipariş vermek için menüden ürün ekleyin',
    total: 'Toplam',
    placeOrder: 'Sipariş Ver',
    placingOrder: 'Gönderiliyor...',
    yourName: 'Adınız',
    yourPhone: 'Telefon (isteğe bağlı)',
    orderNote: 'Mutfak notu',
    orderNotePlaceholder: 'Alerji, tercihler...',
    addToCart: 'Ekle',
    soldOut: 'Tükendi',
    remove: 'Kaldır',
    activeOrder: 'Aktif Sipariş Bulundu',
    trackOrder: 'Siparişi Takip Et',
    callWaiter: 'Garson Çağır',
    requestBill: 'Hesap İste',
    waiterComing: '🛎️ Garson geliyor!',
    billSent: '🧾 Hesap isteği gönderildi!',
    contactRestaurant: 'Restoranla İletişim',
    callUs: '📞 Bizi Arayın',
    orderViaWhatsApp: '💬 WhatsApp ile Sipariş',
    whatsAppMessage: 'Merhaba! Sipariş vermek istiyorum:\n\n{items}\n\n*Toplam: {total}*\n\nAdım: {name}',
    noTableMode: 'Menümüze Göz Atın',
    noTableHint: 'Bizi arayabilir veya WhatsApp üzerinden sipariş verebilirsiniz',
    table: 'Masa',
    currency: 'DA',
  },
};

export function getTranslations(lang: LangCode): Translations {
  return translations[lang] || translations.en;
}

export function buildWhatsAppMessage(
  t: Translations,
  cart: Array<{ item: { name: string; price: number }; quantity: number }>,
  total: number,
  customerName: string,
  currency: string
): string {
  const itemLines = cart
    .map((ci) => `• ${ci.quantity}x ${ci.item.name} — ${ci.item.price * ci.quantity} ${currency}`)
    .join('\n');

  return t.whatsAppMessage
    .replace('{items}', itemLines)
    .replace('{total}', `${total} ${currency}`)
    .replace('{name}', customerName || '—');
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  // Remove all non-digits from phone, ensure starts with country code
  const cleaned = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}
