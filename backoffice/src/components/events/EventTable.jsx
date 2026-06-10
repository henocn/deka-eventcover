import { Edit3, Loader2, Trash2 } from 'lucide-react';
import { Button, StatusPill } from '../ui';
import { formatDate, getEventStatus, getStatusLabel } from '../../utils/eventUtils';

function EventTable({ events, isLoading, selectedEventId, onOpenDetails, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse">
        <thead>
          <tr>
            {['Projet', 'Status', 'Date', 'Acces', 'Actions'].map((header) => (
              <th key={header} className="border-b border-neutral-200 px-4 py-3 text-left align-middle font-extrabold text-neutral-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className="h-[210px] border-b border-neutral-200 px-4 py-3 text-center text-neutral-500">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={18} />
                  Chargement des evenements
                </span>
              </td>
            </tr>
          ) : null}
          {!isLoading && events.length === 0 ? (
            <tr>
              <td colSpan="5" className="h-[210px] border-b border-neutral-200 px-4 py-3 text-center text-neutral-500">
                Aucun evenement trouve.
              </td>
            </tr>
          ) : null}
          {events.map((event) => {
            const status = getEventStatus(event);

            return (
              <tr key={event.id} className={event.id === selectedEventId ? 'bg-neutral-50' : 'hover:bg-neutral-50'}>
                <td className="border-b border-neutral-200 px-4 py-3 align-middle">
                  <button type="button" className="block min-w-60 text-left text-neutral-950" onClick={() => onOpenDetails(event)}>
                    <strong className="block min-w-0 [overflow-wrap:anywhere] text-[15px]">{event.title}</strong>
                    <small className="mt-1 block min-w-0 text-neutral-500">{event.slug}</small>
                  </button>
                </td>
                <td className="border-b border-neutral-200 px-4 py-3 align-middle">
                  <StatusPill status={status}>{getStatusLabel(status)}</StatusPill>
                </td>
                <td className="border-b border-neutral-200 px-4 py-3 align-middle">{formatDate(event.startsAt)}</td>
                <td className="border-b border-neutral-200 px-4 py-3 align-middle">{event.accessCode ? 'Code requis' : 'Libre'}</td>
                <td className="border-b border-neutral-200 px-4 py-3 align-middle">
                  <div className="flex items-center gap-2.5">
                    <Button tone="icon" className="h-8 min-h-0 w-8 px-0" onClick={() => onEdit(event)} title="Edit">
                      <Edit3 size={16} />
                    </Button>
                    <Button tone="icon" className="h-8 min-h-0 w-8 px-0" onClick={() => onDelete(event)} title="Delete">
                      <Trash2 size={16} />
                    </Button>
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
