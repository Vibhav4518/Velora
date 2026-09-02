import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, FileText, ChevronRight } from 'lucide-react';
import { orderApi } from '../api/orderApi';
import { EmptyState } from '../components/EmptyState';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders();
        const data = res.data.data;
        setOrders(data.results || data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No Orders Yet"
        description="You have not placed any orders yet. Explore our shop to place your first order."
        actionLabel="Start Shopping"
        actionTo="/shop"
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Order History</h2>
        <p className="text-xs text-gray-500 mt-1">View and manage your recent purchases</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-emerald-200 transition-all space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-200/60">
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase">Order Number</span>
                <span className="font-bold text-gray-900 text-sm">{order.order_number}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase">Date</span>
                <span className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase">Total</span>
                <span className="font-extrabold text-emerald-600 text-sm">${(Number(order.total) || 0).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase">Status</span>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {order.order_status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-gray-500 font-medium">
                {order.items?.length || 0} item(s) • Payment: <span className="font-bold text-gray-800">{order.payment_status}</span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/orders/${order.order_number}/invoice`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl"
                >
                  <FileText className="w-3.5 h-3.5" /> Invoice
                </Link>

                <Link
                  to={`/orders/${order.order_number}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 hover:text-emerald-600 bg-gray-200/70 px-3 py-1.5 rounded-xl"
                >
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
