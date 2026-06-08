import { LockKeyhole, Loader2 } from 'lucide-react';

function LoginPage({ form, error, isLoading, onChange, onSubmit }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span>Deka.</span>
          <small>EventCover Admin</small>
        </div>
        <div>
          <p className="section-kicker">Back-office interne</p>
          <h1>Connexion</h1>
          <p className="login-copy">Gestion des evenements, albums, medias et liens QR.</p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChange('email', event.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>
          <label>
            Mot de passe
            <input
              type="password"
              value={form.password}
              onChange={(event) => onChange('password', event.target.value)}
              placeholder="Mot de passe"
              required
            />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="spin" size={16} /> : <LockKeyhole size={16} />}
            Se connecter
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
