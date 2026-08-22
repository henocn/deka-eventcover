import { Download, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMediaUrl, getThumbnailUrl } from '../api';
import LocalizedText from './LocalizedText';
import { albumCover } from '../utils/participantUtils';

function AlbumRail({ albums, selectedAlbumSlug, accessCode, accessRole, onSelectAlbum, onDownloadAlbum }) {
  const { t } = useTranslation();

  return (
    <section className="mx-auto w-[min(1180px,100%)] py-6" aria-label={t('albums.label')}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold-text)]">{t('albums.label')}</p>
          <h2 className="m-0 text-[clamp(1.65rem,3vw,2.45rem)] font-black tracking-normal">{t('albums.chooseCollection')}</h2>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,255px),1fr))] gap-4 pb-6">
        {albums.map((album, index) => {
          const cover = album.coverMedia
            ? getThumbnailUrl(album.coverMedia, accessCode, accessRole)
            : albumCover(album);
          const photoCount = Number.isFinite(Number(album.photoCount))
            ? Number(album.photoCount)
            : (album.media || []).filter((item) => item.type === 'image').length;

          return (
            <article
              key={album.id || album.slug}
              role="button"
              tabIndex={0}
              className={`animate-fade-up cursor-pointer rounded-[18px] border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_94%,transparent),color-mix(in_srgb,var(--surface)_76%,transparent)),var(--surface)] p-3 text-left text-[var(--text)] shadow-[0_14px_38px_rgba(23,21,17,0.09)] transition hover:-translate-y-1 hover:shadow-[var(--soft-shadow)] ${selectedAlbumSlug === album.slug ? 'border-[var(--accent)] ring-2 ring-[color-mix(in_srgb,var(--accent)_72%,transparent)]' : 'border-[var(--line)] hover:border-[var(--line-strong)]'}`}
              onClick={() => onSelectAlbum(album.slug)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') onSelectAlbum(album.slug);
              }}
              style={{ '--delay': `${index * 55}ms` }}
            >
              <span className="relative block aspect-[1.08/1] w-full overflow-hidden bg-[linear-gradient(135deg,rgba(163,194,68,0.24),transparent_45%),linear-gradient(155deg,var(--sage),color-mix(in_srgb,var(--gold)_18%,var(--surface)))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--text)_8%,transparent)]">
                {cover ? (
                  <img
                    className="relative z-[1] h-full w-full object-cover transition duration-300 hover:scale-[1.045]"
                    src={cover}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      if (!album.coverMedia) return;
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getMediaUrl(album.coverMedia, accessCode, accessRole);
                    }}
                  />
                ) : (
                  <ImageIcon className="absolute bottom-7 left-7 z-[2] h-14 w-14" />
                )}
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_48%,rgba(0,0,0,0.42)),linear-gradient(135deg,rgba(163,194,68,0.14),transparent_46%)]" />
                <span className="absolute bottom-3 left-3 z-[2] rounded-full border border-white/25 bg-black/70 px-3 py-1 text-xs font-black text-white backdrop-blur">
                  {t('albums.photoCount', { count: photoCount })}
                </span>
              </span>
              <span className="flex items-start justify-between gap-3 px-1 pb-3 pt-4">
                <span>
                  <span className="block text-[1.05rem] font-black leading-tight"><LocalizedText text={album.title} /></span>
                  <span className="mt-1.5 block text-sm leading-snug text-[var(--muted)]">
                    {album.description ? (
                      <LocalizedText text={album.description} />
                    ) : (
                      t('albums.defaultDescription')
                    )}
                  </span>
                </span>
              </span>
              <span className="block px-1 pb-1">
                <button
                  type="button"
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-[var(--gold-deep)] bg-[var(--accent)] px-4 font-black text-[var(--accent-ink)] transition hover:-translate-y-0.5 hover:brightness-105"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownloadAlbum(album.slug);
                  }}
                >
                  <Download size={16} />
                  <span>{t('albums.download')}</span>
                </button>
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default AlbumRail;
