import { LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DisplayMessage from './DisplayMessage';
import LanguageToggle from './LanguageToggle';
import PppWatermarks from './PppWatermarks';
import SiteFooter from './SiteFooter';

function AccessGate({ pendingCode, error, onChange, onSubmit }) {
  const { t } = useTranslation();

  return (
    <main className="participant-shell participant-shell--landing grid min-h-svh place-items-center p-5 pb-0" data-theme="dark">
      <PppWatermarks />
      <div className="participant-shell__content grid w-full place-items-center">
      <div className="mb-6 flex w-[min(480px,100%)] justify-end">
        <LanguageToggle />
      </div>
      <section className="landing-card animate-fade-up w-[min(480px,100%)] rounded-[32px] border bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-7 shadow-[var(--shadow)]">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)]">
          <LockKeyhole size={24} />
        </div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--gold-text)]">{t('access.protectedEvent')}</p>
        <h1 className="m-0 text-[clamp(1.7rem,5vw,2.4rem)] font-black leading-none">{t('access.enterAccessCode')}</h1>
        <form onSubmit={onSubmit} className="mt-5 flex items-stretch gap-2.5 max-[680px]:flex-col">
          <input
            className="min-h-12 min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 font-bold text-[var(--text)]"
            value={pendingCode}
            onChange={(event) => onChange(event.target.value)}
            placeholder={t('access.accessCodePlaceholder')}
            autoFocus
          />
          <button type="submit" className="min-h-12 rounded-2xl border-2 border-[var(--gold-deep)] bg-[var(--accent)] px-5 font-black text-[var(--accent-ink)] transition hover:brightness-105">{t('common.continue')}</button>
        </form>
        {error ? <DisplayMessage message={error} className="participant-modal__error mt-4 block rounded-xl px-4 py-3 font-bold" as="p" /> : null}
      </section>
      <SiteFooter />
      </div>
    </main>
  );
}

export default AccessGate;
