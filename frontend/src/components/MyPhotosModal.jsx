import { Loader2, Search, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { searchMyPhotos } from '../api';
import {
  saveMyPhotosEmbeddingCookie,
} from '../utils/participantCookies';

function MyPhotosModal({ accessCode, accessRole, eventSlug, onClose, onSearchComplete }) {
  const [isSearching, setIsSearching] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [error, setError] = useState('');

  async function runSearch(file) {
    if (!file) return;

    setIsSearching(true);
    setError('');
    setDiagnostics(null);

    try {
      const result = await searchMyPhotos(eventSlug, file, accessCode, accessRole);
      if (result.embedding) {
        saveMyPhotosEmbeddingCookie(eventSlug, accessRole, result.embedding);
      }

      if ((result.matches || []).length > 0) {
        onSearchComplete(result);
        return;
      }

      setDiagnostics(result.diagnostics || {});
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
        className="max-h-[92svh] w-[min(720px,100%)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.32)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {isSearching ? (
          <div className="grid min-h-[280px] place-items-center text-center">
            <div>
              <Loader2 className="mx-auto mb-4 animate-spin text-[var(--text)]" size={34} />
              <p className="text-lg font-black text-[var(--text)]">Recherche en cours...</p>
            </div>
          </div>
        ) : (
          <>
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">Recherche personnelle</p>
            <h2 className="m-0 text-2xl font-black text-[var(--text)]">Mes photos</h2>
            <p className="mt-2 max-w-xl text-sm font-bold text-[var(--muted)]">
              Prenez ou importez un selfie clair. Il est utilise uniquement pour la comparaison puis oublie.
            </p>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--line-strong)] text-[var(--text)] transition hover:border-[var(--accent)]" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 max-[640px]:grid-cols-1">
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-[var(--line-strong)] px-4 font-black text-[var(--text)] transition hover:border-[var(--accent)]">
            <Search size={18} />
            Prendre un selfie
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
            Importer
            <input
              className="hidden"
              type="file"
              accept="image/*"
              disabled={isSearching}
              onChange={(event) => runSearch(event.target.files?.[0])}
            />
          </label>
        </div>

        {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</p> : null}

        {!error && diagnostics ? (
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
          </>
        )}
      </section>
    </div>
  );
}

export default MyPhotosModal;
