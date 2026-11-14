import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader, ProgrammeCard, Section, useLang } from '../components/ui'
import { pickSummary, useProgrammes } from '../lib/content'
import { CZ_EMPLOYERS, CZ_REGIONS, PL_EMPLOYERS, PL_REGIONS } from '../data/rules'
import type { Evidence, Group, Need, Status } from '../data/types'

const NEEDS: Need[] = ['money', 'pension', 'job', 'training', 'business', 'family', 'advice', 'children']
const GROUPS: Group[] = ['underground', 'surface', 'processing', 'office', 'contractor', 'supplier', 'power', 'retired', 'family']
const STATUSES: Status[] = ['active', 'upcoming', 'unclear', 'planned', 'closed', 'legacy']
const EVIDENCE: Evidence[] = ['VERIFIED', 'REPORTED', 'UNVERIFIED']

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')
}

export default function Programmes() {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes } = useProgrammes()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const f = {
    country: params.get('country') ?? '',
    need: params.get('need') ?? '',
    group: params.get('group') ?? '',
    employer: params.get('employer') ?? '',
    region: params.get('region') ?? '',
    status: params.get('status') ?? '',
    evidence: params.get('evidence') ?? '',
    individual: params.get('individual') === '1',
    closed: params.get('closed') === '1',
  }
  const setF = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const list = useMemo(() => {
    const nq = norm(q.trim())
    return programmes
      .filter((p) => (f.closed || f.status ? true : p.status !== 'closed' && p.status !== 'legacy'))
      .filter((p) => !f.individual || p.individual)
      .filter((p) => !f.country || p.country === f.country)
      .filter((p) => !f.need || p.needs.includes(f.need as Need))
      .filter((p) => !f.group || p.groups.includes(f.group as Group))
      .filter((p) => !f.employer || p.employers.includes(f.employer))
      .filter((p) => !f.region || p.regions.length === 0 || p.regions.includes(f.region))
      .filter((p) => !f.status || p.status === f.status)
      .filter((p) => !f.evidence || p.evidence === f.evidence)
      .filter((p) => {
        if (!nq) return true
        const hay = norm([p.id, p.name_local, p.name_en, p.intro, p.who_for, p.what_you_get, p.territory, p.operator, pickSummary(p, lang)].join(' '))
        return nq.split(/\s+/).every((w) => hay.includes(w))
      })
  }, [programmes, q, f.country, f.need, f.group, f.employer, f.region, f.status, f.evidence, f.individual, f.closed, lang])

  const sel = (key: string, label: string, opts: { v: string; l: string }[]) => (
    <label className="block">
      <span className="label text-sm">{label}</span>
      <select className="field" value={(f as Record<string, string | boolean>)[key] as string} onChange={(e) => setF(key, e.target.value)}>
        <option value="">{t('common.all')}</option>
        {opts.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  )

  const employers = f.country === 'PL' ? PL_EMPLOYERS : f.country === 'CZ' ? CZ_EMPLOYERS : [...PL_EMPLOYERS, ...CZ_EMPLOYERS.filter((e) => e !== 'OTHER')]
  const regions = f.country === 'PL' ? PL_REGIONS : f.country === 'CZ' ? CZ_REGIONS : [...PL_REGIONS, ...CZ_REGIONS]

  return (
    <>
      <PageHeader title={t('programmes.title')} intro={t('programmes.intro', { count: programmes.length })} />
      <Section>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-4 no-print" aria-label={t('programmes.filters')}>
            <label className="block">
              <span className="label">{t('common.search')}</span>
              <input className="field" type="search" value={q} placeholder={t('programmes.searchPh')} onChange={(e) => setQ(e.target.value)} />
            </label>
            {sel('country', t('programmes.f_country'), [
              { v: 'CZ', l: t('countries.CZ') },
              { v: 'PL', l: t('countries.PL') },
              { v: 'XB', l: t('countries.XB') },
            ])}
            {sel('need', t('programmes.f_need'), NEEDS.map((n) => ({ v: n, l: t(`needs.${n}`) })))}
            {sel('group', t('programmes.f_group'), GROUPS.map((g) => ({ v: g, l: t(`groups.${g}`) })))}
            {sel('employer', t('programmes.f_employer'), employers.map((e) => ({ v: e, l: t(`employers.${e}`) })))}
            {sel('region', t('programmes.f_region'), regions.map((r) => ({ v: r, l: t(`regions.${r}`) })))}
            {sel('status', t('programmes.f_status'), STATUSES.map((s) => ({ v: s, l: t(`status.${s}`) })))}
            {sel('evidence', t('programmes.f_evidence'), EVIDENCE.map((s) => ({ v: s, l: t(`evidence.${s}`) })))}
            <label className="flex items-center gap-3 text-lg">
              <input type="checkbox" className="h-6 w-6 accent-[#F47B20]" checked={f.individual} onChange={(e) => setF('individual', e.target.checked ? '1' : '')} />
              {t('programmes.onlyIndividual')}
            </label>
            <label className="flex items-center gap-3 text-lg">
              <input type="checkbox" className="h-6 w-6 accent-[#F47B20]" checked={f.closed} onChange={(e) => setF('closed', e.target.checked ? '1' : '')} />
              {t('programmes.includeClosed')}
            </label>
            <button type="button" className="btn btn-outline w-full" onClick={() => { setQ(''); setParams({}, { replace: true }) }}>
              {t('programmes.clear')}
            </button>
          </aside>
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="display text-xl font-bold">{t('programmes.count', { count: list.length })}</p>
              <button type="button" className="btn btn-outline no-print" onClick={() => window.print()}>
                {t('common.print')}
              </button>
            </div>
            {list.length === 0 ? (
              <p className="card p-6 text-lg">{t('programmes.empty')}</p>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {list.map((p) => (
                  <ProgrammeCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}
