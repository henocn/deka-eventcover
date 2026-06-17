import { Check, Download, Image, Loader2, Search, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMediaUrl, searchMyPhotos, searchMyPhotosByEmbedding } from '../api';
import {
  clearMyPhotosEmbeddingCookie,
  getMyPhotosEmbeddingCookie,
  saveMyPhotosEmbeddingCookie,
} from '../utils/participantCookies';
import { isDemoMedia } from '../utils/participantUtils';

function MyPhotosModal({ accessCode, accessRole, eventSlug, onClose }) {
  const [matches, setMatches] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [diagnostics, setDiagnostics] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [usedCachedEmbedding, setUsedCachedEmbedding] = useState(false);
  const [error, setError] = useState('');

  const selectedMatches = useMemo(
    () => matches.filter((match) => selectedIds.includes(match.media.id)),
    [matches, selectedIds],
  );

  function downloadItems(items) {
    items.forEach((match, index) => {
      window.setTimeout(() => {
        const media = match.media;
        const link = document.createElement('a');
        link.href = isDemoMedia(media) ? media.publicUrl : getMediaUrl(media, accessCode, accessRole, 'download');
        link.download = media.originalName || `photo-${index + 1}`;
        link.rel = 'noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, index * 180);
    });
  }

  const applySearchResult = useCallback((result, fromCache = false) => {
    setMatches(result.matches || []);
    setDiagnostics(result.diagnostics || null);
    setUsedCachedEmbedding(fromCache);
    setHasSearched(true);
  }, []);

  const runCachedSearch = useCallback(async () => {
    const embedding = getMyPhotosEmbeddingCookie(eventSlug, accessRole);
    if (!embedding) {
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setError('');
    setMatches([]);
    setSelectedIds([]);
    setDiagnostics(null);

    try {
      const result = await searchMyPhotosByEmbedding(eventSlug, embedding, accessCode, accessRole);
      applySearchResult(result, true);
    } catch {
      clearMyPhotosEmbeddingCookie(eventSlug, accessRole);
      setHasSearched(false);
    } finally {
      setIsSearching(false);
    }
  }, [accessCode, accessRole, applySearchResult, eventSlug]);

  useEffect(() => {
    queueMicrotask(() => runCachedSearch());
  }, [runCachedSearch]);

  async function runSearch(file) {
    if (!file) return;

    setIsSearching(true);
    setError('');
    setMatches([]);
    setSelectedIds([]);
    setDiagnostics(null);
    setUsedCachedEmbedding(false);
    setHasSearched(true);

    try {
      const result = await searchMyPhotos(eventSlug, file, accessCode, accessRole);
      if (result.embedding) {
        saveMyPhotosEmbeddingCookie(eventSlug, accessRole, result.embedding);
      }
      applySearchResult(result, false);
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setIsSearching(false);
    }
  }

  function toggleSelection(mediaId) {
    setSelectedIds((current) => (
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId]
    ));
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4" onMouseDown={onClose}>
      <section
        className="max-h-[92svh] w-[min(1180px,100%)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.32)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">Recherche personnelle</p>
            <h2 className="m-0 text-2xl font-black text-[var(--text)]">Mes photos</h2>
            <p className="mt-2 max-w-xl text-sm font-bold text-[var(--muted)]">
              {usedCachedEmbedding
                ? 'Resultats retrouves depuis votre derniere recherche.'
                : 'Prenez ou importez un selfie clair. Il est utilise uniquement pour la comparaison puis oublie.'}
            </p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--line-strong)] text-[var(--text)] transition hover:border-[var(--accent)]" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[var(--line-strong)] px-4 font-black text-[var(--text)] transition hover:border-[var(--accent)]">
            <Search size={18} />
            {hasSearched ? 'Refaire un selfie' : 'Prendre un selfie'}
            <input
              className="hidden"
              type="file"
              accept="image/*"
              capture="user"
              disabled={isSearching}
              onChange={(event) => runSearch(event.target.files?.[0])}
            />
          </label>
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[var(--line-strong)] px-4 font-black text-[var(--text)] transition hover:border-[var(--accent)]">
            <Upload size={18} />
            {hasSearched ? 'Importer une autre photo' : 'Importer'}
            <input
              className="hidden"
              type="file"
              accept="image/*"
              disabled={isSearching}
              onChange={(event) => runSearch(event.target.files?.[0])}
            />
          </label>
        </div>

        {isSearching ? (
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-3 font-black text-[var(--muted)]">
            <Loader2 className="animate-spin" size={18} />
            Recherche en cours...
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</p> : null}

        {!isSearching && matches.length > 0 ? (
          <div className="mt-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <strong className="text-[var(--text)]">{matches.length} photo{matches.length > 1 ? 's' : ''} trouvee{matches.length > 1 ? 's' : ''}</strong>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-[var(--line-strong)] px-4 font-black text-[var(--text)] transition hover:border-[var(--accent)]" onClick={() => downloadItems(matches)}>
                  <Download size={16} />
                  Tout
                </button>
                <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-full border-2 border-[var(--line-strong)] px-4 font-black text-[var(--text)] transition hover:border-[var(--accent)] disabled:opacity-50" disabled={selectedMatches.length === 0} onClick={() => downloadItems(selectedMatches)}>
                  <Download size={16} />
                  {selectedMatches.length} selection
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-[700px]:grid-cols-3 min-[1024px]:grid-cols-4 min-[1280px]:grid-cols-5">
              {matches.map((match) => {
                const media = match.media;
                const selected = selectedIds.includes(media.id);

                return (
                  <article key={media.id} className="relative aspect-square overflow-hidden rounded-xl bg-[var(--sage)]">
                    <img className="h-full w-full object-cover" src={getMediaUrl(media, accessCode, accessRole)} alt="" loading="lazy" />
                    <button
                      type="button"
                      className={`absolute left-2 top-2 grid h-10 w-10 place-items-center rounded-full border-2 backdrop-blur transition ${selected ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]' : 'border-white/40 bg-black/65 text-white'}`}
                      onClick={() => toggleSelection(media.id)}
                    >
                      {selected ? <Check size={16} /> : <Image size={16} />}
                    </button>
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs font-black text-white">
                      {Math.round(match.score * 100)}%
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {!isSearching && matches.length === 0 && !error && diagnostics ? (
          <div className="mt-5 rounded-xl border border-[var(--line-strong)] p-5 text-sm font-bold text-[var(--muted)]">
            <p className="text-[var(--text)]">Aucune photo correspondante trouvee.</p>
            {diagnostics.indexedFaces === 0 ? (
              <p className="mt-2">Les photos de cet acces ne sont peut-etre pas encore indexees.</p>
            ) : null}
            {diagnostics.selfieWarnings?.length ? (
              <p className="mt-2">{diagnostics.selfieWarnings.join(' ')}</p>
            ) : null}
          </div>
        ) : null}

        {!isSearching && matches.length === 0 && !error && !diagnostics && !hasSearched ? (
          <div className="mt-5 rounded-xl border border-dashed border-[var(--line-strong)] p-5 text-sm font-bold text-[var(--muted)]">
            Les resultats apparaitront ici apres l'envoi du selfie.
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default MyPhotosModal;
