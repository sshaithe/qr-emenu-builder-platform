import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, TrendingUp, Eye, Utensils, ArrowUpRight, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useDashLang } from '@/context/DashLangContext';

const STATUS_DARK: Record<string, string> = {
  new_order:            'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  accepted:             'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
  preparing:            'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
  ready:                'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
  served:               'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  paid:                 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
  cancelled:            'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
  waiting_cash_payment: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
  pending_payment:      'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300',
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const { t } = useDashLang();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await api.getDashboardStats();
      if (res?.success) setStats(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: t.orders,
      value: stats?.total_orders || 0,
      sub: `${stats?.orders_today || 0} ${t.overview === 'نظرة عامة' ? 'اليوم' : t.overview === 'Tableau de bord' ? 'aujourd\'hui' : t.overview === 'Genel Bakış' ? 'bugün' : 'today'}`,
      icon: ShoppingBag,
      iconClass: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
      path: '/dashboard/orders',
    },
    {
      title: t.revenue,
      value: `${(stats?.total_sales || 0).toLocaleString()} DA`,
      sub: `${(stats?.sales_today || 0).toLocaleString()} DA`,
      icon: TrendingUp,
      iconClass: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300',
      path: '/dashboard/analytics',
    },
    {
      title: t.menuViews,
      value: (stats?.total_views || 0).toLocaleString(),
      sub: `${stats?.views_today || 0}`,
      icon: Eye,
      iconClass: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
      path: '/dashboard/analytics',
    },
    {
      title: t.menuItems,
      value: stats?.total_menu_items || 0,
      sub: `${stats?.total_categories || 0} ${t.categories}`,
      icon: Utensils,
      iconClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
      path: '/dashboard/items',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.overview}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ en:'Welcome back! Here\'s what\'s happening today.', fr:'Bienvenue ! Voici ce qui se passe aujourd\'hui.', ar:'مرحباً! إليك ما يحدث اليوم.', tr:'Hoşgeldiniz! Bugün neler oluyor.' }[t.overview==='Overview'?'en':t.overview==='Tableau de bord'?'fr':t.overview==='نظرة عامة'?'ar':'tr']}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm dark:bg-gray-800"
            onClick={() => navigate(card.path)}
          >
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconClass}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-2xl font-bold mt-3 text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">{t.orders} — {t.analytics?.replace('Analytiques','Récents').replace('الإحصائيات','الأخيرة').replace('Analizler','Son') || 'Recent'}</CardTitle>
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
            >
              {t.overview==='نظرة عامة'?'عرض الكل':t.overview==='Tableau de bord'?'Voir tout':t.overview==='Genel Bakış'?'Tümünü Gör':'View All'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {stats?.recent_orders?.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {stats.recent_orders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/dashboard/orders')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t.table} {order.table_number}</span>
                        <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{order.items?.length || 0} items</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.total_price} DA</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_DARK[order.order_status] || STATUS_DARK.served}`}>
                      {order.order_status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Orders will appear here when customers place them</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popular Items */}
      {stats?.popular_items?.length > 0 && (
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">{t.topItems}</CardTitle>
              <button
                onClick={() => navigate('/dashboard/items')}
                className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
              >
                {t.edit} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.popular_items.map((item: any) => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.name} className="w-full h-24 object-cover" />
                  )}
                  <div className="p-2.5">
                    <p className="text-xs font-medium truncate text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-0.5">{item.price} DA</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.addItem || 'Add Item', path: '/dashboard/items',    icon: Utensils,    desc: t.menuItemsTitle || 'Add new dish' },
          { label: t.orders,              path: '/dashboard/orders',   icon: ShoppingBag, desc: t.manageOrders || 'View & update' },
          { label: t.design,              path: '/dashboard/design',   icon: TrendingUp,  desc: t.overview === 'نظرة عامة' ? 'خصّص قائمتك' : t.overview === 'Tableau de bord' ? 'Personnaliser' : t.overview === 'Genel Bakış' ? 'Özelleştir' : 'Customize menu' },
          { label: t.qrCodes,             path: '/dashboard/qr-codes', icon: Eye,         desc: t.generateQR || 'Download & print' },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-sm transition-all text-left"
          >
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <action.icon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{action.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
