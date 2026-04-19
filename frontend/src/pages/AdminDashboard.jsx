import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import BookingList from '../components/BookingList';
import { ShieldAlert, Filter, ListChecks } from 'lucide-react';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAllBookings = useCallback(async () => {
    try {
      const res = await axios.get('/api/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch all bookings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings, refreshTrigger]);

  const handleReview = async (bookingId, isApproved) => {
    const reason = prompt(`Reason for ${isApproved ? 'approving' : 'rejecting'} this request:`, `Reviewed by Admin`);
    
    if (reason !== null) {
      try {
        await axios.put(`/api/bookings/${bookingId}/review`, {
          approved: isApproved,
          reason: reason
        });
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        alert(err.response?.data || 'Failed to review booking');
      }
    }
  };

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-gray-900 to-indigo-900 text-white">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <ShieldAlert className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Admin Dashboard</h1>
            <p className="text-indigo-200 text-sm font-medium">Manage all incoming resource booking requests</p>
          </div>
        </div>
        
        <div className="bg-white/10 p-1.5 rounded-xl flex items-center backdrop-blur-sm shadow-inner">
          <Filter className="w-4 h-4 text-indigo-300 ml-2 mr-1" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-white border-0 focus:ring-0 text-sm font-medium pr-8 outline-none cursor-pointer appearance-none px-3"
          >
            <option className="text-gray-900 font-medium" value="ALL">All Requests</option>
            <option className="text-gray-900 font-medium" value="PENDING">Pending</option>
            <option className="text-gray-900 font-medium" value="APPROVED">Approved</option>
            <option className="text-gray-900 font-medium" value="REJECTED">Rejected</option>
            <option className="text-gray-900 font-medium" value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6 space-x-2 text-gray-700">
          <ListChecks className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-gray-900">Request Queue</h2>
          <span className="bg-indigo-50 text-indigo-700 text-xs py-0.5 px-2.5 rounded-full font-bold ml-2">
            {filteredBookings.length}
          </span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading requests...</div>
        ) : (
          <BookingList bookings={filteredBookings} isAdmin={true} onReview={handleReview} />
        )}
      </div>
    </div>
  );
}
