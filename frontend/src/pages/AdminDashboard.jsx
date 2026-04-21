import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import bookingService from "../services/bookingService";
import { CalendarCheck2, ShieldAlert, Filter, ListChecks, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import BookingList from "../components/BookingList";

const EMPTY_FILTERS = { status: '', resourceId: '', from: '', to: '' };

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchAllBookings = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = {};
      if (appliedFilters.status) activeFilters.status = appliedFilters.status;
      if (appliedFilters.resourceId) activeFilters.resourceId = appliedFilters.resourceId;
      if (appliedFilters.from) activeFilters.from = appliedFilters.from + 'T00:00:00';
      if (appliedFilters.to) activeFilters.to = appliedFilters.to + 'T23:59:59';
      const res = await bookingService.getAllBookings(activeFilters);
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, refreshTrigger]);

  useEffect(() => {
    fetchAllBookings();
  }, [fetchAllBookings]);

  useEffect(() => {
    api.get('/resources').then((res) => setResources(res.data)).catch(() => {});
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setRefreshTrigger((t) => t + 1);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setRefreshTrigger((t) => t + 1);
  };

  const handleReview = async (bookingId, isApproved) => {
    const reason = prompt(
      `Reason for ${isApproved ? 'approving' : 'rejecting'} this request:`,
      'Reviewed by Admin'
    );
    if (reason !== null) {
      try {
        await bookingService.reviewBooking(
          bookingId,
          { approved: isApproved, reason },
          user?.id
        );
        setRefreshTrigger((t) => t + 1);
      } catch (err) {
        alert(err.response?.data || 'Failed to review booking');
      }
    }
  };

  if (!user) return null;

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: CalendarCheck2, route: "/admin-dashboard" },
    { key: "resources", label: "Manage Resources", icon: SlidersHorizontal, route: "/admin/resources" },
  ];

  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);

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
          <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
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
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                showFilters ? 'bg-white text-indigo-700' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters {hasActiveFilters && <span className="bg-amber-400 text-amber-900 rounded-full w-2 h-2 inline-block" />}
            </button>
          </div>
        </section>

        {showFilters && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Resource</label>
                <select
                  value={filters.resourceId}
                  onChange={(e) => setFilters({ ...filters, resourceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">All Resources</option>
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">From Date</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">To Date</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-slate-900 text-left">
          <div className="flex items-center mb-6 space-x-2 text-gray-700">
            <ListChecks className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-900">Request Queue</h2>
            <span className="bg-indigo-50 text-indigo-700 text-xs py-0.5 px-2.5 rounded-full font-bold ml-2">
              {bookings.length}
            </span>
            {hasActiveFilters && (
              <span className="text-xs text-amber-600 font-medium">(filtered)</span>
            )}
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading requests...</div>
          ) : (
            <BookingList bookings={bookings} isAdmin={true} onReview={handleReview} />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
