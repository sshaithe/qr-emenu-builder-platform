import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  QrCode,
  Utensils,
  BarChart3,
  Paintbrush,
  Smartphone,
  ChefHat,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  ShoppingCart,
  Moon,
  Sun,
} from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';
import { useDarkMode } from '@/context/DarkModeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { lang, changeLang } = useDashLang();
  const { isDark, toggleDark } = useDarkMode();

  const isRTL = lang === 'ar';

  const L = (en: string, fr: string, ar: string, tr: string) => {
    if (lang === 'fr') return fr;
    if (lang === 'ar') return ar;
    if (lang === 'tr') return tr;
    return en;
  };

  return (
    <div className={`min-h-screen bg-white dark:bg-gray-950 transition-colors ${isRTL ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">QR E-Menu</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">{L('Features','Fonctionnalités','المميزات','Özellikler')}</a>
              <a href="#how-it-works" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">{L('How It Works','Comment ça marche','كيف تعمل','Nasıl Çalışır')}</a>
              <a href="#pricing" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">{L('Pricing','Tarifs','الأسعار','Fiyatlandırma')}</a>
              
              <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-4">
                <button onClick={toggleDark} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                  {(['en','fr','ar','tr'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => changeLang(l)}
                      className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${lang === l ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      {l === 'ar' ? 'عر' : l}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="border-gray-200 dark:border-gray-800 dark:text-white dark:hover:bg-gray-800"
              >
                {L('Sign In','Se Connecter','تسجيل الدخول','Giriş Yap')}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {L('Get Started','Commencer','ابدأ الآن','Başla')}
              </Button>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <button onClick={toggleDark} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Button
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {L('Sign In','Connexion','دخول','Giriş')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-950 transition-colors">
        <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                {L('The #1 QR Menu Platform','La plateforme N°1 de menus QR','المنصة رقم 1 لقوائم QR','1 Numaralı QR Menü Platformu')}
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                {L('Turn Your Menu','Transformez Votre Menu','حوّل قائمتك إلى','Menünüzü')}
                <span className="text-amber-500"> {L('Digital','Digital','رقمية','Dijital')} </span>
                {L('in Minutes','en Quelques Minutes','في دقائق','Saniyeler İçinde Dönüştürün')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                {L('Create beautiful QR code menus for your restaurant. Let customers scan, browse, and order directly from their phones. No app download needed.',
                   'Créez de superbes menus QR pour votre restaurant. Laissez vos clients scanner, naviguer et commander depuis leur téléphone. Aucune application requise.',
                   'أنشئ قوائم QR جميلة لمطعمك. دع العملاء يمسحون ويتصفحون ويطلبون مباشرة من هواتفهم. لا حاجة لتحميل أي تطبيق.',
                   "Restoranınız için güzel QR kod menüleri oluşturun. Müşterilerin telefonlarından taramalarına, göz atmalarına ve sipariş vermelerine izin verin. Uygulama indirmeye gerek yok.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 h-12 text-base"
                >
                  {L('Start Free Trial','Essai Gratuit','ابدأ التجربة المجانية','Ücretsiz Denemeye Başla')}
                  <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/r/demo-restaurant?table=1')}
                  className="border-gray-300 dark:border-gray-700 dark:text-white h-12 text-base px-8"
                >
                  <Smartphone className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {L('View Demo Menu','Voir le Menu Démo','عرض القائمة التجريبية','Demo Menüyü Görüntüle')}
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {L('No credit card','Sans carte bancaire','بدون بطاقة ائتمان','Kredi kartı gerekmez')}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {L('14-day free','14 jours gratuits','14 يوم مجانًا','14 gün ücretsiz')}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {L('Cancel anytime','Annulable à tout moment','إلغاء في أي وقت','İstediğiniz zaman iptal edin')}
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto w-72 sm:w-80 lg:w-96">
                {/* Phone Mockup */}
                <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Phone Header */}
                    <div className="bg-amber-500 px-4 py-6 text-white">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src="/images/restaurant-logo.jpg"
                          alt="Restaurant"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white"
                        />
                        <div>
                          <h3 className="font-bold text-lg">Aurum Kitchen</h3>
                          <p className="text-xs text-amber-100">Table 5</p>
                        </div>
                      </div>
                    </div>
                    {/* Phone Content */}
                    <div className="p-3 space-y-3">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {['Starters', 'Burgers', 'Pizza', 'Drinks'].map((cat) => (
                          <span
                            key={cat}
                            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                              cat === 'Burgers'
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { name: 'Classic Burger', price: '650 DA', img: '/images/food-burger.jpg' },
                          { name: 'Pepperoni Pizza', price: '650 DA', img: '/images/food-pizza.jpg' },
                        ].map((item) => (
                          <div key={item.name} className="bg-gray-50 rounded-xl overflow-hidden">
                            <img src={item.img} alt={item.name} className="w-full h-20 object-cover" />
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-amber-600 font-semibold">{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-amber-500 text-white rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-sm font-medium">2 items</span>
                        </div>
                        <span className="text-sm font-bold">1,300 DA</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating Badge */}
                <div className={`absolute -bottom-4 ${isRTL ? '-right-4' : '-left-4'} bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 flex items-center gap-2`}>
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{L('Scan to Order','Scannez pour commander','امسح للطلب','Sipariş İçin Tara')}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{L('QR Code Menu','Menu QR','قائمة QR','QR Kod Menü')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-900 dark:bg-gray-950 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '500+', label: L('Restaurants','Restaurants','مطاعم','Restoranlar'), icon: ChefHat },
              { value: '100K+', label: L('Orders Processed','Commandes traitées','طلبات منجزة','İşlenen Siparişler'), icon: ShoppingCart },
              { value: '1M+', label: L('Menu Views','Vues du menu','مشاهدات القائمة','Menü Görüntülemeleri'), icon: BarChart3 },
              { value: '98%', label: L('Satisfaction','Satisfaction','رضا العملاء','Memnuniyet'), icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {L('Everything You Need to Run Your Restaurant',
                 'Tout ce dont vous avez besoin pour gérer votre restaurant',
                 'كل ما تحتاجه لإدارة مطعمك',
                 'Restoranınızı Yönetmek İçin İhtiyacınız Olan Her Şey')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {L('From QR code generation to real-time analytics, our platform gives you complete control over your digital menu experience.',
                 'De la génération de code QR aux analyses en temps réel, notre plateforme vous donne un contrôle total sur votre expérience de menu numérique.',
                 'من إنشاء أكواد QR إلى التحليلات الفورية، تمنحك منصتنا تحكماً كاملاً في تجربة قائمتك الرقمية.',
                 'QR kod oluşturmadan gerçek zamanlı analizlere kadar, platformumuz dijital menü deneyiminiz üzerinde size tam kontrol sağlar.')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: QrCode,
                title: L('QR Code Generation','Génération de QR Code','إنشاء كود QR','QR Kod Oluşturma'),
                description: L('Generate unique QR codes for each table. Customers scan and instantly see your menu.',
                               'Générez des codes QR uniques pour chaque table. Les clients scannent et voient instantanément votre menu.',
                               'قم بإنشاء أكواد QR فريدة لكل طاولة. يقوم العملاء بالمسح ورؤية قائمتك على الفور.',
                               'Her masa için benzersiz QR kodları oluşturun. Müşteriler tarar ve menünüzü anında görür.'),
                color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              },
              {
                icon: Utensils,
                title: L('Menu Management','Gestion du Menu','إدارة القائمة','Menü Yönetimi'),
                description: L('Add, edit, and organize your menu items with categories, prices, and photos.',
                               'Ajoutez, modifiez et organisez vos plats avec des catégories, des prix et des photos.',
                               'أضف، حرر، ونظم عناصر قائمتك مع الفئات والأسعار والصور.',
                               'Kategoriler, fiyatlar ve fotoğraflarla menü öğelerinizi ekleyin, düzenleyin ve organize edin.'),
                color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              },
              {
                icon: Paintbrush,
                title: L('No-Code Design Editor','Éditeur de Design Sans Code','محرر تصميم بدون كود','Kodsuz Tasarım Düzenleyici'),
                description: L('Customize colors, fonts, layouts, and more with our visual design editor. No coding required.',
                               'Personnalisez les couleurs, les polices, les mises en page et plus encore avec notre éditeur visuel. Aucun codage requis.',
                               'قم بتخصيص الألوان والخطوط والتخطيطات والمزيد باستخدام محرر التصميم المرئي الخاص بنا. لا حاجة لأي كود.',
                               'Görsel tasarım düzenleyicimizle renkleri, yazı tiplerini, düzenleri ve daha fazlasını özelleştirin. Kodlama gerekmez.'),
                color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
              },
              {
                icon: BarChart3,
                title: L('Real-Time Analytics','Analyses en Temps Réel','تحليلات فورية','Gerçek Zamanlı Analizler'),
                description: L('Track menu views, orders, sales, and customer behavior with beautiful charts.',
                               'Suivez les vues du menu, les commandes, les ventes et le comportement des clients avec de superbes graphiques.',
                               'تتبع مشاهدات القائمة والطلبات والمبيعات وسلوك العملاء من خلال رسوم بيانية جميلة.',
                               'Güzel grafiklerle menü görüntülemelerini, siparişleri, satışları ve müşteri davranışlarını takip edin.'),
                color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
              },
              {
                icon: ShoppingCart,
                title: L('Order Management','Gestion des Commandes','إدارة الطلبات','Sipariş Yönetimi'),
                description: L('Receive and manage customer orders in real-time. Update status from new to served.',
                               'Recevez et gérez les commandes des clients en temps réel. Mettez à jour le statut de nouveau à servi.',
                               'استقبل وأدر طلبات العملاء في الوقت الفعلي. قم بتحديث الحالة من جديد إلى تم التقديم.',
                               'Müşteri siparişlerini gerçek zamanlı olarak alın ve yönetin. Durumu yeninden servis edildiye güncelleyin.'),
                color: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
              },
              {
                icon: Smartphone,
                title: L('Mobile-First Design','Design Orienté Mobile','تصميم متوافق مع الموبايل','Mobil Öncelikli Tasarım'),
                description: L('Your menu looks stunning on every device. Optimized for phones, tablets, and desktops.',
                               'Votre menu est magnifique sur tous les appareils. Optimisé pour téléphones, tablettes et ordinateurs de bureau.',
                               'تبدو قائمتك مذهلة على كل جهاز. مُحسّنة للهواتف والأجهزة اللوحية وأجهزة الكمبيوتر المكتبية.',
                               'Menünüz her cihazda çarpıcı görünüyor. Telefonlar, tabletler ve masaüstü bilgisayarlar için optimize edilmiştir.'),
                color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-500/50 hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-950/50 transition-colors border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">{L('How It Works','Comment ça marche','كيف تعمل','Nasıl Çalışır')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {L('Get started in three simple steps','Commencez en trois étapes simples','ابدأ في ثلاث خطوات بسيطة','Üç basit adımda başlayın')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: L('Create Your Menu','Créez votre menu','أنشئ قائمتك','Menünüzü Oluşturun'),
                description: L('Sign up, add your restaurant details, and build your digital menu with categories and items.',
                               'Inscrivez-vous, ajoutez les détails de votre restaurant et construisez votre menu numérique avec des catégories et des articles.',
                               'سجل، أضف تفاصيل مطعمك، وابنِ قائمتك الرقمية مع الفئات والعناصر.',
                               'Kaydolun, restoran bilgilerinizi ekleyin ve kategoriler ve öğelerle dijital menünüzü oluşturun.'),
              },
              {
                step: '02',
                title: L('Customize Design','Personnalisez le design','خصص التصميم','Tasarımı Özelleştirin'),
                description: L('Choose from 12+ templates and customize colors, fonts, and layout to match your brand.',
                               'Choisissez parmi plus de 12 modèles et personnalisez les couleurs, les polices et la mise en page pour correspondre à votre marque.',
                               'اختر من بين أكثر من 12 قالبًا وقم بتخصيص الألوان والخطوط والتخطيط ليتناسب مع علامتك التجارية.',
                               '12+ şablon arasından seçim yapın ve renkleri, yazı tiplerini ve düzeni markanıza uyacak şekilde özelleştirin.'),
              },
              {
                step: '03',
                title: L('Print QR Codes','Imprimez les codes QR','اطبع أكواد QR','QR Kodları Yazdırın'),
                description: L('Generate QR codes for each table, print them out, and start receiving orders!',
                               'Générez des codes QR pour chaque table, imprimez-les et commencez à recevoir des commandes !',
                               'قم بإنشاء أكواد QR لكل طاولة، واطبعها، وابدأ في استقبال الطلبات!',
                               'Her masa için QR kodları oluşturun, yazdırın ve sipariş almaya başlayın!'),
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 h-full transition-colors">
                  <span className="text-5xl font-bold text-amber-200 dark:text-amber-500/20">{item.step}</span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {L('Simple, Transparent Pricing','Tarification simple et transparente','تسعير بسيط وشفاف','Basit, Şeffaf Fiyatlandırma')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {L('Choose the plan that fits your restaurant','Choisissez le plan qui correspond à votre restaurant','اختر الخطة التي تناسب مطعمك','Restoranınıza uygun planı seçin')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: L('Starter','Débutant','البداية','Başlangıç'),
                price: '2,900',
                period: L('/month','/mois','/شهر','/ay'),
                description: L('Perfect for small cafes','Parfait pour les petits cafés','مثالي للمقاهي الصغيرة','Küçük kafeler için mükemmel'),
                features: [
                  L('1 Restaurant','1 Restaurant','1 مطعم','1 Restoran'),
                  L('50 Menu Items','50 Articles au menu','50 عنصر قائمة','50 Menü Öğesi'),
                  L('10 Tables','10 Tables','10 طاولات','10 Masa'),
                  L('Basic Analytics','Analyses de base','تحليلات أساسية','Temel Analizler'),
                  L('Email Support','Support par e-mail','دعم عبر البريد الإلكتروني','E-posta Desteği')
                ],
                cta: L('Start Free Trial','Essai Gratuit','ابدأ التجربة المجانية','Ücretsiz Denemeye Başla'),
                highlighted: false,
              },
              {
                name: L('Professional','Professionnel','الاحترافية','Profesyonel'),
                price: '5,900',
                period: L('/month','/mois','/شهر','/ay'),
                description: L('For growing restaurants','Pour les restaurants en pleine croissance','للمطاعم المتنامية','Büyüyen restoranlar için'),
                features: [
                  L('1 Restaurant','1 Restaurant','1 مطعم','1 Restoran'),
                  L('Unlimited Menu Items','Articles illimités','عناصر قائمة غير محدودة','Sınırsız Menü Öğesi'),
                  L('50 Tables','50 Tables','50 طاولة','50 Masa'),
                  L('Advanced Analytics','Analyses avancées','تحليلات متقدمة','Gelişmiş Analizler'),
                  L('Priority Support','Support prioritaire','دعم ذو أولوية','Öncelikli Destek'),
                  L('Staff Management','Gestion du personnel','إدارة الموظفين','Personel Yönetimi'),
                  L('Order Management','Gestion des commandes','إدارة الطلبات','Sipariş Yönetimi'),
                ],
                cta: L('Start Free Trial','Essai Gratuit','ابدأ التجربة المجانية','Ücretsiz Denemeye Başla'),
                highlighted: true,
              },
              {
                name: L('Enterprise','Entreprise','الشركات','Kurumsal'),
                price: '14,900',
                period: L('/month','/mois','/شهر','/ay'),
                description: L('For restaurant chains','Pour les chaînes de restaurants','لسلاسل المطاعم','Restoran zincirleri için'),
                features: [
                  L('Multiple Restaurants','Plusieurs restaurants','مطاعم متعددة','Birden Fazla Restoran'),
                  L('Unlimited Everything','Tout illimité','كل شيء غير محدود','Her Şey Sınırsız'),
                  L('Custom Domain','Domaine personnalisé','نطاق مخصص','Özel Alan Adı'),
                  L('API Access','Accès API','وصول API','API Erişimi'),
                  L('Dedicated Support','Support dédié','دعم مخصص','Özel Destek'),
                  L('White Label Option','Option marque blanche','خيار العلامة البيضاء','Beyaz Etiket Seçeneği'),
                ],
                cta: L('Contact Sales','Contacter les ventes','اتصل بالمبيعات','Satışla İletişime Geç'),
                highlighted: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 transition-colors ${
                  plan.highlighted
                    ? 'bg-gray-900 dark:bg-gray-800 text-white shadow-2xl scale-105 border border-gray-800 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>DA{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className={`w-4 h-4 ${plan.highlighted ? 'text-amber-400' : 'text-green-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full h-11 ${
                    plan.highlighted
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                  onClick={() => navigate('/register')}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-amber-500 dark:bg-amber-600 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {L('Ready to Go Digital?','Prêt à passer au numérique ?','جاهز للتحول الرقمي؟','Dijitale Geçmeye Hazır mısınız?')}
          </h2>
          <p className="text-lg text-amber-100 dark:text-amber-50 mb-8 max-w-2xl mx-auto">
            {L('Join hundreds of restaurants already using QR E-Menu to serve their customers better.',
               'Rejoignez des centaines de restaurants qui utilisent déjà QR E-Menu pour mieux servir leurs clients.',
               'انضم إلى مئات المطاعم التي تستخدم بالفعل قوائم QR لتقديم خدمة أفضل لعملائها.',
               'Müşterilerine daha iyi hizmet vermek için zaten QR E-Menü kullanan yüzlerce restorana katılın.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-amber-600 dark:text-amber-700 hover:bg-gray-100 px-8 h-12 text-base"
            >
              {L('Create Free Account','Créer un compte gratuit','إنشاء حساب مجاني','Ücretsiz Hesap Oluştur')}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/r/demo-restaurant?table=1')}
              className="border-white text-white hover:bg-amber-600 dark:hover:bg-amber-700 px-8 h-12 text-base"
            >
              <Smartphone className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {L('Try Demo Menu','Essayer le menu démo','جرب القائمة التجريبية','Demo Menüyü Dene')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">QR E-Menu</span>
              </div>
              <p className="text-sm leading-relaxed">
                {L('The simplest way to digitize your restaurant menu and accept orders via QR codes.',
                   'Le moyen le plus simple de numériser le menu de votre restaurant et d\'accepter des commandes via des codes QR.',
                   'أبسط طريقة لرقمنة قائمة مطعمك وقبول الطلبات عبر أكواد QR.',
                   'Restoran menünüzü dijitalleştirmenin ve QR kodları aracılığıyla sipariş almanın en basit yolu.')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{L('Product','Produit','المنتج','Ürün')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-amber-500 transition-colors">{L('Features','Fonctionnalités','المميزات','Özellikler')}</a></li>
                <li><a href="#pricing" className="hover:text-amber-500 transition-colors">{L('Pricing','Tarifs','الأسعار','Fiyatlandırma')}</a></li>
                <li><span className="hover:text-amber-500 transition-colors cursor-pointer">{L('Templates','Modèles','القوالب','Şablonlar')}</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{L('Company','Entreprise','الشركة','Şirket')}</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-amber-500 transition-colors cursor-pointer">{L('About','À propos','حول','Hakkında')}</span></li>
                <li><span className="hover:text-amber-500 transition-colors cursor-pointer">{L('Blog','Blog','المدونة','Blog')}</span></li>
                <li><span className="hover:text-amber-500 transition-colors cursor-pointer">{L('Contact','Contact','اتصل بنا','İletişim')}</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{L('Support','Support','الدعم','Destek')}</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-amber-500 transition-colors cursor-pointer">{L('Help Center','Centre d\'aide','مركز المساعدة','Yardım Merkezi')}</span></li>
                <li><span className="hover:text-amber-500 transition-colors cursor-pointer">{L('Documentation','Documentation','التوثيق','Dokümantasyon')}</span></li>
                <li><span className="hover:text-amber-500 transition-colors cursor-pointer">{L('API Reference','Référence API','مرجع API','API Referansı')}</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} QR E-Menu Builder. {L('All rights reserved.','Tous droits réservés.','جميع الحقوق محفوظة.','Tüm hakları saklıdır.')}
            </p>
            <div className="flex gap-6 text-sm">
              <span className="hover:text-amber-500 transition-colors cursor-pointer">{L('Privacy','Confidentialité','الخصوصية','Gizlilik')}</span>
              <span className="hover:text-amber-500 transition-colors cursor-pointer">{L('Terms','Conditions','الشروط','Şartlar')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
