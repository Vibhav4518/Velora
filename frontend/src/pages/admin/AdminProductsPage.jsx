import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Upload, FileSpreadsheet } from 'lucide-react';
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
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [bulkProgressMsg, setBulkProgressMsg] = useState('');

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
        toast.success('Product updated successfully');
      } else {
        await productApi.createProduct(payload);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      toast.warning('Please select an Excel (.xlsx) or CSV file');
      return;
    }
    setUploadingBulk(true);
    setBulkProgressMsg('Processing batch upload (up to 500 products)...');
    try {
      const data = new FormData();
      data.append('file', bulkFile);
      const res = await productApi.bulkUpload(data);
      const info = res.data.data;
      toast.success(res.data.message || `Processed ${info.total_processed} products!`);
      setShowBulkModal(false);
      setBulkFile(null);
      fetchProducts();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      toast.error(`Bulk upload failed: ${errMsg}`);
    } finally {
      setUploadingBulk(false);
      setBulkProgressMsg('');
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
      <AdminHeader title="Product Management" subtitle="Create, edit, and bulk import product catalog" />

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

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowBulkModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-sm rounded-2xl border border-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Bulk Insert (Excel / CSV)
            </button>
            <button
              onClick={handleOpenCreate}
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Product
            </button>
          </div>
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

      {/* Bulk Product Upload Modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Bulk Upload Products (Excel / CSV)">
        <form onSubmit={handleBulkUploadSubmit} className="space-y-6">
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs text-emerald-900">
            <p className="font-bold text-sm text-emerald-800">📄 Excel & CSV Import Format Guidelines (100+ Products):</p>
            <ul className="list-disc pl-4 space-y-1 text-emerald-700">
              <li>Supported file formats: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">.xlsx</code>, <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">.csv</code></li>
              <li>Columns recognized: <strong>Name, SKU, Category, Brand, Price, Cost_Price, Stock_Quantity, Description, Image_URL, Image_URLs</strong> (pipe <code className="bg-emerald-100 px-1 font-mono">|</code> separated).</li>
              <li>Missing Categories & Brands will be created dynamically on the fly.</li>
            </ul>
            <a
              href="data:text/csv;charset=utf-8,Name,SKU,Category,Brand,Price,Cost_Price,Stock_Quantity,Description,Image_URL,Image_URLs%0ASony%20WH-1000XM5,VEL-HEAD-001,Audio%20%26%20Headphones,Sony,399.99,220.00,45,Industry%20leading%20headphones,https%3A%2F%2Fimages.unsplash.com%2Fphoto-1505740420928-5e560c06d30e,https%3A%2F%2Fimages.unsplash.com%2Fphoto-1505740420928-5e560c06d30e%7Chttps%3A%2F%2Fimages.unsplash.com%2Fphoto-1546435770-a3e426bf472b"
              download="sample_velora_products.csv"
              className="inline-block mt-2 font-bold text-emerald-700 underline hover:text-emerald-900"
            >
              📥 Download Sample CSV Template
            </a>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Select Excel / CSV File</label>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="w-full bg-gray-50 text-sm text-gray-900 border border-gray-200 rounded-2xl p-3 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
            {bulkFile && (
              <p className="mt-2 text-xs text-gray-500 font-medium">Selected file: <strong className="text-gray-900">{bulkFile.name}</strong> ({Math.round(bulkFile.size / 1024)} KB)</p>
            )}
          </div>

          {bulkProgressMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold animate-pulse">
              {bulkProgressMsg}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingBulk || !bulkFile}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {uploadingBulk ? 'Uploading & Processing...' : 'Upload & Bulk Insert Products'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Form Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Create New Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SKU</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-gray-50 text-xs font-mono text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Regular Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_price}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Quantity</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URLs</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_urls[0] || ''}
                onChange={(e) => setFormData({ ...formData, image_urls: [e.target.value] })}
                className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 text-xs text-gray-900 rounded-xl p-2.5 border border-gray-200 outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Featured Product
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              Active Listing
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
