import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart, ShoppingBag, Truck, ShieldCheck, Star, CheckCircle, ArrowLeft,
  ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, UserCheck
} from 'lucide-react';
import { productApi } from '../api/productApi';
import { reviewApi } from '../api/reviewApi';
import { PriceDisplay } from '../components/PriceDisplay';
import { Rating } from '../components/Rating';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80';

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        const prodRes = await productApi.getProductBySlug(slug);
        const prod = prodRes.data.data;
        if (prod) {
          setProduct(prod);
          setActiveImgIndex(0);
          setImgError(false);

          // Fetch related products
          try {
            const relRes = await productApi.getRelatedProducts(prod.slug || slug);
            setRelatedProducts((relRes.data.data || []).filter((p) => p.id !== prod.id));
          } catch {
            setRelatedProducts([]);
          }

          // Fetch reviews
          try {
            const revRes = await reviewApi.getProductReviews(prod.slug || slug);
            setReviews(revRes.data.data || []);
          } catch {
            setReviews([]);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      loadProductData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-gray-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
            <div className="h-6 bg-gray-200 rounded-xl w-1/4" />
            <div className="h-24 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link to="/shop" className="text-emerald-600 font-bold mt-4 inline-block hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const inWish = isInWishlist(product.id);

  // Gallery image list logic
  const imageList = product.images && product.images.length > 0
    ? product.images.map((img) => img.image_url)
    : [product.primary_image_url || fallbackImage];

  const currentMainImage = imgError ? fallbackImage : (imageList[activeImgIndex] || fallbackImage);

  const handlePrevImage = () => {
    setActiveImgIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
    setImgError(false);
  };

  const handleNextImage = () => {
    setActiveImgIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
    setImgError(false);
  };

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please log in to submit a review');
      return;
    }
    if (!reviewTitle.trim() || !reviewContent.trim()) {
      toast.warning('Please enter both review title and content');
      return;
    }

    setSubmittingReview(true);
    try {
      const targetSlug = product.slug || slug;
      const res = await reviewApi.createReview(targetSlug, {
        rating: ratingVal,
        title: reviewTitle,
        content: reviewContent,
      });
      toast.success(res.data.message || 'Review submitted successfully!');
      setReviewTitle('');
      setReviewContent('');
      // Reload reviews
      const revRes = await reviewApi.getProductReviews(targetSlug);
      setReviews(revRes.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Rating breakdown statistics
  const totalReviewsCount = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(Number(r.rating)) === stars).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Back Navigation */}
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      {/* Main Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Gallery with Main Image & Thumbnails */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md relative group">
            <img
              src={currentMainImage}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Next / Prev Navigation Overlay */}
            {imageList.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  title="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                  title="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Selector Strip */}
          {imageList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {imageList.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImgIndex(idx);
                    setImgError(false);
                  }}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImgIndex === idx ? 'border-emerald-600 shadow-md scale-95' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              {product.brand_detail?.name || 'Luxury Brand'} • {product.category_detail?.name || 'Category'}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-mono">SKU: {product.sku}</p>
          </div>

          <Rating rating={product.rating} count={product.review_count} />

          <PriceDisplay price={product.price} discountPrice={product.discount_price} className="text-2xl" />

          <p className="text-gray-600 text-sm leading-relaxed">{product.short_description || product.description}</p>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.stock_quantity > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <CheckCircle className="w-4 h-4" /> In Stock ({product.stock_quantity} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity & Cart Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center shadow-xs"
                >
                  -
                </button>
                <span className="w-12 text-center font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="w-8 h-8 rounded-xl bg-white text-gray-700 font-bold hover:bg-gray-100 flex items-center justify-center shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity <= 0}
                className="flex-1 min-w-[160px] py-4 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock_quantity <= 0}
                className="flex-1 min-w-[160px] py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 rounded-2xl border transition-all ${
                  inWish ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-gray-200 text-gray-600 hover:text-rose-600'
                }`}
                title={inWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWish ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <Truck className="w-4 h-4 text-emerald-600" /> Free Express Delivery
            </div>
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2-Year Official Warranty
            </div>
          </div>
        </div>
      </div>

      {/* Description & Customer Reviews Container */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-12">
        <div>
          <h3 className="font-serif text-2xl font-bold text-gray-900 mb-4">Product Overview</h3>
          <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">{product.description}</p>
        </div>

        {/* Customer Reviews Section */}
        <div className="pt-8 border-t border-gray-100 space-y-8">
          <h3 className="font-serif text-2xl font-bold text-gray-900">Customer Ratings & Reviews</h3>

          {/* Rating Summary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            {/* Average Rating Score */}
            <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 pr-0 md:pr-6 space-y-2">
              <span className="font-serif text-5xl font-extrabold text-gray-900">{product.rating}</span>
              <Rating rating={product.rating} size="w-5 h-5" />
              <span className="text-xs text-gray-500 font-semibold">{totalReviewsCount} Verified Customer Reviews</span>
            </div>

            {/* Percentage Bars */}
            <div className="md:col-span-2 space-y-2 flex flex-col justify-center">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-gray-700 flex items-center gap-1">
                    {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-10 text-right font-medium text-gray-500">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write a Review Form for Authenticated Users */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Write a Review</h4>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700">Select Rating:</span>
                <select
                  value={ratingVal}
                  onChange={(e) => setRatingVal(Number(e.target.value))}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none focus:border-emerald-600"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                  <option value={1}>1 Star (Terrible)</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Review Headline..."
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-600"
              />
              <textarea
                placeholder="Write your review experience..."
                rows={3}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-emerald-600"
              />
              <button
                type="submit"
                disabled={submittingReview}
                className="px-6 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100 text-xs text-gray-500 font-medium">
              Please <Link to="/login" className="text-emerald-600 font-bold hover:underline">log in</Link> to post a customer review.
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400 italic text-center py-6">No customer reviews posted yet.</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{rev.user_name || 'Verified Customer'}</span>
                      {rev.is_verified_purchase && (
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <Rating rating={rev.rating} />
                  </div>
                  <h5 className="font-bold text-gray-900 text-sm">{rev.title}</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">{rev.content}</p>
                  <p className="text-[11px] text-gray-400">Reviewed on {new Date(rev.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-8">
          <h2 className="font-serif text-3xl font-bold text-gray-900">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
