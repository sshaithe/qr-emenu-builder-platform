/**
 * Dashboard UI translations (EN/FR/AR/TR)
 * Used by the owner dashboard — all pages
 */

export type DashLang = 'en' | 'fr' | 'ar' | 'tr';

export interface DashTranslations {
  // Nav
  overview: string; restaurant: string; categories: string;
  menuItems: string; orders: string; kitchenDisplay: string;
  design: string; qrCodes: string; reviews: string; analytics: string;
  staff: string; settings: string; adminPanel: string;
  darkMode: string; lightMode: string; logout: string;
  // Notifications
  notifications: string; noNotifications: string; newOrder: string;
  callWaiterAlert: string; billRequestAlert: string; markDone: string;
  // Orders
  ordersTitle: string; manageOrders: string; autoRefresh: string;
  all: string; noOrders: string; table: string; markAs: string;
  markPaid: string; printReceipt: string; cancel: string; payment: string; updating: string;
  // Common
  add: string; edit: string; delete: string; save: string; create: string;
  saving: string; optional: string; required: string; name: string;
  description: string; items: string; noItemsYet: string; getStarted: string;
  confirmDelete: string; copy: string; close: string; search: string;
  // Restaurant Profile
  restaurantProfile: string; manageRestaurantInfo: string; photos: string;
  coverImage: string; logo: string; basicInfo: string; restaurantName: string;
  tagline: string; phone: string; address: string; currency: string;
  website: string; instagram: string; saveChanges: string; uploadPhoto: string;
  uploaded: string;
  // Categories
  categoriesTitle: string; organizeMenu: string; addCategory: string;
  categoryName: string; noCategoriesYet: string; addFirstCategory: string;
  deleteConfirmCat: string;
  // Menu Items
  menuItemsTitle: string; itemsAcross: string; addItem: string; price: string;
  available: string; unavailable: string; popular: string;
  noItemsFound: string; addFirstItem: string;
  // QR Codes
  qrCodesTitle: string; generateQR: string; numberOfTables: string;
  generateAll: string; generating: string; copyUrl: string;
  download: string; print: string; general: string;
  noQRYet: string; generateHint: string;
  // Analytics
  analyticsTitle: string; trackPerformance: string; menuViews: string;
  revenue: string; peakHour: string; topItems: string; noData: string;
  // Reviews
  reviewsTitle: string; privateFeedback: string; avgRating: string;
  totalReviews: string; positive: string; ratingBreakdown: string;
  noReviews: string; anonymous: string;
  // Staff
  staffTitle: string; manageTeam: string; addStaff: string;
  noStaff: string; addFirstStaff: string; removeConfirm: string;
  fullName: string; email: string; role: string; password: string;
  // Settings
  settingsTitle: string; manageAccount: string; changePassword: string;
  currentPassword: string; newPassword: string; confirmPassword: string;
  menuUrl: string; shareUrl: string;
  // Kitchen Display
  kdsTitle: string; liveOrders: string; noActiveOrders: string;
  swipeToComplete: string; markReady: string;
}

