import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useDarkMode } from '@/context/DarkModeContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  LayoutDashboard, Utensils, FolderOpen, ClipboardList, ShoppingBag,
  Palette, QrCode, BarChart3, Settings, Users, Menu, LogOut,
  ChevronLeft, ChevronRight, Shield, ChefHat, Star, Moon, Sun, Bell,
  ShoppingCart, CheckCheck, Languages, BellRing, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { type DashLang } from '@/data/dashI18n';
import { useDashLang } from '@/context/DashLangContext';

const DASH_LANGS: DashLang[] = ['en', 'fr', 'ar', 'tr'];
const LANG_LABELS: Record<DashLang, string> = { en: 'EN', fr: 'FR', ar: 'عر', tr: 'TR' };

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSuperAdmin } = useAuth();
  const { isDark, toggleDark } = useDarkMode();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [showNotifs, setShowNotifs] = useState(false);
  const [newOrders, setNewOrders] = useState<any[]>([]);
  const [serviceReqs, setServiceReqs] = useState<any[]>([]);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { lang, t, changeLang } = useDashLang();
  const isRTL = lang === 'ar';
  const totalAlerts = newOrders.length + serviceReqs.length;

  // Detect staff role
  const userRole = user?.role || 'restaurant_owner';
  const isOwner = userRole === 'restaurant_owner' || userRole === 'super_admin';
  const isManager = userRole === 'manager';
  const isCashier = userRole === 'cashier';
  const isKitchen = userRole === 'kitchen';
  const isWaiter = userRole === 'waiter';
  const isStaff = !isOwner;

  // Redirect staff to their default page on load
  useEffect(() => {
    if (!isStaff) return;
    if (isCashier && location.pathname === '/dashboard') navigate('/dashboard/orders', { replace: true });
    if (isKitchen && location.pathname === '/dashboard') navigate('/dashboard/kds', { replace: true });
    if (isWaiter  && location.pathname === '/dashboard') navigate('/dashboard/orders', { replace: true });
    if (isManager && location.pathname === '/dashboard') navigate('/dashboard/orders', { replace: true });
  }, [isStaff, location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for alerts every 20s
  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const [ordRes, srRes] = await Promise.all([
          api.getOrders({ status: 'new_order' }),
          api.getServiceRequests('pending'),
        ]);
        if (!active) return;
        setNewOrders(ordRes?.data?.orders || []);
        setServiceReqs(srRes?.data || []);
      } catch {/* silent — don't break layout on API error */}
    };
    poll();
    const id = setInterval(poll, 20000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    if (!showNotifs) return;
    const handler = (e: MouseEvent) => {
      if (
        !bellRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifs]);

  const dismissSR = async (id: number) => {
    try { await api.acknowledgeServiceRequest(id); } catch {/* silent */}
    setServiceReqs((p) => p.filter((r) => r.id !== id));
  };

  // Role-based nav — staff only see their relevant pages
  const ALL_NAV = [
    { path: '/dashboard',            label: t.overview,        icon: LayoutDashboard, roles: ['owner'] },
    { path: '/dashboard/restaurant', label: t.restaurant,      icon: Utensils,        roles: ['owner', 'manager'] },
    { path: '/dashboard/categories', label: t.categories,      icon: FolderOpen,      roles: ['owner', 'manager'] },
    { path: '/dashboard/items',      label: t.menuItems,       icon: ClipboardList,   roles: ['owner', 'manager'] },
    { path: '/dashboard/orders',     label: t.orders,          icon: ShoppingBag,     roles: ['owner', 'manager', 'cashier', 'waiter'] },
    { path: '/dashboard/kds',        label: t.kitchenDisplay,  icon: ChefHat,         roles: ['owner', 'manager', 'kitchen'] },
    { path: '/dashboard/design',     label: t.design,          icon: Palette,         roles: ['owner', 'manager'] },
    { path: '/dashboard/qr-codes',   label: t.qrCodes,         icon: QrCode,          roles: ['owner', 'manager'] },
    { path: '/dashboard/reviews',    label: t.reviews,         icon: Star,            roles: ['owner', 'manager'] },
    { path: '/dashboard/analytics',  label: t.analytics,       icon: BarChart3,       roles: ['owner', 'manager'] },
    { path: '/dashboard/staff',      label: t.staff,           icon: Users,           roles: ['owner', 'manager'] },
    { path: '/dashboard/settings',   label: t.settings,        icon: Settings,        roles: ['owner', 'manager', 'cashier', 'kitchen', 'waiter'] },
  ];

  const navRoleKey = isOwner ? 'owner' : userRole;
  const navItems = ALL_NAV.filter(item => item.roles.includes(navRoleKey));

  /* ── Sidebar content (shared between desktop + mobile sheet) ── */
  const Sidebar = ({ onNav }: { onNav?: () => void }) => (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Brand */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <QrCode className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">QR E-Menu</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">Restaurant Dashboard</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex w-6 h-6 rounded-full items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            : <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => { navigate(path); onNav?.(); }}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-amber-500' : ''}`} />
              {!collapsed && <span className="truncate">{label}</span>}
              {active && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />}
            </button>
          );
        })}

        {isSuperAdmin && (
          <button
            onClick={() => { navigate('/admin/dashboard'); onNav?.(); }}
            title={collapsed ? t.adminPanel : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{t.adminPanel}</span>}
          </button>
        )}
      </nav>

      {/* Bottom section */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
        {/* Language */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2">
            <Languages className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <div className="flex gap-1">
              {DASH_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                    lang === l
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          title={isDark ? t.lightMode : t.darkMode}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {isDark
            ? <Sun className="w-5 h-5 text-amber-400 flex-shrink-0" />
            : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{isDark ? t.lightMode : t.darkMode}</span>}
        </button>

        {/* User row */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                {(user?.name || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => { logout(); toast.success('Logged out'); }}
          title={collapsed ? t.logout : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t.logout}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen z-30 hidden lg:block transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <Sidebar />
      </aside>

      {/* ── Mobile Sidebar (Sheet) ── */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="p-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
        >
          <Sidebar onNav={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ── Main content area ── */}
      <div className={`transition-all duration-300 ${isRTL ? (collapsed ? 'lg:mr-16' : 'lg:mr-64') : (collapsed ? 'lg:ml-16' : 'lg:ml-64')}`}>

        {/* ── Top Header ── */}
        <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">

          {/* Left: hamburger (mobile) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <span className="lg:hidden text-sm font-bold text-gray-900 dark:text-white">Dashboard</span>
          </div>

          {/* Right: lang + dark + bell */}
          <div className="flex items-center gap-2">

            {/* Language pills (header) */}
            <div className="flex gap-1">
              {DASH_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    lang === l
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? t.lightMode : t.darkMode}
            >
              {isDark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
            </button>

            {/* Bell */}
            <button
              ref={bellRef}
              onClick={() => setShowNotifs((v) => !v)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={t.notifications}
            >
              {totalAlerts > 0
                ? <BellRing className="w-4 h-4 text-amber-500" />
                : <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {totalAlerts > 9 ? '9+' : totalAlerts}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* ── Notification panel — rendered OUTSIDE header to avoid clipping ── */}
        {showNotifs && (
          <div
            ref={panelRef}
            className={`fixed top-[72px] ${isRTL ? 'left-4' : 'right-4'} z-50 w-80 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden`}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{t.notifications}</span>
                {totalAlerts > 0 && (
                  <span className="text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                    {totalAlerts}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNotifs(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Items */}
            <div className="max-h-80 overflow-y-auto">
              {/* New Orders */}
              {newOrders.map((order) => (
                <button
                  key={`ord-${order.id}`}
                  onClick={() => { navigate('/dashboard/orders'); setShowNotifs(false); }}
                  className="w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-amber-50 dark:hover:bg-amber-900/10 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShoppingCart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t.newOrder} #{order.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {t.table} {order.table_number} · {order.customer_name} · {order.total_price} DA
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap flex-shrink-0">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))}

              {/* Service Requests */}
              {serviceReqs.map((sr) => (
                <div
                  key={`sr-${sr.id}`}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    sr.request_type === 'call_waiter' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                  }`}>
                    <Bell className={`w-4 h-4 ${sr.request_type === 'call_waiter' ? 'text-blue-500' : 'text-green-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {sr.request_type === 'call_waiter' ? t.callWaiterAlert : t.billRequestAlert}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.table} {sr.table_number}</p>
                  </div>
                  <button
                    onClick={() => dismissSR(sr.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors flex-shrink-0"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {t.markDone}
                  </button>
                </div>
              ))}

              {/* Empty */}
              {totalAlerts === 0 && (
                <div className="py-10 text-center">
                  <Bell className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t.noNotifications}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {totalAlerts > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={() => { navigate('/dashboard/orders'); setShowNotifs(false); }}
                  className="w-full text-xs text-center text-amber-600 dark:text-amber-400 font-medium hover:underline"
                >
                  {t.orders} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Page content ── */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
