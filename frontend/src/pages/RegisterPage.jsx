import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Image as ImageIcon, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    avatar_url: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitting(false);
    try {
      await register(formData);
      navigate('/profile');
    } catch {
      // Toast handles error in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-serif text-2xl font-bold">
              V
            </span>
            <span className="font-serif text-2xl font-bold tracking-tight text-gray-900">VELORA</span>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Create Your Account</h2>
          <p className="text-xs text-gray-500">Join Velora to enjoy luxury shopping & rewards</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">First Name</label>
              <input
                type="text" value={formData.first_name} required
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Last Name</label>
              <input
                type="text" value={formData.last_name} required
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email" value={formData.email} required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password" value={formData.password} required minLength={8}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Confirm Password</label>
              <input
                type="password" value={formData.confirm_password} required minLength={8}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Phone Number (Optional)</label>
            <div className="relative">
              <input
                type="text" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1.5">Profile Image URL (Optional)</label>
            <div className="relative">
              <input
                type="url" value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
              <ImageIcon className="w-4 h-4 text-gray-400 absolute left-4 top-3" />
            </div>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100 text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
