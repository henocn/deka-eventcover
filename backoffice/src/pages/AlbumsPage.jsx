import { Edit3, FileImage, FolderPlus, Image, Loader2, LockKeyhole, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAlbum, deleteAlbum, fetchAccessRoles, updateAlbum } from '../api';
import AdminMediaImage from '../components/media/AdminMediaImage';
import { Button, Field, Notice } from '../components/ui';
import useEvents from '../hooks/useEvents';
import { inputClass } from '../utils/styleClasses';

const emptyAlbumForm = {
  title: '',
  description: '',
  accessRoleIds: [],
  coverMediaId: '',
  isPublished: true,
};

function albumFileCount(album) {
  return album.mediaCount ?? album.media?.length ?? 0;
}

function albumCover(album) {
  return album.coverMedia || album.media?.find((item) => item.type === 'image') || null;
}

function AlbumsPage() {
  const navigate = useNavigate();
  const { events, loadEvents } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState(() => events[0]?.id || null);
  const [accessRoles, setAccessRoles] = useState([]);
  const [form, setForm] = useState(emptyAlbumForm);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const effectiveSelectedEventId = selectedEventId || events[0]?.id || null;
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === effectiveSelectedEventId) || null,
    [effectiveSelectedEventId, events],
  );
  const albums = selectedEvent?.albums || [];
  const coverOptions = (editingAlbum?.media || []).filter((item) => item.type === 'image');
  const selectedCover = coverOptions.find((media) => media.id === Number(form.coverMediaId)) || null;

  useEffect(() => {
    if (!selectedEvent?.id) return;

    async function loadRoles() {
      setIsLoadingRoles(true);
      setError('');
      try {
        setAccessRoles(await fetchAccessRoles(selectedEvent.id));
      } catch (rolesError) {
        setAccessRoles([]);
        setError(rolesError.message);
      } finally {
        setIsLoadingRoles(false);
      }
    }

    loadRoles();
  }, [selectedEvent?.id]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingAlbum(null);
    setForm(emptyAlbumForm);
    setError('');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setIsCoverPickerOpen(false);
    setEditingAlbum(null);
    setForm(emptyAlbumForm);
  }

  function selectEvent(eventId) {
    setSelectedEventId(eventId);
    setEditingAlbum(null);
    setForm(emptyAlbumForm);
  }

  function toggleRole(roleId) {
    setForm((current) => {
      const hasRole = current.accessRoleIds.includes(roleId);
      return {
        ...current,
        accessRoleIds: hasRole
          ? current.accessRoleIds.filter((id) => id !== roleId)
          : [...current.accessRoleIds, roleId],
      };
    });
  }

  function editAlbum(album) {
    const accessRoleIds = accessRoles
      .filter((role) => (role.albums || []).some((item) => item.id === album.id))
      .map((role) => role.id);

    setEditingAlbum(album);
    setForm({
      title: album.title || '',
      description: album.description || '',
      accessRoleIds,
      coverMediaId: album.coverMediaId || '',
      isPublished: Boolean(album.isPublished),
    });
    setIsModalOpen(true);
  }

  async function saveAlbum(event) {
    event.preventDefault();
    if (!selectedEvent?.id) return;

    setIsSaving(true);
    setError('');
    setNotice('');

    const payload = {
      ...form,
      coverMediaId: form.coverMediaId ? Number(form.coverMediaId) : null,
    };

    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, payload);
      } else {
        await createAlbum(selectedEvent.id, {
          title: payload.title,
          description: payload.description,
          accessRoleIds: payload.accessRoleIds,
          isPublished: payload.isPublished,
        });
      }
      closeModal();
      setNotice(editingAlbum ? 'Album mis a jour' : 'Album cree');
      await loadEvents();
      setAccessRoles(await fetchAccessRoles(selectedEvent.id));
    } catch (albumError) {
      setError(albumError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAlbum(album) {
    if (!window.confirm(`Supprimer l'album "${album.title}" ?`)) return;

    try {
      await deleteAlbum(album.id);
      if (editingAlbum?.id === album.id) closeModal();
      setNotice('Album supprime');
      await loadEvents();
      if (selectedEvent?.id) setAccessRoles(await fetchAccessRoles(selectedEvent.id));
    } catch (albumError) {
      setError(albumError.message);
    }
  }

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-5 flex items-center justify-between gap-3.5 max-[760px]:items-start">
        <div>
          <h2 className="text-[22px] font-black">Albums photos</h2>
          <p className="mt-1 text-neutral-500">Organisez les dossiers photo, leurs acces et leurs couvertures.</p>
        </div>
        <Button className="shrink-0" onClick={openCreateModal}>
          <Plus size={16} />
          Creer
        </Button>
      </div>

      {notice ? <Notice>{notice}</Notice> : null}
      {error && !isModalOpen ? <Notice tone="error">{error}</Notice> : null}

      <div className="mb-5 flex items-center justify-between gap-4 rounded border border-neutral-200 bg-white p-4 max-[760px]:flex-col max-[760px]:items-stretch">
        <Field label="Evenement" className="w-[min(520px,100%)]">
          <select className={`${inputClass} min-h-[42px]`} value={selectedEvent?.id || ''} onChange={(event) => selectEvent(Number(event.target.value))}>
            <option value="" disabled>Choisir un evenement</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </Field>
        <div className="text-right max-[760px]:text-left">
          <strong className="block text-2xl font-black">{albums.length}</strong>
          <span className="text-sm font-bold text-neutral-500">albums</span>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-5">
        {albums.length === 0 ? (
          <div className="grid min-h-[260px] place-items-center content-center gap-2 rounded border border-neutral-200 bg-white p-6 font-extrabold text-neutral-500">
            <Image size={24} />
            <p>Aucun album pour cet evenement.</p>
          </div>
        ) : null}
        {albums.map((album) => {
          const cover = albumCover(album);
          const fileCount = albumFileCount(album);

          return (
            <article
              className="group relative min-w-0 cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_14px_34px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:border-black hover:shadow-[0_22px_60px_rgba(0,0,0,0.1)]"
              key={album.id}
              onClick={() => navigate(`/albums/${album.slug}`)}
            >
              <div className="absolute right-3 top-3 z-20 flex gap-2">
                <button className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/80 text-white shadow-lg backdrop-blur transition hover:bg-black" type="button" onClick={(event) => { event.stopPropagation(); editAlbum(album); }} title="Modifier">
                  <Edit3 size={15} />
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/95 text-red-600 shadow-lg backdrop-blur transition hover:bg-white" type="button" onClick={(event) => { event.stopPropagation(); removeAlbum(album); }} title="Supprimer">
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#e8ffd5] to-neutral-100">
                {cover ? (
                  <AdminMediaImage media={cover} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-black">
                    <FileImage size={56} strokeWidth={1.7} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className={`inline-flex min-h-[25px] items-center rounded-full px-2.5 text-[11px] font-black ${album.isPublished ? 'bg-black text-[#9cff00]' : 'bg-neutral-200 text-neutral-950'}`}>
                    {album.isPublished ? 'Actif' : <LockKeyhole size={13} />}
                  </span>
                  <span className="inline-flex min-h-[25px] items-center rounded-full bg-white/95 px-2.5 text-[11px] font-black text-neutral-950">
                    {fileCount} fichier{fileCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-black leading-tight [overflow-wrap:anywhere]">{album.title}</h3>
                {album.description ? <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{album.description}</p> : null}
              </div>
            </article>
          );
        })}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/45 p-4" onMouseDown={closeModal}>
          <section className="max-h-[92svh] w-[min(620px,100%)] overflow-y-auto rounded-xl bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,0.28)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">{editingAlbum ? 'Edition album' : 'Creation album'}</p>
                <h3 className="text-2xl font-black">{editingAlbum ? editingAlbum.title : 'Nouvel album'}</h3>
              </div>
              <Button tone="soft" className="h-9 min-h-0 w-9 px-0" onClick={closeModal}>
                <X size={18} />
              </Button>
            </div>

            {error ? <Notice tone="error">{error}</Notice> : null}

            <form className="grid gap-3.5" onSubmit={saveAlbum}>
              <Field label="Nom de l'album">
                <input className={`${inputClass} min-h-[42px]`} value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Photos officielles, Cocktail, VIP..." required />
              </Field>
              <Field label="Description">
                <textarea className={`${inputClass} min-h-[92px] resize-y py-2.5`} value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Optionnel" />
              </Field>

              <label className="inline-flex w-fit items-center gap-2.5 text-[13px] font-extrabold">
                <input type="checkbox" className="h-5 w-5 accent-black" checked={form.isPublished} onChange={(event) => updateForm('isPublished', event.target.checked)} />
                Dossier actif
              </label>

              {editingAlbum ? (
                <div className="grid gap-2">
                  <div className="text-[13px] font-extrabold text-neutral-950">Photo de couverture</div>
                  <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3 rounded border border-neutral-200 bg-neutral-50 p-2">
                    {selectedCover ? (
                      <AdminMediaImage media={selectedCover} className="aspect-square w-24 rounded object-cover" fallbackClassName="aspect-square w-24 rounded" />
                    ) : (
                      <div className="grid aspect-square w-24 place-items-center rounded bg-white text-neutral-500">
                        <Image size={22} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <strong className="block text-sm font-black">{selectedCover ? selectedCover.originalName : 'Couverture automatique'}</strong>
                      <p className="mt-1 text-xs font-bold text-neutral-500">
                        {selectedCover ? 'Cette image sera utilisee sur la carte album.' : 'La premiere image disponible sera utilisee par defaut.'}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button tone="soft" type="button" onClick={() => setIsCoverPickerOpen(true)} disabled={coverOptions.length === 0}>
                          Choisir une image
                        </Button>
                        {selectedCover ? (
                          <Button tone="soft" type="button" onClick={() => updateForm('coverMediaId', '')}>
                            Retirer
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {coverOptions.length === 0 ? (
                    <p className="text-xs font-bold text-neutral-500">Ajoutez d'abord des images dans cet album pour choisir une couverture.</p>
                  ) : null}
                </div>
              ) : (
                <p className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm font-bold text-neutral-500">
                  La couverture pourra etre choisie apres l'ajout des premieres photos.
                </p>
              )}

              <div className="grid gap-2.5">
                <div className="inline-flex items-center gap-2 text-[13px] font-black">
                  <LockKeyhole size={15} />
                  Acces album
                </div>
                <label className="inline-flex min-h-8 w-fit items-center gap-2 rounded-full border border-black bg-neutral-50 px-2.5 text-xs font-extrabold">
                  <input type="checkbox" className="h-3.5 w-3.5 accent-black" checked={form.accessRoleIds.length === 0} onChange={(event) => event.target.checked && updateForm('accessRoleIds', [])} />
                  <span>Tout</span>
                </label>
                {isLoadingRoles ? (
                  <p className="inline-flex items-center gap-2 text-neutral-500">
                    <Loader2 className="animate-spin" size={15} />
                    Chargement des badges...
                  </p>
                ) : null}
                {!isLoadingRoles && accessRoles.length > 0 ? (
                  <div className="flex min-w-0 flex-wrap gap-2">
                    {accessRoles.map((role) => (
                      <label key={role.id} className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 text-xs font-extrabold">
                        <input className="h-3.5 w-3.5 accent-black" type="checkbox" checked={form.accessRoleIds.includes(role.id)} onChange={() => toggleRole(role.id)} />
                        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{role.name}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <Button tone="soft" onClick={closeModal}>Annuler</Button>
                <Button type="submit" disabled={isSaving || !selectedEvent?.id}>
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <FolderPlus size={16} />}
                  {editingAlbum ? 'Mettre a jour' : 'Creer album'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {isCoverPickerOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/55 p-4" onMouseDown={() => setIsCoverPickerOpen(false)}>
          <section className="max-h-[88svh] w-[min(760px,100%)] overflow-y-auto rounded-xl bg-white p-5 shadow-[0_30px_100px_rgba(0,0,0,0.32)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">Couverture album</p>
                <h3 className="text-2xl font-black">Choisir une image</h3>
              </div>
              <Button tone="soft" className="h-9 min-h-0 w-9 px-0" onClick={() => setIsCoverPickerOpen(false)}>
                <X size={18} />
              </Button>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
              {coverOptions.map((media) => {
                const selected = Number(form.coverMediaId) === media.id;

                return (
                  <button
                    key={media.id}
                    type="button"
                    className={`overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-black ${selected ? 'border-black ring-2 ring-[#9cff00]' : 'border-neutral-200'}`}
                    onClick={() => {
                      updateForm('coverMediaId', media.id);
                      setIsCoverPickerOpen(false);
                    }}
                  >
                    <AdminMediaImage media={media} className="aspect-square w-full object-cover" fallbackClassName="aspect-square w-full" />
                    <span className="block overflow-hidden text-ellipsis whitespace-nowrap px-2.5 py-2 text-xs font-extrabold text-neutral-700">{media.originalName}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default AlbumsPage;
