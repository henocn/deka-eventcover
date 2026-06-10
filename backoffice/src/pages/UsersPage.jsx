import { Edit3, Loader2, Plus, ShieldCheck, Trash2, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createUser, deleteUser, fetchUsers, updateUser } from '../api';
import { Button, Field } from '../components/ui';
import useAuth from '../hooks/useAuth';
import { inputClass } from '../utils/styleClasses';

const emptyUserForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'admin',
  isActive: true,
};

function roleLabel(role) {
  return role === 'super_admin' ? 'Super admin' : 'Admin';
}

function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyUserForm);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      setUsers(await fetchUsers());
    } catch (usersError) {
      toast.error(usersError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) queueMicrotask(() => loadUsers());
  }, [isSuperAdmin, loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) => [user.fullName, user.email, user.role]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery)));
  }, [query, users]);

  if (!isSuperAdmin) {
    return <Navigate to="/events" replace />;
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateModal() {
    setEditingUser(null);
    setForm(emptyUserForm);
    setIsModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      role: user.role || 'admin',
      isActive: Boolean(user.isActive),
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
    setForm(emptyUserForm);
  }

  async function saveUser(event) {
    event.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading(editingUser ? 'Mise a jour du compte...' : 'Creation du compte...');

    const payload = {
      fullName: form.fullName,
      email: form.email,
      role: form.role,
      isActive: form.isActive,
    };

    if (form.password) payload.password = form.password;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await createUser({ ...payload, password: form.password });
      }

      toast.success(editingUser ? 'Compte mis a jour' : 'Compte cree', { id: toastId });
      closeModal();
      await loadUsers();
    } catch (saveError) {
      toast.error(saveError.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  }

  async function removeUser(user) {
    if (!window.confirm(`Desactiver le compte "${user.fullName}" ?`)) return;

    try {
      await deleteUser(user.id);
      toast.success('Compte desactive');
      await loadUsers();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  }

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-6 flex items-end justify-between gap-4 max-[760px]:flex-col max-[760px]:items-stretch">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-black uppercase text-[#9cff00]">
            <ShieldCheck size={14} />
            Super admin
          </p>
          <h2 className="text-[24px] font-black">Utilisateurs</h2>
          <p className="mt-1 text-sm font-bold text-neutral-500">Gerez les comptes qui accedent au backoffice.</p>
        </div>

        <div className="flex items-end gap-3 max-[760px]:flex-col max-[760px]:items-stretch">
          <Field label="Recherche" className="w-[min(340px,48vw)] max-[760px]:w-full">
            <input className={`${inputClass} min-h-[40px]`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, email, role..." />
          </Field>
          <Button onClick={openCreateModal}>
            <Plus size={16} />
            Creer
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm">
        <div className="grid grid-cols-[minmax(220px,1.4fr)_minmax(220px,1fr)_140px_120px_120px] items-center gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-black uppercase text-neutral-500 max-[980px]:hidden">
          <span>Utilisateur</span>
          <span>Email</span>
          <span>Role</span>
          <span>Statut</span>
          <span className="text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="grid min-h-52 place-items-center text-neutral-500">
            <span className="inline-flex items-center gap-2 font-black">
              <Loader2 className="animate-spin" size={18} />
              Chargement...
            </span>
          </div>
        ) : null}

        {!isLoading && filteredUsers.length === 0 ? (
          <div className="grid min-h-52 place-items-center p-6 text-center font-extrabold text-neutral-500">
            Aucun utilisateur trouve.
          </div>
        ) : null}

        {!isLoading && filteredUsers.map((user) => (
          <article key={user.id} className="grid grid-cols-[minmax(220px,1.4fr)_minmax(220px,1fr)_140px_120px_120px] items-center gap-4 border-b border-neutral-200 px-4 py-3 last:border-b-0 max-[980px]:grid-cols-1 max-[980px]:gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-[#9cff00]">
                <UserRound size={17} />
              </span>
              <div className="min-w-0">
                <strong className="block truncate font-black">{user.fullName}</strong>
                {currentUser?.id === user.id ? (
                  <span className="mt-0.5 inline-flex rounded-full bg-[#9cff00] px-2 py-0.5 text-[11px] font-black text-black">
                    Vous
                  </span>
                ) : null}
              </div>
            </div>
            <span className="min-w-0 truncate text-sm font-bold text-neutral-600">{user.email}</span>
            <span className="w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-black text-neutral-800">{roleLabel(user.role)}</span>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-black ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {user.isActive ? 'Actif' : 'Inactif'}
            </span>
            <div className="flex justify-end gap-2 max-[980px]:justify-start">
              <Button tone="icon" className="h-9 min-h-0 w-9 px-0" onClick={() => openEditModal(user)} title="Modifier">
                <Edit3 size={15} />
              </Button>
              <Button tone="danger" className="h-9 min-h-0 w-9 px-0" onClick={() => removeUser(user)} title="Desactiver" disabled={currentUser?.id === user.id || !user.isActive}>
                <Trash2 size={15} />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/45 p-4" onMouseDown={closeModal}>
          <section className="max-h-[92svh] w-[min(560px,100%)] overflow-y-auto rounded-xl bg-white p-6 shadow-[0_30px_100px_rgba(0,0,0,0.28)]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-neutral-200 pb-4">
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase text-neutral-500">{editingUser ? 'Edition' : 'Creation'}</p>
                <h3 className="text-2xl font-black">{editingUser ? editingUser.fullName : 'Nouvel utilisateur'}</h3>
              </div>
              <Button tone="soft" className="h-9 min-h-0 w-9 px-0" onClick={closeModal}>
                <X size={18} />
              </Button>
            </div>

            <form className="grid gap-3.5" onSubmit={saveUser}>
              <Field label="Nom complet">
                <input className={`${inputClass} min-h-[42px]`} value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Nom complet" required />
              </Field>
              <Field label="Email">
                <input className={`${inputClass} min-h-[42px]`} type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="admin@domaine.com" required />
              </Field>
              <Field label={editingUser ? 'Nouveau mot de passe' : 'Mot de passe'}>
                <input className={`${inputClass} min-h-[42px]`} type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder={editingUser ? 'Laisser vide pour conserver' : 'Minimum 8 caracteres'} required={!editingUser} />
              </Field>
              <Field label="Role">
                <select className={`${inputClass} min-h-[42px]`} value={form.role} onChange={(event) => updateField('role', event.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </Field>
              <label className="inline-flex w-fit items-center gap-2.5 text-[13px] font-extrabold">
                <input type="checkbox" className="h-5 w-5 accent-black" checked={form.isActive} onChange={(event) => updateField('isActive', event.target.checked)} disabled={editingUser?.id === currentUser?.id} />
                Compte actif
              </label>

              <div className="mt-2 flex justify-end gap-2">
                <Button tone="soft" onClick={closeModal}>Annuler</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  {editingUser ? 'Mettre a jour' : 'Creer'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default UsersPage;
