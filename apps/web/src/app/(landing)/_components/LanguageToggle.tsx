'use client';

import type { Lang } from '../_content/content';

type Variant = 'glass' | 'editorial' | 'brutal';

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
  variant?: Variant;
}

export function LanguageToggle({ lang, onChange, variant = 'glass' }: Props) {
  const isUa = lang === 'ua';

  const wrapClass = {
    glass:
      'inline-flex items-center rounded-full glass-subtle p-1 text-xs font-semibold',
    editorial:
      'inline-flex items-center rounded-full border border-neutral-300 bg-white p-0.5 text-[11px] font-medium tracking-[0.15em] uppercase',
    brutal:
      'inline-flex items-center rounded-none border border-white/30 p-0 text-[11px] font-bold tracking-[0.2em] uppercase',
  }[variant];

  const pillClass = (active: boolean) => {
    if (variant === 'editorial') {
      return `px-3 py-1 rounded-full transition-colors ${
        active ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'
      }`;
    }
    if (variant === 'brutal') {
      return `px-3 py-1.5 transition-colors ${
        active ? 'bg-[#FFD400] text-black' : 'text-white/80 hover:bg-white/10'
      }`;
    }
    return `px-3 py-1 rounded-full transition-all ${
      active
        ? 'bg-white/90 dark:bg-white text-gray-900 shadow-sm'
        : 'text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white'
    }`;
  };

  return (
    <div className={wrapClass} role="group" aria-label="Language toggle">
      <button
        type="button"
        onClick={() => onChange('ua')}
        className={pillClass(isUa)}
        aria-pressed={isUa}
      >
        UA
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={pillClass(!isUa)}
        aria-pressed={!isUa}
      >
        EN
      </button>
    </div>
  );
}
