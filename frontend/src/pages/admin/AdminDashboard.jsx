import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ShoppingBag, FolderTree, ShoppingCart, DollarSign,
  AlertTriangle, Clock, CheckCircle2, TrendingUp, ArrowRight
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { AdminHeader } from '../../components/AdminHeader';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getDashboardStats();
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <AdminHeader title="Dashboard Overview" subtitle="Real-time analytics and store performance" />
        <div className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recent_orders || [];
  const recentUsers = data?.recent_users || [];

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Dashboard Overview" subtitle="Real-time analytics and store metrics from PostgreSQL" />

      <div className="px-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Revenue</span>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">${(stats.total_revenue || 0).toFixed(2)}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.total_orders || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShoppingCart className="w-6 h-6" /></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Customers</span>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.total_customers || 0}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Users className="w-6 h-6" /></div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Low Stock Alert</span>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-1">{stats.low_stock_products || 0}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
            <div className="p-2.5 bg-gray-100 text-gray-700 rounded-xl"><ShoppingBag className="w-5 h-5" /></div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Active Products</span>
              <p className="font-bold text-gray-900 text-lg">{stats.total_products || 0}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Clock className="w-5 h-5" /></div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Pending Orders</span>
              <p className="font-bold text-gray-900 text-lg">{stats.pending_orders || 0}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase">Delivered Orders</span>
              <p className="font-bold text-gray-900 text-lg">{stats.completed_orders || 0}</p>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold">
                    <th className="py-2">Order #</th>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-bold text-gray-900">{o.order_number}</td>
                      <td className="py-3 text-gray-600">{o.customer_name || o.customer_email}</td>
                      <td className="py-3 font-extrabold text-emerald-600">${(Number(o.total) || 0).toFixed(2)}</td>
                      <td className="py-3">
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {o.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Recent Registrations</h3>
              <Link to="/admin/users" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                Manage Users <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase font-bold">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 font-bold text-gray-900">{u.full_name || u.first_name}</td>
                      <td className="py-3 text-gray-600">{u.email}</td>
                      <td className="py-3">
                        <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
