import { ArrowLeft, Image, Images, Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL, getToken } from '../api';

function AdminMediaPreview({ media }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    async function loadPreview() {
      try {
        const response = await fetch(`${API_URL}/api/admin/media/${media.id}/file`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!response.ok) return;
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(objectUrl);
      } catch {
        setSrc('');
      }
    }

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [media.id]);

  if (!src) {
    return (
      <div className="media-file-tile">
        <Image size={20} />
      </div>
    );
  }

  return <img src={src} alt={media.originalName} />;
}

function AlbumDetailsPage({
  album,
  isLoading,
  isUploading,
  notice,
  error,
  onBack,
  onUploadMedia,
}) {
  const roles = album?.accessRoles || [];
  const media = album?.media || [];

  return (
    <section className="albums-workspace">
      <div className="details-top">
        <button type="button" className="soft-button icon-text" onClick={onBack}>
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>

      {notice ? <div className="notice success">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      {isLoading ? (
        <div className="album-detail-empty inline-loading">
          <Loader2 className="spin" size={16} />
          Chargement du dossier...
        </div>
      ) : null}

      {!isLoading && !album ? (
        <div className="album-detail-empty">
          <Images size={24} />
          <p>Dossier introuvable.</p>
        </div>
      ) : null}

      {!isLoading && album ? (
        <div className="album-detail-card">
          <div className="album-detail-header">
            <div>
              <p className="section-kicker">Dossier</p>
              <h3>{album.title}</h3>
              <p>{album.description || 'Aucune description renseignee.'}</p>
            </div>
            <div className="album-status-stack">
              <span className="status-pill published">Publie</span>
              <span className={`status-pill ${album.isPublished ? 'published' : 'draft'}`}>
                {album.isPublished ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          <div className="album-detail-meta">
            <div>
              <strong>Badges d'acces</strong>
              <div className="album-role-badges">
                {roles.length > 0 ? roles.map((role) => (
                  <span key={role.id}>{role.name}</span>
                )) : (
                  <span>Tout</span>
                )}
              </div>
            </div>
            <label className="upload-dropzone">
              <Upload size={20} />
              <span>{isUploading ? 'Upload en cours...' : 'Upload massif'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={isUploading}
                onChange={(event) => onUploadMedia(event.target.files)}
              />
            </label>
          </div>

          <div className="album-media-grid">
            {media.length === 0 ? (
              <div className="album-detail-empty">
                <Image size={22} />
                <p>Aucune image dans ce dossier.</p>
              </div>
            ) : null}
            {media.map((item) => (
              <figure key={item.id} className="album-media-tile">
                {item.type === 'image' ? <AdminMediaPreview media={item} /> : (
                  <div className="media-file-tile">
                    <Image size={20} />
                  </div>
                )}
                <figcaption>{item.originalName}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AlbumDetailsPage;
