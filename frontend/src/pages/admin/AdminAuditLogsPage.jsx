import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Search } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Pagination } from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const AdminAuditLogsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (user && !isSuperAdmin) {
      toast.error('You are not authorized to access Audit Logs');
      navigate('/admin', { replace: true });
    }
  }, [user, isSuperAdmin, navigate, toast]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ page: currentPage, action: actionFilter });
      const data = res.data.data;
      setLogs(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter]);

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Audit Logs" subtitle="Security and administrative action trail" />

      <div className="px-8 space-y-6">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Activity className="w-4 h-4 text-emerald-600" /> System Trail
          </div>

          <input
            type="text"
            placeholder="Filter by action code..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-gray-50 text-sm font-medium text-gray-900 rounded-2xl px-4 py-2 border border-gray-200 outline-none"
          />
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Resource</th>
                <th className="p-4">Resource ID</th>
                <th className="p-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-gray-500">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-gray-900">{l.actor_email}</td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold uppercase bg-gray-900 text-white px-2.5 py-0.5 rounded-full">
                      {l.action}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-gray-700">{l.resource}</td>
                  <td className="p-4 font-mono text-gray-500">{l.resource_id}</td>
                  <td className="p-4 font-mono text-[10px] text-gray-500 max-w-xs truncate">
                    {JSON.stringify(l.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};
