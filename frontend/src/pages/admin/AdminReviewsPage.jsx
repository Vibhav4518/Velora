import React, { useEffect, useState } from 'react';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import { AdminHeader } from '../../components/AdminHeader';
import { Rating } from '../../components/Rating';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const toast = useToast();

  const fetchReviews = async () => {
    try {
      const res = await api.get('/products/');
      // Fetch reviews for products
      const products = res.data.data?.results || [];
      let allRevs = [];
      for (const p of products) {
        try {
          const revRes = await reviewApi.getProductReviews(p.slug);
          allRevs = [...allRevs, ...(revRes.data.data || [])];
        } catch {}
      }
      setReviews(allRevs);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (review) => {
    try {
      await reviewApi.moderateReview(review.id, { is_approved: !review.is_approved });
      toast.success(review.is_approved ? 'Review hidden' : 'Review approved');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to moderate review');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await reviewApi.deleteReview(deletingId);
      toast.success('Review deleted');
      setDeletingId(null);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AdminHeader title="Review Moderation" subtitle="Approve, reject, and moderate product customer reviews" />

      <div className="px-8 space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Title & Content</th>
                <th className="p-4">Verified</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900">{r.user_name}</td>
                  <td className="p-4"><Rating rating={r.rating} /></td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-gray-900">{r.title}</p>
                    <p className="text-gray-500 line-clamp-2">{r.content}</p>
                  </td>
                  <td className="p-4">
                    {r.is_verified_purchase ? (
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Yes</span>
                    ) : (
                      <span className="text-[10px] text-gray-400">No</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${r.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {r.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleApprove(r)}
                      className={`p-2 rounded-xl text-xs font-bold ${r.is_approved ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {r.is_approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeletingId(r.id)} className="p-2 text-gray-600 hover:text-rose-600 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Delete Review?"
        message="Are you sure you want to permanently delete this customer review?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
