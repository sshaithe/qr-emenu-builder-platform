import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TrendingUp, Eye, ShoppingBag, Clock } from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

export default function AnalyticsPage() {
  const { t } = useDashLang();
  const [analytics, setAnalytics] = useState<any>(null);
  const [period, setPeriod] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    try {
      const response = await api.getAnalytics(period);
      if (response?.success) setAnalytics(response.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderBarChart = (data: any[], valueKey: string, color: string) => {
    if (!data || data.length === 0)
      return <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{t.noData}</p>;
    const maxValue = Math.max(...data.map((d) => d[valueKey] || 0), 1);
    return (
      <div className="space-y-2">
        {data.slice(-10).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-16 truncate flex-shrink-0">
              {new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
            <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
              <div
                className="h-full rounded-md transition-all"
                style={{ width: `${Math.max((item[valueKey] / maxValue) * 100, 4)}%`, backgroundColor: color, opacity: 0.7 + (item[valueKey] / maxValue) * 0.3 }}
              />
            </div>
            <span className="text-xs font-medium w-12 text-right flex-shrink-0 text-gray-700 dark:text-gray-300">{item[valueKey]}</span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading)
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-amber-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.analyticsTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.trackPerformance}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${period === d ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t.menuViews, icon: Eye, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300', value: (analytics?.views_chart || []).reduce((s: number, v: any) => s + (v.views || 0), 0).toLocaleString() },
          { label: t.orders, icon: ShoppingBag, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300', value: (analytics?.orders_chart || []).reduce((s: number, o: any) => s + (o.orders || 0), 0).toLocaleString() },
          { label: t.revenue, icon: TrendingUp, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300', value: `${Math.round((analytics?.orders_chart || []).reduce((s: number, o: any) => s + (o.revenue || 0), 0)).toLocaleString()} DA` },
          { label: t.peakHour, icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300', value: (analytics?.peak_hours || []).length > 0 ? `${String(analytics.peak_hours[0]?.hour || 12).padStart(2, '0')}:00` : '--' },
        ].map(({ label, icon: Icon, color, value }) => (
          <Card key={label} className="border-0 shadow-sm dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 dark:text-white">
              <Eye className="w-4 h-4 text-purple-500" /> {t.menuViews}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderBarChart(analytics?.views_chart || [], 'views', '#8B5CF6')}</CardContent>
        </Card>
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 dark:text-white">
              <ShoppingBag className="w-4 h-4 text-blue-500" /> {t.orders}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderBarChart(analytics?.orders_chart || [], 'orders', '#3B82F6')}</CardContent>
        </Card>
      </div>

      {analytics?.top_items?.length > 0 && (
        <Card className="border-0 shadow-sm dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-base dark:text-white">{t.topItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.top_items.map((item: any, idx: number) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
                  <p className="flex-1 text-sm text-gray-900 dark:text-white">{item.name}</p>
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{item.orders} {t.orders}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
