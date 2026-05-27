import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TrendingUp, Building2, ShoppingBag } from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      const response = await api.getAdminAnalytics(period);
      if (response?.success) setAnalytics(response.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBarChart = (data: any[], valueKey: string, color: string) => {
    if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No data</p>;
    const maxValue = Math.max(...data.map((d) => d[valueKey] || 0), 1);
    return (
      <div className="space-y-2">
        {data.slice(-12).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-14 truncate flex-shrink-0">{new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
            <div className="flex-1 h-5 bg-gray-50 rounded-md overflow-hidden">
              <div className="h-full rounded-md transition-all" style={{ width: `${Math.max((item[valueKey] / maxValue) * 100, 3)}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs font-medium w-10 text-right flex-shrink-0">{item[valueKey]}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">All restaurants performance</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => setPeriod(d)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === d ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" /> Menu Views</CardTitle></CardHeader>
          <CardContent>{renderBarChart(analytics?.views_chart || [], 'views', '#3B82F6')}</CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-green-500" /> Orders</CardTitle></CardHeader>
          <CardContent>{renderBarChart(analytics?.orders_chart || [], 'orders', '#22C55E')}</CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-500" /> Top Restaurants by Orders</CardTitle></CardHeader>
          <CardContent>
            {(analytics?.top_restaurants || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No data</p>
            ) : (
              <div className="space-y-3">
                {analytics.top_restaurants.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <p className="flex-1 text-sm">{r.name}</p>
                    <span className="text-sm font-medium text-blue-600">{r.orders} orders</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-purple-500" /> Top Items</CardTitle></CardHeader>
          <CardContent>
            {(analytics?.top_items || []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No data</p>
            ) : (
              <div className="space-y-3">
                {analytics.top_items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <p className="flex-1 text-sm">{item.name}</p>
                    <span className="text-sm font-medium text-amber-600">{item.orders} orders</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
