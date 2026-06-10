import { ArrowLeft, Copy, Download, Edit3, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { createAccessRole, deleteAccessRole, fetchAccessRoleQrCode, fetchAccessRoles, fetchStats } from '../api';
import { Button, Field, StatusPill } from '../components/ui';
import useEvents from '../hooks/useEvents';
import { formatDate, getEventStatus, getStatusLabel } from '../utils/eventUtils';
import { inputClass } from '../utils/styleClasses';

function EventDetailsPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { events } = useEvents();
  const event = useMemo(() => events.find((item) => item.slug === slug) || null, [events, slug]);
  const [stats, setStats] = useState(null);
  const [accessRoles, setAccessRoles] = useState([]);
  const [roleForm, setRoleForm] = useState({ name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  useEffect(() => {
    if (!event) return;

    async function loadDetails() {
      setIsLoading(true);
      setStats(null);
      setAccessRoles([]);

      try {
        const [statsResult, rolesResult] = await Promise.allSettled([
          fetchStats(event.id),
          fetchAccessRoles(event.id),
        ]);

        if (statsResult.status === 'fulfilled') setStats(statsResult.value);
        if (rolesResult.status === 'fulfilled') {
          const rolesWithQr = await Promise.all(
            rolesResult.value.map(async (role) => {
              try {
                return await fetchAccessRoleQrCode(event.id, role.id);
              } catch {
                return role;
              }
            }),
          );
          setAccessRoles(rolesWithQr);
        }

        const failed = [statsResult, rolesResult].find((result) => result.status === 'rejected');
        if (failed) toast.error(failed.reason.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDetails();
  }, [event]);

  async function saveAccessRole(formEvent) {
    formEvent.preventDefault();
    if (!event) return;

    setIsCreatingRole(true);
    const toastId = toast.loading('Creation du badge...');

    try {
      const created = await createAccessRole(event.id, roleForm);
      const createdWithQr = await fetchAccessRoleQrCode(event.id, created.id);
      setAccessRoles((current) => [createdWithQr, ...current]);
      setRoleForm({ name: '' });
      toast.success('Badge cree', { id: toastId });
    } catch (roleError) {
      toast.error(roleError.message, { id: toastId });
    } finally {
      setIsCreatingRole(false);
    }
  }

  async function removeAccessRole(role) {
    if (!window.confirm(`Supprimer le badge "${role.name}" ?`)) return;

    try {
      await deleteAccessRole(role.id);
      setAccessRoles((current) => current.filter((item) => item.id !== role.id));
      toast.success('Badge supprime');
    } catch (roleError) {
      toast.error(roleError.message);
    }
  }

  async function copyPublicUrl(role) {
    if (!role?.publicUrl) return;
    await navigator.clipboard.writeText(role.publicUrl);
    toast.success('Lien public copie');
  }

  if (!event) {
    return (
      <section className="p-6 max-[760px]:p-4">
        <Button tone="soft" onClick={() => navigate('/events')}>
          <ArrowLeft size={16} />
          Retour
        </Button>
      </section>
    );
  }

  const status = getEventStatus(event);

  return (
    <section className="px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-4 flex items-center justify-between gap-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
        <Button tone="soft" onClick={() => navigate('/events')}>
          <ArrowLeft size={16} />
          Retour
        </Button>
        <Button onClick={() => navigate('/events')}>
          <Edit3 size={16} />
          Edit
        </Button>
      </div>

      <div className="rounded border border-neutral-300 bg-white p-5">
        <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">Project details</p>
        <h2 className="mb-2 text-[28px] font-black">{event.title}</h2>
        <p className="max-w-[760px] text-neutral-500">{event.description || 'Aucune description renseignee.'}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5 text-neutral-500">
          <StatusPill status={status}>{getStatusLabel(status)}</StatusPill>
          <span className="inline-flex min-h-[26px] items-center rounded-full border border-neutral-300 bg-neutral-50 px-2.5 text-xs font-extrabold text-neutral-950">{formatDate(event.startsAt)}</span>
          {event.location ? (
            <span className="inline-flex min-h-[26px] max-w-[min(360px,100%)] items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-neutral-300 bg-neutral-50 px-2.5 text-xs font-extrabold text-neutral-950">
              <MapPin size={14} />
              {event.location}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3.5 max-[760px]:grid-cols-1">
        <div className="rounded border border-neutral-300 bg-white p-[18px]">
          <h3 className="mb-3.5 text-base font-black">Statistiques</h3>
          <div className="grid grid-cols-2 gap-2.5 max-[760px]:grid-cols-1">
            {[
              ['Albums', stats?.albumsCount ?? '-'],
              ['Medias', stats?.mediaCount ?? '-'],
              ['Vues', stats?.viewsCount ?? '-'],
              ['Downloads', stats?.downloadsCount ?? '-'],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-neutral-300 p-3">
                <span className="text-xs font-extrabold text-neutral-500">{label}</span>
                <strong className="mt-1.5 block text-2xl">{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border border-neutral-300 bg-white p-[18px]">
          <div className="mb-3.5 flex items-start justify-between gap-3">
            <div>
              <h3 className="mb-1 text-base font-black">Badges QR</h3>
              <p className="text-[13px] text-neutral-500">Chaque badge donne acces uniquement aux albums selectionnes.</p>
            </div>
            <span className="grid min-h-[30px] min-w-[30px] place-items-center rounded-full bg-black text-xs font-black text-[#9cff00]">{accessRoles.length}</span>
          </div>
          <form className="grid gap-3" onSubmit={saveAccessRole}>
            <Field label="Nom du badge">
              <input className={`${inputClass} min-h-[38px]`} value={roleForm.name} onChange={(inputEvent) => setRoleForm({ name: inputEvent.target.value })} placeholder="Presse, VIP, Staff..." />
            </Field>
            <Button type="submit" disabled={isCreatingRole}>
              {isCreatingRole ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Creer badge
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-3.5 grid gap-3">
        {isLoading ? (
          <div className="inline-flex items-center gap-2 rounded border border-neutral-300 bg-white p-[18px]">
            <Loader2 className="animate-spin" size={16} />
            Chargement des badges...
          </div>
        ) : null}
        {!isLoading && accessRoles.length === 0 ? (
          <div className="rounded border border-neutral-300 bg-white p-[18px] font-extrabold text-neutral-500">
            <p>Aucun badge QR pour cet evenement.</p>
          </div>
        ) : null}
        {accessRoles.map((role) => (
          <article className="grid grid-cols-[minmax(0,1fr)_180px] items-start gap-[22px] rounded border border-neutral-300 bg-white p-[18px] transition hover:border-[#9cff00] hover:ring-2 hover:ring-[#9cff00]/70 max-[760px]:grid-cols-1" key={role.id}>
            <div className="grid min-w-0 gap-3.5">
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">Role</p>
                <h3 className="mb-1 text-xl font-black">{role.name}</h3>
                {role.description ? <p className="text-neutral-500">{role.description}</p> : null}
              </div>
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">Dossiers d'acces</p>
                {(role.albums || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(role.albums || []).map((album) => (
                      <span className="inline-flex min-h-[25px] items-center rounded-full bg-emerald-50 px-2.5 text-xs font-extrabold text-emerald-700" key={album.id}>{album.title}</span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-[13px] font-bold">Aucun album rattache pour le moment.</p>
                )}
              </div>
              <p className="text-xs text-neutral-500 [overflow-wrap:anywhere]">{role.publicUrl}</p>
            </div>
            <div className="grid w-[180px] gap-2.5 max-[760px]:w-[min(220px,100%)]">
              {role.qrCodeDataUrl ? (
                <img className="aspect-square h-auto w-full rounded border border-neutral-300" src={role.qrCodeDataUrl} alt={`QR ${role.name}`} />
              ) : (
                <div className="grid aspect-square w-full place-items-center rounded border border-dashed border-neutral-200 font-black text-neutral-500">QR</div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <Button tone="soft" className="min-h-9 min-w-0 px-0" onClick={() => copyPublicUrl(role)} title="Copier le lien">
                  <Copy size={16} />
                </Button>
                {role.qrCodeDataUrl ? (
                  <a className="grid min-h-9 place-items-center rounded border border-neutral-300 bg-white text-neutral-950 transition hover:border-[#9cff00] hover:ring-1 hover:ring-[#9cff00]/70" href={role.qrCodeDataUrl} download={`qr-${event.slug}-${role.name}.png`} title="Telecharger le QR">
                    <Download size={16} />
                  </a>
                ) : null}
                <Button tone="danger" className="min-h-9 min-w-0 px-0" onClick={() => removeAccessRole(role)} title="Supprimer le badge">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EventDetailsPage;
