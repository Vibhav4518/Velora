import React, { useState, useEffect } from 'react';
import { Mail, Send, Headphones, MapPin, Ticket, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supportApi } from '../api/supportApi';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const SupportPage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.full_name || (user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''),
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const fetchMyTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const res = await supportApi.getMyTickets();
      setMyTickets(res.data.data || []);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.warning('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await supportApi.submitTicket(formData);
      toast.success('Support ticket submitted successfully!');
      setFormData({
        name: user?.full_name || (user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : ''),
        email: user?.email || '',
        subject: '',
        message: ''
      });
      if (user) {
        fetchMyTickets();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to submit support request. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Open</span>;
      case 'IN_PROGRESS':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">In Progress</span>;
      case 'RESOLVED':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Resolved</span>;
      case 'CLOSED':
        return <span className="bg-gray-200 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Closed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Client Services
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-gray-900">How Can We Help You?</h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Our dedicated luxury customer care team is available 24/7 to assist with orders, sizing, and inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Info Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0"><Headphones className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">24/7 Hotline</h4>
              <p className="text-xs text-gray-500 mt-1">+1 (800) 555-VELORA</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0"><Mail className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Email Inquiries</h4>
              <p className="text-xs text-gray-500 mt-1">support@velora.com</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0"><MapPin className="w-6 h-6" /></div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Headquarters</h4>
              <p className="text-xs text-gray-500 mt-1">100 Velora Tech Blvd, Suite 500<br />San Francisco, CA 94107</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">Send us a message</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Your Name</label>
                <input
                  type="text" value={formData.name} required
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Doe"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Your Email</label>
                <input
                  type="email" value={formData.email} required
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Subject</label>
              <input
                type="text" value={formData.subject} required
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Order Inquiry / Product Sizing"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Message</label>
              <textarea
                rows={4} value={formData.message} required
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can our concierge assist you?"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="px-8 py-4 rounded-2xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> {loading ? 'Submitting...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      {/* Submitted Tickets Section for Authenticated Users */}
      {user && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-emerald-600" />
            <h3 className="font-serif text-2xl font-bold text-gray-900">Your Support Tickets</h3>
          </div>

          {loadingTickets ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          ) : myTickets.length === 0 ? (
            <p className="text-sm text-gray-400 italic">You have no submitted tickets.</p>
          ) : (
            <div className="space-y-4">
              {myTickets.map((t) => (
                <div key={t.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-400 mr-2">Ticket #{t.id}</span>
                      <span className="font-bold text-gray-900 text-base">{t.subject}</span>
                    </div>
                    {getStatusBadge(t.status)}
                  </div>
                  <p className="text-sm text-gray-700 bg-white p-3.5 rounded-xl border border-gray-100">{t.message}</p>
                  
                  {t.admin_response && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <MessageSquare className="w-3.5 h-3.5" /> Support Response:
                      </div>
                      <p className="text-xs text-emerald-950 font-medium">{t.admin_response}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Submitted on {new Date(t.created_at).toLocaleDateString()} at {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
