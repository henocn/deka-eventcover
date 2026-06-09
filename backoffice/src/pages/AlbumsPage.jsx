import { Edit3, Folder, FolderPlus, Image, Loader2, LockKeyhole, Plus, Trash2 } from 'lucide-react';

function AlbumsPage({
  events,
  selectedEventId,
  selectedEvent,
  accessRoles,
  form,
  editingAlbumId,
  notice,
  error,
  isLoadingRoles,
  isSaving,
  onSelectEvent,
  onFormChange,
  onToggleRole,
  onOpenAlbum,
  onEditAlbum,
  onDeleteAlbum,
  onSubmit,
}) {
  const albums = selectedEvent?.albums || [];

  return (
    <section className="albums-workspace">
      <div className="workspace-heading compact-heading">
        <div>
          <h2>Albums photos</h2>
          <p>Creer les dossiers et choisir si l'acces est public evenement ou limite aux badges.</p>
        </div>
      </div>

      {notice ? <div className="notice success">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <div className="album-manager-grid">
        <div className="detail-panel album-create-panel">
          <div className="panel-heading-row">
            <div>
              <h3>{editingAlbumId ? 'Modifier album' : 'Nouvel album'}</h3>
              <p>Choisissez Tout ou des badges specifiques.</p>
            </div>
            <FolderPlus size={20} />
          </div>

          <form className="album-form" onSubmit={onSubmit}>
            <label>
              Evenement
              <select value={selectedEventId || ''} onChange={(event) => onSelectEvent(Number(event.target.value))}>
                <option value="" disabled>Choisir un evenement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </label>

            <label>
              Nom de l'album
              <input
                value={form.title}
                onChange={(event) => onFormChange('title', event.target.value)}
                placeholder="Photos officielles, Cocktail, VIP..."
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) => onFormChange('description', event.target.value)}
                placeholder="Optionnel"
              />
            </label>

            <div className="role-access-select">
              <label className="switch-line">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => onFormChange('isPublished', event.target.checked)}
                />
                <span />
                Dossier actif
              </label>
              <div className="mini-heading">
                <LockKeyhole size={15} />
                Acces album
              </div>
              <label className="role-choice all-choice">
                <input
                  type="checkbox"
                  checked={form.accessRoleIds.length === 0}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onFormChange('accessRoleIds', []);
                    }
                  }}
                />
                <span>Tout</span>
              </label>
              {isLoadingRoles ? (
                <p className="muted-text inline-loading">
                  <Loader2 className="spin" size={15} />
                  Chargement des badges...
                </p>
              ) : null}
              {!isLoadingRoles && accessRoles.length > 0 ? (
                <div className="role-choice-list">
                  {accessRoles.map((role) => (
                    <label key={role.id} className="role-choice">
                      <input
                        type="checkbox"
                        checked={form.accessRoleIds.includes(role.id)}
                        onChange={() => onToggleRole(role.id)}
                      />
                      <span>{role.name}</span>
                    </label>
                  ))}
                </div>
              ) : null}
            </div>

            <button type="submit" className="primary-button" disabled={isSaving || !selectedEventId}>
              {isSaving ? <Loader2 className="spin" size={16} /> : <Plus size={16} />}
              {editingAlbumId ? 'Mettre a jour' : 'Creer album'}
            </button>
          </form>
        </div>

        <div className="album-gallery-panel">
          <div className="album-gallery-head">
            <div>
              <h3>Dossiers</h3>
              <p>{albums.length} albums</p>
            </div>
          </div>
          <div className="album-gallery">
            {albums.length === 0 ? (
              <div className="album-empty">
                <Image size={24} />
                <p>Aucun album pour cet evenement.</p>
              </div>
            ) : null}
            {albums.map((album) => (
                <article
                  className={`album-folder-card ${editingAlbumId === album.id ? 'is-editing' : ''}`}
                  key={album.id}
                  onClick={() => onOpenAlbum(album)}
                >
                  <div className="album-card-actions">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEditAlbum(album);
                      }}
                      title="Modifier"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteAlbum(album);
                      }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="album-folder-visual">
                    <Folder size={42} />
                    <div className="album-folder-badges">
                      <span className={album.isPublished ? '' : 'locked'}>
                        {album.isPublished ? 'Actif' : <LockKeyhole size={13} />}
                      </span>
                    </div>
                  </div>
                  <div className="album-folder-body">
                    <h3>{album.title}</h3>
                  </div>
                </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AlbumsPage;
