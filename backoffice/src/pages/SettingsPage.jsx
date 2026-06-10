import { Loader2, Save, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Field } from '../components/ui';
import useAuth from '../hooks/useAuth';
import { inputClass } from '../utils/styleClasses';

function SettingsPage() {
  const { updateProfile, user } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    currentPassword: '',
    newPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings(event) {
    event.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Mise a jour du profil...');

    const payload = {
      fullName: form.fullName,
    };

    if (form.currentPassword || form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    try {
      await updateProfile(payload);
      setForm((current) => ({
        ...current,
        currentPassword: '',
        newPassword: '',
      }));
      toast.success('Profil mis a jour', { id: toastId });
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="min-w-0 px-6 pb-8 pt-6 max-[760px]:p-4">
      <div className="mb-5">
        <h2 className="text-[22px] font-black">Parametres</h2>
        <p className="mt-1 text-neutral-500">Gerez les informations du compte administrateur.</p>
      </div>

      <form className="grid max-w-2xl gap-5" onSubmit={saveSettings}>
        <div className="rounded border border-neutral-300 bg-white p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black text-[#9cff00]">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h3 className="text-lg font-black">Identite</h3>
              <p className="text-sm text-neutral-500">L'email est affiche pour reference et ne peut pas etre modifie ici.</p>
            </div>
          </div>

          <div className="grid gap-3.5">
            <Field label="Nom complet">
              <input
                className={`${inputClass} min-h-[42px]`}
                value={form.fullName}
                onChange={(event) => updateField('fullName', event.target.value)}
                placeholder="Nom complet"
                required
              />
            </Field>
            <Field label="Email">
              <input
                className={`${inputClass} min-h-[42px] cursor-not-allowed bg-neutral-100 text-neutral-500`}
                value={user?.email || ''}
                readOnly
              />
            </Field>
          </div>
        </div>

        <div className="rounded border border-neutral-300 bg-white p-5">
          <h3 className="mb-1 text-lg font-black">Mot de passe</h3>
          <p className="mb-4 text-sm text-neutral-500">Laissez vide si vous ne souhaitez pas le changer.</p>

          <div className="grid gap-3.5">
            <Field label="Mot de passe actuel">
              <input
                className={`${inputClass} min-h-[42px]`}
                type="password"
                value={form.currentPassword}
                onChange={(event) => updateField('currentPassword', event.target.value)}
                placeholder="Mot de passe actuel"
              />
            </Field>
            <Field label="Nouveau mot de passe">
              <input
                className={`${inputClass} min-h-[42px]`}
                type="password"
                value={form.newPassword}
                onChange={(event) => updateField('newPassword', event.target.value)}
                placeholder="Minimum 8 caracteres"
              />
            </Field>
          </div>
        </div>

        <div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Enregistrer
          </Button>
        </div>
      </form>
    </section>
  );
}

export default SettingsPage;
