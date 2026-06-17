import { CalendarDays, Camera, MapPin } from 'lucide-react';
import { formatDate } from '../utils/participantUtils';
import ThemeToggle from './ThemeToggle';

function EventHero({ event, theme, onThemeToggle, onMyPhotos }) {
  return (
    <header className="mx-auto w-[min(1180px,100%)] pb-8 pt-1">
      <div className="mb-10 flex items-center justify-between gap-5 max-[680px]:items-start max-[680px]:gap-4">
        <div className="flex items-center gap-3 text-2xl font-black tracking-normal">
          <span>Deka.</span>
        </div>
        <div className="flex flex-wrap justify-end gap-2.5">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 font-black text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
            onClick={onMyPhotos}
          >
            <Camera size={17} />
            <span>Mes photos</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-center gap-[clamp(28px,5vw,70px)] max-[900px]:grid-cols-1">
        <div className="animate-fade-up">
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_66%,transparent)] px-3 text-[var(--muted)]">
              <CalendarDays size={16} />
              {formatDate(event?.startsAt)}
            </span>
            {event?.location ? (
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_66%,transparent)] px-3 text-[var(--muted)]">
                <MapPin size={16} />
                {event.location}
              </span>
            ) : null}
          </div>
          <h1 className="m-0 max-w-[780px] pt-5 text-[clamp(2.8rem,7vw,6.8rem)] font-black leading-[0.92] tracking-normal">{event?.title}</h1>
          <p className="mt-6 max-w-[680px] text-[clamp(1.04rem,2vw,1.28rem)] leading-relaxed text-[var(--muted)]">{event?.description}</p>
        </div>

        <div className="relative min-h-[450px] animate-fade-up max-[900px]:min-h-80 max-[680px]:hidden" aria-hidden="true">
          <div className="absolute inset-[54px_28px_40px_28px] rounded-[34px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] shadow-[var(--shadow)]" />
          <div className="absolute right-[84px] top-[18px] h-[300px] w-[230px] rotate-[-4deg] overflow-hidden rounded-[22px] border-[10px] border-[var(--surface-strong)] bg-[linear-gradient(135deg,rgba(153,255,0,0.18),transparent_45%),linear-gradient(160deg,var(--sage),color-mix(in_srgb,var(--gold)_24%,var(--surface)))] shadow-[var(--shadow)] max-[900px]:right-[18%]" />
          <div className="absolute bottom-[18px] right-2 h-[250px] w-[220px] rotate-[5deg] overflow-hidden rounded-[22px] border-[10px] border-[var(--surface-strong)] bg-[linear-gradient(135deg,rgba(153,255,0,0.18),transparent_45%),linear-gradient(160deg,var(--sage),color-mix(in_srgb,var(--gold)_24%,var(--surface)))] shadow-[var(--shadow)] max-[900px]:right-[6%]" />
          <div className="absolute bottom-[70px] left-[18px] h-[200px] w-40 rotate-[-8deg] overflow-hidden rounded-[22px] border-[10px] border-[var(--surface-strong)] bg-[linear-gradient(135deg,rgba(153,255,0,0.18),transparent_45%),linear-gradient(160deg,var(--sage),color-mix(in_srgb,var(--gold)_24%,var(--surface)))] shadow-[var(--shadow)] max-[900px]:left-[8%]" />
        </div>
      </div>
    </header>
  );
}

export default EventHero;
