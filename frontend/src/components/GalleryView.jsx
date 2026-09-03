import { ArrowLeft, Check, Download, FileText, Image as ImageIcon, Loader2, Square } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMediaUrl, getThumbnailUrl } from '../api';
import LocalizedText from './LocalizedText';
import { isDemoMedia } from '../utils/participantUtils';


// Carte image individuelle avec squelette de chargement et placeholder.
function GalleryCard({ item, index, isSelected, accessCode, accessRole, downloadUrl, onOpenImage, onToggleMediaSelection, t }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const src = isDemoMedia(item) ? item.publicUrl : getThumbnailUrl(item, accessCode, accessRole);
  const fallbackSrc = isDemoMedia(item) ? null : getMediaUrl(item, accessCode, accessRole);

  // Gere le fallback vers l'image originale si la vignette echoue.
  function handleError(event) {
    if (errored || isDemoMedia(item) || !fallbackSrc) return;
    setErrored(true);
    event.currentTarget.src = fallbackSrc;
  }

  return (
    <article
      className="animate-fade-up relative aspect-square cursor-zoom-in overflow-hidden bg-[var(--sage)] text-white shadow-[0_16px_34px_rgba(23,21,17,0.12)]"
      onClick={() => onOpenImage(item)}
      style={{ '--delay': `${index * 35}ms` }}
    >
      {/* Squelette anime visible jusqu'au chargement de l'image. */}
      {!loaded ? (
        <div className="absolute inset-0 z-[1] animate-pulse bg-[linear-gradient(135deg,color-mix(in_srgb,var(--sage)_80%,black),color-mix(in_srgb,var(--surface)_60%,var(--sage)))]" />
      ) : null}

      <img
        className={`h-full w-full object-cover transition-opacity duration-300 hover:scale-[1.045] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        src={src}
        alt={item.originalName}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />

      <div className="pointer-events-none absolute inset-x-2.5 top-2.5 z-[3] flex justify-between gap-2">
        <button
          type="button"
          className={`pointer-events-auto grid h-10 w-10 place-items-center rounded-full border-2 backdrop-blur transition hover:-translate-y-0.5 ${isSelected ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]' : 'border-white/40 bg-black/65 text-white hover:border-[var(--accent)]'}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleMediaSelection(item.id);
          }}
          title={isSelected ? t('gallery.uncheck') : t('gallery.check')}
        >
          {isSelected ? <Check size={16} /> : <Square size={16} />}
        </button>
        <a
          className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border-2 border-white/40 bg-black/65 text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
          href={downloadUrl}
          download={item.originalName}
          onClick={(event) => event.stopPropagation()}
          title={t('gallery.downloadPhoto')}
        >
          <Download size={16} />
        </a>
      </div>
    </article>
  );
}


function GalleryView({
  album,
  images,
  documents,
  accessCode,
  accessRole,
  isLoading,
  selectedMediaIds,
  localizeContent = true,
  onBackToAlbums,
  onOpenImage,
  onToggleMediaSelection,
  onDownloadAlbum,
  onDownloadSelected,
}) {
  const { t } = useTranslation();

  if (!album && !isLoading) {
    return null;
  }

  return (
    <section className="mx-auto w-[min(1180px,100%)] pb-16 pt-2">
      <div className="mb-8 grid grid-cols-[44px_minmax(0,1fr)_auto] items-start gap-x-5 gap-y-5 max-[680px]:grid-cols-[44px_minmax(0,1fr)]">
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
          onClick={onBackToAlbums}
          title={t('gallery.backToAlbums')}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h2 className="m-0 text-[clamp(1.65rem,3vw,2.45rem)] font-black leading-tight tracking-normal">
            {album?.title ? (
              localizeContent ? <LocalizedText text={album.title} /> : album.title
            ) : t('gallery.selectAlbum')}
          </h2>
          {album?.description ? (
            <p className="mb-0 mt-4 max-w-3xl leading-relaxed text-[var(--muted)]">
              {localizeContent ? <LocalizedText text={album.description} /> : album.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5 max-[680px]:col-span-full max-[680px]:mt-1 max-[680px]:justify-start">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 font-black text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onDownloadAlbum}
            disabled={!album}
          >
            <Download size={16} />
            <span>{t('common.album')}</span>
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 font-black text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50 enabled:bg-[var(--accent)] enabled:text-[var(--accent-ink)]"
            onClick={onDownloadSelected}
            disabled={!selectedMediaIds.length}
          >
            <Download size={16} />
            <span>{t('gallery.selection', { count: selectedMediaIds.length || 0 })}</span>
          </button>
          {isLoading ? <Loader2 className="animate-spin text-[var(--muted)]" size={20} /> : null}
        </div>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 min-[681px]:grid-cols-3 min-[681px]:gap-5 min-[981px]:grid-cols-4 min-[1280px]:grid-cols-5">
          {images.map((item, index) => {
            const isSelected = selectedMediaIds.includes(item.id);
            const downloadUrl = isDemoMedia(item) ? item.downloadUrl : getMediaUrl(item, accessCode, accessRole, 'download');

            return (
              <GalleryCard
                key={item.id}
                item={item}
                index={index}
                isSelected={isSelected}
                accessCode={accessCode}
                accessRole={accessRole}
                downloadUrl={downloadUrl}
                onOpenImage={onOpenImage}
                onToggleMediaSelection={onToggleMediaSelection}
                t={t}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] p-9 text-[var(--muted)]">
          <ImageIcon size={28} />
          <p>{t('gallery.noPhotos')}</p>
        </div>
      )}

      {documents.length > 0 ? (
        <div className="mt-7 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_82%,transparent)] p-5">
          <div className="mb-3 flex items-center gap-2 font-black">
            <FileText size={18} />
            {t('common.documents')}
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
