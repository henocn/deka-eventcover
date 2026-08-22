import { useTranslation } from 'react-i18next';

// Permet de basculer entre francais et anglais pour l'interface.
function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'fr';

  function setLanguage(language) {
    i18n.changeLanguage(language);
  }

  return (
    <div
      className="inline-flex min-h-11 items-center rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-1 backdrop-blur"
      role="group"
      aria-label={t('language.switch')}
    >
      <button
        type="button"
        className={`min-h-9 rounded-full px-3 text-xs font-black uppercase tracking-wide transition ${current === 'fr' ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
        onClick={() => setLanguage('fr')}
      >
        {t('language.fr')}
      </button>
      <button
        type="button"
        className={`min-h-9 rounded-full px-3 text-xs font-black uppercase tracking-wide transition ${current === 'en' ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
        onClick={() => setLanguage('en')}
      >
        {t('language.en')}
      </button>
    </div>
  );
}

export default LanguageToggle;
