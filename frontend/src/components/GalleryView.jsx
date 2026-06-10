import { ArrowLeft, Check, Download, FileText, Image as ImageIcon, Loader2, Square } from 'lucide-react';
import { getMediaUrl } from '../api';
import { isDemoMedia } from '../utils/participantUtils';

function GalleryView({
  album,
  images,
  documents,
  accessCode,
  accessRole,
  isLoading,
  selectedMediaIds,
  onBackToAlbums,
  onOpenImage,
  onToggleMediaSelection,
  onDownloadAlbum,
  onDownloadSelected,
}) {
  if (!album && !isLoading) {
    return null;
  }

  return (
    <section className="gallery-section">
      <div className="section-heading">
        <button type="button" className="back-button" onClick={onBackToAlbums} title="Retour aux albums">
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="eyebrow">Album</p>
          <h2>{album?.title || 'Selectionnez un album'}</h2>
        </div>
        <button type="button" className="compact-action" onClick={onDownloadAlbum} disabled={!album}>
          <Download size={16} />
          <span>Album</span>
        </button>
        <button type="button" className="compact-action selected-download-action" onClick={onDownloadSelected} disabled={!selectedMediaIds.length}>
          <Download size={16} />
          <span>{selectedMediaIds.length || 0} selection</span>
        </button>
        {isLoading ? <Loader2 className="animate-spin muted-icon" size={20} /> : null}
      </div>

      {album?.description ? <p className="album-description">{album.description}</p> : null}

      {images.length > 0 ? (
        <div className="photo-grid">
          {images.map((item, index) => {
            const isSelected = selectedMediaIds.includes(item.id);
            const downloadUrl = isDemoMedia(item) ? item.downloadUrl : getMediaUrl(item, accessCode, accessRole, 'download');

            return (
            <article
              className="photo-tile"
              key={item.id}
              onClick={() => onOpenImage(item)}
              style={{ '--delay': `${index * 35}ms` }}
            >
              <img
                src={isDemoMedia(item) ? item.publicUrl : getMediaUrl(item, accessCode, accessRole)}
                alt={item.originalName}
                loading="lazy"
              />
              <span className="photo-title">{item.originalName}</span>
              <div className="photo-tile-actions">
                <button
                  type="button"
                  className={`photo-action-button ${isSelected ? 'is-selected' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleMediaSelection(item.id);
                  }}
                  title={isSelected ? 'Retirer de la selection' : 'Cocher'}
                >
                  {isSelected ? <Check size={16} /> : <Square size={16} />}
                </button>
                <a
                  className="photo-action-button"
                  href={downloadUrl}
                  download={item.originalName}
                  onClick={(event) => event.stopPropagation()}
                  title="Telecharger"
                >
                  <Download size={16} />
                </a>
              </div>
            </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <ImageIcon size={28} />
          <p>Aucune photo disponible pour le moment.</p>
        </div>
      )}

      {documents.length > 0 ? (
        <div className="documents-list">
          <div className="documents-title">
            <FileText size={18} />
            Documents
          </div>
          {documents.map((item) => (
            <a
              href={isDemoMedia(item) ? item.downloadUrl : getMediaUrl(item, accessCode, accessRole, 'download')}
              className="document-row"
              key={item.id}
            >
              <span className="document-icon">
                <FileText size={18} />
              </span>
              <span>{item.originalName}</span>
              <Download size={18} />
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default GalleryView;
