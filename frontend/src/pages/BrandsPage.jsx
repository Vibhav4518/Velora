import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { brandApi } from '../api/brandApi';
import { EmptyState } from '../components/EmptyState';

export const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await brandApi.getBrands();
        setBrands(res.data.data || []);
      } catch (err) {
        console.error('Failed to load brands', err);
        setError('Unable to load brands. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-800">
            Featured Designers & Creators
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight">Our Premium Brands</h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl">
            Explore curated craftsmanship and world-class luxury brands exclusively available on Velora.
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <Tag className="w-8 h-8" />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-gray-100 rounded-3xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-8">
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm"
          >
            Retry
          </button>
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          title="No Brands Available"
          description="Check back soon as we partner with more luxury creators."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand) => (
            <div
              key={brand.id}
              onClick={() => navigate(`/shop?brand=${brand.slug}`)}
              className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden p-2 group-hover:scale-105 transition-transform">
                  {brand.logo_url ? (
                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-serif font-bold text-xl text-gray-900">{brand.name?.[0]}</span>
                  )}
                </div>
                {brand.product_count !== undefined && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    {brand.product_count} {brand.product_count === 1 ? 'Product' : 'Products'}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {brand.description || 'Explore precision engineered products and luxury items.'}
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform gap-1 pt-4 border-t border-gray-100">
                <span>View Products</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
