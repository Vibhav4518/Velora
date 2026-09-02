import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistApi } from '../api/wishlistApi';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  const { fetchCart } = useCart();
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await wishlistApi.getWishlist();
      if (res.data && res.data.data) {
        setWishlist(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlist.items.some((item) => item.product?.id === productId || item.product_id === productId);
  };

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.warning('Please log in to manage your wishlist');
      navigate('/login');
      return;
    }
    try {
      const res = await wishlistApi.addToWishlist(productId);
      if (res.data && res.data.data) {
        setWishlist(res.data.data);
      } else {
        await fetchWishlist();
      }
      const msg = res.data?.message || (isInWishlist(productId) ? 'Removed from wishlist.' : 'Added to wishlist.');
      if (msg.toLowerCase().includes('removed')) {
        toast.info('Removed from wishlist.');
      } else {
        toast.success('Added to wishlist.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Wishlist action failed';
      toast.error(errorMsg);
    }
  };

  const removeFromWishlist = async (productId) => {
    await toggleWishlist(productId);
  };

  const moveToCart = async (productId) => {
    try {
      await wishlistApi.moveToCart(productId);
      await fetchWishlist();
      await fetchCart();
      toast.success('Product moved to cart!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to move item to cart';
      toast.error(msg);
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, isInWishlist, toggleWishlist, removeFromWishlist, moveToCart, fetchWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
