import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  createEvent,
  deleteEvent,
  fetchEvents,
  getToken,
  updateEvent,
} from '../api';
import useAuth from '../hooks/useAuth';

const EventsContext = createContext(null);

function EventsProvider({ children }) {
  const { isAuthenticated, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchEvents();
      setEvents(data);
      return data;
    } catch (loadError) {
      setError(loadError.message);
      if (loadError.message.toLowerCase().includes('token')) {
        clearSession();
        logout();
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      queueMicrotask(() => loadEvents());
    } else {
      queueMicrotask(() => {
        setEvents([]);
        setIsLoading(false);
      });
    }
  }, [isAuthenticated, loadEvents]);

  const saveEvent = useCallback(async (eventId, payload) => {
    const saved = eventId ? await updateEvent(eventId, payload) : await createEvent(payload);
    await loadEvents();
    return saved;
  }, [loadEvents]);

  const removeEvent = useCallback(async (eventId) => {
    await deleteEvent(eventId);
    await loadEvents();
  }, [loadEvents]);

  const value = useMemo(() => ({
    error,
    events,
    isLoading,
    loadEvents,
    removeEvent,
    saveEvent,
    setError,
  }), [error, events, isLoading, loadEvents, removeEvent, saveEvent]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export { EventsContext, EventsProvider };
