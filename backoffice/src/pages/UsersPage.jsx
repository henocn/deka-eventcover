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

// Page de gestion des utilisateurs backoffice (super admin).
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
    const isHardDelete = !user.isActive;
    const confirmMessage = isHardDelete
      ? `Supprimer definitivement le compte "${user.fullName}" ? Cette action est irreversible.`
      : `Desactiver le compte "${user.fullName}" ?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteUser(user.id);
      toast.success(isHardDelete ? 'Compte supprime definitivement' : 'Compte desactive');
      await loadUsers();
    } catch (deleteError) {
      toast.error(deleteError.message);
    }
  }

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-6 flex items-end justify-between gap-4 max-[860px]:flex-col max-[860px]:items-stretch">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">Utilisateurs</h2>
          <p className="mt-1 text-sm text-neutral-500">Comptes avec acces au backoffice</p>
        </div>

        <div className="flex items-end gap-2.5 max-[760px]:flex-col max-[760px]:items-stretch">
          <Field className="w-[min(320px,55vw)] max-[760px]:w-full">
            <input
              className={`${inputClass} min-h-[38px]`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher..."
            />
          </Field>
          <Button onClick={openCreateModal}>
            <Plus size={16} />
            Creer
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-black bg-white">
        <div className="grid grid-cols-[minmax(200px,1.3fr)_minmax(200px,1fr)_120px_100px_100px] items-center gap-4 border-b border-black/20 bg-neutral-50/80 px-4 py-3 text-xs font-semibold text-neutral-500 max-[980px]:hidden">
          <span>Utilisateur</span>
          <span>Email</span>
          <span>Role</span>
          <span>Statut</span>
          <span className="text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="grid min-h-52 place-items-center text-neutral-500">
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <Loader2 className="animate-spin" size={16} />
              Chargement...
            </span>
          </div>
        ) : null}

        {!isLoading && filteredUsers.length === 0 ? (
          <div className="grid min-h-52 place-items-center p-6 text-center text-sm font-medium text-neutral-500">
            Aucun utilisateur trouve.
          </div>
        ) : null}

        {!isLoading && filteredUsers.map((user) => (
          <article
            key={user.id}
            className="grid grid-cols-[minmax(200px,1.3fr)_minmax(200px,1fr)_120px_100px_100px] items-center gap-4 border-b border-black/15 px-4 py-3 last:border-b-0 transition hover:bg-neutral-50 max-[980px]:grid-cols-1 max-[980px]:gap-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-neutral-100 text-neutral-700">
                <UserRound size={16} />
              </span>
              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-neutral-950">{user.fullName}</strong>
                {currentUser?.id === user.id ? (
                  <span className="mt-0.5 inline-flex rounded border border-black/20 bg-[#9cff00]/40 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-800">
                    Vous
                  </span>
                ) : null}
              </div>
            </div>
            <span className="min-w-0 truncate text-sm text-neutral-600">{user.email}</span>
            <span className="w-fit rounded border border-black/15 bg-white px-2 py-0.5 text-xs font-medium text-neutral-700">
              {roleLabel(user.role)}
            </span>
            <span
              className={`w-fit rounded border px-2 py-0.5 text-xs font-medium ${
                user.isActive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {user.isActive ? 'Actif' : 'Inactif'}
            </span>
            <div className="flex justify-end gap-2 max-[980px]:justify-start">
              <Button
                tone="icon"
                className="h-10 min-h-10 w-10 border-black px-0 text-neutral-950"
                onClick={() => openEditModal(user)}
                title="Modifier"
              >
                <Edit3 size={18} />
              </Button>
              <Button
                tone="danger"
                className="h-10 min-h-10 w-10 border-black px-0 text-red-600"
                onClick={() => removeUser(user)}
                title={user.isActive ? 'Desactiver' : 'Supprimer definitivement'}
                disabled={currentUser?.id === user.id}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </article>
        ))}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4" onMouseDown={closeModal}>
          <section
            className="max-h-[92svh] w-[min(480px,100%)] overflow-y-auto rounded-lg border border-black bg-white p-5 shadow-lg"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-black/15 pb-3">
              <div>
                <p className="text-xs font-medium text-neutral-500">{editingUser ? 'Edition' : 'Creation'}</p>
                <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-neutral-950">
                  {editingUser ? editingUser.fullName : 'Nouvel utilisateur'}
                </h3>
              </div>
              <Button tone="soft" className="h-8 min-h-0 w-8 px-0" onClick={closeModal}>
                <X size={16} />
              </Button>
            </div>

            <form className="grid gap-3" onSubmit={saveUser}>
              <Field label="Nom complet">
                <input
                  className={`${inputClass} min-h-[38px]`}
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  placeholder="Nom complet"
                  required
                />
              </Field>
              <Field label="Email">
                <input
                  className={`${inputClass} min-h-[38px]`}
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="admin@domaine.com"
                  required
                />
              </Field>
              <Field label={editingUser ? 'Nouveau mot de passe' : 'Mot de passe'}>
                <input
                  className={`${inputClass} min-h-[38px]`}
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                  placeholder={editingUser ? 'Laisser vide pour conserver' : 'Minimum 8 caracteres'}
                  required={!editingUser}
                />
              </Field>
              <Field label="Role">
                <select
                  className={`${inputClass} min-h-[38px]`}
                  value={form.role}
                  onChange={(event) => updateField('role', event.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>
              </Field>
              <label className="inline-flex w-fit items-center gap-2 text-sm font-medium text-neutral-800">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-black"
                  checked={form.isActive}
                  onChange={(event) => updateField('isActive', event.target.checked)}
                  disabled={editingUser?.id === currentUser?.id}
                />
                Compte actif
              </label>

              <div className="mt-1 flex justify-end gap-2">
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
