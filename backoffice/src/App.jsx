import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileImage,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  MapPin,
  Plus,
  QrCode,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import {
  clearSession,
  createEvent,
  fetchEvents,
  fetchQrCode,
  fetchStats,
  getStoredUser,
  getToken,
  login,
  updateEvent,
} from './api';
import './App.css';

const emptyForm = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: '',
  accessCode: '',
  isPublished: true,
};

function formatDate(value) {
  if (!value) return 'Non planifie';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
  return value ? new Date(value).toISOString() : null;
}

function formFromEvent(event) {
  if (!event) return emptyForm;

  return {
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    startsAt: toDatetimeLocal(event.startsAt),
    endsAt: toDatetimeLocal(event.endsAt),
    accessCode: event.accessCode || '',
    isPublished: Boolean(event.isPublished),
  };
}

function initials(name) {
  return (name || 'AD')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventForm, setEventForm] = useState(emptyForm);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [query, setQuery] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(getToken()));
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const selectedEventIdRef = useRef(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || events[0] || null,
    [events, selectedEventId],
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return events;

    return events.filter((event) =>
      [event.title, event.location, event.slug]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [events, query]);

  const summary = useMemo(
    () => ({
      total: events.length,
      published: events.filter((event) => event.isPublished).length,
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
      const nextSelectedId = selectedEventIdRef.current || data[0]?.id || null;
      const nextSelectedEvent = data.find((event) => event.id === nextSelectedId);
      selectedEventIdRef.current = nextSelectedId;
      setSelectedEventId(nextSelectedId);
      setEventForm(formFromEvent(nextSelectedEvent));
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

  async function handleLogin(event) {
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
    setUser(null);
    setEvents([]);
    selectedEventIdRef.current = null;
    setSelectedEventId(null);
  }

  function updateForm(field, value) {
    setEventForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function buildEventPayload() {
    return {
      title: eventForm.title,
      description: eventForm.description || null,
      location: eventForm.location || null,
      startsAt: fromDatetimeLocal(eventForm.startsAt),
      endsAt: fromDatetimeLocal(eventForm.endsAt),
      accessCode: eventForm.accessCode || null,
      isPublished: eventForm.isPublished,
    };
  }

  async function handleSaveEvent(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = buildEventPayload();
      const saved = selectedEvent
        ? await updateEvent(selectedEvent.id, payload)
        : await createEvent(payload);

      await loadEvents();
      selectedEventIdRef.current = saved.id;
      setSelectedEventId(saved.id);
      setEventForm(formFromEvent(saved));
      setNotice(selectedEvent ? 'Evenement mis a jour' : 'Evenement cree');
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  function startNewEvent() {
    selectedEventIdRef.current = null;
    setSelectedEventId(null);
    setEventForm(emptyForm);
    setQrCode(null);
    setStats(null);
  }

  function selectEvent(event) {
    selectedEventIdRef.current = event.id;
    setSelectedEventId(event.id);
    setEventForm(formFromEvent(event));
    setQrCode(null);
    setStats(null);
  }

  async function loadQrCode() {
    if (!selectedEvent) return;

    try {
      const data = await fetchQrCode(selectedEvent.id);
      setQrCode(data);
      setNotice('QR code genere');
    } catch (qrError) {
      setError(qrError.message);
    }
  }

  async function loadStats() {
    if (!selectedEvent) return;

    try {
      const data = await fetchStats(selectedEvent.id);
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
      <main className="admin-login-shell">
        <section className="login-panel">
          <h1 className='text-center'>Deka EventCover</h1>
          <p className="login-copy text-center pb-5 text-sm">
            Console de gestion des evenements.
          </p>
          {error ? <p className="form-error text-red-500 text-sm text-center">{error}</p> : null}
          <form className="login-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                className='mb-2'
                value={loginForm.email}
                onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="test-admin@gmail.com"
                required
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                className='mb-2'
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, password: event.target.value }))
                }
                placeholder="Mot de passe"
                required
              />
            </label>
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? <Loader2 className="spin" size={18} /> : <LockKeyhole size={18} />}
              Se connecter
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">
            <Shield size={20} />
          </div>
          <div>
            <strong>Deka</strong>
            <span>EventCover</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          <button type="button" className="nav-item active">
            <LayoutDashboard size={18} />
            Evenements
          </button>
          <button type="button" className="nav-item" disabled>
            <FileImage size={18} />
            Medias
          </button>
          <button type="button" className="nav-item" disabled>
            <BarChart3 size={18} />
            Statistiques
          </button>
        </nav>

        <button type="button" className="logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          Quitter
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Console operationnelle</p>
            <h1>Gestion des evenements</h1>
          </div>
          <div className="user-chip">
            <span>{initials(user.fullName)}</span>
            <div>
              <strong>{user.fullName}</strong>
              <small>{user.role}</small>
            </div>
          </div>
        </header>

        {notice ? (
          <div className="notice success" onAnimationEnd={() => setNotice('')}>
            <CheckCircle2 size={18} />
            {notice}
          </div>
        ) : null}
        {error ? (
          <div className="notice error">
            <Sparkles size={18} />
            {error}
          </div>
        ) : null}

        <section className="summary-grid">
          <div className="metric">
            <span>Total</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="metric">
            <span>Publies</span>
            <strong>{summary.published}</strong>
          </div>
          <div className="metric">
            <span>Proteges</span>
            <strong>{summary.protected}</strong>
          </div>
        </section>

        <section className="admin-layout">
          <div className="events-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Evenements</p>
                <h2>Liste</h2>
              </div>
              <button type="button" className="icon-button primary" onClick={startNewEvent} title="Nouvel evenement">
                <Plus size={20} />
              </button>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher"
              />
            </div>
            <div className="event-list">
              {isLoading ? (
                <div className="loading-row">
                  <Loader2 className="spin" size={20} />
                  Chargement
                </div>
              ) : null}
              {!isLoading && filteredEvents.length === 0 ? (
                <div className="empty-row">Aucun evenement pour le moment.</div>
              ) : null}
              {filteredEvents.map((event) => (
                <button
                  type="button"
                  key={event.id}
                  className={`event-row ${event.id === selectedEvent?.id ? 'active' : ''}`}
                  onClick={() => selectEvent(event)}
                >
                  <span className={`status-dot ${event.isPublished ? 'published' : ''}`} />
                  <span>
                    <strong>{event.title}</strong>
                    <small>
                      {formatDate(event.startsAt)}
                      {event.location ? ` · ${event.location}` : ''}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form className="editor-panel" onSubmit={handleSaveEvent}>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{selectedEvent ? 'Edition' : 'Creation'}</p>
                <h2>{selectedEvent ? selectedEvent.title : 'Nouvel evenement'}</h2>
              </div>
              <button type="submit" className="save-button" disabled={isSaving}>
                {isSaving ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
                Enregistrer
              </button>
            </div>

            <div className="form-grid">
              <label className="field wide">
                Titre
                <input
                  value={eventForm.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  placeholder="Conference institutionnelle"
                  required
                />
              </label>
              <label className="field wide">
                Description
                <textarea
                  value={eventForm.description}
                  onChange={(event) => updateForm('description', event.target.value)}
                  placeholder="Contexte, objectif et informations utiles pour les participants."
                />
              </label>
              <label className="field">
                Lieu
                <span className="field-icon">
                  <MapPin size={16} />
                </span>
                <input
                  value={eventForm.location}
                  onChange={(event) => updateForm('location', event.target.value)}
                  placeholder="Auditorium principal"
                />
              </label>
              <label className="field">
                Debut
                <span className="field-icon">
                  <CalendarDays size={16} />
                </span>
                <input
                  type="datetime-local"
                  value={eventForm.startsAt}
                  onChange={(event) => updateForm('startsAt', event.target.value)}
                />
              </label>
              <label className="field">
                Fin
                <span className="field-icon">
                  <CalendarDays size={16} />
                </span>
                <input
                  type="datetime-local"
                  value={eventForm.endsAt}
                  onChange={(event) => updateForm('endsAt', event.target.value)}
                />
              </label>
              <label className="field">
                Code d'acces
                <span className="field-icon">
                  <LockKeyhole size={16} />
                </span>
                <input
                  value={eventForm.accessCode}
                  onChange={(event) => updateForm('accessCode', event.target.value)}
                  placeholder="Optionnel"
                />
              </label>
              <label className="toggle-field">
                <input
                  type="checkbox"
                  checked={eventForm.isPublished}
                  onChange={(event) => updateForm('isPublished', event.target.checked)}
                />
                <span />
                Publier l'evenement
              </label>
            </div>

            <div className="tools-row">
              <button type="button" onClick={loadQrCode} disabled={!selectedEvent}>
                <QrCode size={18} />
                QR code
              </button>
              <button type="button" onClick={loadStats} disabled={!selectedEvent}>
                <BarChart3 size={18} />
                Stats
              </button>
              {qrCode?.publicUrl ? (
                <a href={qrCode.publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={18} />
                  Ouvrir
                </a>
              ) : null}
            </div>

            {qrCode ? (
              <div className="qr-panel">
                <img src={qrCode.qrCodeDataUrl} alt="QR code evenement" />
                <div>
                  <strong>Lien public</strong>
                  <p>{qrCode.publicUrl}</p>
                  <button type="button" onClick={copyPublicUrl}>
                    <Copy size={16} />
                    Copier le lien
                  </button>
                </div>
              </div>
            ) : null}

            {stats ? (
              <div className="stats-panel">
                <div>
                  <span>Albums</span>
                  <strong>{stats.albumsCount}</strong>
                </div>
                <div>
                  <span>Medias</span>
                  <strong>{stats.mediaCount}</strong>
                </div>
                <div>
                  <span>Vues</span>
                  <strong>{stats.viewsCount}</strong>
                </div>
                <div>
                  <span>Telechargements</span>
                  <strong>{stats.downloadsCount}</strong>
                </div>
              </div>
            ) : null}
          </form>
        </section>
      </section>
    </main>
  );
}

export default App;
