import { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, MapPin, Users, CalendarCheck2 } from 'lucide-react';

export default function ResourceList({ onSelectResource }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get('/api/resources');
        setResources(res.data);
      } catch (err) {
        console.error("Error fetching resources, using fallback data", err);
        setResources([
          { id: 1, name: 'Main Auditorium', type: 'Room', capacity: 300, location: 'Block A', isAvailable: true },
          { id: 2, name: 'Computer Lab 3', type: 'Lab', capacity: 40, location: 'Block B', isAvailable: true },
          { id: 3, name: 'Projector Pro-X', type: 'Equipment', capacity: 0, location: 'IT Store', isAvailable: true },
        ]);
      }
      setLoading(false);
    };
    fetchResources();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading resources...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Available Resources</h2>
        <Layers className="w-5 h-5 text-gray-400" />
      </div>
      <div className="p-4 overflow-y-auto flex-1 space-y-4">
        {resources.map(resource => (
          <div key={resource.id} className="group border border-gray-100 p-4 rounded-xl hover:shadow-md transition-all hover:border-indigo-100 bg-white">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{resource.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                {resource.type}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400" /> {resource.location}</div>
              {resource.type !== 'Equipment' && (
                <div className="flex items-center"><Users className="w-4 h-4 mr-1 text-gray-400" /> {resource.capacity}</div>
              )}
            </div>
            <button 
              onClick={() => onSelectResource(resource)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-gray-50 text-gray-700 font-medium hover:bg-indigo-600 hover:text-white transition-colors duration-200"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Book this {resource.type}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
