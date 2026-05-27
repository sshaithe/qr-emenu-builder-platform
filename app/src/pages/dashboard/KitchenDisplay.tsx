import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { ChefHat, RefreshCw, Clock, CheckCircle2, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

interface OrderItem { item_name: string; quantity: number; note?: string; }
interface Order {
  id: number; table_number: number; customer_name: string;
  total_price: number; order_status: string; created_at: string;
  note?: string; items?: OrderItem[];
}

// ── Urgency helpers ───────────────────────────────────────────────
function ageSeconds(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
}
function formatAge(secs: number) {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}
function urgencyBorder(secs: number) {
  if (secs > 600) return 'border-red-500 shadow-red-900/40';
  if (secs > 300) return 'border-yellow-500 shadow-yellow-900/40';
  return 'border-gray-700 shadow-black/20';
}
function urgencyTimerClass(secs: number) {
  if (secs > 600) return 'text-red-400 animate-pulse';
  if (secs > 300) return 'text-yellow-400';
  return 'text-green-400';
}

// ── Statuses the KDS handles ─────────────────────────────────────
const ACTIVE_STATUSES = ['pending_payment', 'waiting_cash_payment', 'new_order', 'accepted', 'preparing', 'ready'];
const NEW_STATUSES    = ['pending_payment', 'waiting_cash_payment', 'new_order'];

// ── Live 1-second tick ────────────────────────────────────────────
function useTick(ms = 1000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export default function KitchenDisplay() {
  const { t, lang } = useDashLang();
  useTick(); // forces re-render every second for live timers

  const L = (en: string, fr: string, ar: string, tr: string): string =>
    ({ en, fr, ar, tr }[lang] ?? en);

  // Column definitions (translated) — built inside component so L() works
  const COLUMNS = [
    {
      keys: ['pending_payment', 'waiting_cash_payment'],
      next: 'new_order',
      emoji: '💳',
      bg: 'from-purple-600 to-pink-600',
      btnBg: 'bg-purple-600 hover:bg-purple-500',
      label: L('Awaiting Payment','En attente de paiement','في انتظار الدفع','Ödeme Bekleniyor'),
      btnLabel: L('Confirm','Confirmer','تأكيد','Onayla'),
    },
    {
      keys: ['new_order'],
      next: 'accepted',
      emoji: '🔔',
      bg: 'from-yellow-500 to-orange-500',
      btnBg: 'bg-yellow-500 hover:bg-yellow-400',
      label: L('New Orders','Nouvelles commandes','طلبات جديدة','Yeni Siparişler'),
      btnLabel: L('Accept','Accepter','قبول','Kabul Et'),
    },
    {
      keys: ['accepted'],
      next: 'preparing',
      emoji: '✅',
      bg: 'from-blue-600 to-indigo-600',
      btnBg: 'bg-blue-600 hover:bg-blue-500',
      label: L('Accepted','Acceptées','مقبولة','Kabul Edildi'),
      btnLabel: L('Start Prep','Commencer','ابدأ','Başla'),
    },
    {
      keys: ['preparing'],
      next: 'ready',
      emoji: '🔥',
      bg: 'from-orange-600 to-red-600',
      btnBg: 'bg-orange-600 hover:bg-orange-500',
      label: L('Preparing','En préparation','قيد التحضير','Hazırlanıyor'),
      btnLabel: L('Mark Ready','Prêt','جاهز','Hazır İşaretle'),
    },
    {
      keys: ['ready'],
      next: 'served',
      emoji: '🍽️',
      bg: 'from-green-600 to-teal-600',
      btnBg: 'bg-green-600 hover:bg-green-500',
      label: L('Ready to Serve','Prêt à servir','جاهز للتقديم','Servis Hazır'),
      btnLabel: L('Served ✓','Servi ✓','قُدِّم ✓','Servis ✓'),
    },
  ];

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const prevOrderIds = useRef<Set<number>>(new Set());
  const audioCtx = useRef<AudioContext | null>(null);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Beep on new order ─────────────────────────────────────────
  const beep = useCallback(() => {
    if (!soundOn) return;
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      [0, 180, 360].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay / 1000);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay / 1000 + 0.3);
        osc.start(ctx.currentTime + delay / 1000);
        osc.stop(ctx.currentTime + delay / 1000 + 0.4);
      });
    } catch { /* ignore AudioContext errors in some browsers */ }
  }, [soundOn]);

  // ── Fetch orders ──────────────────────────────────────────────
  // We don't pass `status` so backend returns ALL orders (up to 50),
  // then we filter client-side to only show kitchen-relevant statuses.
  const loadOrders = useCallback(async () => {
    try {
      const res = await api.getOrders({ page: 1 });
      if (res?.success) {
        const raw: Order[] = res.data?.orders ?? res.data ?? [];
        const active = raw.filter(o => ACTIVE_STATUSES.includes(o.order_status));
        active.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        // Detect newly arrived orders → beep
        const newSet = new Set(active.filter(o => NEW_STATUSES.includes(o.order_status)).map(o => o.id));
        const isFirstLoad = prevOrderIds.current.size === 0;
        if (!isFirstLoad) {
          newSet.forEach(id => { if (!prevOrderIds.current.has(id)) { beep(); } });
        }
        prevOrderIds.current = newSet;

        setOrders(active);
        setLastRefresh(new Date());
        setIsConnected(true);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [beep]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadOrders();
    const id = setInterval(loadOrders, 8000);
    return () => clearInterval(id);
  }, [loadOrders]);

  // ── Move order to next status ─────────────────────────────────
  const moveOrder = async (orderId: number, nextStatus: string) => {
    setUpdating(orderId);
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      await loadOrders();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const colOrders = (keys: string[]) => orders.filter(o => keys.includes(o.order_status));
  const totalActive = orders.length;
  const totalNew = orders.filter(o => NEW_STATUSES.includes(o.order_status)).length;
  const totalReady = orders.filter(o => o.order_status === 'ready').length;

  // ── LOADING state ─────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center text-white">
        <ChefHat className="w-16 h-16 mx-auto mb-4 animate-pulse text-amber-400" />
        <p className="text-xl font-medium text-gray-300">
          {L('Loading Kitchen Display…','Chargement…','جاري التحميل…','Yükleniyor…')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col select-none"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── TOP BAR ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              {L('Kitchen Display','Affichage Cuisine','شاشة المطبخ','Mutfak Ekranı')}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isConnected
                ? <><Wifi className="w-3 h-3 text-green-400" /><span className="text-[10px] text-green-400">{L('Live','En direct','مباشر','Canlı')}</span></>
                : <><WifiOff className="w-3 h-3 text-red-400 animate-pulse" /><span className="text-[10px] text-red-400">{L('Reconnecting…','Reconnexion…','إعادة الاتصال…','Bağlanıyor…')}</span></>
              }
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="flex items-center gap-6">
          {[
            { label: L('Active','Actifs','نشط','Aktif'), value: totalActive, color: 'text-amber-400' },
            { label: L('New','Nouveau','جديد','Yeni'), value: totalNew, color: 'text-yellow-400' },
            { label: L('Ready','Prêt','جاهز','Hazır'), value: totalReady, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-mono text-gray-400">{now.toLocaleTimeString()}</p>
          <button onClick={() => setSoundOn(s => !s)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${soundOn ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}
            title={soundOn ? 'Mute' : 'Unmute'}>
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button onClick={loadOrders}
            className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-gray-600 hidden lg:block">
            {L('Updated','Mis à jour','آخر تحديث','Güncelleme')}: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* ── KANBAN ────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-0 overflow-hidden">
        {COLUMNS.map((col) => {
          const items = colOrders(col.keys);
          const hasUrgent = items.some(o => ageSeconds(o.created_at) > 600);

          return (
            <div key={col.keys.join()} className="flex flex-col border-r border-gray-800 last:border-r-0 overflow-hidden">
              {/* Column header */}
              <div className={`bg-gradient-to-r ${col.bg} px-4 py-3 flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{col.emoji}</span>
                  <span className="font-bold text-white text-sm">{col.label}</span>
                  {hasUrgent && (
                    <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse font-bold">!</span>
                  )}
                </div>
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-sm font-black text-white">{items.length}</span>
                </div>
              </div>

              {/* Order tickets */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-950">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-700">
                    <CheckCircle2 className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs font-medium">{L('All clear','Tout OK','لا يوجد','Temiz')}</p>
                  </div>
                ) : (
                  items.map((order) => {
                    const age = ageSeconds(order.created_at);
                    const isUpdating = updating === order.id;

                    return (
                      <div key={order.id}
                        className={`bg-gray-900 rounded-xl border-2 shadow-lg overflow-hidden transition-all ${urgencyBorder(age)}`}>

                        {/* Card header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white">{t.table} {order.table_number}</span>
                            <span className="text-xs text-gray-500 font-mono">#{order.id}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs font-bold ${urgencyTimerClass(age)}`}>
                            <Clock className="w-3 h-3" />
                            {formatAge(age)}
                          </div>
                        </div>

                        {/* Customer */}
                        {order.customer_name && (
                          <p className="px-3 pt-2 text-xs text-gray-400">👤 {order.customer_name}</p>
                        )}

                        {/* Items */}
                        <div className="px-3 py-2 space-y-1">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-amber-400 font-black text-sm w-6 flex-shrink-0">×{item.quantity}</span>
                                <div>
                                  <p className="text-sm font-semibold text-white leading-tight">{item.item_name}</p>
                                  {item.note && <p className="text-[10px] text-yellow-400 mt-0.5">📝 {item.note}</p>}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-600 italic">{L('No item details','Aucun détail','لا تفاصيل','Detay yok')}</p>
                          )}
                        </div>

                        {/* Special note */}
                        {order.note && (
                          <div className="mx-3 mb-2 px-2 py-1.5 bg-yellow-900/30 border border-yellow-700/30 rounded-lg">
                            <p className="text-xs text-yellow-300">⚠️ {order.note}</p>
                          </div>
                        )}

                        {/* Action button */}
                        <button
                          onClick={() => moveOrder(order.id, col.next)}
                          disabled={isUpdating}
                          className={`w-full py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${col.btnBg}`}>
                          {isUpdating ? '⏳ …' : col.btnLabel}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM STATUS BAR ─────────────────────────────── */}
      <div className="px-5 py-2 bg-gray-900 border-t border-gray-800 flex items-center justify-between flex-shrink-0">
        <p className="text-[10px] text-gray-600">
          🔄 {L('Auto-refresh every 8s','Actualisation toutes les 8s','تحديث كل 8 ثواني','Her 8 saniyede güncellenir')}
        </p>
        <div className="flex items-center gap-4 text-[10px] text-gray-600">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {L('Fresh (< 5min)','Frais','طازج','Taze')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> {L('Warning (> 5min)','Attention','تحذير','Uyarı')}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" /> {L('Critical (> 10min)','Critique','حرج','Kritik')}</span>
        </div>
      </div>
    </div>
  );
}
