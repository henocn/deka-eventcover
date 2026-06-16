import { ArrowLeft, ChevronLeft, ChevronRight, Image, Images, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchAlbum, uploadAlbumMedia } from '../api';
import AdminMediaImage from '../components/media/AdminMediaImage';
import { Button } from '../components/ui';
import useEvents from '../hooks/useEvents';

const MAX_UPLOAD_FILES = 100;
const UPLOAD_BATCH_SIZE = 10;

const FACE_STATUS_LABELS = {
  pending: 'Analyse en attente',
  processing: 'Analyse...',
  completed: 'Visages detectes',
  no_face: 'Aucun visage',
  failed: 'Analyse echouee',
};

const FACE_STATUS_CLASSES = {
  pending: 'bg-white/90 text-neutral-700',
  processing: 'bg-amber-100 text-amber-800',
  completed: 'bg-emerald-100 text-emerald-800',
  no_face: 'bg-neutral-100 text-neutral-700',
  failed: 'bg-red-100 text-red-700',
};

function AlbumDetailsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { events, loadEvents } = useEvents();
  const routeAlbum = useMemo(
    () => events.flatMap((event) => event.albums || []).find((album) => album.slug === slug) || null,
    [events, slug],
  );
  const albumId = routeAlbum?.id || null;
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);

  const loadAlbum = useCallback(async () => {
    if (!albumId) return;
    setIsLoading(true);

    try {
      setAlbum(await fetchAlbum(albumId));
    } catch (albumError) {
      setAlbum(null);
      toast.error(albumError.message);
    } finally {
      setIsLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    queueMicrotask(() => loadAlbum());
  }, [loadAlbum]);

  async function uploadMedia(files) {
    if (!album?.id || !files?.length) return;
    const selectedFiles = [...files];

    if (selectedFiles.length > MAX_UPLOAD_FILES) {
      toast.error(`Vous pouvez uploader ${MAX_UPLOAD_FILES} fichiers maximum en une seule fois.`);
      return;
    }

    setIsUploading(true);
    const totalFiles = selectedFiles.length;
    let savedFiles = 0;
    const toastId = toast.loading(`Sauvegarde en cours... 0/${totalFiles}`);

    try {
      for (let index = 0; index < selectedFiles.length; index += UPLOAD_BATCH_SIZE) {
        const batch = selectedFiles.slice(index, index + UPLOAD_BATCH_SIZE);
        const createdMedia = await uploadAlbumMedia(album.id, batch);
        savedFiles += createdMedia.length;
        toast.loading(`Sauvegardees ${savedFiles}/${totalFiles}`, { id: toastId });
      }

      toast.success(`${savedFiles}/${totalFiles} fichiers sauvegardes`, { id: toastId });
      await loadAlbum();
      await loadEvents();
    } catch (uploadError) {
      toast.error(uploadError.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  }

  const roles = album?.accessRoles || [];
  const media = album?.media || [];
  const imageMedia = media.filter((item) => item.type === 'image');
  const previewMedia = previewIndex !== null ? imageMedia[previewIndex] : null;

  function openPreview(mediaItem) {
    const nextIndex = imageMedia.findIndex((item) => item.id === mediaItem.id);
    if (nextIndex >= 0) setPreviewIndex(nextIndex);
  }

  function goToPreview(direction) {
    setPreviewIndex((current) => {
      if (current === null || imageMedia.length === 0) return current;
      return (current + direction + imageMedia.length) % imageMedia.length;
    });
  }

  return (
    <section className="px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-4 flex items-center justify-between gap-3.5">
        <Button tone="soft" onClick={() => navigate('/albums')}>
          <ArrowLeft size={16} />
          Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="inline-flex min-h-40 items-center gap-2 rounded border border-neutral-300 bg-white p-[18px] font-extrabold text-neutral-500">
          <Loader2 className="animate-spin" size={16} />
          Chargement du dossier...
        </div>
      ) : null}

      {!isLoading && !album ? (
        <div className="grid min-h-40 place-items-center content-center gap-2 rounded border border-neutral-300 bg-white p-[18px] font-extrabold text-neutral-500">
          <Images size={24} />
          <p>Dossier introuvable.</p>
        </div>
      ) : null}

      {!isLoading && album ? (
        <div className="grid gap-4 rounded border border-neutral-400 bg-white p-4">
          <div className="flex items-start justify-between gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">Dossier</p>
              <h3 className="mb-1.5 text-xl font-black">{album.title}</h3>
              <p className="text-neutral-500">{album.description}</p>
            </div>
            <label className="inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-2 rounded border border-black bg-black px-3.5 font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-50">
              <Upload size={16} />
              <span>{isUploading ? 'Upload...' : 'Upload'}</span>
              <input
                className="hidden"
                type="file"
                multiple
                accept="image/*"
                disabled={isUploading}
                onChange={async (event) => {
                  await uploadMedia(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>
          </div>

          <div className="grid items-start gap-3.5">
            <div>
              <div className="flex flex-wrap gap-2">
                {roles.length > 0 ? roles.map((role) => (
                  <span className="inline-flex min-h-[25px] items-center border border-black rounded-full bg-emerald-50 px-2.5 text-xs font-extrabold text-emerald-700" key={role.id}>{role.name}</span>
                )) : (
                  <span className="inline-flex min-h-[25px] items-center border border-black rounded-full bg-emerald-50 px-2.5 text-xs font-extrabold text-emerald-700">Tout</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2.5">
            {media.length === 0 ? (
              <div className="grid min-h-40 place-items-center content-center gap-2 rounded border border-neutral-300 bg-white p-[18px] font-extrabold text-neutral-500">
                <Image size={22} />
                <p>Aucune image dans ce dossier.</p>
              </div>
            ) : null}
            {media.map((item) => (
              <figure key={item.id} className="m-0 min-w-0 overflow-hidden rounded border border-neutral-300 bg-neutral-50 transition hover:border-[#9cff00] hover:ring-2 hover:ring-[#9cff00]/70">
                <div className="relative">
                  {item.type === 'image' ? (
                    <button
                      type="button"
                      className="block w-full cursor-zoom-in text-left"
                      onClick={() => openPreview(item)}
                    >
                      <AdminMediaImage media={item} className="aspect-4/3 w-full object-cover" fallbackClassName="aspect-4/3 w-full" />
                    </button>
                  ) : (
                    <div className="grid aspect-4/3 w-full place-items-center bg-neutral-100">
                      <Image size={20} />
                    </div>
                  )}
                  {item.type === 'image' ? (
                    <span className={`absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-full px-2 py-1 text-[10px] font-black ${FACE_STATUS_CLASSES[item.faceAnalysisStatus] || FACE_STATUS_CLASSES.pending}`}>
                      {FACE_STATUS_LABELS[item.faceAnalysisStatus] || FACE_STATUS_LABELS.pending}
                    </span>
                  ) : null}
                </div>
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      {previewMedia ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5"
          onMouseDown={() => setPreviewIndex(null)}
        >
          <div
            className="relative grid h-full w-full max-w-6xl grid-rows-[auto_1fr] gap-3"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 rounded border border-white/15 bg-black/45 px-3 py-2 text-white backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-white/55">Apercu image</p>
                <p className="truncate text-sm font-extrabold">{previewIndex + 1} / {imageMedia.length}</p>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded border border-white/25 bg-white/10 transition hover:border-[#9cff00] hover:text-[#9cff00]"
                onClick={() => setPreviewIndex(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative grid min-h-0 place-items-center rounded border border-white/15 bg-black/30 p-3">
              {imageMedia.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/55 text-white transition hover:border-[#9cff00] hover:text-[#9cff00]"
                    onClick={() => goToPreview(-1)}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/55 text-white transition hover:border-[#9cff00] hover:text-[#9cff00]"
                    onClick={() => goToPreview(1)}
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              ) : null}
              <AdminMediaImage
                media={previewMedia}
                className="max-h-full max-w-full rounded object-contain"
                fallbackClassName="h-80 w-full max-w-xl rounded"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AlbumDetailsPage;
