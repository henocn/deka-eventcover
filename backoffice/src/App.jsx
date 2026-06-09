import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearSession,
  createAccessRole,
  createAlbum,
  createEvent,
  deleteAccessRole,
  deleteAlbum,
  deleteEvent,
  fetchAccessRoleQrCode,
  fetchAccessRoles,
  fetchAlbum,
  fetchEvents,
  fetchStats,
  getStoredUser,
  getToken,
  login,
  updateAlbum,
  updateEvent,
  uploadAlbumMedia,
} from './api';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import EventDrawer from './components/events/EventDrawer';
import AlbumDetailsPage from './pages/AlbumDetailsPage';
import AlbumsPage from './pages/AlbumsPage';
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

function routeFromPath(pathname = window.location.pathname) {
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === 'event' && parts[1]) return { view: 'details', slug: parts[1] };
  if (parts[0] === 'albums' && parts[1]) return { view: 'albumDetails', slug: parts[1] };
  if (parts[0] === 'albums') return { view: 'albums' };
  return { view: 'events' };
}

function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [route, setRoute] = useState(() => routeFromPath());
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [accessRoles, setAccessRoles] = useState([]);
  const [accessRoleForm, setAccessRoleForm] = useState({ name: '' });
  const [albumEventId, setAlbumEventId] = useState(null);
  const [albumAccessRoles, setAlbumAccessRoles] = useState([]);
