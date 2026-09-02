import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderTree, ArrowRight } from 'lucide-react';
import { categoryApi } from '../api/categoryApi';
import { EmptyState } from '../components/EmptyState';

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryApi.getCategories();
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
        setError('Unable to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3.5 py-1 rounded-full border border-emerald-800">
            Curated Collections
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight">Browse Categories</h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl">
            Explore our curated product categories engineered for high performance and luxury living.
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
          <FolderTree className="w-8 h-8" />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-gray-100 rounded-3xl animate-pulse border border-gray-200" />
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
      ) : categories.length === 0 ? (
        <EmptyState
          title="No Categories Available"
          description="Check back soon as new collections are published."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/shop?category=${category.slug}`)}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              {/* Category Image Header */}
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-950/10 text-emerald-800 font-serif font-bold text-3xl">
                    {category.name?.[0]}
                  </div>
                )}
                {category.product_count !== undefined && (
                  <span className="absolute top-4 right-4 text-xs font-bold text-white bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                    {category.product_count} {category.product_count === 1 ? 'Product' : 'Products'}
                  </span>
                )}
              </div>

              {/* Category Info */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {category.description || 'Browse high quality products in this category.'}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform gap-1 pt-4 border-t border-gray-100">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
