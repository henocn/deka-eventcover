import { ArrowLeft, Image, Images, Loader2, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchAlbum, uploadAlbumMedia } from '../api';
import AdminMediaImage from '../components/media/AdminMediaImage';
import { Button } from '../components/ui';
import useEvents from '../hooks/useEvents';

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
    setIsUploading(true);
    const toastId = toast.loading('Upload en cours...');

    try {
      await uploadAlbumMedia(album.id, files);
      toast.success('Images ajoutees', { id: toastId });
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
              <input className="hidden" type="file" multiple accept="image/*" disabled={isUploading} onChange={(event) => uploadMedia(event.target.files)} />
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
                {item.type === 'image' ? (
                  <AdminMediaImage media={item} className="aspect-4/3 w-full object-cover" fallbackClassName="aspect-4/3 w-full" />
                ) : (
                  <div className="grid aspect-4/3 w-full place-items-center bg-neutral-100">
                    <Image size={20} />
                  </div>
                )}
                <figcaption className="overflow-hidden text-ellipsis whitespace-nowrap p-2 text-xs font-extrabold text-neutral-500">{item.originalName}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AlbumDetailsPage;
