import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Phone, Image as ImageIcon, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    avatar_url: user?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
    } catch (err) {
      // Toast handles error in AuthContext
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h2 className="font-serif text-2xl font-bold text-gray-900">Account Profile</h2>
        <p className="text-xs text-gray-500 mt-1">Manage your personal information and profile avatar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Email Address (Read-only)</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-2xl px-4 py-3 text-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Phone Number</label>
          <div className="relative">
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Profile Image URL</label>
          <div className="relative">
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <ImageIcon className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3.5 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
};
