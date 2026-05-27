import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDashLang } from '@/context/DashLangContext';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600'}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { t } = useDashLang();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => {
    api.getFeedback()
      .then((res) => { if (res?.success) setData(res.data); })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const feedback = data?.feedback || [];
  const filtered = filterRating === 0 ? feedback : feedback.filter((f: any) => f.rating === filterRating);
  const ratingCounts = [5,4,3,2,1].map((r) => ({ rating: r, count: feedback.filter((f: any) => f.rating === r).length }));
  const total = data?.stats?.total || 0;
  const avg = data?.stats?.average_rating || 0;

  if (isLoading)
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-amber-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.reviewsTitle}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.privateFeedback}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t.avgRating, value: avg > 0 ? avg.toFixed(1) : '—', sub: <StarRating rating={Math.round(avg)} />, color: 'text-amber-500' },
          { label: t.totalReviews, value: total, sub: <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-auto mt-1" />, color: 'text-indigo-500' },
          { label: t.positive, value: `${total > 0 ? Math.round((feedback.filter((f: any) => f.rating >= 4).length / total) * 100) : 0}%`, sub: <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-auto mt-1" />, color: 'text-green-500' },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="border-0 shadow-sm dark:bg-gray-800">
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              {sub}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t.ratingBreakdown}</h3>
          <div className="space-y-2">
            {ratingCounts.map(({ rating, count }) => (
              <button key={rating} onClick={() => setFilterRating(filterRating === rating ? 0 : rating)}
                className={`w-full flex items-center gap-3 rounded-lg px-2 py-1 transition ${filterRating === rating ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-4">{rating}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: total > 0 ? `${(count/total)*100}%` : '0%' }} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">{count}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterRating(0)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium ${filterRating === 0 ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
          {t.all}
        </button>
        {[5,4,3,2,1].map((r) => (
          <button key={r} onClick={() => setFilterRating(filterRating === r ? 0 : r)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${filterRating === r ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {r}★
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.noReviews}</p>
          </div>
        ) : (
          filtered.map((fb: any) => (
            <Card key={fb.id} className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{fb.customer_name || t.anonymous}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t.table} {fb.table_number}{fb.order_id ? ` · #${fb.order_id}` : ''} · {new Date(fb.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StarRating rating={fb.rating} />
                </div>
                {fb.comment && <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">{fb.comment}</p>}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
