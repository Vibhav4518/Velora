import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { couponApi } from '../../api/couponApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    min_order_amount: '0.00',
    is_active: true,
  });

  const fetchCoupons = async () => {
    try {
      const res = await couponApi.getCoupons();
      setCoupons(res.data.data || []);
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: '',
      min_order_amount: '0.00',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCoupon(c);
    setFormData({
      code: c.code,
      description: c.description,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount,
      is_active: c.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponApi.updateCoupon(editingCoupon.id, formData);
        toast.success('Coupon updated successfully');
      } else {
        await couponApi.createCoupon(formData);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to save coupon');
    }
  };

  const handleDelete = async () => {
    if (!deletingCoupon) return;
    try {
      await couponApi.deleteCoupon(deletingCoupon.id);
      toast.success('Coupon deleted');
      setDeletingCoupon(null);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Coupon Management" subtitle="Create and manage promotional discount codes" />

      <div className="px-8 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Value</th>
                <th className="p-4">Min Spend</th>
                <th className="p-4">Used Count</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono font-bold text-gray-900 text-sm">{c.code}</td>
                  <td className="p-4 font-semibold text-gray-600">{c.discount_type}</td>
                  <td className="p-4 font-extrabold text-emerald-600">
                    {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `$${c.discount_value}`}
                  </td>
                  <td className="p-4 text-gray-700">${Number(c.min_order_amount).toFixed(2)}</td>
                  <td className="p-4 font-bold text-gray-900">{c.used_count}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(c)} className="p-2 text-gray-600 hover:text-emerald-600 rounded-xl">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingCoupon(c)} className="p-2 text-gray-600 hover:text-rose-600 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Coupon Code</label>
              <input
                type="text" value={formData.code} required
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="PROMO10"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none uppercase font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Discount Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-bold"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Discount Value</label>
              <input
                type="number" step="0.01" value={formData.discount_value} required
                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Min Order Amount ($)</label>
              <input
                type="number" step="0.01" value={formData.min_order_amount} required
                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
            <input
              type="text" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs">Save Coupon</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingCoupon}
        title="Delete Coupon?"
        message={`Are you sure you want to delete coupon "${deletingCoupon?.code}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCoupon(null)}
      />
    </div>
  );
};
