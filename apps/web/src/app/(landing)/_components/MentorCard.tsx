import type { Lang } from '../_content/content';
import { content, t } from '../_content/content';

type Variant = 'glass' | 'editorial' | 'brutal';

type Mentor = (typeof content.mentors.items)[number];

interface Props {
  mentor: Mentor;
  lang: Lang;
  variant: Variant;
  index?: number;
}

const gradientFor = (i: number) => {
  const palette = [
    'from-primary-500 to-secondary-500',
    'from-secondary-500 to-accent-500',
    'from-accent-500 to-primary-500',
    'from-primary-400 to-primary-700',
    'from-secondary-400 to-secondary-700',
    'from-accent-400 to-accent-700',
    'from-primary-500 to-accent-500',
    'from-secondary-500 to-primary-500',
  ];
  return palette[i % palette.length];
};

export function MentorCard({ mentor, lang, variant, index = 0 }: Props) {
  const name = t(mentor.name, lang);
  const role = t(mentor.role, lang);

  if (variant === 'editorial') {
    return (
      <div className="group">
        <div className="aspect-[4/5] w-full overflow-hidden rounded-md bg-neutral-200 mb-3 relative">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradientFor(
              index
            )} opacity-60`}
          />
          <div className="absolute inset-0 flex items-center justify-center text-5xl font-serif text-white/80">
            {mentor.initials}
          </div>
        </div>
        <p className="font-serif text-lg leading-tight text-neutral-900">
          {name}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">{role}</p>
      </div>
    );
  }

  if (variant === 'brutal') {
    return (
      <div className="shrink-0 w-[260px] border border-white/20 bg-black/40 p-5">
        <div
          className={`w-full aspect-square mb-4 bg-gradient-to-br ${gradientFor(
            index
          )} flex items-center justify-center text-4xl font-black text-black/70`}
        >
          {mentor.initials}
        </div>
        <p className="text-white font-bold uppercase tracking-wider text-sm">
          {name}
        </p>
        <p className="text-[#FFD400]/80 text-xs mt-1 uppercase tracking-widest">
          {role}
        </p>
      </div>
    );
  }

  return (
    <div className="card-glass group text-center">
      <div
        className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${gradientFor(
          index
        )} flex items-center justify-center text-white text-xl font-bold mb-4 shadow-glow-primary transition-transform group-hover:scale-110`}
      >
        {mentor.initials}
      </div>
      <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role}</p>
    </div>
  );
}
