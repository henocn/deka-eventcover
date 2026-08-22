import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function ThemeToggle({ theme, onToggle }) {
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 font-black text-[var(--text)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
      onClick={onToggle}
      title={t('theme.toggle')}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default ThemeToggle;
