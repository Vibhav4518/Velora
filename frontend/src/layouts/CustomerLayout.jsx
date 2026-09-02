import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { User, ShoppingBag, MapPin, LogOut } from 'lucide-react';

export const CustomerLayout = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              {/* Profile Brief */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.first_name} className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-md" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xl flex items-center justify-center border-2 border-emerald-600 shadow-md">
                    {user.first_name?.[0] || 'U'}
                  </div>
                )}
                <div className="truncate">
                  <h3 className="font-bold text-gray-900 truncate">{user.full_name || user.first_name}</h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              {/* Links */}
              <nav className="space-y-1.5 font-semibold text-sm">
                <NavLink
                  to="/profile"
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <User className="w-4 h-4" />
                  My Profile
                </NavLink>

                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <ShoppingBag className="w-4 h-4" />
                  My Orders
                </NavLink>

                <NavLink
                  to="/addresses"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <MapPin className="w-4 h-4" />
                  Address Book
                </NavLink>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 transition-all border-t border-gray-100 mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Area */}
          <div className="md:col-span-3">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
