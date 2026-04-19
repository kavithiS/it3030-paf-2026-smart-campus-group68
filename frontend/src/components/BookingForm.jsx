import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Calendar as CalendarIcon, Clock, Users, FileText } from 'lucide-react';

export default function BookingForm({ resource, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const combineDateTime = (date, time) => {
    return `${date}T${time}:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        resourceId: resource.id,
        userId: user?.id,
        startTime: combineDateTime(formData.date, formData.startTime),
        endTime: combineDateTime(formData.date, formData.endTime),
        purpose: formData.purpose,
        expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : 0
      };

      await api.post('/bookings', payload, {
        headers: { 'X-User-Id': user?.id }
      });
      
      onSuccess();
    } catch (err) {
      setError(err.response?.data || 'Failed to request booking. check times and conflicts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900 mt-1">Book {resource.name}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm flex items-start">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400" /> Date
              </label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> Start Time
                </label>
                <input 
                  type="time" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                  <Clock className="w-4 h-4 mr-1.5 text-gray-400" /> End Time
                </label>
                <input 
                  type="time" 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                <FileText className="w-4 h-4 mr-1.5 text-gray-400" /> Purpose
              </label>
              <input 
                type="text" 
                required
                placeholder="E.g., Group study, Project presentation"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              />
            </div>

            {resource.type !== 'Equipment' && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
                  <Users className="w-4 h-4 mr-1.5 text-gray-400" /> Expected Attendees
                </label>
                <input 
                  type="number" 
                  min="1"
                  max={resource.capacity}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors outline-none"
                  value={formData.expectedAttendees}
                  onChange={e => setFormData({...formData, expectedAttendees: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
