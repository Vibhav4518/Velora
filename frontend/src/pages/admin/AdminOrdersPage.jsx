import React, { useEffect, useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { orderApi } from '../../api/orderApi';
import { adminApi } from '../../api/adminApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Modal } from '../../components/Modal';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Status Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusVal, setOrderStatusVal] = useState('PENDING');
  const [paymentStatusVal, setPaymentStatusVal] = useState('PENDING');
  const toast = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getOrders({
        page: currentPage,
        search,
        status: statusFilter,
      });
      const data = res.data.data;
      setOrders(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, search, statusFilter]);

  const handleOpenStatusModal = (o) => {
    setSelectedOrder(o);
    setOrderStatusVal(o.order_status);
    setPaymentStatusVal(o.payment_status);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await adminApi.updateOrderStatus(selectedOrder.order_number, {
        order_status: orderStatusVal,
        payment_status: paymentStatusVal,
      });
      toast.success('Order status updated!');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Order Management" subtitle="Fulfill orders and process status changes" />

      <div className="px-8 space-y-6">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by order # or customer email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 text-sm text-gray-900 rounded-2xl pl-10 pr-4 py-2.5 border border-gray-200 outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 text-sm font-semibold text-gray-900 rounded-2xl px-4 py-2.5 border border-gray-200 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono font-bold text-gray-900">{o.order_number}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{o.customer_name || 'Customer'}</p>
                    <p className="text-gray-400 text-[10px]">{o.customer_email}</p>
                  </td>
                  <td className="p-4 font-extrabold text-emerald-600">${(Number(o.total) || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                      {o.order_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenStatusModal(o)}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Update Order #${selectedOrder?.order_number}`}>
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Order Status</label>
            <select
              value={orderStatusVal}
              onChange={(e) => setOrderStatusVal(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-bold"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Payment Status</label>
            <select
              value={paymentStatusVal}
              onChange={(e) => setPaymentStatusVal(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-bold"
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs">Save Status</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
