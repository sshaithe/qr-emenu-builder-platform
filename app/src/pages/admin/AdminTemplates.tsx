import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await api.getAdminTemplates();
      if (response?.success) setTemplates(response.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: number, current: boolean) => {
    try {
      await api.updateTemplate(id, { is_active: !current });
      toast.success(`Template ${!current ? 'activated' : 'deactivated'}`);
      loadTemplates();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const TEMPLATE_PREVIEWS: Record<string, { bg: string; primary: string }> = {
    modern: { bg: 'bg-white', primary: '#F59E0B' },
    luxury_black_gold: { bg: 'bg-gray-900', primary: '#D4AF37' },
    fast_food: { bg: 'bg-orange-50', primary: '#EF4444' },
    pizza_style: { bg: 'bg-orange-50', primary: '#EA580C' },
    coffee_shop: { bg: 'bg-amber-50', primary: '#92400E' },
    dark_mode: { bg: 'bg-gray-900', primary: '#8B5CF6' },
    minimal: { bg: 'bg-white', primary: '#000000' },
    burger_house: { bg: 'bg-orange-50', primary: '#F97316' },
    dessert_shop: { bg: 'bg-pink-50', primary: '#EC4899' },
    traditional_algerian: { bg: 'bg-amber-50', primary: '#B45309' },
    seafood: { bg: 'bg-sky-50', primary: '#0EA5E9' },
    family: { bg: 'bg-green-50', primary: '#22C55E' },
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-500 mt-1">Manage menu design templates</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => {
          const preview = TEMPLATE_PREVIEWS[t.key] || { bg: 'bg-gray-50', primary: '#F59E0B' };
          return (
            <Card key={t.id} className="border-0 shadow-sm overflow-hidden">
              <div className={`h-24 ${preview.bg} relative flex items-center justify-center`}>
                <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 50%, ${preview.primary}, transparent 70%)` }} />
                <div className="text-center z-10">
                  <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: preview.primary }}>
                    {(t.name || 'T')[0]}
                  </div>
                  <p className="text-xs font-medium" style={{ color: preview.bg === 'bg-gray-900' ? 'white' : '#111827' }}>{t.name}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{t.key}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                  <button
                    onClick={() => toggleActive(t.id, t.is_active)}
                    className={t.is_active ? 'text-green-500' : 'text-gray-300'}
                  >
                    {t.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
