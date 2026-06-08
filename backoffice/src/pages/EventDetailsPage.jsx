import { ArrowLeft, BarChart3, Copy, Edit3, MapPin, QrCode } from 'lucide-react';
import { formatDate, getEventStatus, getStatusLabel } from '../utils/eventUtils';

function EventDetailsPage({ event, stats, qrCode, onBack, onEdit, onLoadStats, onLoadQr, onCopyUrl }) {
  if (!event) return null;
  const status = getEventStatus(event);

  return (
    <section className="details-page">
      <div className="details-top">
        <button type="button" className="soft-button icon-text" onClick={onBack}>
          <ArrowLeft size={16} />
          Retour
        </button>
        <div className="details-actions">
          <button type="button" className="soft-button" onClick={onLoadStats}>
            <BarChart3 size={16} />
            Stats
          </button>
          <button type="button" className="soft-button" onClick={onLoadQr}>
            <QrCode size={16} />
            QR
          </button>
          <button type="button" className="primary-button" onClick={onEdit}>
            <Edit3 size={16} />
            Edit
          </button>
        </div>
      </div>

      <div className="details-hero">
        <p className="section-kicker">Project details</p>
        <h2>{event.title}</h2>
        <p>{event.description || 'Aucune description renseignee.'}</p>
        <div className="detail-meta">
          <span className={`status-pill ${status}`}>{getStatusLabel(status)}</span>
          <span>{formatDate(event.startsAt)}</span>
          {event.location ? (
            <span><MapPin size={15} /> {event.location}</span>
          ) : null}
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-panel">
          <h3>Statistiques</h3>
          <div className="stat-grid">
            <div><span>Albums</span><strong>{stats?.albumsCount ?? '-'}</strong></div>
            <div><span>Medias</span><strong>{stats?.mediaCount ?? '-'}</strong></div>
            <div><span>Vues</span><strong>{stats?.viewsCount ?? '-'}</strong></div>
            <div><span>Downloads</span><strong>{stats?.downloadsCount ?? '-'}</strong></div>
          </div>
        </div>

        <div className="detail-panel">
          <h3>QR code</h3>
          {qrCode ? (
            <div className="qr-inline">
              <img src={qrCode.qrCodeDataUrl} alt="QR code evenement" />
              <div>
                <p>{qrCode.publicUrl}</p>
                <button type="button" className="soft-button" onClick={onCopyUrl}>
                  <Copy size={16} />
                  Copier
                </button>
              </div>
            </div>
          ) : (
            <p className="muted-text">Genere le QR code pour afficher le lien public.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default EventDetailsPage;
