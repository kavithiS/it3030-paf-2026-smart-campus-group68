import { Link, useLocation } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl tracking-tight">
              <CalendarDays className="w-6 h-6" />
              <span>SmartCampus</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${!isAdmin ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                My Bookings
              </Link>
              <Link 
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isAdmin ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                Admin Review
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-3 bg-gray-50 py-1.5 px-3 rounded-full border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {isAdmin ? 'A' : 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700">{isAdmin ? 'Admin' : 'Student (user1)'}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
