import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, PageHeader, ProgrammeCard, SafetyBox, Section, useLang } from '../components/ui'
import { useProgrammes } from '../lib/content'
import { insert } from '../lib/store'

// School level of each programme for children (programmes can be added by admins).
const LEVEL: Record<string, string[]> = { 'PL-R08': ['secondary'] }

export default function Children() {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes } = useProgrammes()
  const [level, setLevel] = useState('')
  const [sent, setSent] = useState(false)
  const [f, setF] = useState({ title: '', link: '', note: '' })
  const list = programmes
    .filter((p) => p.needs.includes('children') && p.status !== 'closed')
    .filter((p) => !level || (LEVEL[p.id] ?? []).includes(level))

  return (
    <>
      <PageHeader title={t('children.title')} intro={t('children.intro')} />
      <Section>
        <label className="block max-w-sm no-print">
          <span className="label">{t('children.level')}</span>
          <select className="field" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">{t('common.all')}</option>
            <option value="primary">{t('children.lvl_primary')}</option>
            <option value="secondary">{t('children.lvl_secondary')}</option>
            <option value="university">{t('children.lvl_university')}</option>
          </select>
        </label>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <ProgrammeCard key={p.id} p={p} />
          ))}
        </div>
      </Section>
      <Section>
        <SafetyBox title={t('children.emptyTitle')}>
          {sent ? (
            <p className="text-lg">{t('children.sent')}</p>
          ) : (
            <form
              className="mt-3 grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault()
                await insert('suggestions', { kind: 'children', title: f.title, link: f.link, note: f.note, status: 'new', lang })
                setSent(true)
              }}
            >
              <Field label={t('children.suggestName')}>
                <input required className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
              </Field>
              <Field label={t('children.suggestLink')}>
                <input className="field" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} />
              </Field>
              <Field label={t('children.suggestNote')}>
                <textarea className="field" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
              </Field>
              <button className="btn btn-primary justify-self-start">{t('common.send')}</button>
            </form>
          )}
        </SafetyBox>
      </Section>
    </>
  )
}
