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
    <section className="mx-auto w-[min(1180px,100%)] pb-16 pt-4">
      <div className="mb-5 grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 max-[680px]:grid-cols-[44px_minmax(0,1fr)]">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
          onClick={onBackToAlbums}
          title="Retour aux albums"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">Album</p>
          <h2 className="m-0 text-[clamp(1.65rem,3vw,2.45rem)] font-black tracking-normal">{album?.title || 'Selectionnez un album'}</h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5 max-[680px]:col-span-full max-[680px]:justify-start">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 font-black text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onDownloadAlbum}
            disabled={!album}
          >
            <Download size={16} />
            <span>Album</span>
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 font-black text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 enabled:bg-[var(--accent)] enabled:text-[var(--accent-ink)]"
            onClick={onDownloadSelected}
            disabled={!selectedMediaIds.length}
          >
            <Download size={16} />
            <span>{selectedMediaIds.length || 0} selection</span>
          </button>
          {isLoading ? <Loader2 className="animate-spin text-[var(--muted)]" size={20} /> : null}
        </div>
      </div>

      {album?.description ? <p className="mb-5 mt-2 max-w-3xl leading-relaxed text-[var(--muted)]">{album.description}</p> : null}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 min-[681px]:grid-cols-3 min-[981px]:grid-cols-4 min-[1280px]:grid-cols-5">
          {images.map((item, index) => {
            const isSelected = selectedMediaIds.includes(item.id);
            const downloadUrl = isDemoMedia(item) ? item.downloadUrl : getMediaUrl(item, accessCode, accessRole, 'download');

            return (
            <article
              className="animate-fade-up relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-[var(--sage)] text-white shadow-[0_16px_34px_rgba(23,21,17,0.12)]"
              key={item.id}
              onClick={() => onOpenImage(item)}
              style={{ '--delay': `${index * 35}ms` }}
            >
              <img
                className="h-full w-full object-cover transition duration-300 hover:scale-[1.045]"
                src={isDemoMedia(item) ? item.publicUrl : getMediaUrl(item, accessCode, accessRole)}
                alt={item.originalName}
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-[3] flex justify-between gap-2">
                <button
                  type="button"
                  className={`pointer-events-auto grid h-10 w-10 place-items-center rounded-full border-2 backdrop-blur transition hover:-translate-y-0.5 ${isSelected ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]' : 'border-white/40 bg-black/65 text-white hover:border-[var(--accent)]'}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleMediaSelection(item.id);
                  }}
                  title={isSelected ? 'Retirer de la selection' : 'Cocher'}
                >
                  {isSelected ? <Check size={16} /> : <Square size={16} />}
                </button>
                <a
                  className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border-2 border-white/40 bg-black/65 text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
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
        <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-9 text-[var(--muted)]">
          <ImageIcon size={28} />
          <p>Aucune photo disponible pour le moment.</p>
        </div>
      )}

      {documents.length > 0 ? (
        <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-5">
          <div className="mb-3 flex items-center gap-2 font-black">
            <FileText size={18} />
            Documents
          </div>
          {documents.map((item) => (
            <a
              href={isDemoMedia(item) ? item.downloadUrl : getMediaUrl(item, accessCode, accessRole, 'download')}
              className="flex min-h-12 w-full items-center gap-2.5 rounded-xl px-3 text-left text-[var(--text)] transition hover:bg-[color-mix(in_srgb,var(--sage)_44%,transparent)]"
              key={item.id}
            >
              <span className="text-[var(--muted)]">
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
