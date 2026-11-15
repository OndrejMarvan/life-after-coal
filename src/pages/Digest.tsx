import { useTranslation } from 'react-i18next'
import { Headframe, useLang } from '../components/ui'
import { usePageTitle } from '../lib/pageTitle'
import { displayName, fmtDate, pickSummary, t3, useEvents, useProgrammes } from '../lib/content'
import type { Lang, Programme } from '../data/types'
import type { CalEvent } from '../data/events'

/** Monthly digest: printable A4 page and the source of the email version. */
export function buildDigest(programmes: Programme[], events: CalEvent[], lang: Lang) {
  const today = new Date()
  const iso = today.toISOString().slice(0, 10)
  const in90 = new Date(today.getTime() + 90 * 86400000).toISOString().slice(0, 10)
  const monthAgo = new Date(today.getTime() - 30 * 86400000).toISOString()
  const changed = programmes.filter((p) => (p as Programme & { updated_at?: string }).updated_at && String((p as Programme & { updated_at?: string }).updated_at) >= monthAgo)
  const highlight = changed.length
    ? changed
    : programmes.filter((p) => p.individual && (p.status === 'upcoming' || ['CZ-P06', 'CZ-P11', 'CZ-P19', 'PL-N01', 'PL-N03', 'PL-R01', 'CZ-P17'].includes(p.id)))
  const deadlines = events.filter((e) => e.date >= iso && e.date <= in90).sort((a, b) => a.date.localeCompare(b.date))
  return {
    title: fmtDate(iso, lang, { month: 'long', year: 'numeric' }),
    highlight: highlight.slice(0, 8),
    deadlines,
    changedCount: changed.length,
  }
}

export function digestHtml(d: ReturnType<typeof buildDigest>, lang: Lang, labels: { app: string; deadlines: string; programmes: string; help: string }) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
  const origin = typeof window !== 'undefined' ? window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '') : ''
  return `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#0D0D0D">
<div style="background:#0D0D0D;color:#fff;padding:16px;border-bottom:6px solid #F47B20"><h1 style="margin:0;font-size:24px">${esc(labels.app)} · ${esc(d.title)}</h1></div>
<h2 style="color:#C85A12">${esc(labels.deadlines)}</h2><ul>${d.deadlines.map((e) => `<li><b>${esc(e.dateLabel ? t3(e.dateLabel, lang) : fmtDate(e.date, lang))}</b>: ${esc(t3(e.title, lang))}</li>`).join('')}</ul>
<h2 style="color:#C85A12">${esc(labels.programmes)}</h2>${d.highlight.map((p) => `<p><a href="${origin}/programmes/${p.id}" style="color:#0D0D0D;font-weight:bold">${esc(displayName(p, lang))}</a><br>${esc(pickSummary(p, lang))}</p>`).join('')}
<p style="background:#FFF1E6;padding:12px;border-left:6px solid #F47B20">${esc(labels.help)}</p></div>`
}

export default function Digest() {
  const { t } = useTranslation()
  usePageTitle(t('nav.newsletter'))
  const lang = useLang()
  const { programmes } = useProgrammes()
  const events = useEvents()
  const d = buildDigest(programmes, events, lang)

  return (
    <div className="mx-auto max-w-[210mm] bg-white my-6 shadow-xl print:shadow-none print:my-0">
      <div className="no-print bg-orange-pale p-3 flex justify-between items-center">
        <span>A4</span>
        <button type="button" className="btn btn-dark" onClick={() => window.print()}>
          {t('common.print')}
        </button>
      </div>
      <header className="bg-coal text-white p-6 flex items-center gap-4 border-b-8 border-orange">
        <Headframe className="w-16 shrink-0" />
        <div>
          <p className="display text-3xl font-bold">{t('appName')}</p>
          <p className="display text-orange text-xl">
            {t('newsletter.title')} · {d.title}
          </p>
        </div>
      </header>
      <div className="p-6 space-y-6">
        <section>
          <h2 className="text-2xl font-bold border-b-4 border-orange pb-1 mb-3">{t('home.deadlinesTitle')}</h2>
          <ul className="space-y-2">
            {d.deadlines.map((e) => (
              <li key={e.id}>
                <b className="text-orange-deep">{e.dateLabel ? t3(e.dateLabel, lang) : fmtDate(e.date, lang)}</b>: {t3(e.title, lang)}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-2xl font-bold border-b-4 border-orange pb-1 mb-3">{t('nav.programmes')}</h2>
          <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
            {d.highlight.map((p) => (
              <div key={p.id} className="border-2 border-coal/20 rounded-lg p-3">
                <p className="font-bold">{displayName(p, lang)}</p>
                <p className="text-sm">{pickSummary(p, lang)}</p>
                <p className="text-xs text-coal/60 mt-1">{p.id}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg bg-orange-pale p-4 border-l-8 border-orange">
          <p className="font-bold">{t('home.talkTitle')}</p>
          <p>
            {t('hotline.line_up')}: 800 77 99 00 · {t('hotline.line_wup')}: +48 32 757 33 11 · {t('crisis.short')}
          </p>
        </section>
        <p className="text-sm text-coal/60">{t('greeting')}</p>
      </div>
    </div>
  )
}
