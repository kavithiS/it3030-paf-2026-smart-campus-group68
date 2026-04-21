import { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

export function useUserBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    bookingService
      .getUserBookings(user.id)
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [user?.id, tick]);

  return { bookings, loading, error, refresh };
}

export function useAllBookings(filters = {}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bookingService
      .getAllBookings(filters)
      .then((res) => setBookings(res.data))
      .catch((err) => setError(err.response?.data || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [tick, filters.status, filters.resourceId, filters.from, filters.to]);

  return { bookings, loading, error, refresh };
}
