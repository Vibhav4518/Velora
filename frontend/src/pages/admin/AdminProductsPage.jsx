import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { brandApi } from '../../api/brandApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal & Confirm states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    short_description: '',
    price: '',
    discount_price: '',
    category: '',
    brand: '',
    stock_quantity: 10,
    low_stock_threshold: 5,
    is_featured: false,
    is_active: true,
    image_urls: [''],
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        productApi.getProducts({ page: currentPage, search, include_inactive: 'true' }),
        categoryApi.getCategories(),
        brandApi.getBrands(),
      ]);
      const data = prodRes.data.data;
      setProducts(data.results || []);
      setTotalPages(data.total_pages || 1);
      setCategories(catRes.data.data || []);
      setBrands(brandRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      description: '',
      short_description: '',
      price: '',
      discount_price: '',
      category: categories[0]?.id || '',
      brand: brands[0]?.id || '',
      stock_quantity: 15,
      low_stock_threshold: 5,
      is_featured: false,
      is_active: true,
      image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      description: p.description,
      short_description: p.short_description || '',
      price: p.price,
      discount_price: p.discount_price || '',
      category: p.category || '',
      brand: p.brand || '',
      stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold,
      is_featured: p.is_featured,
      is_active: p.is_active,
      image_urls: p.images?.length ? p.images.map((img) => img.image_url) : [''],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category: formData.category || null,
        brand: formData.brand || null,
        image_urls: formData.image_urls.filter((url) => url.trim() !== ''),
      };

      if (editingProduct) {
        await productApi.updateProduct(editingProduct.slug, payload);
        toast.success('Product updated successfully!');
      } else {
        await productApi.createProduct(payload);
        toast.success('Product created successfully!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await productApi.deleteProduct(deletingProduct.slug);
      toast.success('Product deleted successfully');
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Product Management" subtitle="Create, edit, and update product catalog" />

      <div className="px-8 space-y-6">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search products by SKU or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 text-sm text-gray-900 rounded-2xl pl-10 pr-4 py-2.5 border border-gray-200 outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.primary_image_url}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover bg-gray-100 border border-gray-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</p>
                          <p className="text-gray-400 text-[10px]">{p.category_detail?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-600">{p.sku}</td>
                    <td className="p-4 font-extrabold text-emerald-600">${Number(p.current_price).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`font-bold ${p.stock_quantity <= 5 ? 'text-rose-600' : 'text-gray-900'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingProduct(p)} className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Modal Form */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Create Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product SKU</label>
              <input
                type="text" value={formData.sku} required
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Product Name</label>
              <input
                type="text" value={formData.name} required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Price ($)</label>
              <input
                type="number" step="0.01" value={formData.price} required
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Discount Price ($)</label>
              <input
                type="number" step="0.01" value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                placeholder="Optional"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Stock Quantity</label>
            <input
              type="number" value={formData.stock_quantity} required
              onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">Product Image URLs (Multiple supported)</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image_urls: [...formData.image_urls, ''] })}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                + Add Image URL
              </button>
            </div>
            <div className="space-y-2">
              {formData.image_urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    required={idx === 0}
                    onChange={(e) => {
                      const updated = [...formData.image_urls];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, image_urls: updated });
                    }}
                    placeholder={`Image URL #${idx + 1}...`}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  {formData.image_urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.image_urls.filter((_, i) => i !== idx);
                        setFormData({ ...formData, image_urls: updated.length ? updated : [''] });
                      }}
                      className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
            <textarea
              rows={3} value={formData.description} required
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <input
                type="checkbox" checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded text-emerald-600"
              />
              Featured Product
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <input
                type="checkbox" checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded text-emerald-600"
              />
              Active in Catalog
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs">
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingProduct}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deletingProduct?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
};
