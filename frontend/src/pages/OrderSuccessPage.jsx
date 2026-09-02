import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, FileText, ArrowRight, Package } from 'lucide-react';
import { orderApi } from '../api/orderApi';

export const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderApi.getOrderByNumber(orderNumber);
        setOrder(res.data.data);
      } catch (err) {
        console.error('Failed to load order details', err);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900">Order Confirmed!</h1>
        <p className="text-gray-500 text-sm">
          Thank you for shopping with VELORA. Your order number is{' '}
          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{orderNumber}</span>
        </p>
      </div>

      {order && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-md text-left space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400 block uppercase font-bold">Total Paid</span>
              <span className="text-2xl font-extrabold text-emerald-600">${(Number(order.total) || 0).toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block uppercase font-bold">Payment Status</span>
              <span className="text-xs font-bold uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                {order.payment_status}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-gray-900 mb-3">Items Ordered</h4>
            <div className="space-y-3">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span className="font-bold text-gray-900">${(Number(item.total_price) || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link
          to={`/orders/${orderNumber}`}
          className="px-6 py-3 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Package className="w-4 h-4" /> View Order Details
        </Link>
        <Link
          to={`/orders/${orderNumber}/invoice`}
          className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 font-bold text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-emerald-600" /> View & Print Invoice
        </Link>
      </div>
    </div>
  );
};
