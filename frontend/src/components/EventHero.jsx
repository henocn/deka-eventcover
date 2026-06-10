import { CalendarDays, Camera, MapPin } from 'lucide-react';
import { formatDate } from '../utils/participantUtils';
import ThemeToggle from './ThemeToggle';

function EventHero({ event, theme, onThemeToggle, onMyPhotos }) {
  return (
    <header className="event-hero">
      <div className="hero-topbar">
        <div className="hero-brand">
          <span>Deka.</span>
          <small>Galerie officielle</small>
        </div>
        <div className="hero-actions">
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
          <div className="border border-2 border-yellow-500 rounded-full p-2 inline-flex items-center justify-center gap-2" onClick={onMyPhotos}>
            <Camera size={17} className=''/>
            <span>Mes photos</span>
          </div>
        </div>
      </div>

      <div className="hero-grid">
        <div className="hero-copy">
          <div className="event-meta">
            <span>
              <CalendarDays size={16} />
              {formatDate(event?.startsAt)}
            </span>
            {event?.location ? (
              <span>
                <MapPin size={16} />
                {event.location}
              </span>
            ) : null}
          </div>
          <h1 className="pt-5">{event?.title}</h1>
          <p className="event-description">{event?.description}</p>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-frame one" />
          <div className="hero-frame two" />
          <div className="hero-frame three" />
        </div>
      </div>
    </header>
  );
}

export default EventHero;
