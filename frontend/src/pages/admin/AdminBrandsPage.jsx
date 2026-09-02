import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { brandApi } from '../../api/brandApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const AdminBrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({ name: '', description: '', logo_url: '' });

  const fetchBrands = async () => {
    try {
      const res = await brandApi.getBrands();
      setBrands(res.data.data || []);
    } catch (err) {
      console.error('Failed to load brands', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '', logo_url: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBrand(b);
    setFormData({ name: b.name, description: b.description, logo_url: b.logo_url });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await brandApi.updateBrand(editingBrand.slug, formData);
        toast.success('Brand updated successfully');
      } else {
        await brandApi.createBrand(formData);
        toast.success('Brand created successfully');
      }
      setShowModal(false);
      fetchBrands();
    } catch (err) {
      toast.error('Failed to save brand');
    }
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;
    try {
      await brandApi.deleteBrand(deletingBrand.slug);
      toast.success('Brand deleted successfully');
      setDeletingBrand(null);
      fetchBrands();
    } catch (err) {
      toast.error('Failed to delete brand');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Brand Management" subtitle="Manage brand partners and manufacturers" />

      <div className="px-8 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Brand
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">Brand Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Products</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900 text-sm flex items-center gap-3">
                    <img src={b.logo_url || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&q=80'} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    {b.name}
                  </td>
                  <td className="p-4 font-mono text-gray-500">{b.slug}</td>
                  <td className="p-4 font-bold text-emerald-600">{b.product_count}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(b)} className="p-2 text-gray-600 hover:text-emerald-600 rounded-xl">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingBrand(b)} className="p-2 text-gray-600 hover:text-rose-600 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBrand ? 'Edit Brand' : 'Create Brand'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Brand Name</label>
            <input
              type="text" value={formData.name} required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Logo URL</label>
            <input
              type="url" value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.jpg"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
            <textarea
              rows={2} value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs">Save Brand</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingBrand}
        title="Delete Brand?"
        message={`Are you sure you want to delete brand "${deletingBrand?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingBrand(null)}
      />
    </div>
  );
};
