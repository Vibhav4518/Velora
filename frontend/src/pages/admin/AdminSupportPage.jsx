import React, { useEffect, useState } from 'react';
import { Headphones, Filter, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { supportApi } from '../../api/supportApi';
import { useToast } from '../../context/ToastContext';
import { AdminHeader } from '../../components/AdminHeader';
import { Modal } from '../../components/Modal';

export const AdminSupportPage = () => {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [ticketStatus, setTicketStatus] = useState('OPEN');
  const [updating, setUpdating] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await supportApi.getAdminTickets(statusFilter);
      setTickets(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResponseMsg(ticket.admin_response || '');
    setTicketStatus(ticket.status || 'OPEN');
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await supportApi.updateAdminTicket(selectedTicket.id, {
        status: ticketStatus,
        admin_response: responseMsg,
      });
      toast.success('Support ticket updated successfully');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update ticket';
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">Open</span>;
      case 'IN_PROGRESS':
        return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">In Progress</span>;
      case 'RESOLVED':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">Resolved</span>;
      case 'CLOSED':
        return <span className="bg-gray-200 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full">Closed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <AdminHeader title="Customer Support Tickets" subtitle="Manage and resolve user support inquiries" />

      <div className="px-8 space-y-6">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-emerald-600"
          >
            <option value="">All Tickets</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400 italic">No support tickets found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-500">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User / Email</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">#{t.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.email}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs truncate">{t.subject}</td>
                    <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenTicket(t)}
                        className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ticket Details & Response Modal */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Support Ticket #${selectedTicket.id}`}
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>From: {selectedTicket.name} ({selectedTicket.email})</span>
                <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{selectedTicket.subject}</h4>
              <p className="text-xs text-gray-700 whitespace-pre-line bg-white p-3 rounded-xl border border-gray-100">
                {selectedTicket.message}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Ticket Status
              </label>
              <select
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                Admin Response / Notes
              </label>
              <textarea
                rows={4}
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                placeholder="Write your response to the customer..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-xl border text-sm font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm transition-all"
              >
                {updating ? 'Saving...' : 'Save & Update Ticket'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
