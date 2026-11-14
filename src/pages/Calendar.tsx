import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Field, PageHeader, SafetyBox, Section, useLang } from '../components/ui'
import { downloadIcs, fmtDate, t3, useEvents } from '../lib/content'
import { rollingRule, type CalEvent, type EventKind } from '../data/events'
import { insert } from '../lib/store'

const KINDS: EventKind[] = ['deadline', 'law', 'mine', 'call', 'meeting', 'fair', 'community']

export default function CalendarPage() {
  const { t } = useTranslation()
  const lang = useLang()
  const events = useEvents()
  const [country, setCountry] = useState('')
  const [kind, setKind] = useState('')
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', place: '' })
  const today = new Date().toISOString().slice(0, 10)

  const filtered = events
    .filter((e) => !country || e.country === country || e.country === 'XB')
    .filter((e) => !kind || e.kind === kind)
  const upcoming = filtered.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = filtered.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date))

  const item = (e: CalEvent, isPast: boolean) => (
    <li key={e.id} className={`card p-5 grid gap-3 sm:grid-cols-[160px_1fr_auto] items-start ${isPast ? 'opacity-75' : ''}`}>
      <div>
        <p className="display text-xl font-bold text-orange-deep">{e.dateLabel ? t3(e.dateLabel, lang) : fmtDate(e.date, lang)}</p>
        <p className="text-sm font-semibold">
          {e.country === 'XB' ? '🇪🇺' : e.country === 'PL' ? '🇵🇱' : '🇨🇿'} {t(`calendar.kind_${e.kind}`)}
        </p>
      </div>
      <div>
        <p className="text-lg font-bold">{t3(e.title, lang)}</p>
        <p className="text-coal/70">
          {t('calendar.who')}: {t3(e.who, lang)}
        </p>
        {e.place && <p className="text-coal/70">📍 {e.place}</p>}
        {e.crossBorder && <span className="mt-1 inline-block rounded-full bg-orange px-2 py-0.5 text-xs font-bold">{t('calendar.crossBorder')}</span>}
        {e.programmeIds?.length ? (
          <p className="mt-1 text-sm">
            {e.programmeIds.map((id) => (
              <Link key={id} to={`/programmes/${id}`} className="mr-3 underline underline-offset-4 text-orange-deep font-semibold">
                {id}
              </Link>
            ))}
          </p>
        ) : null}
      </div>
      {!isPast && (
        <button type="button" className="btn btn-outline no-print" onClick={() => downloadIcs(e.id, e.date, t3(e.title, lang), t3(e.who, lang))}>
          📅 {t('common.addToCalendar')}
        </button>
      )}
    </li>
  )

  return (
    <>
      <PageHeader title={t('calendar.title')} intro={t('calendar.intro')} />
      <Section>
        <SafetyBox title={t('calendar.rolling')}>{t3(rollingRule, lang)}</SafetyBox>
        <div className="mt-6 flex flex-wrap gap-4 no-print">
          <label>
            <span className="label">{t('common.country')}</span>
            <select className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="">{t('common.all')}</option>
              <option value="CZ">{t('countries.CZ')}</option>
              <option value="PL">{t('countries.PL')}</option>
            </select>
          </label>
          <label>
            <span className="label">{t('calendar.kind')}</span>
            <select className="field" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">{t('common.all')}</option>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`calendar.kind_${k}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Section>
      <Section title={t('calendar.upcoming')}>
        <ol className="space-y-3">{upcoming.map((e) => item(e, false))}</ol>
      </Section>
      {past.length > 0 && (
        <Section title={t('calendar.past')}>
          <ol className="space-y-3">{past.map((e) => item(e, true))}</ol>
        </Section>
      )}
      <Section title={t('calendar.suggest')} className="no-print">
        {sent ? (
          <p className="card p-5 text-lg">{t('calendar.suggestSent')}</p>
        ) : (
          <form
            className="card p-5 grid gap-4 sm:grid-cols-3 items-end"
            onSubmit={async (ev) => {
              ev.preventDefault()
              await insert('suggestions', { kind: 'event', title: form.title, date: form.date, place: form.place, status: 'new', lang })
              setSent(true)
            }}
          >
            <Field label={t('calendar.suggestTitle')}>
              <input required className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label={t('calendar.suggestDate')}>
              <input required type="date" className="field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label={t('calendar.suggestPlace')}>
              <input className="field" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
            </Field>
            <button className="btn btn-primary sm:col-span-3 justify-self-start">{t('common.send')}</button>
          </form>
        )}
      </Section>
    </>
  )
}
