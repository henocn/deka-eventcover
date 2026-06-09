import EventTable from '../components/events/EventTable';
import EventToolbar from '../components/events/EventToolbar';

function EventsPage({
  events,
  summary,
  query,
  filter,
  selectedEventId,
  isLoading,
  notice,
  error,
  onQueryChange,
  onFilterChange,
  onCreate,
  onOpenDetails,
  onEdit,
  onDelete,
}) {
  return (
    <section className="events-workspace compact-page">
      <div className="workspace-heading compact-heading">
        <div>
          <h2>Mes evenements</h2>
          <p>{summary.total} evenements, {summary.published} publies, {summary.draft} brouillons</p>
        </div>
      </div>

      {notice ? (
        <div className="notice success">{notice}</div>
      ) : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="table-card">
        <EventToolbar
          query={query}
          filter={filter}
          onQueryChange={onQueryChange}
          onFilterChange={onFilterChange}
          onCreate={onCreate}
        />
        <EventTable
          events={events}
          isLoading={isLoading}
          selectedEventId={selectedEventId}
          onOpenDetails={onOpenDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </section>
  );
}

export default EventsPage;
