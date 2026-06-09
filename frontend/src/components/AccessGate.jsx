import { LockKeyhole } from 'lucide-react';

function AccessGate({ pendingCode, error, onChange, onSubmit }) {
  return (
    <main className="participant-shell access-screen">
      <section className="access-panel">
        <div className="access-icon">
          <LockKeyhole size={24} />
        </div>
        <p className="eyebrow">Evenement protege</p>
        <h1>Entrez le code d'acces</h1>
        <form onSubmit={onSubmit} className="access-form">
          <input
            value={pendingCode}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Code d'acces"
            autoFocus
          />
          <button type="submit">Continuer</button>
        </form>
        {error ? <p className="form-error">{error}</p> : null}
      </section>
    </main>
  );
}

export default AccessGate;
