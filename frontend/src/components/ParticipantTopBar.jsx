import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BrandLogo from './BrandLogo';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

// Barre superieure commune : logo, langue, theme et acces Mes photos.
function ParticipantTopBar({ theme, onThemeToggle, onMyPhotos, compact = false }) {
  const { t } = useTranslation();

  return (
    <div
      className={`mx-auto flex w-[min(1180px,100%)] items-center justify-between gap-5 max-[680px]:items-start max-[680px]:gap-4 ${compact ? 'pb-8 pt-1' : 'mb-10 pt-1'}`}
    >
      <BrandLogo />
      <div className="flex flex-wrap justify-end gap-2.5">
        <LanguageToggle />
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[color-mix(in_srgb,var(--accent)_88%,transparent)] px-4 font-black text-[var(--accent-ink)] shadow-[0_8px_24px_rgba(232,184,74,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:brightness-105"
          onClick={onMyPhotos}
        >
          <Camera size={17} />
          <span>{t('topBar.myPhotos')}</span>
        </button>
      </div>
    </div>
  );
}

export default ParticipantTopBar;
