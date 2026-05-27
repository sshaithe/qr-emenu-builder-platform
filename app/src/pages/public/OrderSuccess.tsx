import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { api } from '@/services/api';
import { toast } from 'sonner';
import {
  CheckCircle2, ChefHat, Package, UtensilsCrossed, Star,
  Phone, MapPin, Printer, Clock, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderData {
  id: number;
  table_number: number;
  customer_name: string;
  total_price: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  note?: string;
  feedback_submitted: boolean;
  items?: { item_name: string; quantity: number; unit_price: number; total_price: number }[];
  restaurant?: {
    name: string; slug: string; phone?: string; address?: string;
    logo_url?: string; currency?: string;
  };
}

const STATUS_STEPS = [
  { key: 'new_order',   label: 'Received',   icon: CheckCircle2, desc: 'Your order is confirmed!' },
  { key: 'accepted',    label: 'Accepted',    icon: AlertCircle,  desc: 'Kitchen has your order' },
  { key: 'preparing',   label: 'Preparing',   icon: ChefHat,      desc: 'Your food is being prepared 🔥' },
  { key: 'ready',       label: 'Ready',       icon: Package,      desc: 'Food is ready! Waiter is coming' },
  { key: 'served',      label: 'Served',      icon: UtensilsCrossed, desc: 'Enjoy your meal! 🎉' },
  { key: 'paid',        label: 'Paid',        icon: CheckCircle2, desc: 'Thank you! See you again!' },
];

const STATUS_ORDER = ['new_order', 'accepted', 'preparing', 'ready', 'served', 'paid'];

function getCurrentStep(status: string): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export default function OrderSuccess() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);

  // Receipt print state
  const [showReceipt, setShowReceipt] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await api.getOrder(parseInt(orderId));
      if (res?.success) {
        setOrder(res.data);
        if (res.data.feedback_submitted) setFeedbackDone(true);
        // Prompt feedback if served/paid and no feedback yet
        if (['served', 'paid'].includes(res.data.order_status) && !res.data.feedback_submitted) {
          setShowFeedback(true);
        }

        // Clear active order tracking if order is finished
        if (['paid', 'cancelled'].includes(res.data.order_status) && slug) {
          localStorage.removeItem(`active_order_${slug}`);
          localStorage.removeItem(`active_order_table_${slug}`);
        }
      }
    } catch {
      /* silently ignore auto-refresh errors */
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    const iv = setInterval(loadOrder, 10000); // poll every 10s
    return () => clearInterval(iv);
  }, [loadOrder]);

  const submitFeedback = async () => {
    if (!rating) { toast.error('Please select a rating'); return; }
    if (!order?.restaurant?.slug) return;
    setSubmittingFeedback(true);
    try {
      await api.submitFeedback(order.restaurant.slug, {
        rating,
        order_id: order.id,
        comment,
        customer_name: order.customer_name,
        table_number: order.table_number,
      });
      setFeedbackDone(true);
      setShowFeedback(false);
      toast.success('Thank you for your feedback! ⭐');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handlePrint = () => {
    setShowReceipt(true);
    setTimeout(() => window.print(), 400);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }

  const currentStep = getCurrentStep(order?.order_status || 'new_order');
  const currentStepInfo = STATUS_STEPS[currentStep];
  const StepIcon = currentStepInfo?.icon || CheckCircle2;
  const currency = order?.restaurant?.currency || 'DA';
  const restaurantSlug = order?.restaurant?.slug || slug;

  return (
    <>
      {/* ── RECEIPT (print only) ── */}
      {showReceipt && order && (
        <div id="receipt-print" className="hidden print:block p-8 font-mono text-sm">
          <div className="text-center mb-6">
            {order.restaurant?.logo_url && (
              <img
                src={order.restaurant.logo_url.startsWith('http') ? order.restaurant.logo_url : `http://localhost:5000${order.restaurant.logo_url}`}
                alt="Logo"
                className="w-20 h-20 object-contain mx-auto mb-3"
              />
            )}
            <h1 className="text-xl font-bold">{order.restaurant?.name}</h1>
            {order.restaurant?.phone && <p className="text-sm">{order.restaurant.phone}</p>}
            {order.restaurant?.address && <p className="text-sm">{order.restaurant.address}</p>}
            <hr className="my-3 border-dashed" />
            <p className="font-bold text-lg">ORDER RECEIPT</p>
            <p className="text-sm">Order #: {order.id}</p>
            <p className="text-sm">Table: {order.table_number}</p>
            <p className="text-sm">Customer: {order.customer_name}</p>
            <p className="text-sm">Date: {new Date(order.created_at).toLocaleString()}</p>
            <hr className="my-3 border-dashed" />
          </div>

          <div className="mb-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between py-1">
                <span>{item.quantity}x {item.item_name}</span>
                <span>{item.total_price} {currency}</span>
              </div>
            ))}
          </div>

          <hr className="my-3 border-dashed" />
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL</span>
            <span>{order.total_price} {currency}</span>
          </div>
          <div className="text-center mt-6 text-xs text-gray-500">
            <p>Thank you for dining with us!</p>
            <p>Come back soon 🍽️</p>
          </div>
        </div>
      )}

      {/* ── MAIN PAGE (screen only) ── */}
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-gray-50 p-4 print:hidden">
        <div className="max-w-sm mx-auto space-y-4">

          {/* Live Status Card */}
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white text-center">
              <StepIcon className="w-12 h-12 mx-auto mb-2" />
              <h1 className="text-xl font-bold">{currentStepInfo?.label}</h1>
              <p className="text-sm opacity-90 mt-1">{currentStepInfo?.desc}</p>
            </div>

            <div className="p-4">
              <p className="text-center text-xs text-gray-400 mb-4">Order #{orderId} · Table {order?.table_number}</p>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-2 px-2">
                {STATUS_STEPS.slice(0, 5).map((step, idx) => {
                  const isDone = idx < currentStep;
                  const isActive = idx === currentStep;
                  const StIcon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isActive ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-1' :
                        isDone  ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        <StIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-medium text-center leading-tight ${
                        isActive ? 'text-amber-600' : isDone ? 'text-green-600' : 'text-gray-400'
                      }`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Polling indicator */}
              <p className="text-center text-[10px] text-gray-400 mt-2">
                <Clock className="w-3 h-3 inline mr-1" />
                Updates automatically every 10s
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}× {item.item_name}</span>
                  <span className="font-medium">{item.total_price} {currency}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-amber-600">{order?.total_price} {currency}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 bg-white rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-100 transition"
            >
              <Printer className="w-4 h-4" />
              Print Receipt
            </button>
            <button
              onClick={() => window.location.href = `/r/${restaurantSlug}?table=${tableNumber}`}
              className="flex items-center justify-center gap-2 py-3 bg-amber-500 rounded-xl shadow-sm text-sm font-medium text-white hover:bg-amber-600 transition"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Back to Menu
            </button>
          </div>

          {/* Restaurant Info */}
          {(order?.restaurant?.phone || order?.restaurant?.address) && (
            <div className="bg-white rounded-2xl shadow-sm p-4 text-sm text-gray-600 space-y-1">
              {order.restaurant?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" />
                  <span>{order.restaurant.phone}</span>
                </div>
              )}
              {order.restaurant?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{order.restaurant.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Feedback Card */}
          {showFeedback && !feedbackDone && (
            <div className="bg-white rounded-2xl shadow-md p-5 border-2 border-amber-200">
              <h3 className="font-bold text-gray-900 text-center mb-1">How was your meal?</h3>
              <p className="text-xs text-gray-500 text-center mb-4">Your feedback helps us improve</p>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <>
                  <textarea
                    rows={3}
                    placeholder="Leave a comment (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
                  />
                  <Button
                    onClick={submitFeedback}
                    disabled={submittingFeedback}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback ⭐'}
                  </Button>
                </>
              )}
              <button
                onClick={() => setShowFeedback(false)}
                className="w-full text-center text-xs text-gray-400 mt-2 hover:text-gray-600"
              >
                Skip for now
              </button>
            </div>
          )}

          {feedbackDone && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700">Feedback submitted. Thank you! 🙏</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
