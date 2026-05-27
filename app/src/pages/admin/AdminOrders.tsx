import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShoppingBag, Building2, ChevronDown } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.getAdminOrders(params);
      if (response?.success) setOrders(response.data?.orders || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    new_order: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    served: 'bg-gray-100 text-gray-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    waiting_cash_payment: 'bg-purple-100 text-purple-800',
  };

  const statusFilters = ['all', 'new_order', 'accepted', 'preparing', 'ready', 'served', 'paid', 'cancelled'];

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <p className="text-sm text-gray-500 mt-1">View orders across all restaurants</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 overflow-x-auto">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-colors ${
              statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
            }`}
          >
            {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          return (
            <Card key={order.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Order #{order.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.order_status] || 'bg-gray-100'}`}>
                        {order.order_status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {order.restaurant?.name}
                      </span>
                      <span className="text-xs text-gray-500">Table {order.table_number}</span>
                      <span className="text-xs text-gray-500">{order.customer_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-600">{order.total_price} DA</span>
                    <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="space-y-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600">{item.quantity}x {item.item_name}</span>
                          <span>{item.total_price} DA</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
