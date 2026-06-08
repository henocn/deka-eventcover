import { CheckCircle2, Loader2, LockKeyhole, MapPin, X } from 'lucide-react';

function EventDrawer({ open, selectedEvent, form, isSaving, onClose, onSubmit, onChange }) {
  if (!open) return null;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="event-drawer slim" onClick={(event) => event.stopPropagation()}>
        <header className="drawer-header">
          <div>
            <p className="section-kicker">{selectedEvent ? 'Edition' : 'Creation'}</p>
            <h2>{selectedEvent ? selectedEvent.title : 'Nouvel evenement'}</h2>
          </div>
          <button type="button" onClick={onClose} title="Fermer">
            <X size={18} />
          </button>
        </header>

        <form className="drawer-form" onSubmit={onSubmit}>
          <label>
            Titre
            <input
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
              placeholder="Conference institutionnelle"
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => onChange('description', event.target.value)}
              placeholder="Contexte, objectif et informations utiles."
            />
          </label>
          <label>
            Lieu
            <span className="input-icon"><MapPin size={15} /></span>
            <input
              value={form.location}
              onChange={(event) => onChange('location', event.target.value)}
              placeholder="Auditorium principal"
            />
          </label>
          <div className="two-fields">
            <label>
              Debut
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) => onChange('startsAt', event.target.value)}
              />
            </label>
            <label>
              Fin
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => onChange('endsAt', event.target.value)}
              />
            </label>
          </div>
          <label>
            Code d'acces
            <span className="input-icon"><LockKeyhole size={15} /></span>
            <input
              value={form.accessCode}
              onChange={(event) => onChange('accessCode', event.target.value)}
              placeholder="Optionnel"
            />
          </label>
          <label className="switch-line">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => onChange('isPublished', event.target.checked)}
            />
            <span />
            Publier
          </label>

          <div className="drawer-actions">
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? <Loader2 className="spin" size={16} /> : <CheckCircle2 size={16} />}
              Enregistrer
            </button>
            <button type="button" className="soft-button" onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default EventDrawer;
