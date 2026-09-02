import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FolderTree, Tag, ShoppingCart,
  Users, Ticket, Star, Activity, ArrowLeft, LogOut, Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Brands', path: '/admin/brands', icon: Tag },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Users & Roles', path: '/admin/users', icon: Users, superAdminOnly: true },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Support Tickets', path: '/admin/support', icon: Headphones },
    { label: 'Audit Logs', path: '/admin/audit', icon: Activity, superAdminOnly: true },
  ];

  return (
    <aside className="w-64 bg-gray-950 text-gray-300 min-h-screen border-r border-gray-900 flex flex-col shrink-0">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-serif text-xl font-bold shadow-lg shadow-emerald-950">
            V
          </span>
          <div>
            <h1 className="font-serif text-lg font-bold text-white tracking-wide">VELORA</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Admin Control</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-900 mb-4 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          Back to Storefront
        </NavLink>

        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-4 mb-2">Management</div>

        {navItems.map((item) => {
          if (item.superAdminOnly && !isSuperAdmin) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-gray-900 bg-gray-900/50 space-y-3">
        <div className="flex items-center gap-3">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Admin" className="w-9 h-9 rounded-xl object-cover border border-emerald-500" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-emerald-900 text-emerald-300 font-bold flex items-center justify-center">
              {user?.first_name?.[0] || 'A'}
            </div>
          )}
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.full_name || user?.first_name}</p>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
              {user?.role || 'STAFF'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-rose-950/60 text-rose-300 hover:bg-rose-900 hover:text-white transition-all border border-rose-900/50"
        >
          <LogOut className="w-4 h-4" /> Logout Account
        </button>
      </div>
    </aside>
  );
};
