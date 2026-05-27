import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Users, Plus, Trash2, X, Check, Shield, ChefHat, CreditCard, User, Info } from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

const ROLE_ICONS: Record<string, typeof User> = {
  manager: Shield, cashier: CreditCard, kitchen: ChefHat, waiter: User,
};

// Color badge per role
const ROLE_COLORS: Record<string, string> = {
  manager: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  cashier:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  kitchen:  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  waiter:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
};

export default function StaffPage() {
  const { t, lang } = useDashLang();
  const L = (en: string, fr: string, ar: string, tr: string): string =>
    ({ en, fr, ar, tr }[lang] ?? en);

  // Translated role labels
  const ROLE_LABELS: Record<string, string> = {
    waiter:  L('Waiter',   'Serveur',   'نادل',    'Garson'),
    kitchen: L('Kitchen',  'Cuisine',   'مطبخ',    'Mutfak'),
    cashier: L('Cashier',  'Caissier',  'صراف',    'Kasiyer'),
    manager: L('Manager',  'Gérant',    'مدير',    'Müdür'),
  };

  // Role guide descriptions
  const ROLE_GUIDE = [
    {
      key: 'manager',
      icon: Shield,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/10',
      border: 'border-purple-200 dark:border-purple-800',
      title: ROLE_LABELS.manager,
      desc: L(
        'Full dashboard access — can manage menu, staff, orders and settings.',
        'Accès complet — gère le menu, le personnel, les commandes et les paramètres.',
        'وصول كامل — يدير القائمة والموظفين والطلبات والإعدادات.',
        'Tam erişim — menü, personel, siparişler ve ayarları yönetir.'
      ),
    },
    {
      key: 'cashier',
      icon: CreditCard,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-200 dark:border-blue-800',
      title: ROLE_LABELS.cashier,
      desc: L(
        'Handles payments — can view orders and mark them as paid.',
        'Gère les paiements — peut voir les commandes et les marquer comme payées.',
        'يدير المدفوعات — يمكنه عرض الطلبات وتأكيد الدفع.',
        'Ödeme işlemleri — siparişleri görüntüleyebilir ve ödendi olarak işaretleyebilir.'
      ),
    },
    {
      key: 'kitchen',
      icon: ChefHat,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/10',
      border: 'border-orange-200 dark:border-orange-800',
      title: ROLE_LABELS.kitchen,
      desc: L(
        'Kitchen Display access — can view and update order preparation status.',
        "Accès à l'écran cuisine — voit et met à jour le statut de préparation.",
        'وصول إلى شاشة المطبخ — يرى ويحدث حالة التحضير.',
        'Mutfak ekranı erişimi — sipariş hazırlama durumunu görüp güncelleyebilir.'
      ),
    },
    {
      key: 'waiter',
      icon: User,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/10',
      border: 'border-green-200 dark:border-green-800',
      title: ROLE_LABELS.waiter,
      desc: L(
        'Table service — can view orders for their assigned tables and mark as served.',
        'Service en salle — voit les commandes des tables assignées.',
        'خدمة الطاولات — يرى الطلبات المسندة إليه ويحدد "تم التقديم".',
        'Masa servisi — atanan masaların siparişlerini görebilir.'
      ),
    },
  ];

  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'waiter', password: 'Staff@123' });

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    try {
      const r = await api.getStaff();
      if (r?.success) setStaff(r.data || []);
    } catch (e: any) { toast.error(e.message); }
    finally { setIsLoading(false); }
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(`${t.fullName} & ${t.email} ${t.required}`);
      return;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) {
      toast.error(L('Invalid email address','Adresse email invalide','بريد إلكتروني غير صالح','Geçersiz e-posta'));
      return;
    }
    try {
      const res = await api.addStaff(form);
      toast.success(res?.message || L('Staff member added','Membre ajouté','تم إضافة الموظف','Personel eklendi'));
      setForm({ name: '', email: '', role: 'waiter', password: 'Staff@123' });
      setIsAdding(false);
      loadStaff();
    } catch (e: any) {
      // Show the exact backend error (e.g. duplicate, wrong account type, etc.)
      const msg = e?.message || 'Failed to add staff';
      if (msg.toLowerCase().includes('already')) {
        toast.error(`⚠️ ${msg}`);
      } else if (msg.toLowerCase().includes('owner')) {
        toast.error(`🔒 ${msg}`);
      } else {
        toast.error(msg);
      }
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm(t.removeConfirm)) return;
    try {
      await api.removeStaff(id);
      toast.success(L('Staff removed','Membre supprimé','تم إزالة الموظف','Personel kaldırıldı'));
      loadStaff();
    } catch (e: any) { toast.error(e.message); }
  };

  if (isLoading)
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-amber-500" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.staffTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.manageTeam}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${showGuide ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-600' : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            title={L('Role Guide','Guide des rôles','دليل الأدوار','Rol Kılavuzu')}>
            <Info className="w-4 h-4" />
          </button>
          <Button onClick={() => setIsAdding(!isAdding)} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-2" /> {t.addStaff}
          </Button>
        </div>
      </div>

      {/* ── ROLE GUIDE ─────────────────────────────────────── */}
      {showGuide && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/5">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {L('What can each role do?','Que peut faire chaque rôle ?','ماذا يستطيع كل دور أن يفعل؟','Her rol ne yapabilir?')}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {ROLE_GUIDE.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.key} className={`flex items-start gap-3 p-3 rounded-xl border ${r.bg} ${r.border}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.bg}`}>
                      <Icon className={`w-4 h-4 ${r.color}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${r.color}`}>{r.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 border-t dark:border-gray-700 pt-3">
              💡 {L(
                'Share the dashboard link with staff — they log in with the email and password you set here.',
                'Partagez le lien du tableau de bord avec le personnel.',
                'شارك رابط لوحة التحكم مع الموظفين — يسجلون الدخول بالبريد الإلكتروني وكلمة المرور التي حددتها هنا.',
                'Kontrol paneli bağlantısını personelinizle paylaşın.'
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── ADD FORM ────────────────────────────────────────── */}
      {isAdding && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/30">
          <CardContent className="p-4 space-y-3">
            <Input placeholder={`${t.fullName} *`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            <Input type="email" placeholder={`${t.email} *`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />

            {/* Translated role select */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t.role}</p>
              <div className="grid grid-cols-2 gap-2">
                {(['waiter','kitchen','cashier','manager'] as const).map((r) => {
                  const Icon = ROLE_ICONS[r];
                  return (
                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                        form.role === r
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${form.role === r ? 'text-amber-600' : 'text-gray-400 dark:text-gray-500'}`} />
                      <div>
                        <p className={`text-sm font-medium ${form.role === r ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {ROLE_LABELS[r]}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          {r === 'manager' ? L('Full access','Accès total','وصول كامل','Tam erişim') :
                           r === 'cashier' ? L('Payments','Paiements','مدفوعات','Ödeme') :
                           r === 'kitchen' ? L('Kitchen only','Cuisine seul.','المطبخ فقط','Sadece mutfak') :
                           L('Table service','Service tables','خدمة طاولات','Masa servisi')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Input type="password" placeholder={`${t.password} (Staff@123)`} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Check className="w-4 h-4 mr-1" /> {t.add}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <X className="w-4 h-4 mr-1" /> {t.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STAFF LIST ───────────────────────────────────────── */}
      <div className="space-y-3">
        {staff.map((s) => {
          const RoleIcon = ROLE_ICONS[s.role] || User;
          return (
            <Card key={s.id} className="border-0 shadow-sm dark:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ROLE_COLORS[s.role] || 'bg-gray-100 dark:bg-gray-700'}`}>
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.user?.email}</p>
                      <span className={`inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[s.role] || 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABELS[s.role] || s.role}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(s.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {staff.length === 0 && !isAdding && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.noStaff}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t.addFirstStaff}</p>
          </div>
        )}
      </div>
    </div>
  );
}
