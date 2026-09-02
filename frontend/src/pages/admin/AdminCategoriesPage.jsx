import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const toast = useToast();

  const [formData, setFormData] = useState({ name: '', description: '', image_url: '', parent: '' });

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image_url: '', parent: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({ name: c.name, description: c.description, image_url: c.image_url, parent: c.parent || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, parent: formData.parent || null };
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.slug, payload);
        toast.success('Category updated successfully');
      } else {
        await categoryApi.createCategory(payload);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await categoryApi.deleteCategory(deletingCategory.slug);
      toast.success('Category deleted successfully');
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Category Management" subtitle="Manage store taxonomy and subcategories" />

      <div className="px-8 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">Category Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Products</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900 text-sm flex items-center gap-3">
                    <img src={c.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} alt="" className="w-10 h-10 rounded-xl object-cover" />
                    {c.name}
                  </td>
                  <td className="p-4 font-mono text-gray-500">{c.slug}</td>
                  <td className="p-4 font-bold text-emerald-600">{c.product_count}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(c)} className="p-2 text-gray-600 hover:text-emerald-600 rounded-xl">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingCategory(c)} className="p-2 text-gray-600 hover:text-rose-600 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? 'Edit Category' : 'Create Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Category Name</label>
            <input
              type="text" value={formData.name} required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Image URL</label>
            <input
              type="url" value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
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
            <button type="submit" className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs">Save Category</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingCategory}
        title="Delete Category?"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
};
