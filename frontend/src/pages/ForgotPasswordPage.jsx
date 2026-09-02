import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
      toast.success('Password reset instructions sent to your email!');
    } catch {
      toast.error('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600">
          <ArrowLeft className="w-4 h-4" /> Back to Sign In
        </Link>

        <div className="text-center space-y-2">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="text-xs text-gray-500">Enter your email and we'll send reset instructions.</p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-xs font-medium text-center space-y-3">
            <p>Password reset token dispatched to <strong>{email}</strong>.</p>
            <Link to={`/reset-password?email=${encodeURIComponent(email)}&token=reset-simulated-token-12345`} className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">
              Proceed to Reset Password
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email" value={email} required
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
