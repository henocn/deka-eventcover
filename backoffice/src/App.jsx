import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearSession,
  createEvent,
  deleteEvent,
  fetchEvents,
  fetchQrCode,
  fetchStats,
  getStoredUser,
  getToken,
  login,
  updateEvent,
} from './api';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import EventDrawer from './components/events/EventDrawer';
import EventDetailsPage from './pages/EventDetailsPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import {
  buildEventPayload,
  emptyEventForm,
  formFromEvent,
  getEventStatus,
} from './utils/eventUtils';
import './App.css';

function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [view, setView] = useState('events');
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [qrCode, setQrCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(getToken()));
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [drawerNotice, setDrawerNotice] = useState('');
  const [drawerError, setDrawerError] = useState('');
  const selectedEventIdRef = useRef(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      const status = getEventStatus(event);
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'published' && status === 'published') ||
        (activeFilter === 'draft' && status === 'draft') ||
        (activeFilter === 'protected' && status === 'protected');
      const matchesQuery =
        !normalizedQuery ||
        [event.title, event.location, event.slug]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery));

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, events, query]);

  const summary = useMemo(
    () => ({
      total: events.length,
      published: events.filter((event) => event.isPublished).length,
      draft: events.filter((event) => !event.isPublished).length,
      protected: events.filter((event) => event.accessCode).length,
    }),
    [events],
  );

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (loadError) {
      setError(loadError.message);
      if (loadError.message.toLowerCase().includes('token')) {
        clearSession();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Synchronizes the dashboard with the authenticated API session.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadEvents();
    }
  }, [loadEvents, user]);

  function updateEventForm(field, value) {
    setEventForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const data = await login(loginForm.email, loginForm.password);
      setUser(data.user);
      setNotice('Session ouverte');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    clearSession();
    selectedEventIdRef.current = null;
    setUser(null);
    setEvents([]);
    setSelectedEventId(null);
    setDrawerOpen(false);
    setView('events');
  }

  function openCreateDrawer() {
    selectedEventIdRef.current = null;
    setSelectedEventId(null);
    setEventForm(emptyEventForm);
    setQrCode(null);
    setStats(null);
    setDrawerNotice('');
    setDrawerError('');
    setDrawerOpen(true);
  }

  function openEditDrawer(event) {
    selectedEventIdRef.current = event.id;
    setSelectedEventId(event.id);
    setEventForm(formFromEvent(event));
    setDrawerNotice('');
    setDrawerError('');
    setDrawerOpen(true);
  }

  async function saveEvent(event) {
    event.preventDefault();
    setIsSaving(true);
    setDrawerError('');
    setDrawerNotice('Enregistrement en cours...');

    try {
      const payload = buildEventPayload(eventForm);
      const saved = selectedEvent
        ? await updateEvent(selectedEvent.id, payload)
        : await createEvent(payload);

      selectedEventIdRef.current = saved.id;
      setSelectedEventId(saved.id);
      setEventForm(formFromEvent(saved));
      setDrawerNotice(selectedEvent ? 'Evenement mis a jour.' : 'Evenement cree.');
      await loadEvents();
    } catch (saveError) {
      setDrawerNotice('');
      setDrawerError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function removeEvent(event) {
    if (!window.confirm(`Supprimer "${event.title}" ?`)) return;

    try {
      await deleteEvent(event.id);
      setNotice('Evenement supprime');
      if (selectedEventId === event.id) {
        setSelectedEventId(null);
        setView('events');
      }
      await loadEvents();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function openDetails(event) {
    selectedEventIdRef.current = event.id;
    setSelectedEventId(event.id);
    setView('details');
    setStats(null);
    setQrCode(null);

    try {
      const data = await fetchStats(event.id);
      setStats(data);
    } catch {
      setStats(null);
    }
  }

  async function loadQrCode(event = selectedEvent) {
    if (!event) return;

    try {
      selectedEventIdRef.current = event.id;
      setSelectedEventId(event.id);
      const data = await fetchQrCode(event.id);
      setQrCode(data);
      setView('details');
      setNotice('QR code genere');
    } catch (qrError) {
      setError(qrError.message);
    }
  }

  async function loadStats(event = selectedEvent) {
    if (!event) return;

    try {
      const data = await fetchStats(event.id);
      setStats(data);
    } catch (statsError) {
      setError(statsError.message);
    }
  }

  async function copyPublicUrl() {
    if (!qrCode?.publicUrl) return;
    await navigator.clipboard.writeText(qrCode.publicUrl);
    setNotice('Lien public copie');
  }

  if (!user) {
    return (
      <LoginPage
        form={loginForm}
        error={error}
        isLoading={isLoggingIn}
        onChange={(field, value) =>
          setLoginForm((current) => ({
            ...current,
            [field]: value,
          }))
        }
        onSubmit={handleLoginSubmit}
      />
    );
  }

  return (
    <main className="admin-page compact-admin">
      <Sidebar onLogout={handleLogout} />
      <section className="admin-content">
        <Topbar user={user} />
        {view === 'details' ? (
          <EventDetailsPage
            event={selectedEvent}
            stats={stats}
            qrCode={qrCode}
            onBack={() => setView('events')}
            onEdit={() => selectedEvent && openEditDrawer(selectedEvent)}
            onLoadStats={() => loadStats()}
            onLoadQr={() => loadQrCode()}
            onCopyUrl={copyPublicUrl}
          />
        ) : (
          <EventsPage
            events={filteredEvents}
            summary={summary}
            query={query}
            filter={activeFilter}
            selectedEventId={selectedEventId}
            isLoading={isLoading}
            notice={notice}
            error={error}
            onQueryChange={setQuery}
            onFilterChange={setActiveFilter}
            onCreate={openCreateDrawer}
            onOpenDetails={openDetails}
            onEdit={openEditDrawer}
            onDelete={removeEvent}
            onQr={loadQrCode}
          />
        )}
      </section>
      <EventDrawer
        open={drawerOpen}
        selectedEvent={selectedEvent}
        form={eventForm}
        isSaving={isSaving}
        notice={drawerNotice}
        error={drawerError}
        onClose={() => setDrawerOpen(false)}
        onSubmit={saveEvent}
        onChange={updateEventForm}
      />
    </main>
  );
}

export default App;
