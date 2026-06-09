import { Moon, Sun } from 'lucide-react';

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <div type="button" className="border border-2 border-gray-300 rounded-full p-2 inline-flex items-center justify-center gap-2" onClick={onToggle} title="Changer le theme">
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
      <span>{isDark ? 'Clair' : 'Sombre'}</span>
    </div>
  );
}

export default ThemeToggle;
