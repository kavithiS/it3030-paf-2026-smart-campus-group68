import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ResourceList from '../components/ResourceList';
import BookingList from '../components/BookingList';
import BookingForm from '../components/BookingForm';
import { CalendarRange, Activity } from 'lucide-react';

export default function Dashboard() {
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get('/api/bookings/user', {
        headers: { 'X-User-Id': 'user1' }
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch user bookings", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshTrigger]);

  const handleCancel = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking request?")) {
      try {
        await axios.put(`/api/bookings/${bookingId}/cancel`, {}, {
          headers: { 'X-User-Id': 'user1' }
        });
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        alert(err.response?.data || 'Failed to cancel booking');
      }
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-4 h-full">
        <ResourceList onSelectResource={setSelectedResource} />
      </div>
      
      <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CalendarRange className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">My Requests</h2>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <Activity className="w-4 h-4 mr-2 text-emerald-500" /> 
            {bookings.length} Total
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {loading ? (
            <div className="flex justify-center items-center h-full text-gray-400">Loading requests...</div>
          ) : (
            <BookingList bookings={bookings} onCancel={handleCancel} isAdmin={false} />
          )}
        </div>
      </div>

      {selectedResource && (
        <BookingForm 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)}
          onSuccess={() => {
            setSelectedResource(null);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}
