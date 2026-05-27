import { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

export default function SettingsPage() {
  const { t } = useDashLang();
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      toast.error(`${t.required}`); return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match'); return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setIsChanging(true);
    try {
      await api.changePassword({ current_password: passwordForm.current_password, new_password: passwordForm.new_password });
      toast.success('Password changed successfully');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally { setIsChanging(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settingsTitle}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.manageAccount}</p>
      </div>

      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 dark:text-white">
            <Lock className="w-4 h-4 text-amber-500" /> {t.changePassword}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="dark:text-gray-300">{t.currentPassword}</Label>
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                placeholder={t.currentPassword} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="dark:text-gray-300">{t.newPassword}</Label>
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                placeholder={t.newPassword} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="dark:text-gray-300">{t.confirmPassword}</Label>
            <Input type="password" value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              placeholder={t.confirmPassword} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <Button onClick={handleChangePassword} disabled={isChanging} className="bg-amber-500 hover:bg-amber-600 text-white">
            {isChanging ? t.saving : t.changePassword}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base dark:text-white">{t.menuUrl}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input value={`${window.location.origin}/r/demo-restaurant`} readOnly
              className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300" />
            <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/r/demo-restaurant`); toast.success('URL copied'); }}>
              {t.copy}
            </Button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{t.shareUrl}</p>
        </CardContent>
      </Card>
    </div>
  );
}
