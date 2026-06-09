'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drafts = [
  { href: '/draft-2', label: '02 · Editorial' },
  { href: '/draft-3', label: '03 · Bold' },
];

export function DraftSwitcher() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2">
      <nav className="flex items-center gap-1 rounded-full bg-black/85 backdrop-blur-md p-1 text-xs font-medium text-white shadow-2xl ring-1 ring-white/10">
        <span className="px-3 py-1 text-white/40 uppercase tracking-wider text-[10px]">
          Draft
        </span>
        {drafts.map((d) => {
          const active = pathname?.startsWith(d.href);
          return (
            <Link
              key={d.href}
              href={d.href}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                active
                  ? 'bg-white text-black'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {d.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
