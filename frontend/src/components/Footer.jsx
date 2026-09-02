import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-serif text-xl font-bold">
                V
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                VELORA
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Crafting premium luxury e-commerce experiences. Minimalist design, curated quality, and timeless elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?featured=true" className="hover:text-white transition-colors">Featured Collection</Link></li>
              <li><Link to="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/brands" className="hover:text-white transition-colors">Top Brands</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/support" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">My Account</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Contact Info</h4>
            <ul className="space-y-2.5 text-sm">
              <li>100 Velora Tech Blvd, Suite 500</li>
              <li>San Francisco, CA 94107</li>
              <li className="text-white font-semibold">support@velora.com</li>
              <li className="text-emerald-400 font-semibold">+1 (800) 555-VELORA</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} VELORA E-Commerce Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
