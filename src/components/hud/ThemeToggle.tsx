import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex min-h-11 items-center border border-[var(--border-cyan)] px-3 text-left text-[var(--text-primary)]"
    >
      [THEME: {theme.toUpperCase()}]
    </button>
  );
}
