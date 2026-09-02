import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password, rememberMe);
      if (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'STAFF') {
        navigate('/admin');
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch {
      // Toast handles error in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-serif text-2xl font-bold">
              V
            </span>
            <span className="font-serif text-2xl font-bold tracking-tight text-gray-900">VELORA</span>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-xs text-gray-500">Sign in to access your account & orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@velora.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Password</label>
              <Link to="/forgot-password" className="text-xs text-emerald-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password" value={password} required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit" disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100 text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
