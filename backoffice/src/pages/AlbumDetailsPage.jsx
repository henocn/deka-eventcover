import { ArrowLeft, Image, Images, Loader2, Upload } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchAlbum, uploadAlbumMedia } from '../api';
import AdminMediaImage from '../components/media/AdminMediaImage';
import { Button, Notice, StatusPill } from '../components/ui';
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
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadAlbum = useCallback(async () => {
    if (!albumId) return;
    setIsLoading(true);
    setError('');

    try {
      setAlbum(await fetchAlbum(albumId));
    } catch (albumError) {
      setAlbum(null);
      setError(albumError.message);
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
    setError('');
    setNotice('');

    try {
      await uploadAlbumMedia(album.id, files);
      setNotice('Images ajoutees');
      await loadAlbum();
      await loadEvents();
    } catch (uploadError) {
      setError(uploadError.message);
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

      {notice ? <Notice>{notice}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      {isLoading ? (
        <div className="inline-flex min-h-40 items-center gap-2 rounded border border-neutral-200 bg-white p-[18px] font-extrabold text-neutral-500">
          <Loader2 className="animate-spin" size={16} />
          Chargement du dossier...
        </div>
      ) : null}

      {!isLoading && !album ? (
        <div className="grid min-h-40 place-items-center content-center gap-2 rounded border border-neutral-200 bg-white p-[18px] font-extrabold text-neutral-500">
          <Images size={24} />
          <p>Dossier introuvable.</p>
        </div>
      ) : null}

      {!isLoading && album ? (
        <div className="grid gap-4 rounded border border-neutral-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
            <div>
              <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">Dossier</p>
              <h3 className="mb-1.5 text-xl font-black">{album.title}</h3>
              <p className="text-neutral-500">{album.description || 'Aucune description renseignee.'}</p>
            </div>
            <div className="flex gap-2">
              <StatusPill status={album.isPublished ? 'published' : 'draft'}>
                {album.isPublished ? 'Actif' : 'Inactif'}
              </StatusPill>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_220px] items-start gap-3.5 max-[760px]:grid-cols-1">
            <div>
              <strong className="mb-2 block text-[13px]">Badges d'acces</strong>
              <div className="flex flex-wrap gap-2">
                {roles.length > 0 ? roles.map((role) => (
                  <span className="inline-flex min-h-[25px] items-center rounded-full bg-emerald-50 px-2.5 text-xs font-extrabold text-emerald-700" key={role.id}>{role.name}</span>
                )) : (
                  <span className="inline-flex min-h-[25px] items-center rounded-full bg-emerald-50 px-2.5 text-xs font-extrabold text-emerald-700">Tout</span>
                )}
              </div>
            </div>
            <label className="grid min-h-[92px] cursor-pointer place-items-center gap-2 rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-center text-[13px] font-black text-neutral-950">
              <Upload size={20} />
              <span>{isUploading ? 'Upload en cours...' : 'Upload massif'}</span>
              <input className="hidden" type="file" multiple accept="image/*" disabled={isUploading} onChange={(event) => uploadMedia(event.target.files)} />
            </label>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-2.5">
            {media.length === 0 ? (
              <div className="grid min-h-40 place-items-center content-center gap-2 rounded border border-neutral-200 bg-white p-[18px] font-extrabold text-neutral-500">
                <Image size={22} />
                <p>Aucune image dans ce dossier.</p>
              </div>
            ) : null}
            {media.map((item) => (
              <figure key={item.id} className="m-0 min-w-0 overflow-hidden rounded border border-neutral-200 bg-neutral-50">
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