const T: Record<DashLang, DashTranslations> = {
  en: {
    overview:'Overview', restaurant:'Restaurant', categories:'Categories',
    menuItems:'Menu Items', orders:'Orders', kitchenDisplay:'Kitchen Display',
    design:'Design', qrCodes:'QR Codes', reviews:'Reviews', analytics:'Analytics',
    staff:'Staff', settings:'Settings', adminPanel:'Admin Panel',
    darkMode:'Dark Mode', lightMode:'Light Mode', logout:'Logout',
    notifications:'Notifications', noNotifications:'No new notifications',
    newOrder:'New Order', callWaiterAlert:'Call Waiter', billRequestAlert:'Bill Request',
    markDone:'Done', ordersTitle:'Orders', manageOrders:'Manage incoming orders',
    autoRefresh:'Auto-refreshes every 30s', all:'All', noOrders:'No orders found',
    table:'Table', markAs:'Mark as', markPaid:'Mark Paid', printReceipt:'Print Receipt',
    cancel:'Cancel', payment:'Payment', updating:'Updating...',
    add:'Add', edit:'Edit', delete:'Delete', save:'Save', create:'Create',
    saving:'Saving...', optional:'optional', required:'required',
    name:'Name', description:'Description', items:'items',
    noItemsYet:'No items yet', getStarted:'Get started by adding your first',
    confirmDelete:'Are you sure you want to delete this?',
    copy:'Copy', close:'Close', search:'Search',
    restaurantProfile:'Restaurant Profile', manageRestaurantInfo:'Manage your restaurant information',
    photos:'Photos', coverImage:'Cover Image', logo:'Logo',
    basicInfo:'Basic Information', restaurantName:'Restaurant Name',
    tagline:'Tagline / Slogan', phone:'Phone Number', address:'Address',
    currency:'Currency', website:'Website', instagram:'Instagram',
    saveChanges:'Save Changes', uploadPhoto:'Upload Photo', uploaded:'Uploaded',
    categoriesTitle:'Categories', organizeMenu:'Organize your menu items',
    addCategory:'Add Category', categoryName:'Category name',
    noCategoriesYet:'No categories yet', addFirstCategory:'Add your first category to get started',
    deleteConfirmCat:'Are you sure? This will also delete all items in this category.',
    menuItemsTitle:'Menu Items', itemsAcross:'Items across', addItem:'Add Item',
    price:'Price', available:'Available', unavailable:'Unavailable', popular:'Popular',
    noItemsFound:'No items found', addFirstItem:'Add your first menu item',
    qrCodesTitle:'QR Codes', generateQR:'Generate QR Codes', numberOfTables:'Number of Tables',
    generateAll:'Generate All', generating:'Generating...', copyUrl:'Copy URL',
    download:'Download', print:'Print', general:'General',
    noQRYet:'No QR codes yet', generateHint:'Enter the number of tables and click Generate',
    analyticsTitle:'Analytics', trackPerformance:'Track your restaurant performance',
    menuViews:'Menu Views', revenue:'Revenue', peakHour:'Peak Hour',
    topItems:'Top Ordered Items', noData:'No data available',
    reviewsTitle:'Customer Reviews', privateFeedback:'Private feedback from your customers',
    avgRating:'Avg Rating', totalReviews:'Total Reviews', positive:'Positive',
    ratingBreakdown:'Rating Breakdown', noReviews:'No reviews yet',
    anonymous:'Anonymous',
    staffTitle:'Staff', manageTeam:'Manage your team members', addStaff:'Add Staff',
    noStaff:'No staff members yet', addFirstStaff:'Add your first team member',
    removeConfirm:'Remove this staff member?',
    fullName:'Full name', email:'Email', role:'Role', password:'Password',
    settingsTitle:'Settings', manageAccount:'Manage your account settings',
    changePassword:'Change Password', currentPassword:'Current Password',
    newPassword:'New Password', confirmPassword:'Confirm New Password',
    menuUrl:'Menu URL', shareUrl:'Share this URL with customers or generate QR codes for each table.',
    kdsTitle:'Kitchen Display', liveOrders:'Live Orders', noActiveOrders:'No active orders',
    swipeToComplete:'Mark orders as ready when done', markReady:'Mark Ready',
  },
  fr: {
    overview:'Tableau de bord', restaurant:'Restaurant', categories:'Catégories',
    menuItems:'Articles du menu', orders:'Commandes', kitchenDisplay:'Affichage cuisine',
    design:'Design', qrCodes:'Codes QR', reviews:'Avis', analytics:'Analytiques',
    staff:'Personnel', settings:'Paramètres', adminPanel:'Panneau admin',
    darkMode:'Mode sombre', lightMode:'Mode clair', logout:'Déconnexion',
    notifications:'Notifications', noNotifications:'Aucune nouvelle notification',
    newOrder:'Nouvelle commande', callWaiterAlert:'Appel garçon', billRequestAlert:"Demande d'addition",
    markDone:'Terminé', ordersTitle:'Commandes', manageOrders:'Gérer les commandes entrantes',
    autoRefresh:'Actualisation auto toutes les 30s', all:'Tout', noOrders:'Aucune commande trouvée',
    table:'Table', markAs:'Marquer comme', markPaid:'Marquer payé', printReceipt:'Imprimer reçu',
    cancel:'Annuler', payment:'Paiement', updating:'Mise à jour...',
    add:'Ajouter', edit:'Modifier', delete:'Supprimer', save:'Enregistrer', create:'Créer',
    saving:'Enregistrement...', optional:'optionnel', required:'requis',
    name:'Nom', description:'Description', items:'articles',
    noItemsYet:"Aucun article pour l'instant", getStarted:'Commencez par ajouter votre premier',
    confirmDelete:'Êtes-vous sûr de vouloir supprimer ceci ?',
    copy:'Copier', close:'Fermer', search:'Rechercher',
    restaurantProfile:'Profil du restaurant', manageRestaurantInfo:'Gérez les informations de votre restaurant',
    photos:'Photos', coverImage:'Image de couverture', logo:'Logo',
    basicInfo:'Informations de base', restaurantName:'Nom du restaurant',
    tagline:'Slogan', phone:'Numéro de téléphone', address:'Adresse',
    currency:'Devise', website:'Site web', instagram:'Instagram',
    saveChanges:'Enregistrer les modifications', uploadPhoto:'Télécharger une photo', uploaded:'Téléchargé',
    categoriesTitle:'Catégories', organizeMenu:'Organisez vos articles de menu',
    addCategory:'Ajouter une catégorie', categoryName:'Nom de la catégorie',
    noCategoriesYet:"Aucune catégorie pour l'instant", addFirstCategory:'Ajoutez votre première catégorie pour commencer',
    deleteConfirmCat:'Êtes-vous sûr ? Cela supprimera également tous les articles de cette catégorie.',
    menuItemsTitle:'Articles du menu', itemsAcross:'Articles dans', addItem:'Ajouter un article',
    price:'Prix', available:'Disponible', unavailable:'Indisponible', popular:'Populaire',
    noItemsFound:'Aucun article trouvé', addFirstItem:'Ajoutez votre premier article du menu',
    qrCodesTitle:'Codes QR', generateQR:'Générer des codes QR', numberOfTables:'Nombre de tables',
    generateAll:'Tout générer', generating:'Génération...', copyUrl:"Copier l'URL",
    download:'Télécharger', print:'Imprimer', general:'Général',
    noQRYet:"Aucun code QR pour l'instant", generateHint:'Entrez le nombre de tables et cliquez sur Générer',
    analyticsTitle:'Analytiques', trackPerformance:'Suivez les performances de votre restaurant',
    menuViews:'Vues du menu', revenue:'Chiffre d\'affaires', peakHour:'Heure de pointe',
    topItems:'Articles les plus commandés', noData:'Aucune donnée disponible',
    reviewsTitle:'Avis clients', privateFeedback:'Retours privés de vos clients',
    avgRating:'Note moy.', totalReviews:'Total des avis', positive:'Positifs',
    ratingBreakdown:'Répartition des notes', noReviews:"Aucun avis pour l'instant",
    anonymous:'Anonyme',
    staffTitle:'Personnel', manageTeam:'Gérez les membres de votre équipe', addStaff:'Ajouter un membre',
    noStaff:"Aucun membre du personnel pour l'instant", addFirstStaff:'Ajoutez votre premier membre',
    removeConfirm:'Supprimer ce membre du personnel ?',
    fullName:'Nom complet', email:'Email', role:'Rôle', password:'Mot de passe',
    settingsTitle:'Paramètres', manageAccount:'Gérez les paramètres de votre compte',
    changePassword:'Changer le mot de passe', currentPassword:'Mot de passe actuel',
    newPassword:'Nouveau mot de passe', confirmPassword:'Confirmer le nouveau mot de passe',
    menuUrl:'URL du menu', shareUrl:'Partagez cette URL avec vos clients ou générez des QR codes pour chaque table.',
    kdsTitle:'Affichage cuisine', liveOrders:'Commandes en cours', noActiveOrders:'Aucune commande active',
    swipeToComplete:'Marquez les commandes comme prêtes', markReady:'Marquer prêt',
  },
  ar: {
    overview:'نظرة عامة', restaurant:'المطعم', categories:'الفئات',
    menuItems:'عناصر القائمة', orders:'الطلبات', kitchenDisplay:'شاشة المطبخ',
    design:'التصميم', qrCodes:'رموز QR', reviews:'التقييمات', analytics:'الإحصائيات',
    staff:'الموظفون', settings:'الإعدادات', adminPanel:'لوحة الإدارة',
    darkMode:'الوضع المظلم', lightMode:'الوضع المضيء', logout:'تسجيل الخروج',
    notifications:'الإشعارات', noNotifications:'لا توجد إشعارات جديدة',
    newOrder:'طلب جديد', callWaiterAlert:'استدعاء نادل', billRequestAlert:'طلب الحساب',
    markDone:'تم', ordersTitle:'الطلبات', manageOrders:'إدارة الطلبات الواردة',
    autoRefresh:'تحديث تلقائي كل 30 ثانية', all:'الكل', noOrders:'لا توجد طلبات',
    table:'طاولة', markAs:'تحديد كـ', markPaid:'تحديد كمدفوع', printReceipt:'طباعة الإيصال',
    cancel:'إلغاء', payment:'الدفع', updating:'جاري التحديث...',
    add:'إضافة', edit:'تعديل', delete:'حذف', save:'حفظ', create:'إنشاء',
    saving:'جاري الحفظ...', optional:'اختياري', required:'مطلوب',
    name:'الاسم', description:'الوصف', items:'عناصر',
    noItemsYet:'لا توجد عناصر بعد', getStarted:'ابدأ بإضافة أول',
    confirmDelete:'هل أنت متأكد من الحذف؟',
    copy:'نسخ', close:'إغلاق', search:'بحث',
    restaurantProfile:'ملف المطعم', manageRestaurantInfo:'إدارة معلومات مطعمك',
    photos:'الصور', coverImage:'صورة الغلاف', logo:'الشعار',
    basicInfo:'المعلومات الأساسية', restaurantName:'اسم المطعم',
    tagline:'الشعار / العبارة', phone:'رقم الهاتف', address:'العنوان',
    currency:'العملة', website:'الموقع الإلكتروني', instagram:'إنستغرام',
    saveChanges:'حفظ التغييرات', uploadPhoto:'رفع صورة', uploaded:'تم الرفع',
    categoriesTitle:'الفئات', organizeMenu:'نظّم عناصر قائمتك',
    addCategory:'إضافة فئة', categoryName:'اسم الفئة',
    noCategoriesYet:'لا توجد فئات بعد', addFirstCategory:'أضف أول فئة للبدء',
    deleteConfirmCat:'هل أنت متأكد؟ سيؤدي هذا إلى حذف جميع العناصر في هذه الفئة.',
    menuItemsTitle:'عناصر القائمة', itemsAcross:'عناصر في', addItem:'إضافة عنصر',
    price:'السعر', available:'متاح', unavailable:'غير متاح', popular:'شعبي',
    noItemsFound:'لم يتم العثور على عناصر', addFirstItem:'أضف أول عنصر في القائمة',
    qrCodesTitle:'رموز QR', generateQR:'توليد رموز QR', numberOfTables:'عدد الطاولات',
    generateAll:'توليد الكل', generating:'جاري التوليد...', copyUrl:'نسخ الرابط',
    download:'تحميل', print:'طباعة', general:'عام',
    noQRYet:'لا توجد رموز QR بعد', generateHint:'أدخل عدد الطاولات واضغط توليد',
    analyticsTitle:'الإحصائيات', trackPerformance:'تتبع أداء مطعمك',
    menuViews:'مشاهدات القائمة', revenue:'الإيرادات', peakHour:'ساعة الذروة',
    topItems:'الأكثر طلبًا', noData:'لا توجد بيانات',
    reviewsTitle:'تقييمات العملاء', privateFeedback:'آراء خاصة من عملائك',
    avgRating:'متوسط التقييم', totalReviews:'إجمالي التقييمات', positive:'إيجابية',
    ratingBreakdown:'توزيع التقييمات', noReviews:'لا توجد تقييمات بعد',
    anonymous:'مجهول',
    staffTitle:'الموظفون', manageTeam:'إدارة أعضاء فريقك', addStaff:'إضافة موظف',
    noStaff:'لا يوجد موظفون بعد', addFirstStaff:'أضف أول عضو في الفريق',
    removeConfirm:'هل تريد إزالة هذا الموظف؟',
    fullName:'الاسم الكامل', email:'البريد الإلكتروني', role:'الدور', password:'كلمة المرور',
    settingsTitle:'الإعدادات', manageAccount:'إدارة إعدادات حسابك',
    changePassword:'تغيير كلمة المرور', currentPassword:'كلمة المرور الحالية',
    newPassword:'كلمة المرور الجديدة', confirmPassword:'تأكيد كلمة المرور الجديدة',
    menuUrl:'رابط القائمة', shareUrl:'شارك هذا الرابط مع العملاء أو أنشئ رموز QR لكل طاولة.',
    kdsTitle:'شاشة المطبخ', liveOrders:'الطلبات الحية', noActiveOrders:'لا توجد طلبات نشطة',
    swipeToComplete:'حدد الطلبات كجاهزة عند الانتهاء', markReady:'تحديد كجاهز',
  },
  tr: {
    overview:'Genel Bakış', restaurant:'Restoran', categories:'Kategoriler',
    menuItems:'Menü Öğeleri', orders:'Siparişler', kitchenDisplay:'Mutfak Ekranı',
    design:'Tasarım', qrCodes:'QR Kodlar', reviews:'Yorumlar', analytics:'Analizler',
    staff:'Personel', settings:'Ayarlar', adminPanel:'Yönetici Paneli',
    darkMode:'Karanlık Mod', lightMode:'Aydınlık Mod', logout:'Çıkış Yap',
    notifications:'Bildirimler', noNotifications:'Yeni bildirim yok',
    newOrder:'Yeni Sipariş', callWaiterAlert:'Garson Çağrısı', billRequestAlert:'Hesap İsteği',
    markDone:'Tamamlandı', ordersTitle:'Siparişler', manageOrders:'Gelen siparişleri yönetin',
    autoRefresh:'Her 30 saniyede otomatik güncellenir', all:'Tümü', noOrders:'Sipariş bulunamadı',
    table:'Masa', markAs:'Olarak işaretle', markPaid:'Ödendi Olarak İşaretle',
    printReceipt:'Fiş Yazdır', cancel:'İptal', payment:'Ödeme', updating:'Güncelleniyor...',
    add:'Ekle', edit:'Düzenle', delete:'Sil', save:'Kaydet', create:'Oluştur',
    saving:'Kaydediliyor...', optional:'isteğe bağlı', required:'zorunlu',
    name:'Ad', description:'Açıklama', items:'öğeler',
    noItemsYet:'Henüz öğe yok', getStarted:'İlk öğenizi ekleyerek başlayın',
    confirmDelete:'Bunu silmek istediğinizden emin misiniz?',
    copy:'Kopyala', close:'Kapat', search:'Ara',
    restaurantProfile:'Restoran Profili', manageRestaurantInfo:'Restoran bilgilerinizi yönetin',
    photos:'Fotoğraflar', coverImage:'Kapak Resmi', logo:'Logo',
    basicInfo:'Temel Bilgiler', restaurantName:'Restoran Adı',
    tagline:'Slogan', phone:'Telefon Numarası', address:'Adres',
    currency:'Para Birimi', website:'Web Sitesi', instagram:'Instagram',
    saveChanges:'Değişiklikleri Kaydet', uploadPhoto:'Fotoğraf Yükle', uploaded:'Yüklendi',
    categoriesTitle:'Kategoriler', organizeMenu:'Menü öğelerinizi düzenleyin',
    addCategory:'Kategori Ekle', categoryName:'Kategori adı',
    noCategoriesYet:'Henüz kategori yok', addFirstCategory:'Başlamak için ilk kategorinizi ekleyin',
    deleteConfirmCat:'Emin misiniz? Bu, bu kategorideki tüm öğeleri de siler.',
    menuItemsTitle:'Menü Öğeleri', itemsAcross:'Öğeler', addItem:'Öğe Ekle',
    price:'Fiyat', available:'Mevcut', unavailable:'Mevcut Değil', popular:'Popüler',
    noItemsFound:'Öğe bulunamadı', addFirstItem:'İlk menü öğenizi ekleyin',
    qrCodesTitle:'QR Kodlar', generateQR:'QR Kod Oluştur', numberOfTables:'Masa Sayısı',
    generateAll:'Tümünü Oluştur', generating:'Oluşturuluyor...', copyUrl:"URL'yi Kopyala",
    download:'İndir', print:'Yazdır', general:'Genel',
    noQRYet:'Henüz QR kodu yok', generateHint:"Masa sayısını girin ve Oluştur'a tıklayın",
    analyticsTitle:'Analizler', trackPerformance:'Restoran performansınızı takip edin',
    menuViews:'Menü Görüntülemeleri', revenue:'Gelir', peakHour:'Yoğun Saat',
    topItems:'En Çok Sipariş Edilenler', noData:'Veri bulunamadı',
    reviewsTitle:'Müşteri Yorumları', privateFeedback:'Müşterilerinizden özel geri bildirimler',
    avgRating:'Ort. Puan', totalReviews:'Toplam Yorum', positive:'Olumlu',
    ratingBreakdown:'Puan Dağılımı', noReviews:'Henüz yorum yok',
    anonymous:'Anonim',
    staffTitle:'Personel', manageTeam:'Ekip üyelerinizi yönetin', addStaff:'Personel Ekle',
    noStaff:'Henüz personel üyesi yok', addFirstStaff:'İlk ekip üyenizi ekleyin',
    removeConfirm:'Bu personel üyesini kaldırmak istiyor musunuz?',
    fullName:'Ad Soyad', email:'E-posta', role:'Rol', password:'Şifre',
    settingsTitle:'Ayarlar', manageAccount:'Hesap ayarlarınızı yönetin',
    changePassword:'Şifre Değiştir', currentPassword:'Mevcut Şifre',
    newPassword:'Yeni Şifre', confirmPassword:'Yeni Şifreyi Onayla',
    menuUrl:'Menü URL', shareUrl:"Bu URL'yi müşterilerinizle paylaşın veya her masa için QR kod oluşturun.",
    kdsTitle:'Mutfak Ekranı', liveOrders:'Canlı Siparişler', noActiveOrders:'Aktif sipariş yok',
    swipeToComplete:'Hazır olduğunda siparişleri tamamlandı olarak işaretleyin', markReady:'Hazır İşaretle',
  },
};

export function getDashTranslations(lang: DashLang): DashTranslations {
  return T[lang] || T.en;
}

export function getDashLang(): DashLang {
  return (localStorage.getItem('dash_lang') as DashLang) || 'en';
}

export function setDashLang(lang: DashLang) {
  localStorage.setItem('dash_lang', lang);
}
