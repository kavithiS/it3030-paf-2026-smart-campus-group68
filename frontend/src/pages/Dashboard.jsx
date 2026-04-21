import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookingList from '../components/BookingList';
import BookingForm from '../components/BookingForm';
import { format, parseISO } from 'date-fns';
import { Plus, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('recent');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings/user', {
        headers: { 'X-User-Id': user?.id }
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch user bookings', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshTrigger]);

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking request?')) {
      try {
        await api.put(`/bookings/${bookingId}/cancel`, {}, {
          headers: { 'X-User-Id': user?.id }
        });
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        alert(err.response?.data || 'Failed to cancel booking');
      }
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length,
    rejected: bookings.filter(b => b.status === 'REJECTED').length,
  };

  const recentBookings = bookings.slice(0, 5);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':   return 'bg-amber-100 text-amber-700';
      case 'APPROVED':  return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':  return 'bg-rose-100 text-rose-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-500';
      default:          return 'bg-gray-100 text-gray-500';
    }
  };

  const formatBookingId = (id) => {
    if (!id) return 'BKG-0000';
    return 'BKG-' + id.slice(-4).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your booking requests</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg">
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* Bookings Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {view === 'recent' ? 'Recent Bookings' : 'All Bookings'}
          </h2>
        </div>

        {view === 'recent' ? (
          loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No bookings yet. Click <span className="font-semibold">+ New Booking</span> to get started.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left font-medium">ID</th>
                      <th className="px-5 py-3 text-left font-medium">Resource</th>
                      <th className="px-5 py-3 text-left font-medium">Date</th>
                      <th className="px-5 py-3 text-left font-medium">Time</th>
                      <th className="px-5 py-3 text-left font-medium">Purpose</th>
                      <th className="px-5 py-3 text-left font-medium">Status</th>
                      <th className="px-5 py-3 text-left font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{formatBookingId(booking.id)}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{booking.resource?.name || '—'}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {booking.startTime ? format(parseISO(booking.startTime), 'dd MMM yyyy') : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {booking.startTime
                            ? `${format(parseISO(booking.startTime), 'hh:mm a')} - ${format(parseISO(booking.endTime), 'hh:mm a')}`
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{booking.purpose}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 flex items-center gap-3">
                          <button
                            onClick={() => setView('all')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                          {booking.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              className="text-sm text-rose-500 hover:text-rose-700 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-50 text-center">
                <button
                  onClick={() => setView('all')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Bookings →
                </button>
              </div>
            </>
          )
        ) : (
          <div className="p-6">
            <button
              onClick={() => setView('recent')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-5 flex items-center gap-1"
            >
              ← Back to Recent
            </button>
            <BookingList bookings={bookings} onCancel={handleCancel} isAdmin={false} />
          </div>
        )}
      </div>

      {showForm && (
        <BookingForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}
