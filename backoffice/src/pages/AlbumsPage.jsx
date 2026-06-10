import { Edit3, Folder, FolderPlus, Image, Loader2, LockKeyhole, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAlbum, deleteAlbum, fetchAccessRoles, updateAlbum } from '../api';
import { Button, Field, Notice } from '../components/ui';
import useEvents from '../hooks/useEvents';
import { inputClass } from '../utils/styleClasses';

const emptyAlbumForm = { title: '', description: '', accessRoleIds: [], isPublished: true };

function AlbumsPage() {
  const navigate = useNavigate();
  const { events, loadEvents } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState(() => events[0]?.id || null);
  const [accessRoles, setAccessRoles] = useState([]);
  const [form, setForm] = useState(emptyAlbumForm);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
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

  function selectEvent(eventId) {
    setSelectedEventId(eventId);
    setEditingAlbumId(null);
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

    setEditingAlbumId(album.id);
    setForm({
      title: album.title || '',
      description: album.description || '',
      accessRoleIds,
      isPublished: Boolean(album.isPublished),
    });
  }

  async function saveAlbum(event) {
    event.preventDefault();
    if (!selectedEvent?.id) return;

    setIsSaving(true);
    setError('');
    setNotice('');

    try {
      if (editingAlbumId) {
        await updateAlbum(editingAlbumId, form);
      } else {
        await createAlbum(selectedEvent.id, form);
      }
      setEditingAlbumId(null);
      setForm(emptyAlbumForm);
      setNotice(editingAlbumId ? 'Album mis a jour' : 'Album cree');
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
      if (editingAlbumId === album.id) {
        setEditingAlbumId(null);
        setForm(emptyAlbumForm);
      }
      setNotice('Album supprime');
      await loadEvents();
      if (selectedEvent?.id) setAccessRoles(await fetchAccessRoles(selectedEvent.id));
    } catch (albumError) {
      setError(albumError.message);
    }
  }

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-4 flex items-center justify-between gap-3.5">
        <div>
          <h2 className="text-[22px] font-black">Albums photos</h2>
          <p className="mt-1 text-neutral-500">Creer les dossiers et choisir si l'acces est public evenement ou limite aux badges.</p>
        </div>
      </div>

      {notice ? <Notice>{notice}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}

      <div className="grid min-w-0 grid-cols-[minmax(300px,360px)_minmax(0,1fr)] gap-3.5 max-[760px]:grid-cols-1">
        <div className="self-start rounded border border-neutral-200 bg-white p-[18px]">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div>
              <h3 className="mb-1 text-base font-black">{editingAlbumId ? 'Modifier album' : 'Nouvel album'}</h3>
              <p className="text-[13px] text-neutral-500">Choisissez Tout ou des badges specifiques.</p>
            </div>
            <FolderPlus size={20} />
          </div>

          <form className="grid gap-3.5" onSubmit={saveAlbum}>
            <Field label="Evenement">
              <select className={`${inputClass} min-h-[38px]`} value={selectedEvent?.id || ''} onChange={(event) => selectEvent(Number(event.target.value))}>
                <option value="" disabled>Choisir un evenement</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Nom de l'album">
              <input className={`${inputClass} min-h-[38px]`} value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Photos officielles, Cocktail, VIP..." />
            </Field>
            <Field label="Description">
              <textarea className={`${inputClass} min-h-[84px] resize-y py-2.5`} value={form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Optionnel" />
            </Field>

            <div className="grid gap-2.5">
              <label className="inline-flex w-fit items-center gap-2.5 text-[13px] font-extrabold">
                <input type="checkbox" className="h-5 w-5 accent-black" checked={form.isPublished} onChange={(event) => updateForm('isPublished', event.target.checked)} />
                Dossier actif
              </label>
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

            <Button type="submit" disabled={isSaving || !selectedEvent?.id}>
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              {editingAlbumId ? 'Mettre a jour' : 'Creer album'}
            </Button>
          </form>
        </div>

        <div className="min-w-0 overflow-x-clip">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-black">Dossiers</h3>
              <p className="text-[13px] text-neutral-500">{albums.length} albums</p>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-4">
            {albums.length === 0 ? (
              <div className="grid min-h-[220px] place-items-center content-center gap-2 rounded border border-neutral-200 bg-white p-[18px] font-extrabold text-neutral-500">
                <Image size={24} />
                <p>Aucun album pour cet evenement.</p>
              </div>
            ) : null}
            {albums.map((album) => (
              <article className={`relative grid min-h-[236px] min-w-0 cursor-pointer grid-rows-[156px_auto] gap-3 rounded-lg border bg-white p-2.5 shadow-[0_14px_34px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-black hover:shadow-[0_18px_48px_rgba(0,0,0,0.08)] ${editingAlbumId === album.id ? 'border-black' : 'border-neutral-200'}`} key={album.id} onClick={() => navigate(`/albums/${album.slug}`)}>
                <div className="absolute right-[18px] top-[18px] z-10 flex gap-1.5">
                  <Button tone="soft" className="h-[30px] min-h-0 w-[30px] px-0" onClick={(event) => { event.stopPropagation(); editAlbum(album); }} title="Modifier">
                    <Edit3 size={15} />
                  </Button>
                  <Button tone="danger" className="h-[30px] min-h-0 w-[30px] px-0" onClick={(event) => { event.stopPropagation(); removeAlbum(album); }} title="Supprimer">
                    <Trash2 size={15} />
                  </Button>
                </div>
                <div className="relative flex min-h-0 items-stretch justify-between overflow-hidden rounded bg-gradient-to-br from-[#e8ffd5] to-neutral-100 p-0 text-black">
                  <Folder className="absolute bottom-7 left-7" size={54} strokeWidth={1.8} />
                  <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5">
                    <span className={`inline-flex min-h-[25px] items-center rounded-full px-2.5 text-[11px] font-black ${album.isPublished ? 'bg-black text-[#9cff00]' : 'bg-neutral-200 text-neutral-950'}`}>
                      {album.isPublished ? 'Actif' : <LockKeyhole size={13} />}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black leading-tight [overflow-wrap:anywhere]">{album.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AlbumsPage;
