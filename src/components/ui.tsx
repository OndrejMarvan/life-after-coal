import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Evidence, Lang, Programme, Status } from '../data/types'
import { displayName, pickSummary } from '../lib/content'

export function useLang(): Lang {
  const { i18n } = useTranslation()
  const l = i18n.language.slice(0, 2)
  return (l === 'pl' || l === 'en' ? l : 'cs') as Lang
}

/** Black line-art mine headframe (shaft tower) with a winding wheel. */
export function Headframe({ className = '', color = '#0D0D0D' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 200 220" className={className} aria-hidden="true" fill="none" stroke={color} strokeWidth="6" strokeLinejoin="round" strokeLinecap="round">
      <path d="M40 210 L100 40 L160 210" />
      <path d="M60 155 H140 M72 120 H128 M84 85 H116" />
      <path d="M60 155 L128 120 M140 155 L72 120 M72 120 L116 85 M128 120 L84 85" strokeWidth="4" />
      <circle cx="100" cy="34" r="24" />
      <circle cx="100" cy="34" r="5" fill={color} />
      <path d="M100 10 V58 M76 34 H124 M83 17 L117 51 M117 17 L83 51" strokeWidth="3" />
      <path d="M100 58 V210" strokeWidth="3" strokeDasharray="8 6" />
      <path d="M20 210 H180" />
    </svg>
  )
}

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <section className="kit-stripes-soft text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="inline-block bg-coal/90 px-4 py-3 rounded-lg border-l-8 border-orange">
          <h1 className="text-3xl sm:text-5xl font-bold">{title}</h1>
        </div>
        {intro && <p className="mt-4 max-w-3xl text-lg text-white/90 bg-coal/70 rounded-lg px-4 py-2">{intro}</p>}
        {children}
      </div>
    </section>
  )
}

export function SafetyBox({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="safety-tape rounded-xl p-2" role="note">
      <div className="rounded-lg bg-white p-4">
        {title && <p className="display text-xl font-bold mb-1">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}

export function EvidenceBadge({ e }: { e: Evidence }) {
  const { t } = useTranslation()
  const cls =
    e === 'VERIFIED'
      ? 'bg-coal text-white border-coal'
      : e === 'REPORTED'
        ? 'bg-white text-orange-deep border-orange'
        : 'bg-white text-stone border-stone border-dashed'
  return (
    <span title={t(`evidence.${e}_hint`)} className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${cls}`}>
      {e === 'VERIFIED' ? '✓ ' : ''}
      {t(`evidence.${e}`)}
    </span>
  )
}

export function StatusBadge({ s }: { s: Status }) {
  const { t } = useTranslation()
  const cls =
    s === 'active'
      ? 'bg-orange text-coal'
      : s === 'upcoming'
        ? 'bg-orange-pale text-coal border-2 border-orange'
        : s === 'closed' || s === 'legacy'
          ? 'bg-stone/20 text-coal/70'
          : 'bg-white text-coal border-2 border-coal/30'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${cls}`}>{t(`status.${s}`)}</span>
}

export function CountryTag({ c }: { c: string }) {
  const { t } = useTranslation()
  const flag = c === 'PL' ? '🇵🇱' : c === 'CZ' ? '🇨🇿' : '🇪🇺'
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold">
      <span aria-hidden="true">{flag}</span>
      {t(`countries.${c}`)}
    </span>
  )
}

/** Programme card styled like a miner's brass check-in token: rounded tag with a punched hole. */
export function ProgrammeCard({ p, reason, tone = 'default' }: { p: Programme; reason?: string; tone?: 'default' | 'likely' | 'check' | 'no' }) {
  const lang = useLang()
  const { t } = useTranslation()
  const border =
    tone === 'likely' ? 'border-orange border-4' : tone === 'check' ? 'border-coal border-2' : tone === 'no' ? 'border-stone/40 border-2 opacity-90' : 'border-[#e7e2da] border'
  return (
    <article className={`relative rounded-2xl bg-white ${border} p-5 pl-12 shadow-sm`}>
      <span aria-hidden="true" className="absolute left-4 top-6 h-4 w-4 rounded-full border-4 border-orange bg-paper" />
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <CountryTag c={p.country} />
        <StatusBadge s={p.status} />
        <EvidenceBadge e={p.evidence} />
        <span className="text-xs text-coal/50">{p.id}</span>
      </div>
      <h3 className="text-xl font-bold">
        <Link to={`/programmes/${p.id}`} className="hover:text-orange-deep underline-offset-4 hover:underline">
          {displayName(p, lang)}
        </Link>
      </h3>
      {lang !== 'en' && p.name_en !== p.name_local && <p className="text-sm text-coal/60">{p.name_en}</p>}
      <p className="mt-2">{pickSummary(p, lang)}</p>
      {reason && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${tone === 'no' ? 'bg-stone/15' : 'bg-orange-pale'}`}>{t(`reason.${reason}`)}</p>
      )}
      <div className="mt-3">
        <Link to={`/programmes/${p.id}`} className="font-semibold text-orange-deep underline underline-offset-4">
          {t('common.details')} →
        </Link>
      </div>
    </article>
  )
}

/** Mine-lift progress: the cage rises toward the surface as steps are done. */
export function MineLift({ done, total }: { done: number; total: number }) {
  const { t } = useTranslation()
  const pct = total ? done / total : 0
  return (
    <div className="flex flex-col items-center" aria-label={`${done} / ${total}`}>
      <span className="display text-sm text-ok font-bold">☀ {t('check.surface')}</span>
      <div className="relative my-2 h-64 w-16 rounded-md bg-gradient-to-b from-orange-pale via-[#b98b62] to-coal border-2 border-coal">
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-coal/60" />
        <div
          className="absolute left-1/2 h-10 w-12 -translate-x-1/2 rounded-sm border-2 border-coal bg-orange transition-all duration-700"
          style={{ bottom: `calc(${pct * 100}% - ${pct * 40}px)` }}
        >
          <div className="mx-auto mt-1 h-3 w-8 rounded-sm bg-coal/30" />
        </div>
      </div>
      <span className="display text-sm text-coal/70 font-bold">⛏ {t('check.lift')}</span>
      <span className="mt-1 font-bold">
        {done}/{total}
      </span>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-sm text-coal/60">{hint}</span>}
    </label>
  )
}

export function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full min-h-14 rounded-xl border-2 px-4 py-3 text-left text-lg font-semibold transition-colors ${
        selected ? 'border-orange bg-orange text-coal' : 'border-coal/20 bg-white hover:border-coal'
      }`}
    >
      {children}
    </button>
  )
}

export function Section({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`mx-auto max-w-6xl px-4 py-8 ${className}`}>
      {title && <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>}
      {children}
    </section>
  )
}
