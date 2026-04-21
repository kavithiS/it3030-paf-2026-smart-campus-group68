import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarClock, Search, Users, Clock } from 'lucide-react';

export default function BookingList({ bookings, onCancel, isAdmin, onReview }) {
  const [view, setView] = useState('list');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [search, setSearch] = useState('');

  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === 'All Status' || b.status === statusFilter;
    const matchSearch =
      !search ||
      b.resource?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.purpose?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING':   return 'bg-amber-100 text-amber-700';
      case 'APPROVED':  return 'bg-emerald-100 text-emerald-700';
      case 'REJECTED':  return 'bg-rose-100 text-rose-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-500';
      default:          return 'bg-gray-100 text-gray-500';
    }
  };

  const getDateBadgeColor = (status) => {
    switch (status) {
      case 'APPROVED':  return 'bg-emerald-500';
      case 'PENDING':   return 'bg-amber-500';
      case 'REJECTED':  return 'bg-rose-500';
      default:          return 'bg-gray-400';
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <CalendarClock className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No Bookings Found</h3>
        <p className="text-gray-500 text-sm">You haven't made any booking requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Calendar View
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List View */}
      {view === 'list' ? (
        <div className="space-y-3">
          {filteredBookings.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">No bookings match your filter.</div>
          ) : (
            filteredBookings.map(booking => {
              const date = booking.startTime ? parseISO(booking.startTime) : null;
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
                >
                  {/* Date Badge */}
                  {date && (
                    <div className={`flex-shrink-0 w-14 text-center text-white rounded-xl py-2 ${getDateBadgeColor(booking.status)}`}>
                      <p className="text-xs font-semibold uppercase">{format(date, 'MMM')}</p>
                      <p className="text-xl font-bold leading-tight">{format(date, 'd')}</p>
                      <p className="text-xs">{format(date, 'EEE')}</p>
                    </div>
                  )}

                  {/* Booking Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {booking.resource?.name || 'Unknown Resource'}
                      </h3>
                      <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {date && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {format(date, 'hh:mm a')}
                          {booking.endTime && ` - ${format(parseISO(booking.endTime), 'hh:mm a')}`}
                        </span>
                      )}
                      {booking.purpose && (
                        <span className="truncate">{booking.purpose}</span>
                      )}
                      {booking.expectedAttendees > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {booking.expectedAttendees}
                        </span>
                      )}
                    </div>
                    {isAdmin && booking.userId && (
                      <p className="text-xs text-gray-400 mt-1">Requested by: {booking.userId}</p>
                    )}
                    {booking.adminReason && (
                      <p className="text-xs text-gray-500 mt-1 italic">Note: {booking.adminReason}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex gap-2">
                    {!isAdmin && booking.status === 'PENDING' && (
                      <button
                        onClick={() => onCancel(booking.id)}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {isAdmin && booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onReview(booking.id, false)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onReview(booking.id, true)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Calendar View Placeholder */
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <CalendarClock className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="font-medium text-gray-400">Calendar view coming soon</p>
        </div>
      )}
    </div>
  );
}
