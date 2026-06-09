import { ArrowLeft, Copy, Download, Edit3, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { formatDate, getEventStatus, getStatusLabel } from '../utils/eventUtils';

function EventDetailsPage({
  event,
  stats,
  accessRoles,
  roleForm,
  isLoading,
  isCreatingRole,
  onBack,
  onEdit,
  onCopyUrl,
  onRoleFormChange,
  onCreateRole,
  onDeleteRole,
}) {
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
          <span className="meta-chip">{formatDate(event.startsAt)}</span>
          {event.location ? (
            <span className="meta-chip location-chip">
              <MapPin size={14} />
              {event.location}
            </span>
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

        <div className="detail-panel access-panel-card">
          <div className="panel-heading-row">
            <div>
              <h3>Badges QR</h3>
              <p>Chaque badge donne acces uniquement aux albums selectionnes.</p>
            </div>
            <span>{accessRoles.length}</span>
          </div>

          <form className="role-form" onSubmit={onCreateRole}>
            <label>
              Nom du badge
              <input
                value={roleForm.name}
                onChange={(inputEvent) => onRoleFormChange('name', inputEvent.target.value)}
                placeholder="Presse, VIP, Staff..."
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={isCreatingRole}
            >
              {isCreatingRole ? <Loader2 className="spin" size={16} /> : <Plus size={16} />}
              Creer badge
            </button>
          </form>
        </div>
      </div>

      <div className="access-role-list">
        {isLoading ? (
          <div className="detail-panel inline-loading">
            <Loader2 className="spin" size={16} />
            Chargement des badges...
          </div>
        ) : null}

        {!isLoading && accessRoles.length === 0 ? (
          <div className="detail-panel empty-role-state">
            <p>Aucun badge QR pour cet evenement.</p>
          </div>
        ) : null}

        {accessRoles.map((role) => (
          <article className="role-card" key={role.id}>
            <div className="role-main">
              <div className="role-title-block">
                <p className="section-kicker">Role</p>
                <h3>{role.name}</h3>
                {role.description ? <p>{role.description}</p> : null}
              </div>
              <div className="role-access-block">
                <p className="section-kicker">Dossiers d'acces</p>
              {(role.albums || []).length > 0 ? (
                <div className="role-albums">
                  {(role.albums || []).map((album) => (
                    <span key={album.id}>{album.title}</span>
                  ))}
                </div>
              ) : (
                <p className="role-empty-access">Aucun album rattache pour le moment.</p>
              )}
              </div>
              <p className="role-url">{role.publicUrl}</p>
            </div>
            <div className="role-qr-box">
              {role.qrCodeDataUrl ? (
                <img src={role.qrCodeDataUrl} alt={`QR ${role.name}`} />
              ) : (
                <div className="qr-placeholder">QR</div>
              )}
              <div className="qr-actions">
                <button type="button" className="qr-action-button" onClick={() => onCopyUrl(role)} title="Copier le lien">
                  <Copy size={16} />
                </button>
                {role.qrCodeDataUrl ? (
                  <a
                    className="qr-action-button"
                    href={role.qrCodeDataUrl}
                    download={`qr-${event.slug}-${role.name}.png`}
                    title="Telecharger le QR"
                  >
                    <Download size={16} />
                  </a>
                ) : null}
                <button
                  type="button"
                  className="qr-action-button danger-button"
                  onClick={() => onDeleteRole(role)}
                  title="Supprimer le badge"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EventDetailsPage;
