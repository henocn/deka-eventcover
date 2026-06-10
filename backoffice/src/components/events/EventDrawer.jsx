import { CheckCircle2, Loader2, LockKeyhole, MapPin, X } from 'lucide-react';
import { Button, Field, Notice } from '../ui';
import { inputClass } from '../../utils/styleClasses';

function EventDrawer({
  open,
  selectedEvent,
  form,
  isSaving,
  notice,
  error,
  onClose,
  onSubmit,
  onChange,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/40" onClick={onClose}>
      <aside className="min-h-svh w-[min(500px,100%)] overflow-y-auto bg-white p-6 shadow-[-24px_0_70px_rgba(0,0,0,0.22)]" onClick={(event) => event.stopPropagation()}>
        <header className="mb-5 flex justify-between gap-5 border-b border-neutral-200 pb-5">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">{selectedEvent ? 'Edition' : 'Creation'}</p>
            <h2 className="text-[22px] font-black">{selectedEvent ? selectedEvent.title : 'Nouvel evenement'}</h2>
          </div>
          <Button tone="soft" className="h-9 min-h-0 w-9 px-0" onClick={onClose} title="Fermer">
            <X size={18} />
          </Button>
        </header>

        <form className="grid gap-3.5" onSubmit={onSubmit}>
          {notice ? <Notice>{notice}</Notice> : null}
          {error ? (
            <Notice tone="error">
              <div className="grid gap-1">
                {error.split('\n').map((line) => <span key={line}>{line}</span>)}
              </div>
            </Notice>
          ) : null}

          <Field label="Titre">
            <input className={`${inputClass} min-h-[42px]`} value={form.title} onChange={(event) => onChange('title', event.target.value)} placeholder="Conference institutionnelle" required />
          </Field>
          <Field label="Description">
            <textarea className={`${inputClass} min-h-[92px] resize-y py-3 leading-normal`} value={form.description} onChange={(event) => onChange('description', event.target.value)} placeholder="Contexte, objectif et informations utiles." />
          </Field>
          <Field label="Lieu">
            <MapPin className="absolute bottom-3 right-3 text-neutral-500" size={15} />
            <input className={`${inputClass} min-h-[42px] pr-10`} value={form.location} onChange={(event) => onChange('location', event.target.value)} placeholder="Auditorium principal" />
          </Field>
          <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            <Field label="Debut">
              <input className={`${inputClass} min-h-[42px]`} type="datetime-local" value={form.startsAt} onChange={(event) => onChange('startsAt', event.target.value)} />
            </Field>
            <Field label="Fin">
              <input className={`${inputClass} min-h-[42px]`} type="datetime-local" value={form.endsAt} onChange={(event) => onChange('endsAt', event.target.value)} />
            </Field>
          </div>
          <Field label="Code d'acces">
            <LockKeyhole className="absolute bottom-3 right-3 text-neutral-500" size={15} />
            <input className={`${inputClass} min-h-[42px] pr-10`} value={form.accessCode} onChange={(event) => onChange('accessCode', event.target.value)} placeholder="Optionnel" />
          </Field>
          <label className="inline-flex w-fit items-center gap-2.5 text-[13px] font-extrabold">
            <input type="checkbox" className="h-5 w-5 accent-black" checked={form.isPublished} onChange={(event) => onChange('isPublished', event.target.checked)} />
            Publier
          </label>

          <div className="mt-1 flex items-center gap-2.5">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Enregistrer
            </Button>
            <Button tone="soft" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default EventDrawer;
