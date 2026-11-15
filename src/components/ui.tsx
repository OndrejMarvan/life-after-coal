import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Evidence, Lang, Programme, Status } from '../data/types'
import { displayName, pickSummary } from '../lib/content'
import { usePageTitle } from '../lib/pageTitle'
import { PHOTOS, srcSet, type Photo, type PhotoKey } from '../data/photos'
import type { Fact } from '../data/facts'

export function useLang(): Lang {
  const { i18n } = useTranslation()
  const l = i18n.language.slice(0, 2)
  return (l === 'pl' || l === 'en' ? l : 'cs') as Lang
}

export { Headframe } from './Headframe'


/** A Commons photo with srcset and alt text in the reader's language. */
export function PhotoImg({
  photo,
  sizes,
  className = '',
  decorative = false,
  priority = false,
}: {
  photo: Photo
  sizes: string
  className?: string
  decorative?: boolean
  priority?: boolean
}) {
  const lang = useLang()
  return (
    <img
      src={photo.srcs[photo.srcs.length - 1].src}
      srcSet={srcSet(photo)}
      sizes={sizes}
      alt={decorative ? '' : photo.alt[lang]}
      className={className}
      style={{ objectPosition: photo.position }}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  )
}

/** Attribution line required by the photo's CC licence; full list on /credits. */
export function PhotoCredit({ photo, className = '' }: { photo: Photo; className?: string }) {
  const { t } = useTranslation()
  return (
    <a href={photo.credit.page} target="_blank" rel="noreferrer" className={`no-print text-xs hover:underline underline-offset-2 ${className}`}>
      {t('common.photo')}: {photo.credit.author} · {photo.credit.license}
    </a>
  )
}

export function PageHeader({ title, intro, photo, children }: { title: string; intro?: string; photo?: PhotoKey; children?: ReactNode }) {
  usePageTitle(title)
  const p: Photo | undefined = photo ? PHOTOS[photo] : undefined
  return (
    <section className={`relative overflow-hidden text-white ${p ? 'bg-coal' : 'kit-stripes-soft'}`}>
      {p && (
        <>
          <PhotoImg photo={p} sizes="100vw" decorative priority className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-coal/45 md:bg-transparent md:bg-linear-to-r md:from-coal/80 md:via-coal/40 md:to-transparent" aria-hidden="true" />
        </>
      )}
      <div className={`relative mx-auto max-w-6xl px-4 ${p ? 'pt-12 pb-14 sm:py-20' : 'py-10 sm:py-12'}`}>
        <div className="inline-block bg-coal/90 px-4 py-3 rounded-lg border-l-8 border-orange">
          <h1 className={`${title.length > 28 ? 'text-2xl' : 'text-3xl'} sm:text-5xl font-bold`}>{title}</h1>
        </div>
        {intro && <p className="mt-4 max-w-3xl text-lg text-white/90 bg-coal/70 rounded-lg px-4 py-2">{intro}</p>}
        {children}
      </div>
      {p && <PhotoCredit photo={p} className="absolute bottom-1.5 right-3 text-white/80 hover:text-white" />}
    </section>
  )
}

/** One "Did you know?" fact with its photo (if any) and source link. */
export function FactCard({ fact }: { fact: Fact }) {
  const { t } = useTranslation()
  const lang = useLang()
  const p: Photo | undefined = fact.photo ? PHOTOS[fact.photo] : undefined
  return (
    <figure className="card overflow-hidden flex flex-col">
      {p ? (
        <PhotoImg photo={p} sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw" className="aspect-[16/9] w-full object-cover" />
      ) : fact.highlight ? (
        <div className="kit-stripes-soft flex aspect-[16/9] items-center justify-center p-4" aria-hidden="true">
          <span className="display rounded-lg bg-coal/90 px-4 py-2 text-center text-4xl font-bold text-orange sm:text-5xl">{fact.highlight[lang]}</span>
        </div>
      ) : null}
      <figcaption className="p-5 flex flex-1 flex-col gap-3">
        <p className="text-lg leading-relaxed">{fact.text[lang]}</p>
        <p className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <a href={fact.source} target="_blank" rel="noreferrer" className="font-semibold text-orange-deep underline underline-offset-4">
            {t('common.source')} ↗
          </a>
          {p && <PhotoCredit photo={p} className="text-coal/60" />}
        </p>
      </figcaption>
    </figure>
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
    <article className={`relative min-w-0 rounded-2xl bg-white ${border} p-5 pl-12 shadow-sm [overflow-wrap:anywhere]`}>
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

export function Section({ title, children, className = '', id }: { title?: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-4 py-8 scroll-mt-24 ${className}`}>
      {title && <h2 className="text-2xl sm:text-3xl font-bold mb-4">{title}</h2>}
      {children}
    </section>
  )
}
