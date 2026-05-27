import { Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DarkModeProvider } from '@/context/DarkModeContext';
import { DashLangProvider } from '@/context/DashLangContext';
import { Toaster } from '@/components/ui/sonner';

// Public Pages
import LandingPage from '@/pages/public/LandingPage';
import PublicMenu from '@/pages/public/PublicMenu';
import OrderSuccess from '@/pages/public/OrderSuccess';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Dashboard Pages
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import DashboardHome from '@/pages/dashboard/DashboardHome';
import RestaurantProfile from '@/pages/dashboard/RestaurantProfile';
import MenuCategories from '@/pages/dashboard/MenuCategories';
import MenuItems from '@/pages/dashboard/MenuItems';
import OrdersPage from '@/pages/dashboard/OrdersPage';
import DesignEditor from '@/pages/dashboard/DesignEditor';
import QRCodesPage from '@/pages/dashboard/QRCodesPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import StaffPage from '@/pages/dashboard/StaffPage';
import KitchenDisplay from '@/pages/dashboard/KitchenDisplay';
import ReviewsPage from '@/pages/dashboard/ReviewsPage';

// Admin Pages
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminRestaurants from '@/pages/admin/AdminRestaurants';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminTemplates from '@/pages/admin/AdminTemplates';
import AdminSettings from '@/pages/admin/AdminSettings';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/r/:slug" element={<PublicMenu />} />
      <Route path="/r/:slug/order-success/:orderId" element={<OrderSuccess />} />

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="restaurant" element={<RestaurantProfile />} />
        <Route path="categories" element={<MenuCategories />} />
        <Route path="items" element={<MenuItems />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="design" element={<DesignEditor />} />
        <Route path="qr-codes" element={<QRCodesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="kds" element={<KitchenDisplay />} />
        <Route path="reviews" element={<ReviewsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="templates" element={<AdminTemplates />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <DashLangProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </DashLangProvider>
    </DarkModeProvider>
  );
}
