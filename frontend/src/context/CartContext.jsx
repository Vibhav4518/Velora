import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../api/cartApi';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total_items: 0 });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const res = await cartApi.getCart();
      if (res.data && res.data.data) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.warning('Please log in to add products to your cart.');
      navigate('/login');
      return;
    }
    try {
      const res = await cartApi.addToCart(productId, quantity);
      if (res.data && res.data.data) {
        setCart(res.data.data);
      } else {
        await fetchCart();
      }
      toast.success('Product added to cart successfully.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to add product to cart';
      toast.error(msg);
      throw err;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await cartApi.updateQuantity(itemId, quantity);
      if (res.data && res.data.data) {
        setCart(res.data.data);
      } else {
        await fetchCart();
      }
      toast.success('Cart updated successfully');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to update cart quantity';
      toast.error(msg);
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId);
      if (res.data && res.data.data) {
        setCart(res.data.data);
      } else {
        await fetchCart();
      }
      toast.success('Product removed from cart');
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to remove product from cart';
      toast.error(msg);
      throw err;
    }
  };

  const clearCart = async (isOrderPlaced = False) => {
    try {
      const res = await cartApi.clearCart();
      if (res.data && res.data.data) {
        setCart(res.data.data);
      } else {
        setCart({ items: [], subtotal: 0, total_items: 0 });
      }
      if (isOrderPlaced) {
        toast.success('Order placed successfully. Your cart has been cleared.');
      } else {
        toast.info('Cart cleared');
      }
    } catch (err) {
      setCart({ items: [], subtotal: 0, total_items: 0 });
      if (isOrderPlaced) {
        toast.success('Order placed successfully. Your cart has been cleared.');
      } else {
        toast.error('Failed to clear cart');
      }
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
