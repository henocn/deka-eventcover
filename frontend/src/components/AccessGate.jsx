import { LockKeyhole } from 'lucide-react';

function AccessGate({ pendingCode, error, onChange, onSubmit }) {
  return (
    <main className="participant-shell grid min-h-svh place-items-center p-5">
      <section className="animate-fade-up w-[min(480px,100%)] rounded-[32px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-7 shadow-[var(--shadow)]">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--text)] text-[var(--accent)]">
          <LockKeyhole size={24} />
        </div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold)]">Evenement protege</p>
        <h1 className="m-0 text-[clamp(1.7rem,5vw,2.4rem)] font-black leading-none">Entrez le code d'acces</h1>
        <form onSubmit={onSubmit} className="mt-5 flex items-stretch gap-2.5 max-[680px]:flex-col">
          <input
            className="min-h-12 min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 font-bold text-[var(--text)]"
            value={pendingCode}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Code d'acces"
            autoFocus
          />
          <button type="submit" className="min-h-12 rounded-2xl border-2 border-[var(--line-strong)] bg-[var(--text)] px-5 font-black text-[var(--bg)] transition hover:border-[var(--accent)]">Continuer</button>
        </form>
        {error ? <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 font-bold text-red-700">{error}</p> : null}
      </section>
    </main>
  );
}

export default AccessGate;