const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [selectedAlbumDetails, setSelectedAlbumDetails] = useState(null);
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', accessRoleIds: [], isPublished: true });
  const [stats, setStats] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isAlbumRolesLoading, setIsAlbumRolesLoading] = useState(false);
  const [isAlbumDetailsLoading, setIsAlbumDetailsLoading] = useState(false);
  const [isSavingAlbum, setIsSavingAlbum] = useState(false);
  const [isUploadingAlbumMedia, setIsUploadingAlbumMedia] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
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

  const selectedAlbumEvent = useMemo(
    () => events.find((event) => event.id === albumEventId) || null,
    [albumEventId, events],
  );

  const routeAlbum = useMemo(() => {
    if (!route.slug) return null;
    return events.flatMap((event) => event.albums || []).find((album) => album.slug === route.slug) || null;
  }, [events, route.slug]);

  const view = route.view;

  function navigateTo(path) {
    window.history.pushState({}, '', path);
    setRoute(routeFromPath(path));
  }

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
      setAlbumEventId((current) => current || data[0]?.id || null);
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

  useEffect(() => {
    const onPopState = () => {
      setRoute(routeFromPath());
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (view !== 'details' || !route.slug || events.length === 0) return;
    const event = events.find((item) => item.slug === route.slug);

    if (event && selectedEventId !== event.id) {
      openDetails(event, { push: false });
    }
    // URL state is synchronized with loaded event data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, route.slug, selectedEventId, view]);

  useEffect(() => {
    if (view !== 'albumDetails' || !routeAlbum) return;

    queueMicrotask(() => {
      setAlbumEventId(routeAlbum.eventId);
      loadAlbumAccessRoles(routeAlbum.eventId);
      openAlbumDetails(routeAlbum, { push: false });
    });
    // URL state is synchronized with loaded album data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeAlbum, view]);

  useEffect(() => {
    if (view !== 'albums' || !albumEventId) return;

    queueMicrotask(() => {
      loadAlbumAccessRoles(albumEventId);
    });
  }, [albumEventId, view]);

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
    navigateTo('/events');
  }

  async function navigate(viewName) {
    setError('');
    setNotice('');

    if (viewName === 'albums') {
      const nextEventId = albumEventId || selectedEventId || events[0]?.id || null;
      setAlbumEventId(nextEventId);
      navigateTo('/albums');

      if (nextEventId) {
        await loadAlbumAccessRoles(nextEventId);
      }
      return;
    }

    navigateTo('/events');
  }

  function openCreateDrawer() {
    selectedEventIdRef.current = null;
    setSelectedEventId(null);
    setEventForm(emptyEventForm);
    setAccessRoles([]);
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
        navigateTo('/events');
      }
      await loadEvents();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function openDetails(event, options = { push: true }) {
    selectedEventIdRef.current = event.id;
    setSelectedEventId(event.id);
    if (options.push) {
      navigateTo(`/event/${event.slug}`);
    }
    setStats(null);
    setAccessRoles([]);
    setAccessRoleForm({ name: '' });
    setError('');
    setIsDetailsLoading(true);

    try {
      const [statsResult, rolesResult] = await Promise.allSettled([
        fetchStats(event.id),
        fetchAccessRoles(event.id),
      ]);

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      }

      if (rolesResult.status === 'fulfilled') {
        const rolesWithQr = await Promise.all(
          rolesResult.value.map(async (role) => {
            try {
              return await fetchAccessRoleQrCode(event.id, role.id);
            } catch {
              return role;
            }
          }),
        );
        setAccessRoles(rolesWithQr);
      }

      const failed = [statsResult, rolesResult].find((result) => result.status === 'rejected');
      if (failed) {
        setError(failed.reason.message);
      }
    } finally {
      setIsDetailsLoading(false);
    }
  }

  function updateAccessRoleForm(field, value) {
    setAccessRoleForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveAccessRole(event) {
    event.preventDefault();
    if (!selectedEvent) return;

    setIsCreatingRole(true);
    setError('');

    try {
      const created = await createAccessRole(selectedEvent.id, accessRoleForm);
      const createdWithQr = await fetchAccessRoleQrCode(selectedEvent.id, created.id);
      setAccessRoles((current) => [createdWithQr, ...current]);
      setAccessRoleForm({ name: '' });
      setNotice('Badge cree');
    } catch (roleError) {
      setError(roleError.message);
    } finally {
      setIsCreatingRole(false);
    }
  }

  async function removeAccessRole(role) {
    if (!window.confirm(`Supprimer le badge "${role.name}" ?`)) return;

    try {
      await deleteAccessRole(role.id);
      setAccessRoles((current) => current.filter((item) => item.id !== role.id));
      setNotice('Badge supprime');
    } catch (roleError) {
      setError(roleError.message);
    }
  }

  async function copyPublicUrl(role) {
    const publicUrl = role?.publicUrl;
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setNotice('Lien public copie');
  }

  async function loadAlbumAccessRoles(eventId) {
    if (!eventId) {
      setAlbumAccessRoles([]);
      return;
    }

    setIsAlbumRolesLoading(true);
    setError('');

    try {
      const roles = await fetchAccessRoles(eventId);
      setAlbumAccessRoles(roles);
    } catch (rolesError) {
      setAlbumAccessRoles([]);
      setError(rolesError.message);
    } finally {
      setIsAlbumRolesLoading(false);
    }
  }

  async function selectAlbumEvent(eventId) {
    setAlbumEventId(eventId);
    setEditingAlbumId(null);
    setSelectedAlbumDetails(null);
    setAlbumForm({ title: '', description: '', accessRoleIds: [], isPublished: true });
    await loadAlbumAccessRoles(eventId);
  }

  function updateAlbumForm(field, value) {
    setAlbumForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function toggleAlbumRole(roleId) {
    setAlbumForm((current) => {
      const hasRole = current.accessRoleIds.includes(roleId);
      const nextRoleIds = hasRole
        ? current.accessRoleIds.filter((id) => id !== roleId)
        : [...current.accessRoleIds, roleId];

      return {
        ...current,
        accessRoleIds: nextRoleIds,
      };
    });
  }

  function editAlbum(album) {
    const accessRoleIds = albumAccessRoles
      .filter((role) => (role.albums || []).some((item) => item.id === album.id))
      .map((role) => role.id);

    setEditingAlbumId(album.id);
    setAlbumForm({
      title: album.title || '',
      description: album.description || '',
      accessRoleIds,
      isPublished: Boolean(album.isPublished),
    });
  }

  async function openAlbumDetails(album, options = { push: true }) {
    setIsAlbumDetailsLoading(true);
    setError('');
    if (options.push) {
      navigateTo(`/albums/${album.slug}`);
    }

    try {
      const details = await fetchAlbum(album.id);
      setSelectedAlbumDetails(details);
    } catch (albumError) {
      setSelectedAlbumDetails(null);
      setError(albumError.message);
    } finally {
      setIsAlbumDetailsLoading(false);
    }
  }

  async function saveAlbum(event) {
    event.preventDefault();
    if (!albumEventId) return;

    setIsSavingAlbum(true);
    setError('');
    setNotice('');

    try {
      if (editingAlbumId) {
        await updateAlbum(editingAlbumId, albumForm);
      } else {
        await createAlbum(albumEventId, albumForm);
      }

      setEditingAlbumId(null);
      setAlbumForm({ title: '', description: '', accessRoleIds: [], isPublished: true });
      setNotice(editingAlbumId ? 'Album mis a jour' : 'Album cree');
      await loadEvents();
      await loadAlbumAccessRoles(albumEventId);
      if (selectedAlbumDetails?.id) {
        await openAlbumDetails({ id: selectedAlbumDetails.id });
      }
    } catch (albumError) {
      setError(albumError.message);
    } finally {
      setIsSavingAlbum(false);
    }
  }

  async function removeAlbum(album) {
    if (!window.confirm(`Supprimer l'album "${album.title}" ?`)) return;

    try {
      await deleteAlbum(album.id);
      if (editingAlbumId === album.id) {
        setEditingAlbumId(null);
        setAlbumForm({ title: '', description: '', accessRoleIds: [], isPublished: true });
      }
      if (selectedAlbumDetails?.id === album.id) {
        setSelectedAlbumDetails(null);
      }
      setNotice('Album supprime');
      await loadEvents();
      await loadAlbumAccessRoles(albumEventId);
    } catch (albumError) {
      setError(albumError.message);
    }
  }

  async function uploadMediaToAlbum(files) {
    if (!selectedAlbumDetails?.id || !files?.length) return;

    setIsUploadingAlbumMedia(true);
    setError('');
    setNotice('');

    try {
      await uploadAlbumMedia(selectedAlbumDetails.id, files);
      setNotice('Images ajoutees');
      await openAlbumDetails({ id: selectedAlbumDetails.id });
      await loadEvents();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploadingAlbumMedia(false);
    }
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
      <Sidebar activeView={view} onNavigate={navigate} onLogout={handleLogout} />
      <section className="admin-content">
        <Topbar user={user} />
        {view === 'details' ? (
          <EventDetailsPage
            event={selectedEvent}
            stats={stats}
            accessRoles={accessRoles}
            roleForm={accessRoleForm}
            isLoading={isDetailsLoading}
            isCreatingRole={isCreatingRole}
            onBack={() => navigateTo('/events')}
            onEdit={() => selectedEvent && openEditDrawer(selectedEvent)}
            onCopyUrl={copyPublicUrl}
            onRoleFormChange={updateAccessRoleForm}
            onCreateRole={saveAccessRole}
            onDeleteRole={removeAccessRole}
          />
        ) : view === 'albumDetails' ? (
          <AlbumDetailsPage
            album={selectedAlbumDetails}
            notice={notice}
            error={error}
            isLoading={isAlbumDetailsLoading}
            isUploading={isUploadingAlbumMedia}
            onBack={() => navigateTo('/albums')}
            onUploadMedia={uploadMediaToAlbum}
          />
        ) : view === 'albums' ? (
          <AlbumsPage
            events={events}
            selectedEventId={albumEventId}
            selectedEvent={selectedAlbumEvent}
            accessRoles={albumAccessRoles}
            form={albumForm}
            editingAlbumId={editingAlbumId}
            notice={notice}
            error={error}
            isLoadingRoles={isAlbumRolesLoading}
            isSaving={isSavingAlbum}
            onSelectEvent={selectAlbumEvent}
            onFormChange={updateAlbumForm}
            onToggleRole={toggleAlbumRole}
            onOpenAlbum={openAlbumDetails}
            onEditAlbum={editAlbum}
            onDeleteAlbum={removeAlbum}
            onSubmit={saveAlbum}
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
