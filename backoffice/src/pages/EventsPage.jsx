import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventDrawer from '../components/events/EventDrawer';
import EventTable from '../components/events/EventTable';
import EventToolbar from '../components/events/EventToolbar';
import { Notice } from '../components/ui';
import useEvents from '../hooks/useEvents';
import {
  buildEventPayload,
  emptyEventForm,
  formFromEvent,
  getEventStatus,
} from '../utils/eventUtils';

function EventsPage() {
  const navigate = useNavigate();
  const { error, events, isLoading, removeEvent, saveEvent, setError } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerNotice, setDrawerNotice] = useState('');
  const [drawerError, setDrawerError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const summary = useMemo(() => ({
    total: events.length,
    published: events.filter((event) => event.isPublished).length,
    draft: events.filter((event) => !event.isPublished).length,
  }), [events]);

  function updateEventForm(field, value) {
    setEventForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateDrawer() {
    setSelectedEvent(null);
    setEventForm(emptyEventForm);
    setDrawerNotice('');
    setDrawerError('');
    setDrawerOpen(true);
  }

  function openEditDrawer(event) {
    setSelectedEvent(event);
    setEventForm(formFromEvent(event));
    setDrawerNotice('');
    setDrawerError('');
    setDrawerOpen(true);
  }

  async function handleSaveEvent(event) {
    event.preventDefault();
    setIsSaving(true);
    setDrawerError('');
    setDrawerNotice('Enregistrement en cours...');

    try {
      const payload = buildEventPayload(eventForm);
      const saved = await saveEvent(selectedEvent?.id, payload);
      setSelectedEvent(saved);
      setEventForm(formFromEvent(saved));
      setDrawerNotice(selectedEvent ? 'Evenement mis a jour.' : 'Evenement cree.');
    } catch (saveError) {
      setDrawerNotice('');
      setDrawerError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteEvent(event) {
    if (!window.confirm(`Supprimer "${event.title}" ?`)) return;

    try {
      await removeEvent(event.id);
      setNotice('Evenement supprime');
      if (selectedEvent?.id === event.id) setSelectedEvent(null);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-4 flex items-center justify-between gap-3.5">
        <div>
          <h2 className="text-[22px] font-black">Mes evenements</h2>
          <p className="mt-1 text-neutral-500">
            {summary.total} evenements, {summary.published} publies, {summary.draft} brouillons
          </p>
        </div>
      </div>

      {notice ? <Notice>{notice}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="overflow-hidden rounded border border-neutral-200 bg-white">
        <EventToolbar
          query={query}
          filter={activeFilter}
          onQueryChange={setQuery}
          onFilterChange={setActiveFilter}
          onCreate={openCreateDrawer}
        />
        <EventTable
          events={filteredEvents}
          isLoading={isLoading}
          selectedEventId={selectedEvent?.id}
          onOpenDetails={(event) => navigate(`/event/${event.slug}`)}
          onEdit={openEditDrawer}
          onDelete={handleDeleteEvent}
        />
      </div>

      <EventDrawer
        open={drawerOpen}
        selectedEvent={selectedEvent}
        form={eventForm}
        isSaving={isSaving}
        notice={drawerNotice}
        error={drawerError}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSaveEvent}
        onChange={updateEventForm}
      />
    </section>
  );
}

export default EventsPage;
