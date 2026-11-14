import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Field, PageHeader, SafetyBox, Section, useLang } from '../components/ui'
import { insert } from '../lib/store'
import type { Need } from '../data/types'

const TOPICS: Need[] = ['money', 'pension', 'job', 'training', 'business', 'family', 'children']

export default function Newsletter() {
  const { t } = useTranslation()
  const lang = useLang()
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({ channel: 'email', contact: '', language: lang as string, country: 'CZ', topics: [] as string[] })

  return (
    <>
      <PageHeader title={t('newsletter.title')} intro={t('newsletter.intro')} />
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {sent ? (
            <SafetyBox title={t('common.thanks')}>{t('newsletter.sent')}</SafetyBox>
          ) : (
            <form
              className="card p-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                await insert('newsletter_subscribers', {
                  channel: f.channel,
                  email: f.channel === 'email' ? f.contact : null,
                  phone: f.channel === 'sms' ? f.contact : null,
                  language: f.language,
                  country: f.country,
                  topics: f.topics,
                })
                setSent(true)
              }}
            >
              <fieldset>
                <legend className="label">{t('newsletter.channel')}</legend>
                <div className="flex flex-wrap gap-3">
                  {(['email', 'sms'] as const).map((c) => (
                    <label key={c} className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 cursor-pointer ${f.channel === c ? 'border-orange bg-orange-pale' : 'border-coal/15'}`}>
                      <input type="radio" className="h-5 w-5 accent-[#F47B20]" checked={f.channel === c} onChange={() => setF({ ...f, channel: c, contact: '' })} />
                      {c === 'email' ? t('newsletter.byEmail') : t('newsletter.bySms')}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label={f.channel === 'email' ? t('newsletter.email') : t('newsletter.phone')}>
                <input
                  required
                  type={f.channel === 'email' ? 'email' : 'tel'}
                  className="field"
                  value={f.contact}
                  onChange={(e) => setF({ ...f, contact: e.target.value })}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t('newsletter.language')}>
                  <select className="field" value={f.language} onChange={(e) => setF({ ...f, language: e.target.value })}>
                    <option value="cs">Čeština</option>
                    <option value="pl">Polski</option>
                    <option value="en">English</option>
                  </select>
                </Field>
                <Field label={t('newsletter.country')}>
                  <select className="field" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}>
                    <option value="CZ">{t('countries.CZ')}</option>
                    <option value="PL">{t('countries.PL')}</option>
                    <option value="BOTH">
                      {t('countries.CZ')} + {t('countries.PL')}
                    </option>
                  </select>
                </Field>
              </div>
              <fieldset>
                <legend className="label">{t('newsletter.topics')}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TOPICS.map((x) => {
                    const on = f.topics.includes(x)
                    return (
                      <label key={x} className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer ${on ? 'border-orange bg-orange-pale' : 'border-coal/15'}`}>
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[#F47B20]"
                          checked={on}
                          onChange={() => setF({ ...f, topics: on ? f.topics.filter((y) => y !== x) : [...f.topics, x] })}
                        />
                        {t(`needs.${x}`)}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
              <button className="btn btn-primary">{t('newsletter.subscribe')}</button>
            </form>
          )}
          <aside className="rounded-2xl bg-coal text-white p-5">
            <h2 className="text-2xl font-bold text-orange">{t('newsletter.printedTitle')}</h2>
            <p className="mt-2">{t('newsletter.printedText')}</p>
            <Link to="/newsletter/digest" className="btn btn-primary mt-4">
              {t('newsletter.preview')} →
            </Link>
          </aside>
        </div>
      </Section>
    </>
  )
}
