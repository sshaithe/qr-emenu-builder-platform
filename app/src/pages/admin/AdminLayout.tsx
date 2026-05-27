import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Building2,
  ShoppingBag,
  BarChart3,
  Palette,
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/restaurants', label: 'Restaurants', icon: Building2 },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/templates', label: 'Templates', icon: Palette },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
        <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">Super Admin</h1>
            <p className="text-[10px] text-gray-400 truncate">Platform Management</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex w-6 h-6 rounded-full bg-gray-100 items-center justify-center hover:bg-gray-200"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 mb-4"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Back to Dashboard</span>}
        </button>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-500' : ''}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isActive && !isCollapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 hidden lg:flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <SidebarContent />
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 ml-14">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">Admin</span>
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
