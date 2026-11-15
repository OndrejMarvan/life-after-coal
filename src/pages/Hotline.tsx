import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, PageHeader, SafetyBox, Section, useLang } from '../components/ui'
import { insert } from '../lib/store'
import { CrisisLines } from '../components/CrisisLines'
import { isDemo } from '../lib/supabase'

const LINES = [
  { key: 'line_up', phone: '800 77 99 00', country: '🇨🇿' },
  { key: 'line_wup', phone: '+48 32 757 33 11', country: '🇵🇱' },
  { key: 'line_karvina', phone: '+420 596 387 631', country: '🇨🇿' },
  { key: 'line_jastrzebie', phone: '+48 32 47 85 100', country: '🇵🇱' },
  { key: 'line_nrb', phone: '+420 255 721 111', country: '🇨🇿' },
]
const TOPICS = ['money', 'pension', 'job', 'mental', 'family'] as const

export default function Hotline() {
  const { t } = useTranslation()
  const lang = useLang()
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState({ name: '', phone: '', language: lang as string, best_time: 'morning', topic: 'money', note: '', consent: false })

  return (
    <>
      <PageHeader title={t('hotline.title')} intro={t('hotline.intro')} />
      <Section>
        <CrisisLines />
      </Section>
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            {!isDemo && <h2 className="text-2xl font-bold mb-4">{t('hotline.callbackTitle')}</h2>}
            {isDemo ? (
              // Without a database nobody would receive the request, so do not offer it.
              <SafetyBox title={t('hotline.demoTitle')}>{t('hotline.demoText')}</SafetyBox>
            ) : sent ? (
              <SafetyBox title={t('common.thanks')}>{t('hotline.sent')}</SafetyBox>
            ) : (
              <form
                className="card p-5 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setBusy(true)
                  setErr('')
                  try {
                    await insert('callback_requests', { ...f, status: 'new' })
                    setSent(true)
                  } catch {
                    setErr(t('common.error'))
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                <Field label={t('hotline.name')}>
                  <input required className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
                </Field>
                <Field label={t('hotline.phone')}>
                  <input required type="tel" className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('hotline.language')}>
                    <select className="field" value={f.language} onChange={(e) => setF({ ...f, language: e.target.value })}>
                      <option value="cs">Čeština</option>
                      <option value="pl">Polski</option>
                      <option value="en">English</option>
                    </select>
                  </Field>
                  <Field label={t('hotline.bestTime')}>
                    <select className="field" value={f.best_time} onChange={(e) => setF({ ...f, best_time: e.target.value })}>
                      {(['morning', 'afternoon', 'evening'] as const).map((x) => (
                        <option key={x} value={x}>
                          {t(`hotline.times.${x}`)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <fieldset>
                  <legend className="label">{t('hotline.topic')}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TOPICS.map((x) => (
                      <label key={x} className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer ${f.topic === x ? 'border-orange bg-orange-pale' : 'border-coal/15'}`}>
                        <input type="radio" name="topic" className="h-5 w-5 accent-[#F47B20]" checked={f.topic === x} onChange={() => setF({ ...f, topic: x })} />
                        {t(`hotline.topic_${x}`)}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label={t('hotline.note')}>
                  <textarea className="field min-h-24" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
                </Field>
                <label className="flex items-start gap-3">
                  <input required type="checkbox" className="mt-1 h-6 w-6 accent-[#F47B20]" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
                  <span>{t('hotline.consent')}</span>
                </label>
                {err && <p className="text-alarm font-bold">{err}</p>}
                <button className="btn btn-primary" disabled={busy}>
                  {t('common.send')}
                </button>
              </form>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">{t('hotline.linesTitle')}</h2>
            <ul className="space-y-3">
              {LINES.map((l) => (
                <li key={l.key} className="card p-4 flex items-center justify-between gap-3">
                  <span>
                    <span aria-hidden="true">{l.country}</span> {t(`hotline.${l.key}`)}
                  </span>
                  <a className="btn btn-dark !min-h-11 whitespace-nowrap" href={`tel:${l.phone.replace(/\s/g, '')}`}>
                    {l.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  )
}
