import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="border border-[var(--border-cyan)] px-2 py-1 text-left text-[var(--text-primary)]"
    >
      [THEME: {theme.toUpperCase()}]
    </button>
  );
}
