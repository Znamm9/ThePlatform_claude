'use client';

import { useState } from 'react';
import { Lora } from 'next/font/google';
import { content, t, type Lang } from '../_content/content';
import { LanguageToggle } from '../_components/LanguageToggle';
import { MentorCard } from '../_components/MentorCard';

const fraunces = Lora({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export default function Draft2Page() {
  const [lang, setLang] = useState<Lang>('ua');

  return (
    <div
      className={`min-h-screen bg-[#FAFAF7] text-neutral-900 ${fraunces.className ? '' : ''}`}
      style={{ colorScheme: 'light' }}
    >
      <header className="sticky top-0 z-40 bg-[#FAFAF7]/85 backdrop-blur border-b border-neutral-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold">
              EC
            </div>
            <span className={`${fraunces.className} text-lg`}>
              {t(content.brand, lang)}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-neutral-600">
            <a href="#why" className="hover:text-neutral-900">{t(content.nav.why, lang)}</a>
            <a href="#how" className="hover:text-neutral-900">{t(content.nav.how, lang)}</a>
            <a href="#team" className="hover:text-neutral-900">{t(content.nav.team, lang)}</a>
            <a href="#stories" className="hover:text-neutral-900">{t(content.nav.stories, lang)}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} onChange={setLang} variant="editorial" />
            <a
              href="#apply"
              className="hidden sm:inline-block bg-neutral-900 text-white px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] hover:bg-orange-700 transition-colors"
            >
              {t(content.nav.apply, lang)} →
            </a>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          <div className="md:col-span-5">
            <div className="aspect-[4/5] w-full bg-gradient-to-br from-orange-200 via-orange-100 to-neutral-100 rounded-md overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`${fraunces.className} text-[12rem] leading-none text-orange-700/30`}>
                  EC
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-[11px] uppercase tracking-[0.22em] text-orange-900/70">
                Vadym Rudenko · Founder
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.25em] text-orange-700 mb-6">
              {t(content.hero.eyebrow, lang)}
            </p>
            <h1
              className={`${fraunces.className} text-5xl md:text-7xl leading-[1.02] tracking-tight mb-6`}
              style={{ fontWeight: 500 }}
            >
              <span>{t(content.hero.headlineLine1, lang)}</span>
              <br />
              <em className="text-orange-700 not-italic" style={{ fontWeight: 400, fontStyle: 'italic' }}>
                {t(content.hero.headlineLine2, lang)}
              </em>
            </h1>
            <p className="text-lg leading-relaxed text-neutral-700 max-w-xl mb-8">
              {t(content.hero.sub, lang)}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#apply"
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full text-sm hover:bg-orange-700 transition-colors"
              >
                {t(content.hero.primaryCta, lang)} →
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 border border-neutral-300 text-neutral-900 px-6 py-3 rounded-full text-sm hover:border-neutral-900 transition-colors"
              >
                {t(content.hero.secondaryCta, lang)}
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-8">
              {content.stats.map((s, i) => (
                <div key={i}>
                  <div className={`${fraunces.className} text-3xl text-neutral-900`}>
                    {t(s.value, lang)}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.15em] text-neutral-500 mt-1">
                    {t(s.label, lang)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.25em] text-orange-700 mb-3">
                The offer
              </p>
              <h2 className={`${fraunces.className} text-4xl md:text-5xl leading-tight`} style={{ fontWeight: 500 }}>
                {t(content.why.heading, lang)}
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6">
              <p className="text-neutral-700 leading-relaxed text-lg">
                {t(content.why.sub, lang)}
              </p>
            </div>
          </div>

          <div className="space-y-px bg-neutral-200">
            {content.why.items.map((it, i) => (
              <div
                key={i}
                className="bg-[#FAFAF7] grid grid-cols-1 md:grid-cols-12 gap-6 py-8 md:py-10 hover:bg-white transition-colors"
              >
                <div className="md:col-span-2">
                  <span className={`${fraunces.className} text-5xl text-orange-700/60`}>
                    0{i + 1}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3 className={`${fraunces.className} text-2xl leading-tight`} style={{ fontWeight: 500 }}>
                    {t(it.title, lang)}
                  </h3>
                </div>
                <div className="md:col-span-6 md:col-start-7">
                  <p className="text-neutral-700 leading-relaxed">{t(it.body, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-neutral-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-orange-700 mb-3">
            The path
          </p>
          <h2
            className={`${fraunces.className} text-4xl md:text-5xl leading-tight mb-14 max-w-xl`}
            style={{ fontWeight: 500 }}
          >
            {t(content.how.heading, lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {content.how.steps.map((s, i) => (
              <div key={i} className="flex gap-6">
                <div className={`${fraunces.className} text-4xl text-orange-700 shrink-0 w-12`}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className={`${fraunces.className} text-2xl mb-2`} style={{ fontWeight: 500 }}>
                    {t(s.title, lang)}
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">{t(s.body, lang)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="border-t border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-orange-700 mb-3">
                The mentors
              </p>
              <h2 className={`${fraunces.className} text-4xl md:text-5xl leading-tight`} style={{ fontWeight: 500 }}>
                {t(content.mentors.heading, lang)}
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="text-neutral-700 leading-relaxed">{t(content.mentors.sub, lang)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.mentors.items.map((m, i) => (
              <MentorCard key={i} mentor={m} lang={lang} variant="editorial" index={i} />
            ))}
          </div>
        </div>
      </section>

      <section id="stories" className="border-t border-neutral-200 bg-orange-50/40">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-orange-700 mb-3">
            Student stories
          </p>
          <h2 className={`${fraunces.className} text-4xl md:text-5xl leading-tight mb-16`} style={{ fontWeight: 500 }}>
            {t(content.testimonials.heading, lang)}
          </h2>
          <div className="space-y-16">
            {content.testimonials.items.map((q, i) => (
              <figure key={i}>
                <blockquote
                  className={`${fraunces.className} text-2xl md:text-3xl leading-[1.35] text-neutral-900`}
                  style={{ fontWeight: 400 }}
                >
                  “{t(q.quote, lang)}”
                </blockquote>
                <figcaption className="mt-4 text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                  — {t(q.author, lang)}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="border-t border-neutral-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-24">
          <p className="text-[11px] uppercase tracking-[0.25em] text-orange-700 mb-3">
            Apply
          </p>
          <h2 className={`${fraunces.className} text-3xl md:text-4xl leading-tight mb-3`} style={{ fontWeight: 500 }}>
            {t(content.apply.heading, lang)}
          </h2>
          <p className="text-neutral-700 mb-10">{t(content.apply.sub, lang)}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(t(content.apply.success, lang));
            }}
            className="space-y-5"
          >
            {[
              { key: 'name', type: 'text', required: true },
              { key: 'phone', type: 'tel', required: true },
              { key: 'email', type: 'email', required: false },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
                  {t(content.apply.fields[f.key as 'name' | 'phone' | 'email'], lang)}
                </label>
                <input
                  type={f.type}
                  required={f.required}
                  className="w-full border-b border-neutral-300 bg-transparent py-2 text-lg focus:border-neutral-900 outline-none transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
                {t(content.apply.fields.message, lang)}
              </label>
              <textarea
                className="w-full border-b border-neutral-300 bg-transparent py-2 text-lg focus:border-neutral-900 outline-none transition-colors min-h-[80px]"
              />
            </div>
            <button
              type="submit"
              className="mt-6 bg-neutral-900 text-white px-8 py-3 rounded-full text-sm uppercase tracking-[0.2em] hover:bg-orange-700 transition-colors"
            >
              {t(content.apply.submit, lang)} →
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 flex flex-col md:flex-row gap-6 justify-between text-sm text-neutral-600">
          <p className={`${fraunces.className} max-w-md leading-relaxed`}>
            {t(content.footer.tagline, lang)}
          </p>
          <p className="text-xs uppercase tracking-[0.2em]">
            {t(content.footer.rights, lang)}
          </p>
        </div>
      </footer>
    </div>
  );
}
