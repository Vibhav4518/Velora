import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RefreshCw } from 'lucide-react';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { brandApi } from '../api/brandApi';
import { ProductCard } from '../components/ProductCard';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state from URL query parameters
  const categoryFilter = searchParams.get('category') || '';
  const brandFilter = searchParams.get('brand') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const sortFilter = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getCategories(),
          brandApi.getBrands(),
        ]);
        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          page_size: 12,
        };
        if (categoryFilter) params.category = categoryFilter;
        if (brandFilter) params.brand = brandFilter;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (sortFilter) params.sort = sortFilter;
        if (searchQuery) params.search = searchQuery;

        const res = await productApi.getProducts(params);
        const data = res.data.data;
        setProducts(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalCount(data.count || 0);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter, brandFilter, minPrice, maxPrice, sortFilter, searchQuery, currentPage]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page when filtering
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gray-900 text-white rounded-3xl p-8 sm:p-10 shadow-lg">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold mb-2">Explore Catalog</h1>
        <p className="text-gray-400 text-sm">Find precision electronics, apparel, and design pieces.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Filter By</span>
              </div>
              <button
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-emerald-600 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Search Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={searchQuery}
                  onChange={(e) => updateParam('search', e.target.value)}
                  className="w-full bg-gray-50 text-sm text-gray-900 rounded-xl pl-9 pr-3 py-2 border border-gray-200 outline-none focus:border-emerald-600"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Categories</label>
              <select
                value={categoryFilter}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full bg-gray-50 text-sm text-gray-900 rounded-xl px-3 py-2 border border-gray-200 outline-none focus:border-emerald-600"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Brands</label>
              <select
                value={brandFilter}
                onChange={(e) => updateParam('brand', e.target.value)}
                className="w-full bg-gray-50 text-sm text-gray-900 rounded-xl px-3 py-2 border border-gray-200 outline-none focus:border-emerald-600"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Price Range ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="w-1/2 bg-gray-50 text-sm text-gray-900 rounded-xl px-3 py-2 border border-gray-200 outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="w-1/2 bg-gray-50 text-sm text-gray-900 rounded-xl px-3 py-2 border border-gray-200 outline-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Control Bar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{products.length}</span> of{' '}
              <span className="font-bold text-gray-900">{totalCount}</span> products
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortFilter}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-gray-50 text-sm font-semibold text-gray-900 rounded-xl px-3 py-1.5 border border-gray-200 outline-none focus:border-emerald-600"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products match your search"
              description="Try adjusting your category, brand, or price filters."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateParam('page', page)}
          />
        </main>
      </div>
    </div>
  );
};
