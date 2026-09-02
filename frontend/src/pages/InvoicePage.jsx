import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Download, ShieldCheck } from 'lucide-react';
import { orderApi } from '../api/orderApi';

export const InvoicePage = () => {
  const { orderNumber } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await orderApi.getInvoice(orderNumber);
        setInvoice(res.data.data);
      } catch (err) {
        console.error('Failed to load invoice', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
      </div>
    );
  }

  if (!invoice || !invoice.order_detail) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h3 className="text-xl font-bold text-gray-900">Invoice not available</h3>
        <Link to="/orders" className="text-emerald-600 font-bold mt-2 inline-block">Back to Orders</Link>
      </div>
    );
  }

  const order = invoice.order_detail;
  const address = order.shipping_address_data || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <Link to={`/orders/${orderNumber}`} className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600">
          <ArrowLeft className="w-4 h-4" /> Back to Order
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all"
        >
          <Printer className="w-4 h-4" /> Print / Download PDF
        </button>
      </div>

      {/* Professional Printable Invoice Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-lg text-gray-900 font-sans space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-serif text-lg font-bold">
                V
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight">{invoice.store_name}</span>
            </div>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">{invoice.store_address}</p>
            <p className="text-xs text-gray-500 mt-1">{invoice.store_email} • {invoice.store_phone}</p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">INVOICE</h2>
            <p className="text-xs font-bold text-emerald-600 mt-1">{invoice.invoice_number}</p>
            <p className="text-xs text-gray-500 mt-2">
              Date: <span className="font-semibold text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</span>
            </p>
            <p className="text-xs text-gray-500">
              Order Ref: <span className="font-semibold text-gray-900">{order.order_number}</span>
            </p>
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-b border-gray-200 pb-8">
          <div>
            <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To / Customer</h4>
            <p className="font-bold text-gray-900 text-sm">{order.customer_name || address.full_name}</p>
            <p className="text-gray-600">{order.customer_email}</p>
            <p className="text-gray-600">{address.phone}</p>
          </div>

          <div>
            <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Destination</h4>
            <p className="font-semibold text-gray-900">{address.address_line_1} {address.address_line_2}</p>
            <p className="text-gray-600">{address.city}, {address.state} {address.postal_code}</p>
            <p className="text-gray-600">{address.country}</p>
          </div>
        </div>

        {/* Items Table */}
        <div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider">
                <th className="py-3 font-bold">Item & Description</th>
                <th className="py-3 font-bold text-center">SKU</th>
                <th className="py-3 font-bold text-center">Qty</th>
                <th className="py-3 font-bold text-right">Unit Price</th>
                <th className="py-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-semibold text-gray-900">{item.product_name}</td>
                  <td className="py-3 text-center text-gray-500">{item.sku}</td>
                  <td className="py-3 text-center font-bold text-gray-900">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">${(Number(item.unit_price) || 0).toFixed(2)}</td>
                  <td className="py-3 text-right font-bold text-gray-900">${(Number(item.total_price) || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-6 border-t border-gray-200 gap-6">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-bold text-gray-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Payment Authorized & Verified
            </p>
            <p>Payment Status: <span className="font-bold text-emerald-600 uppercase">{order.payment_status}</span></p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${(Number(order.subtotal) || 0).toFixed(2)}</span></div>
            {(Number(order.discount) || 0) > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount</span><span>-${(Number(order.discount) || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>${(Number(order.shipping_fee) || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>${(Number(order.tax) || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
              <span>Grand Total</span>
              <span className="text-emerald-600">${(Number(order.total) || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-8 border-t border-gray-100 text-[11px] text-gray-400">
          Thank you for your business with VELORA E-Commerce. If you have any questions, please contact support@velora.com.
        </div>
      </div>
    </div>
  );
};
