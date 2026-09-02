import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User as UserIcon, LogOut, Shield, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar = () => {
  const { user, logout, isStaff } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Announcement Bar */}
      <div className="bg-gray-900 text-white text-xs py-2 text-center font-medium tracking-wide">
        ✨ Free Worldwide Express Shipping on Orders Over $100 | Use Code <span className="text-emerald-400 font-bold">WELCOME10</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform">
              V
            </span>
            <span className="font-serif text-2xl font-bold tracking-tight text-gray-900">
              VELORA
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-700">
            <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-emerald-600 transition-colors">Shop</Link>
            <Link to="/categories" className="hover:text-emerald-600 transition-colors">Categories</Link>
            <Link to="/brands" className="hover:text-emerald-600 transition-colors">Brands</Link>
            <Link to="/support" className="hover:text-emerald-600 transition-colors">Support</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 hover:bg-gray-200/70 focus:bg-white text-sm text-gray-900 rounded-full pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-emerald-600 transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </form>

          {/* Icons & Account */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notification Dropdown (Logged-in User) */}
            {user && <NotificationDropdown />}

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-full text-gray-700 hover:text-emerald-600 hover:bg-gray-100 transition-all"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.items.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.items.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full text-gray-700 hover:text-emerald-600 hover:bg-gray-100 transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.total_items > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.total_items}
                </span>
              )}
            </Link>

            {/* User Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.first_name} className="w-8 h-8 rounded-full object-cover border border-emerald-600" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      {user.first_name?.[0] || 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{user.full_name || user.first_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    {isStaff && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-700 font-semibold hover:bg-emerald-50"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <UserIcon className="w-4 h-4" />
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      My Orders
                    </Link>

                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-gray-900 hover:bg-emerald-600 px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3 animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-sm text-gray-900 rounded-xl pl-10 pr-4 py-2.5 outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </form>
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Home</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Shop</Link>
            <Link to="/categories" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Categories</Link>
            <Link to="/brands" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Brands</Link>
            <Link to="/support" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Support</Link>
          </div>
        )}
      </div>
    </header>
  );
};
