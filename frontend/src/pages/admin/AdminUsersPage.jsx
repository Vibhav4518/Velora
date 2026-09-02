import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (user && !isSuperAdmin) {
      toast.error('You are not authorized to access Users & Roles management');
      navigate('/admin', { replace: true });
    }
  }, [user, isSuperAdmin, navigate, toast]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role_id: '',
    is_active: true,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [uRes, rRes] = await Promise.all([
        adminApi.getUsers({ page: currentPage, search }),
        adminApi.getRoles(),
      ]);
      const data = uRes.data.data;
      setUsers(data.results || []);
      setTotalPages(data.total_pages || 1);
      setRoles(rRes.data.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role_id: roles[0]?.id || '',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone || '',
      role_id: roles.find((r) => r.name === u.role)?.id || '',
      is_active: u.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, formData);
        toast.success('User updated successfully');
      } else {
        await adminApi.createUser(formData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await adminApi.deleteUser(deletingUser.id);
      toast.success('User deleted');
      setDeletingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="User & Role Management" subtitle="Manage user credentials, status, and assigned RBAC roles" />

      <div className="px-8 space-y-6">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 text-sm text-gray-900 rounded-2xl pl-10 pr-4 py-2.5 border border-gray-200 outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>

          <button
            onClick={handleOpenCreate}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create User
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900 text-sm">{u.full_name || u.first_name}</td>
                  <td className="p-4 text-gray-600 font-medium">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(u)} className="p-2 text-gray-600 hover:text-emerald-600 rounded-xl">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingUser(u)} className="p-2 text-gray-600 hover:text-rose-600 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
            <input
              type="email" value={formData.email} required disabled={!!editingUser}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none disabled:bg-gray-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">First Name</label>
              <input
                type="text" value={formData.first_name} required
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Last Name</label>
              <input
                type="text" value={formData.last_name} required
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Assigned Role</label>
            <select
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none font-bold"
            >
              {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox" checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-emerald-600"
            />
            <label className="text-xs font-bold text-gray-700">Account Active</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs">Save User</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingUser}
        title="Delete User?"
        message={`Are you sure you want to delete user "${deletingUser?.email}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
      />
    </div>
  );
};
