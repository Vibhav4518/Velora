import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';
import { productApi } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';
import { ProductCard } from '../components/ProductCard';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featRes, newRes, catRes] = await Promise.all([
          productApi.getProducts({ featured: 'true', page_size: 4 }),
          productApi.getProducts({ sort: 'newest', page_size: 4 }),
          categoryApi.getCategories(),
        ]);
        setFeaturedProducts(featRes.data.data.results || []);
        setNewArrivals(newRes.data.data.results || []);
        setCategories((catRes.data.data || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
            alt="Velora Luxury"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
        </div>

        <div className="relative max-w-3xl px-8 sm:px-12 py-24 sm:py-32 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Redefined
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            Curated Elegance <br /> For Modern Living.
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl font-light max-w-xl">
            Discover precision-engineered tech, sustainable luxury apparel, and minimalist home decor tailored to perfection.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-900/40 transition-all hover:scale-105"
            >
              Shop Collection
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md transition-all"
            >
              Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Truck className="w-6 h-6" /></div>
            <div><h4 className="font-bold text-sm text-gray-900">Express Shipping</h4><p className="text-xs text-gray-500">Free over $100</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck className="w-6 h-6" /></div>
            <div><h4 className="font-bold text-sm text-gray-900">Secure Payments</h4><p className="text-xs text-gray-500">256-bit Encryption</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><RotateCcw className="w-6 h-6" /></div>
            <div><h4 className="font-bold text-sm text-gray-900">Easy Returns</h4><p className="text-xs text-gray-500">30 Days Guarantee</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Headphones className="w-6 h-6" /></div>
            <div><h4 className="font-bold text-sm text-gray-900">24/7 Support</h4><p className="text-xs text-gray-500">Dedicated assistance</p></div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900">Featured Categories</h2>
            <p className="text-gray-500 text-sm mt-1">Browse our top product divisions</p>
          </div>
          <Link to="/categories" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group relative h-64 rounded-3xl overflow-hidden shadow-md flex flex-col justify-end p-6 text-white"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
              <div className="relative z-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {cat.product_count} Products
                </span>
                <h3 className="text-xl font-bold">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">Handpicked quality for discerning tastes</p>
          </div>
          <Link to="/shop" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Shop All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 to-gray-950 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/30">
              Limited Offer
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold">Save 20% On Premium Audio Gear</h2>
            <p className="text-gray-300 text-sm">
              Use promo code <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">VELORA20</span> at checkout for orders over $150.
            </p>
          </div>
          <Link
            to="/shop?category=audio-headphones"
            className="px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold hover:bg-emerald-400 hover:text-gray-950 transition-all shadow-lg shrink-0"
          >
            Claim Offer
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-gray-900">New Arrivals</h2>
            <p className="text-gray-500 text-sm mt-1">Fresh additions to our catalog</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
