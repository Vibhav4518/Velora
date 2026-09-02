import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { shippingApi } from '../api/shippingApi';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const AddressManagerPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await shippingApi.getAddresses();
      setAddresses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenCreate = () => {
    setEditingAddr(null);
    setFormData({
      full_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
      is_default: addresses.length === 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddr(addr);
    setFormData({ ...addr });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddr) {
        await shippingApi.updateAddress(editingAddr.id, formData);
        toast.success('Address updated successfully');
      } else {
        await shippingApi.createAddress(formData);
        toast.success('Address saved successfully');
      }
      setShowModal(false);
      fetchAddresses();
    } catch (err) {
      let msg = err.response?.data?.message;
      if (!msg && err.response?.data?.errors) {
        const errs = err.response.data.errors;
        const firstKey = Object.keys(errs)[0];
        msg = Array.isArray(errs[firstKey]) ? `${firstKey}: ${errs[firstKey][0]}` : `${firstKey}: ${errs[firstKey]}`;
      }
      toast.error(msg || 'Unable to save address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await shippingApi.setDefaultAddress(id);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to set default address');
    }
  };

  const handleDelete = async () => {
    try {
      await shippingApi.deleteAddress(deletingId);
      toast.success('Address deleted');
      setDeletingId(null);
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Address Book</h2>
          <p className="text-xs text-gray-500 mt-1">Manage multiple shipping destinations</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
      ) : addresses.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No addresses saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-2xl border transition-all relative ${
                addr.is_default ? 'border-emerald-600 bg-emerald-50/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-gray-900">{addr.full_name}</h4>
                {addr.is_default ? (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[10px] font-bold text-gray-500 hover:text-emerald-600"
                  >
                    Set as Default
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600">{addr.address_line_1} {addr.address_line_2}</p>
              <p className="text-xs text-gray-600">{addr.city}, {addr.state} {addr.postal_code}</p>
              <p className="text-xs text-gray-400 mt-2">{addr.phone}</p>

              <div className="flex items-center gap-3 pt-4 mt-3 border-t border-gray-100 text-xs font-semibold">
                <button onClick={() => handleOpenEdit(addr)} className="text-emerald-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => setDeletingId(addr.id)} className="text-rose-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingAddr ? 'Edit Address' : 'New Address'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text" placeholder="Full Name" value={formData.full_name} required
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
            />
            <input
              type="text" placeholder="Phone Number" value={formData.phone} required
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
            />
          </div>
          <input
            type="text" placeholder="Address Line 1" value={formData.address_line_1} required
            onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
          />
          <input
            type="text" placeholder="Address Line 2 (Optional)" value={formData.address_line_2}
            onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text" placeholder="City" value={formData.city} required
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
            <input
              type="text" placeholder="State" value={formData.state} required
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
            <input
              type="text" placeholder="Postal Code" value={formData.postal_code} required
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border text-sm font-bold text-gray-600">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold text-sm">
              Save Address
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Address?"
        message="Are you sure you want to remove this address?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
