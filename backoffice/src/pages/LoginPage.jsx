import { LockKeyhole, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Field } from '../components/ui';
import useAuth from '../hooks/useAuth';
import { inputClass } from '../utils/styleClasses';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Connexion en cours...');

    try {
      await login(form.email, form.password);
      toast.success('Session ouverte', { id: toastId });
      navigate('/events', { replace: true });
    } catch (loginError) {
      toast.error(loginError.message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="grid min-h-svh place-items-center bg-neutral-200 p-6 text-neutral-950">
      <section className="w-[min(410px,100%)] rounded-lg border border-neutral-200 bg-white p-8 shadow-[0_28px_80px_rgba(0,0,0,0.12)]">
        <div className="mb-7">
          <span className="block text-3xl font-black text-black">Deka.</span>
        </div>
        <h1 className="text-2xl font-black">Connexion</h1>
        <form className="mt-6 grid gap-3.5" onSubmit={handleSubmit}>
          <Field label="Email">
            <input
              className={`${inputClass} min-h-[42px]`}
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="admin@example.com"
              required
            />
          </Field>
          <Field label="Mot de passe">
            <input
              className={`${inputClass} min-h-[42px]`}
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Mot de passe"
              required
            />
          </Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <LockKeyhole size={16} />}
            Se connecter
          </Button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
