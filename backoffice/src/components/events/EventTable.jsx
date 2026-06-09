import { Edit3, Loader2, Trash2 } from 'lucide-react';
import { formatDate, getEventStatus, getStatusLabel } from '../../utils/eventUtils';

function EventTable({ events, isLoading, selectedEventId, onOpenDetails, onEdit, onDelete }) {
  return (
    <div className="events-table-wrap">
      <table className="events-table compact-table">
        <thead>
          <tr>
            <th>Projet</th>
            <th>Status</th>
            <th>Date</th>
            <th>Acces</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className="table-state">
                <Loader2 className="spin" size={18} />
                Chargement des evenements
              </td>
            </tr>
          ) : null}
          {!isLoading && events.length === 0 ? (
            <tr>
              <td colSpan="5" className="table-state">
                Aucun evenement trouve.
              </td>
            </tr>
          ) : null}
          {events.map((event) => {
            const status = getEventStatus(event);

            return (
              <tr key={event.id} className={event.id === selectedEventId ? 'selected' : ''}>
                <td>
                  <button type="button" className="project-link" onClick={() => onOpenDetails(event)}>
                    <strong>{event.title}</strong>
                    <small>{event.slug}</small>
                  </button>
                </td>
                <td>
                  <span className={`status-pill ${status}`}>{getStatusLabel(status)}</span>
                </td>
                <td>{formatDate(event.startsAt)}</td>
                <td>{event.accessCode ? 'Code requis' : 'Libre'}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => onEdit(event)} title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button type="button" onClick={() => onDelete(event)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default EventTable;
