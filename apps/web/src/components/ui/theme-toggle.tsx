'use client';

import { useTheme } from '@/contexts/theme-context';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="glass-subtle hover:glass w-10 h-10 p-0 relative group"
      aria-label="Toggle theme"
    >
      {/* Sun icon - visible in dark mode */}
      <svg
        className={`absolute inset-0 m-auto h-5 w-5 transition-all duration-300 ${
          resolvedTheme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" strokeWidth="2" />
        <path
          strokeLinecap="round"
          strokeWidth="2"
          d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        />
      </svg>

      {/* Moon icon - visible in light mode */}
      <svg
        className={`absolute inset-0 m-auto h-5 w-5 transition-all duration-300 ${
          resolvedTheme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* System icon indicator (small badge) */}
      {theme === 'system' && (
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
}
