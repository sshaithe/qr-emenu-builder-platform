import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, ShoppingBag, Eye, TrendingUp, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.getAdminStats();
      if (response?.success) setStats(response.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Restaurants', value: stats?.total_restaurants || 0, icon: Building2, color: 'bg-blue-50 text-blue-600' },
    { title: 'Active', value: stats?.active_restaurants || 0, icon: Building2, color: 'bg-green-50 text-green-600' },
    { title: 'Suspended', value: stats?.suspended_restaurants || 0, icon: Building2, color: 'bg-red-50 text-red-600' },
    { title: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'bg-purple-50 text-purple-600' },
    { title: 'Total Views', value: (stats?.total_views || 0).toLocaleString(), icon: Eye, color: 'bg-amber-50 text-amber-600' },
    { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'bg-pink-50 text-pink-600' },
    { title: 'Orders Today', value: stats?.orders_today || 0, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Sales Today', value: `${(stats?.sales_today || 0).toLocaleString()} DA`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                <card.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {stats?.most_viewed_restaurant && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">Most Viewed Restaurant</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stats.most_viewed_restaurant.name}</p>
                  <p className="text-xs text-gray-500">{stats.most_viewed_restaurant.views} views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stats?.most_ordered_item && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-gray-900 mb-3">Most Ordered Item</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stats.most_ordered_item.name}</p>
                  <p className="text-xs text-gray-500">{stats.most_ordered_item.order_count} orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
