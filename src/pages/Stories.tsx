import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, PageHeader, SafetyBox, Section, useLang } from '../components/ui'
import site from '../data/site.json'
import { insert, list, type Row } from '../lib/store'
import { useAuth } from '../lib/auth'
import { fmtDate } from '../lib/content'

interface Story extends Row {
  title: string
  body: string
  name?: string
  approved?: boolean
}

export default function Stories() {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const [country, setCountry] = useState<'ALL' | 'PL' | 'CZ'>('ALL')
  const [stories, setStories] = useState<Story[]>([])
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({ title: '', body: '', name: '' })

  useEffect(() => {
    list<Story>('stories', { eq: { approved: true }, order: 'created_at' })
      .then(setStories)
      .catch(() => undefined)
  }, [])

  const hist = site.history.filter((h) => country === 'ALL' || h.country === country)

  return (
    <>
      <PageHeader title={t('stories.title')} intro={t('stories.intro')} />
      <Section title={t('stories.lessons')}>
        <div className="grid gap-4 md:grid-cols-2">
          {(['CZ', 'PL'] as const).map((c) => (
            <div key={c} className="card p-5">
              <p className="display text-xl font-bold mb-2">
                {c === 'CZ' ? '🇨🇿' : '🇵🇱'} {t(`countries.${c}`)}
              </p>
              <ul className="space-y-2 list-disc pl-5" lang="en">
                {site.historyLessons[c].map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t('stories.timeline')}>
        <div className="mb-4 flex gap-2 no-print">
          {(['ALL', 'CZ', 'PL'] as const).map((c) => (
            <button key={c} type="button" onClick={() => setCountry(c)} className={`rounded-full px-4 py-2 font-semibold border-2 ${country === c ? 'bg-orange border-orange' : 'border-coal/20 bg-white'}`}>
              {c === 'ALL' ? t('common.all') : t(`countries.${c}`)}
            </button>
          ))}
        </div>
        {lang !== 'en' && <p className="mb-3 rounded-lg bg-orange-pale px-3 py-2 text-sm font-semibold">{t('common.detailsInEnglish')}</p>}
        <ol className="relative border-l-4 border-orange ml-3 space-y-6" lang="en">
          {hist.map((h, i) => (
            <li key={i} className="ml-6">
              <span className="absolute -left-[13px] mt-1.5 h-5 w-5 rounded-full border-4 border-coal bg-orange" aria-hidden="true" />
              <p className="display text-lg font-bold text-orange-deep">
                {h.country === 'CZ' ? '🇨🇿' : '🇵🇱'} {h.years}
              </p>
              <p className="text-xl font-bold">{h.title}</p>
              <p>{h.what}</p>
              {h.results && h.results !== 'Not found' && (
                <p className="mt-1">
                  <b>{t('stories.results')}:</b> {h.results}
                </p>
              )}
              {h.outcome && (
                <p>
                  <b>{t('stories.outcome')}:</b> {h.outcome}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {stories.length > 0 && (
        <Section title={t('stories.community')}>
          <div className="grid gap-4 md:grid-cols-2">
            {stories.map((s) => (
              <article key={s.id} className="card p-5">
                <h3 className="text-xl font-bold normal-case">{s.title}</h3>
                <p className="mt-2 whitespace-pre-wrap">{s.body}</p>
                <p className="mt-2 text-sm text-coal/60">
                  {s.name || t('stories.anonymous')} · {s.created_at ? fmtDate(s.created_at, lang) : ''}
                </p>
              </article>
            ))}
          </div>
        </Section>
      )}

      <Section title={t('stories.submitTitle')} className="no-print">
        <p className="mb-4 text-lg">{t('stories.submitText')}</p>
        {sent ? (
          <SafetyBox title={t('common.thanks')}>{t('stories.sent')}</SafetyBox>
        ) : (
          <form
            className="card p-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              await insert('stories', { ...f, approved: false, user_id: user?.id ?? null, lang })
              setSent(true)
            }}
          >
            <Field label={t('stories.storyTitle')}>
              <input required maxLength={140} className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </Field>
            <Field label={t('stories.storyBody')}>
              <textarea required maxLength={8000} className="field min-h-40" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
            </Field>
            <Field label={t('stories.storyName')}>
              <input maxLength={80} className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </Field>
            <button className="btn btn-primary">{t('stories.submit')}</button>
          </form>
        )}
      </Section>
    </>
  )
}
