import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { CalendarCheck2, ShieldAlert, Filter, ListChecks } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import BookingList from "../components/BookingList";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
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

  if (!user) return null;

  const sidebarItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: CalendarCheck2,
      route: "/admin-dashboard",
    },
  ];

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout
      user={user}
      logout={logout}
      title="Admin Dashboard"
      items={sidebarItems}
      displayRole="ADMIN"
      accentClassName="bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]"
      accentButtonClassName="bg-gradient-to-r from-[#1E2A50] to-[#3B4A89]"
      accentTextClassName="text-blue-100/90"
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-[#1E2A50] to-[#3B4A89] px-6 py-7 text-white shadow-lg shadow-blue-950/20">
          <div className="flex justify-between items-center sm:flex-row flex-col">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/90 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2" /> ADMIN ACCESS
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Welcome Admin, {user.name}
              </h2>
              <p className="mt-2 text-sm text-blue-50/95">
                Manage all incoming resource booking requests below.
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 bg-white/10 p-1.5 rounded-xl flex items-center backdrop-blur-sm shadow-inner">
              <Filter className="w-4 h-4 text-indigo-300 ml-2 mr-1" />
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-white border-0 focus:ring-0 text-sm font-medium pr-8 outline-none cursor-pointer appearance-none px-3"
              >
                <option className="text-gray-900" value="ALL">All Requests</option>
                <option className="text-gray-900" value="PENDING">Pending</option>
                <option className="text-gray-900" value="APPROVED">Approved</option>
                <option className="text-gray-900" value="REJECTED">Rejected</option>
                <option className="text-gray-900" value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-slate-900 text-left">
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
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
