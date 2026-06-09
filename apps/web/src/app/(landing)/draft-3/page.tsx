'use client';

import { useState } from 'react';
import { Unbounded } from 'next/font/google';
import { content, t, type Lang } from '../_content/content';
import { LanguageToggle } from '../_components/LanguageToggle';
import { MentorCard } from '../_components/MentorCard';

const display = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

const YELLOW = '#FFD400';
const COBALT = '#1E40AF';

export default function Draft3Page() {
  const [lang, setLang] = useState<Lang>('ua');

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-[#FFD400] selection:text-black">
      <header className="sticky top-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{ background: YELLOW, boxShadow: `0 0 16px ${YELLOW}` }}
            />
            <span className={`${display.className} text-sm font-bold tracking-[0.25em] uppercase`}>
              {t(content.brand, lang)}
            </span>
          </div>
          <nav className={`${display.className} hidden md:flex items-center gap-6 text-[11px] uppercase tracking-[0.25em] text-white/60`}>
            <a href="#why" className="hover:text-white">{t(content.nav.why, lang)}</a>
            <a href="#how" className="hover:text-white">{t(content.nav.how, lang)}</a>
            <a href="#team" className="hover:text-white">{t(content.nav.team, lang)}</a>
            <a href="#stories" className="hover:text-white">{t(content.nav.stories, lang)}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} onChange={setLang} variant="brutal" />
            <a
              href="#apply"
              className={`${display.className} hidden sm:inline-flex items-center gap-1 px-4 py-2 text-[11px] uppercase tracking-[0.25em] font-bold text-black`}
              style={{ background: YELLOW }}
            >
              {t(content.nav.apply, lang)} ▸
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.4) 2px 3px)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24">
          <p className={`${display.className} text-xs uppercase tracking-[0.35em] text-white/50 mb-10`}>
            {t(content.hero.eyebrow, lang)}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7">
              <h1
                className={`${display.className} font-bold tracking-tighter leading-[0.85]`}
                style={{ fontSize: 'clamp(4rem, 14vw, 12rem)' }}
              >
                <span style={{ color: YELLOW }}>$2,5K</span>
                <br />
                <span className="text-white/30">—</span>
                <br />
                <span style={{ color: YELLOW }}>$5K</span>
                <span className={`${display.className} text-white/60 text-3xl md:text-5xl align-top ml-3`}>
                  /mo
                </span>
              </h1>
            </div>
            <div className="md:col-span-5 pb-4">
              <p className={`${display.className} text-2xl md:text-3xl font-medium leading-tight mb-4`}>
                {t(content.hero.headlineLine1, lang)}
              </p>
              <p className={`${display.className} text-2xl md:text-3xl font-medium leading-tight mb-6`} style={{ color: YELLOW }}>
                {t(content.hero.headlineLine2, lang)}
              </p>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                {t(content.hero.sub, lang)}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#apply"
                  className={`${display.className} inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.25em] font-bold text-black`}
                  style={{ background: YELLOW }}
                >
                  {t(content.hero.primaryCta, lang)} ▸
                </a>
                <a
                  href="#how"
                  className={`${display.className} inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs uppercase tracking-[0.25em] font-bold hover:bg-white/10 transition-colors`}
                >
                  {t(content.hero.secondaryCta, lang)} ▾
                </a>
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-3 border-t border-white/15">
            {content.stats.map((s, i) => (
              <div
                key={i}
                className={`py-6 ${i < 2 ? 'border-r border-white/15' : ''} px-4 md:px-6`}
              >
                <div className={`${display.className} text-3xl md:text-5xl font-bold`} style={{ color: YELLOW }}>
                  {t(s.value, lang)}
                </div>
                <div className={`${display.className} text-[10px] uppercase tracking-[0.25em] text-white/50 mt-2`}>
                  {t(s.label, lang)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
          <p className={`${display.className} text-[11px] uppercase tracking-[0.35em] text-white/50 mb-4`}>
            01 / Why us
          </p>
          <h2 className={`${display.className} text-4xl md:text-6xl font-bold tracking-tight mb-12 max-w-2xl`}>
            {t(content.why.heading, lang)}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/15">
            {content.why.items.map((it, i) => {
              const isYellow = i % 2 === 0;
              return (
                <div
                  key={i}
                  className="p-8 md:p-10 min-h-[260px] flex flex-col justify-between"
                  style={{
                    background: isYellow ? YELLOW : COBALT,
                    color: isYellow ? '#0A0A0B' : '#fff',
                  }}
                >
                  <span className={`${display.className} text-6xl font-bold opacity-30`}>
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className={`${display.className} text-2xl font-bold mb-3 uppercase tracking-tight`}>
                      {t(it.title, lang)}
                    </h3>
                    <p className="text-sm leading-relaxed opacity-90">{t(it.body, lang)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
          <p className={`${display.className} text-[11px] uppercase tracking-[0.35em] text-white/50 mb-4`}>
            02 / Process
          </p>
          <h2 className={`${display.className} text-4xl md:text-6xl font-bold tracking-tight mb-12 max-w-2xl`}>
            {t(content.how.heading, lang)}
          </h2>
          <ol className="space-y-px bg-white/15">
            {content.how.steps.map((s, i) => (
              <li
                key={i}
                className="bg-[#0A0A0B] grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline py-8 md:py-10 px-2 md:px-4"
              >
                <div className="md:col-span-2">
                  <span className={`${display.className} text-5xl md:text-7xl font-bold`} style={{ color: YELLOW }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className={`${display.className} text-xl md:text-2xl font-bold uppercase tracking-tight`}>
                    {t(s.title, lang)}
                  </h3>
                </div>
                <div className="md:col-span-6 md:col-start-7">
                  <p className="text-white/70 leading-relaxed">{t(s.body, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="team" className="border-t border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
          <p className={`${display.className} text-[11px] uppercase tracking-[0.35em] text-white/50 mb-4`}>
            03 / The team
          </p>
          <h2 className={`${display.className} text-4xl md:text-6xl font-bold tracking-tight mb-3 max-w-2xl`}>
            {t(content.mentors.heading, lang)}
          </h2>
          <p className="text-white/60 max-w-2xl leading-relaxed mb-12">
            {t(content.mentors.sub, lang)}
          </p>
        </div>
        <div className="overflow-x-auto pb-12">
          <div className="flex gap-5 px-6 md:px-10 min-w-min">
            {content.mentors.items.map((m, i) => (
              <MentorCard key={i} mentor={m} lang={lang} variant="brutal" index={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="stories" className="border-t border-white/10 bg-[#0E0E10]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
          <p className={`${display.className} text-[11px] uppercase tracking-[0.35em] text-white/50 mb-4`}>
            04 / Stories
          </p>
          <h2 className={`${display.className} text-4xl md:text-6xl font-bold tracking-tight mb-12 max-w-2xl`}>
            {t(content.testimonials.heading, lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/15">
            {content.testimonials.items.map((q, i) => (
              <div key={i} className="bg-[#0E0E10] p-8 flex flex-col">
                <span
                  className={`${display.className} text-7xl leading-none mb-4`}
                  style={{ color: YELLOW }}
                >
                  “
                </span>
                <p className="text-white/85 text-sm leading-relaxed flex-1">
                  {t(q.quote, lang)}
                </p>
                <p
                  className={`${display.className} mt-6 text-[10px] uppercase tracking-[0.3em]`}
                  style={{ color: YELLOW }}
                >
                  — {t(q.author, lang)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="border-t border-white/10" style={{ background: COBALT }}>
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-20">
          <p className={`${display.className} text-[11px] uppercase tracking-[0.35em] text-white/70 mb-4`}>
            05 / Apply
          </p>
          <h2 className={`${display.className} text-3xl md:text-5xl font-bold tracking-tight mb-3`} style={{ color: YELLOW }}>
            {t(content.apply.heading, lang)}
          </h2>
          <p className="text-white/80 mb-10 max-w-xl">{t(content.apply.sub, lang)}</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(t(content.apply.success, lang));
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <input
              required
              placeholder={t(content.apply.fields.name, lang)}
              className={`${display.className} col-span-1 sm:col-span-2 bg-transparent border border-white/30 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#FFD400] outline-none uppercase tracking-wider text-xs`}
            />
            <input
              required
              placeholder={t(content.apply.fields.phone, lang)}
              className={`${display.className} bg-transparent border border-white/30 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#FFD400] outline-none uppercase tracking-wider text-xs`}
            />
            <input
              type="email"
              placeholder={t(content.apply.fields.email, lang)}
              className={`${display.className} bg-transparent border border-white/30 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#FFD400] outline-none uppercase tracking-wider text-xs`}
            />
            <textarea
              placeholder={t(content.apply.fields.message, lang)}
              className={`${display.className} col-span-1 sm:col-span-2 bg-transparent border border-white/30 px-4 py-3 text-white placeholder:text-white/50 focus:border-[#FFD400] outline-none uppercase tracking-wider text-xs min-h-[100px]`}
            />
            <button
              type="submit"
              className={`${display.className} col-span-1 sm:col-span-2 px-8 py-4 text-sm uppercase tracking-[0.3em] font-bold text-black hover:opacity-90 transition-opacity`}
              style={{ background: YELLOW }}
            >
              {t(content.apply.submit, lang)} ▸
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row justify-between gap-6 text-xs">
          <p className={`${display.className} max-w-xl uppercase tracking-[0.18em] text-white/70 leading-relaxed`}>
            {t(content.footer.tagline, lang)}
          </p>
          <p className={`${display.className} uppercase tracking-[0.25em] text-white/50`}>
            {t(content.footer.rights, lang)}
          </p>
        </div>
      </footer>
    </div>
  );
}
