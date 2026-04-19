import { format, parseISO } from 'date-fns';
import { CalendarClock, XCircle, CheckCircle2, Clock, CalendarIcon } from 'lucide-react';

export default function BookingList({ bookings, onCancel, isAdmin, onReview }) {
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-3.5 h-3.5 mr-1" />;
      case 'APPROVED': return <CheckCircle2 className="w-3.5 h-3.5 mr-1" />;
      case 'REJECTED': return <XCircle className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center h-full shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <CalendarClock className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">No Bookings Found</h3>
        <p className="text-gray-500">You haven't made any booking requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => (
        <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{booking.resource?.name || `Resource #${booking.resourceId}`}</h3>
              <p className="text-sm text-gray-500 font-medium">Purpose: {booking.purpose}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              {booking.status}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 my-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-medium">Date:</span>
              <span className="ml-2">{format(parseISO(booking.startTime), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-indigo-500" />
              <span className="font-medium">Time:</span>
              <span className="ml-2">
                {format(parseISO(booking.startTime), 'HH:mm')} - {format(parseISO(booking.endTime), 'HH:mm')}
              </span>
            </div>
          </div>

          {(booking.status === 'REJECTED' || booking.status === 'APPROVED') && booking.adminReason && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${booking.status === 'REJECTED' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
              <span className="font-bold">Admin note:</span> {booking.adminReason}
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-gray-400">Req ID: #{booking.id}</div>
            
            {!isAdmin && booking.status === 'PENDING' && (
              <button 
                onClick={() => onCancel(booking.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
              >
                Cancel Request
              </button>
            )}

            {isAdmin && booking.status === 'PENDING' && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => onReview(booking.id, false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100"
                >
                  Reject
                </button>
                <button 
                  onClick={() => onReview(booking.id, true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
