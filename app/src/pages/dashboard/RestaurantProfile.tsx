import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Utensils, Save, Image, Instagram, Globe } from 'lucide-react';
import CurrencySelect from '@/components/CurrencySelect';
import ImageUpload from '@/components/ImageUpload';
import { useDashLang } from '@/context/DashLangContext';

export default function RestaurantProfile() {
  const { t } = useDashLang();
  const [profile, setProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const r = await api.getRestaurantProfile();
      if (r?.success) setProfile(r.data);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateRestaurantProfile(profile);
      toast.success('Profile updated successfully');
    } catch (e: any) { toast.error(e.message || 'Failed to update'); }
    finally { setIsSaving(false); }
  };

  const set = (k: string, v: any) => setProfile((p: any) => ({ ...p, [k]: v }));

  if (isLoading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-amber-500" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.restaurantProfile}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.manageRestaurantInfo}</p>
      </div>

      {/* Images */}
      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 dark:text-white">
            <Image className="w-5 h-5 text-amber-500" /> {t.photos}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload
              label={t.logo}
              value={profile.logo_url}
              uploadType="logo"
              aspectRatio="square"
              hint="Square image, min 200×200px"
              onChange={(url) => set('logo_url', url)}
            />
            <ImageUpload
              label={t.coverImage}
              value={profile.cover_image_url}
              uploadType="cover"
              aspectRatio="wide"
              hint="Wide banner, 1200×400px recommended"
              onChange={(url) => set('cover_image_url', url)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 dark:text-white">
            <Utensils className="w-5 h-5 text-amber-500" /> {t.basicInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="dark:text-gray-300">{t.restaurantName}</Label>
            <Input value={profile.name || ''} onChange={(e) => set('name', e.target.value)}
              placeholder="Your restaurant name" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">{t.description}</Label>
            <Textarea value={profile.description || ''} onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your restaurant" rows={3} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">{t.phone}</Label>
              <Input value={profile.phone || ''} onChange={(e) => set('phone', e.target.value)}
                placeholder="+213 ..." className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">WhatsApp</Label>
              <Input value={profile.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)}
                placeholder="+213 ..." className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">{t.address}</Label>
            <Textarea value={profile.address || ''} onChange={(e) => set('address', e.target.value)}
              placeholder="Your restaurant address" rows={2} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 dark:text-gray-300">
              <Instagram className="w-4 h-4 text-pink-500" /> {t.instagram}
            </Label>
            <div className="flex">
              <span className="flex items-center px-3 bg-gray-50 dark:bg-gray-700 border border-r-0 border-gray-200 dark:border-gray-600 rounded-l-md text-sm text-gray-500 dark:text-gray-400">@</span>
              <Input value={profile.instagram_handle || ''} onChange={(e) => set('instagram_handle', e.target.value)}
                placeholder="yourrestaurant" className="rounded-l-none dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 dark:text-gray-300">
              <Globe className="w-4 h-4 text-blue-500" /> {t.website} ({t.optional})
            </Label>
            <Input value={profile.website || ''} onChange={(e) => set('website', e.target.value)}
              placeholder="https://yourrestaurant.com" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base dark:text-white">{t.settings}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="dark:text-gray-300">{t.currency}</Label>
              <CurrencySelect value={profile.currency || 'DA'} onChange={(code) => set('currency', code)} />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-gray-300">Number of Tables</Label>
              <Input type="number" value={profile.table_count || 10}
                onChange={(e) => set('table_count', parseInt(e.target.value) || 10)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Payment Mode</Label>
            <select value={profile.payment_mode || 'cash_after_service'} onChange={(e) => set('payment_mode', e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm dark:text-gray-200">
              <option value="menu_only">Menu Only (No Ordering)</option>
              <option value="cash_after_service">Cash After Service</option>
              <option value="cash_before_service">Cash Before Service</option>
              <option value="online_optional">Online Payment Optional</option>
              <option value="online_required">Online Payment Required</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="dark:text-gray-300">Restaurant URL Slug</Label>
            <Input value={profile.slug || ''} disabled className="bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400" />
            <p className="text-xs text-gray-400 dark:text-gray-500">Menu URL: /r/{profile.slug}</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto">
        <Save className="w-4 h-4 mr-2" />{isSaving ? t.saving : t.saveChanges}
      </Button>
    </div>
  );
}
