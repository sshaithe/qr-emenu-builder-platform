import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ShoppingBag, Clock, CheckCircle2, ChefHat, Package, CreditCard,
  XCircle, AlertCircle, ChevronDown, Printer, RefreshCw,
} from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

interface Order {
  id: number;
  table_number: number;
  customer_name: string;
  total_price: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Dark-mode compatible status colors
const STATUS_CONFIG: Record<string, {
  label: string;
  bg: string;      // light bg
  text: string;    // light text
  darkBg: string;  // dark bg
  darkText: string;// dark text
  icon: typeof Clock;
  next?: string;
}> = {
  new_order:            { label: 'New',             bg: 'bg-yellow-100',  text: 'text-yellow-800',  darkBg: 'dark:bg-yellow-900/40', darkText: 'dark:text-yellow-300', icon: AlertCircle,  next: 'accepted' },
  accepted:             { label: 'Accepted',         bg: 'bg-blue-100',    text: 'text-blue-800',    darkBg: 'dark:bg-blue-900/40',   darkText: 'dark:text-blue-300',   icon: CheckCircle2, next: 'preparing' },
  preparing:            { label: 'Preparing',        bg: 'bg-orange-100',  text: 'text-orange-800',  darkBg: 'dark:bg-orange-900/40', darkText: 'dark:text-orange-300', icon: ChefHat,      next: 'ready' },
  ready:                { label: 'Ready',            bg: 'bg-green-100',   text: 'text-green-800',   darkBg: 'dark:bg-green-900/40',  darkText: 'dark:text-green-300',  icon: Package,      next: 'served' },
  served:               { label: 'Served',           bg: 'bg-gray-100',    text: 'text-gray-700',    darkBg: 'dark:bg-gray-700',      darkText: 'dark:text-gray-300',   icon: CheckCircle2, next: 'paid' },
  paid:                 { label: 'Paid',             bg: 'bg-emerald-100', text: 'text-emerald-800', darkBg: 'dark:bg-emerald-900/40',darkText: 'dark:text-emerald-300',icon: CreditCard },
  cancelled:            { label: 'Cancelled',        bg: 'bg-red-100',     text: 'text-red-800',     darkBg: 'dark:bg-red-900/40',    darkText: 'dark:text-red-300',    icon: XCircle },
  waiting_cash_payment: { label: 'Waiting Payment',  bg: 'bg-purple-100',  text: 'text-purple-800',  darkBg: 'dark:bg-purple-900/40', darkText: 'dark:text-purple-300', icon: AlertCircle,  next: 'accepted' },
  pending_payment:      { label: 'Pending Payment',  bg: 'bg-orange-100',  text: 'text-orange-800',  darkBg: 'dark:bg-orange-900/40', darkText: 'dark:text-orange-300', icon: Clock },
};

function badgeClass(cfg: typeof STATUS_CONFIG[string]) {
  return `${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText}`;
}

export default function OrdersPage() {
  const { t } = useDashLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.getOrders(params);
      if (response?.success) setOrders(response.data?.orders || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingOrder(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      toast.success(`Order → ${STATUS_CONFIG[status]?.label || status}`);
      loadOrders();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const updatePayment = async (orderId: number) => {
    setUpdatingOrder(orderId);
    try {
      await api.updateOrderPayment(orderId, 'paid');
      toast.success('Payment marked as paid');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const statusFilters = ['all', 'new_order', 'accepted', 'preparing', 'ready', 'waiting_cash_payment', 'paid', 'cancelled'];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.ordersTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.manageOrders}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">{t.autoRefresh}</span>
          <button
            onClick={loadOrders}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Refresh now"
          >
            <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statusFilters.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? t.all : cfg?.label || status}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.length === 0 && (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t.noOrders}</p>
          </div>
        )}

        {orders.map((order) => {
          const config = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.new_order;
          const StatusIcon = config.icon;
          const isExpanded = expandedOrder === order.id;
          const isNew = order.order_status === 'new_order';

          return (
            <Card
              key={order.id}
              className={`border-0 shadow-sm dark:bg-gray-800 ${isNew ? 'ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
            >
              <CardContent className="p-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.darkBg}`}>
                      <StatusIcon className={`w-5 h-5 ${config.text} ${config.darkText}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Order #{order.id}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass(config)}`}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.table} {order.table_number} · {order.customer_name} · {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {order.total_price} DA
                    </span>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {/* Items */}
                    <div className="space-y-1.5 mb-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.quantity}× {item.item_name}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.total_price} DA
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">{order.total_price} DA</span>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{t.payment}:</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.payment_status === 'paid'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {config.next && (
                        <button
                          onClick={() => updateStatus(order.id, config.next!)}
                          disabled={updatingOrder === order.id}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                          {updatingOrder === order.id
                            ? t.updating
                            : `${t.markAs} ${STATUS_CONFIG[config.next]?.label}`}
                        </button>
                      )}

                      {order.order_status === 'served' && order.payment_status !== 'paid' && (
                        <button
                          onClick={() => updatePayment(order.id)}
                          disabled={updatingOrder === order.id}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                          {updatingOrder === order.id ? t.updating : t.markPaid}
                        </button>
                      )}

                      {(order.order_status === 'paid' || order.payment_status === 'paid') && (
                        <button
                          onClick={() => {
                            const lines = (order.items || []).map(
                              (i: any) => `${i.quantity}x ${i.item_name} — ${i.total_price} DA`
                            ).join('\n');
                            const receipt = `
============================
       ORDER RECEIPT
============================
Order #: ${order.id}
Table:   ${order.table_number}
Customer: ${order.customer_name}
Date:    ${new Date(order.created_at).toLocaleString()}
----------------------------
${lines}
----------------------------
TOTAL:   ${order.total_price} DA
============================
     Thank you! 🍽️
`;
                            const win = window.open('', '_blank', 'width=420,height=620');
                            if (win) {
                              win.document.write(`<pre style="font-family:monospace;padding:24px;font-size:13px;line-height:1.6">${receipt}</pre>`);
                              win.document.close();
                              win.print();
                            }
                          }}
                          className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5"
                        >
                          <Printer className="w-4 h-4" />
                          {t.printReceipt}
                        </button>
                      )}

                      {['new_order', 'accepted', 'waiting_cash_payment'].includes(order.order_status) && (
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          disabled={updatingOrder === order.id}
                          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                        >
                          {t.cancel}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
