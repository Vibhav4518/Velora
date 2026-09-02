import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, ArrowLeft, XCircle, MapPin, CreditCard } from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';

export const OrderDetailPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderByNumber(orderNumber);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to fetch order details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await orderApi.cancelOrder(orderNumber, 'Customer Cancellation');
      setOrder(res.data.data);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <h3 className="text-lg font-bold text-gray-900">Order not found</h3>
        <Link to="/orders" className="text-emerald-600 font-bold mt-2 inline-block text-sm">Back to Orders</Link>
      </div>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.order_status);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-emerald-600 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Order History
          </Link>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Order #{order.order_number}</h2>
          <p className="text-xs text-gray-400 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/orders/${order.order_number}/invoice`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-all"
          >
            <FileText className="w-4 h-4" /> View Invoice
          </Link>

          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-all"
            >
              <XCircle className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Visual Tracking Stepper */}
      {order.order_status !== 'CANCELLED' ? (
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Order Progress</h4>
          <div className="grid grid-cols-6 gap-2 text-center relative">
            {[
              { label: 'Pending', status: 'PENDING' },
              { label: 'Confirmed', status: 'CONFIRMED' },
              { label: 'Processing', status: 'PROCESSING' },
              { label: 'Shipped', status: 'SHIPPED' },
              { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY' },
              { label: 'Delivered', status: 'DELIVERED' },
            ].map((step, idx, arr) => {
              const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
              const currentIdx = statusOrder.indexOf(order.order_status);
              const isCompleted = currentIdx >= idx;
              const isCurrent = currentIdx === idx;

              return (
                <div key={step.status} className="flex flex-col items-center space-y-2 relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 scale-110'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-[10px] font-bold ${isCurrent ? 'text-emerald-700 font-extrabold' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>This order was cancelled. {order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : ''}</span>
        </div>
      )}

      {/* Status Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
        <div>
          <span className="text-gray-400 font-bold block uppercase">Order Status</span>
          <span className="font-bold text-gray-900">{order.order_status}</span>
        </div>
        <div>
          <span className="text-gray-400 font-bold block uppercase">Payment Status</span>
          <span className="font-bold text-emerald-600">{order.payment_status}</span>
        </div>
        <div>
          <span className="text-gray-400 font-bold block uppercase">Shipping</span>
          <span className="font-bold text-gray-900">${(Number(order.shipping_fee) || 0).toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-400 font-bold block uppercase">Total Amount</span>
          <span className="font-extrabold text-gray-900">${(Number(order.total) || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Address & Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-gray-900">
            <MapPin className="w-4 h-4 text-emerald-600" /> Shipping Address
          </div>
          <div className="text-xs text-gray-600 space-y-1 pt-2">
            <p className="font-bold text-gray-900">{order.shipping_address_data?.full_name}</p>
            <p>{order.shipping_address_data?.address_line_1}</p>
            <p>{order.shipping_address_data?.city}, {order.shipping_address_data?.state} {order.shipping_address_data?.postal_code}</p>
            <p className="text-gray-400">{order.shipping_address_data?.phone}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h4 className="font-bold text-sm text-gray-900">Order Items</h4>
          <div className="space-y-3">
            {(order.items || []).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white text-xs">
                <div className="font-medium text-gray-900">
                  <span className="font-bold">{item.quantity}x</span> {item.product_name}
                  <span className="text-gray-400 block text-[10px]">SKU: {item.sku}</span>
                </div>
                <span className="font-bold text-gray-900">${(Number(item.total_price) || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancelModal}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? Stock will be restored and payment refunded."
        confirmText="Yes, Cancel Order"
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
        loading={cancelling}
      />
    </div>
  );
};
