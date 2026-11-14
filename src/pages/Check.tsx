import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Choice, MineLift, PageHeader, ProgrammeCard, SafetyBox, Section, useLang } from '../components/ui'
import {
  CZ_EMPLOYERS, PL_EMPLOYERS, STEP_ORDER, addMonths, czAllowanceEstimate, evaluate, regionsOf,
  type Profile, type Result,
} from '../data/rules'
import type { Group, Need } from '../data/types'
import { daysUntil, displayName, fmtDate, useProgrammes } from '../lib/content'
import { insert, prefs } from '../lib/store'
import { useAuth } from '../lib/auth'

const GROUPS: Group[] = ['underground', 'surface', 'processing', 'office', 'contractor', 'supplier', 'power', 'retired', 'family']
const NEEDS: Need[] = ['money', 'pension', 'job', 'training', 'business', 'family', 'advice', 'children']

type Draft = Partial<Profile>
type StepId =
  | 'workCountry' | 'liveCountry' | 'group' | 'employer' | 'situation' | 'plEmployed' | 'plLeftWhen'
  | 'yearsToPension' | 'service' | 'age' | 'czShifts' | 'region' | 'workRegion' | 'needs'

/** The workplace region is asked only when the mine is in another country than home. */
const asksWorkRegion = (d: Draft) => d.liveCountry !== d.workCountry && d.group !== 'family' && d.group !== 'retired'

function stepsFor(d: Draft): StepId[] {
  const s: StepId[] = ['workCountry', 'liveCountry', 'group']
  const fam = d.group === 'family'
  const ret = d.group === 'retired'
  if (!fam) s.push('employer')
  if (!fam && !ret) s.push('situation')
  if (d.workCountry === 'PL' && !fam && !ret) {
    if (d.situation === 'working' || d.situation === 'leaving') s.push('plEmployed')
    if (d.situation === 'left_lt6' || d.situation === 'left_gt6') s.push('plLeftWhen')
  }
  if (!fam && !ret) s.push('yearsToPension')
  if (!fam) s.push('service', 'age')
  if (d.workCountry === 'CZ' && (d.group === 'underground' || ret)) s.push('czShifts')
  if (regionsOf(d.liveCountry).length) s.push('region')
  if (asksWorkRegion(d)) s.push('workRegion')
  s.push('needs')
  return s
}

function answered(id: StepId, d: Draft): boolean {
  switch (id) {
    case 'workCountry': return !!d.workCountry
    case 'liveCountry': return !!d.liveCountry
    case 'group': return !!d.group
    case 'employer': return !!d.employer
    case 'situation': return !!d.situation
    case 'plEmployed': return !!d.plEmployedJan2026
    case 'plLeftWhen': return !!d.plLeftWhen
    case 'yearsToPension': return !!d.yearsToPension
    case 'service': return !!d.service
    case 'age': return !!d.age
    case 'czShifts': return !!d.czShifts && !!d.czStartBefore2016
    case 'region': return regionsOf(d.liveCountry).includes(d.region ?? '')
    case 'workRegion': return regionsOf(d.workCountry).includes(d.workRegion ?? '')
    case 'needs': return true
  }
}

function complete(d: Draft): Profile {
  const fam = d.group === 'family'
  const ret = d.group === 'retired'
  return {
    workCountry: d.workCountry ?? 'CZ',
    liveCountry: d.liveCountry ?? d.workCountry ?? 'CZ',
    group: d.group ?? 'underground',
    employer: fam ? 'OTHER' : d.employer ?? 'OTHER',
    situation: fam ? 'working' : ret ? 'left_gt6' : d.situation ?? 'working',
    leaveDate: d.leaveDate,
    plEmployedJan2026: d.plEmployedJan2026,
    plLeftWhen: d.plLeftWhen,
    yearsToPension: fam ? 'unknown' : ret ? 'lt1' : d.yearsToPension ?? 'unknown',
    service: d.service ?? 'lt2',
    age: d.age ?? 'lt50',
    czShifts: d.czShifts,
    czStartBefore2016: d.czStartBefore2016,
    region: regionsOf(d.liveCountry).includes(d.region ?? '') ? d.region! : '',
    workRegion: asksWorkRegion(d) && regionsOf(d.workCountry).includes(d.workRegion ?? '') ? d.workRegion : undefined,
    needs: d.needs ?? [],
  }
}

export default function Check() {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<Draft>(() => prefs.get<Draft>('profileDraft', {}))
  const [i, setI] = useState(0)
  const [showResults, setShowResults] = useState<boolean>(() => prefs.get('profileDone', false))
  const steps = stepsFor(draft)
  const step = steps[Math.min(i, steps.length - 1)]

  const set = (patch: Draft) => {
    const next = { ...draft, ...patch }
    setDraft(next)
    prefs.set('profileDraft', next)
  }
  const go = (delta: number) => setI((x) => Math.max(0, Math.min(steps.length - 1, x + delta)))
  const pick = (patch: Draft) => {
    set(patch)
    // Advance to the step after this one, so a double tap or a quick "Next" cannot skip a question.
    const from = i
    setTimeout(() => setI(from + 1), 150)
  }

  if (showResults) {
    return (
      <Results
        profile={complete(draft)}
        onEdit={() => {
          setShowResults(false)
          prefs.set('profileDone', false)
          setI(0)
        }}
      />
    )
  }

  const employers = draft.workCountry === 'PL' ? PL_EMPLOYERS : CZ_EMPLOYERS

  const q = (key: string) => <h2 className="text-3xl sm:text-4xl font-bold mb-6">{t(key)}</h2>
  const grid = 'grid gap-3 sm:grid-cols-2'

  return (
    <>
      <PageHeader title={t('check.title')} intro={t('check.intro')} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="display font-bold text-coal/70">{t('check.step', { n: i + 1, total: steps.length })}</p>
            <div className="mt-2 h-3 rounded-full bg-coal/10 overflow-hidden">
              <div className="h-full bg-orange transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
            </div>
          </div>

          {step === 'workCountry' && (
            <div>
              {q('check.q_workCountry')}
              <div className={grid}>
                {(['CZ', 'PL'] as const).map((c) => (
                  <Choice key={c} selected={draft.workCountry === c} onClick={() => pick({ workCountry: c, employer: undefined, workRegion: undefined })}>
                    {c === 'CZ' ? '🇨🇿' : '🇵🇱'} {t(`countries.${c}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'liveCountry' && (
            <div>
              {q('check.q_liveCountry')}
              <div className={grid}>
                {(['CZ', 'PL', 'OTHER'] as const).map((c) => (
                  <Choice key={c} selected={draft.liveCountry === c} onClick={() => pick({ liveCountry: c, region: undefined })}>
                    {t(`countries.${c}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'group' && (
            <div>
              {q('check.q_group')}
              <div className={grid}>
                {GROUPS.map((g) => (
                  <Choice key={g} selected={draft.group === g} onClick={() => pick({ group: g })}>
                    {t(`groups.${g}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'employer' && (
            <div>
              {q('check.q_employer')}
              <div className={grid}>
                {employers.map((e) => (
                  <Choice key={e} selected={draft.employer === e} onClick={() => pick({ employer: e })}>
                    {t(`employers.${e}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'situation' && (
            <div>
              {q('check.q_situation')}
              <div className={grid}>
                {(['working', 'leaving', 'left_lt6', 'left_gt6'] as const).map((s) => (
                  <Choice key={s} selected={draft.situation === s} onClick={() => set({ situation: s })}>
                    {t(`check.sit_${s}`)}
                  </Choice>
                ))}
              </div>
              {draft.situation && draft.situation !== 'working' && (
                <label className="mt-6 block max-w-sm">
                  <span className="label">
                    {t('check.leaveDate')} ({t('common.optional')})
                  </span>
                  <input type="date" className="field" value={draft.leaveDate ?? ''} onChange={(e) => set({ leaveDate: e.target.value || undefined })} />
                  <span className="text-sm text-coal/60">{t('check.leaveDateHint')}</span>
                </label>
              )}
            </div>
          )}
          {step === 'plEmployed' && (
            <div>
              {q('check.q_plEmployedJan2026')}
              <div className={grid}>
                {(['yes', 'no', 'unknown'] as const).map((v) => (
                  <Choice key={v} selected={draft.plEmployedJan2026 === v} onClick={() => pick({ plEmployedJan2026: v })}>
                    {t(`common.${v}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'plLeftWhen' && (
            <div>
              {q('check.q_plLeftWhen')}
              <div className="grid gap-3">
                {(['before2021', '2021to2025', '2026'] as const).map((v) => (
                  <Choice key={v} selected={draft.plLeftWhen === v} onClick={() => pick({ plLeftWhen: v })}>
                    {t(`check.left_${v}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'yearsToPension' && (
            <div>
              {q('check.q_yearsToPension')}
              <div className={grid}>
                {(['lt1', '1to4', '5', '6to10', 'gt10', 'unknown'] as const).map((v) => (
                  <Choice key={v} selected={draft.yearsToPension === v} onClick={() => pick({ yearsToPension: v })}>
                    {t(`check.ytp_${v}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'service' && (
            <div>
              {q('check.q_service')}
              <div className={grid}>
                {(['lt2', '2to3', '3to5', '5to15', '16to24', '25plus'] as const).map((v) => (
                  <Choice key={v} selected={draft.service === v} onClick={() => pick({ service: v })}>
                    {t(`check.svc_${v}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'age' && (
            <div>
              {q('check.q_age')}
              <div className={grid}>
                {(['lt50', '50to54', '55plus'] as const).map((v) => (
                  <Choice key={v} selected={draft.age === v} onClick={() => pick({ age: v })}>
                    {t(`check.age_${v}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'czShifts' && (
            <div className="space-y-8">
              <div>
                {q('check.q_czShifts')}
                <div className={grid}>
                  {(['yes', 'almost', 'no', 'unknown'] as const).map((v) => (
                    <Choice key={v} selected={draft.czShifts === v} onClick={() => set({ czShifts: v })}>
                      {v === 'unknown' ? t('common.unknown') : t(`check.shifts_${v}`)}
                    </Choice>
                  ))}
                </div>
                <p className="mt-2 text-coal/70">{t('check.shiftsHint')}</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3">{t('check.q_czStartBefore2016')}</h3>
                <div className={grid}>
                  {(['yes', 'no', 'unknown'] as const).map((v) => (
                    <Choice key={v} selected={draft.czStartBefore2016 === v} onClick={() => set({ czStartBefore2016: v })}>
                      {t(`common.${v}`)}
                    </Choice>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 'region' && (
            <div>
              {q('check.q_region')}
              <div className={grid}>
                {regionsOf(draft.liveCountry).map((r) => (
                  <Choice key={r} selected={draft.region === r} onClick={() => pick({ region: r })}>
                    {t(`regions.${r}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'workRegion' && (
            <div>
              {q('check.q_workRegion')}
              <div className={grid}>
                {regionsOf(draft.workCountry).map((r) => (
                  <Choice key={r} selected={draft.workRegion === r} onClick={() => pick({ workRegion: r })}>
                    {t(`regions.${r}`)}
                  </Choice>
                ))}
              </div>
            </div>
          )}
          {step === 'needs' && (
            <div>
              {q('check.q_needs')}
              <div className={grid}>
                {NEEDS.map((n) => {
                  const sel = (draft.needs ?? []).includes(n)
                  return (
                    <Choice
                      key={n}
                      selected={sel}
                      onClick={() => set({ needs: sel ? (draft.needs ?? []).filter((x) => x !== n) : [...(draft.needs ?? []), n] })}
                    >
                      {sel ? '✓ ' : ''}
                      {t(`needs.${n}`)}
                    </Choice>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {i > 0 && (
              <button type="button" className="btn btn-outline" onClick={() => go(-1)}>
                ← {t('common.back')}
              </button>
            )}
            {step !== 'needs' ? (
              <button type="button" className="btn btn-dark" disabled={!answered(step, draft)} onClick={() => go(1)}>
                {t('common.next')} →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  prefs.set('profileDone', true)
                  setShowResults(true)
                  window.scrollTo(0, 0)
                }}
              >
                {t('check.seeResults')} →
              </button>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}

function Results({ profile, onEdit }: { profile: Profile; onEdit: () => void }) {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const { programmes } = useProgrammes()
  const results = useMemo(() => evaluate(profile, programmes), [profile, programmes])
  const by = (v: Result['verdict']) => results.filter((r) => r.verdict === v)
  const likely = by('likely')
  const [done, setDone] = useState<string[]>(() => prefs.get('routeDone', []))
  const [saved, setSaved] = useState(false)

  const route = useMemo(() => {
    const ids = new Set(likely.map((r) => r.programme.id))
    const ordered = STEP_ORDER.filter((id) => ids.has(id))
    for (const r of likely) if (!ordered.includes(r.programme.id)) ordered.push(r.programme.id)
    return ordered.map((id) => programmes.find((p) => p.id === id)!).filter(Boolean)
  }, [likely, programmes])

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id]
    setDone(next)
    prefs.set('routeDone', next)
  }

  const czClock =
    profile.workCountry === 'CZ' && ['OKD', 'DIAMO', 'SU', 'SEV', 'LISTED'].includes(profile.employer) && profile.situation !== 'working'
  const deadline = czClock && profile.leaveDate ? addMonths(profile.leaveDate, 6) : null
  const estimate = profile.workCountry === 'CZ' ? czAllowanceEstimate(profile) : null
  const cross = profile.liveCountry !== profile.workCountry

  async function saveRoute() {
    if (!user) return
    await insert('user_routes', {
      user_id: user.id,
      profile,
      steps: route.map((p) => p.id),
      done,
      deadline: deadline ? deadline.toISOString().slice(0, 10) : null,
    })
    setSaved(true)
  }

  const stepText = (id: string) =>
    t(`step.${id}`, {
      defaultValue: t('step.generic', {
        name: displayName(programmes.find((p) => p.id === id)!, lang),
        operator: programmes.find((p) => p.id === id)?.operator || '',
      }),
    })

  return (
    <>
      <PageHeader title={t('check.resultsTitle')} intro={t('common.guideNotDecision')}>
        <div className="mt-4 flex flex-wrap gap-3 no-print">
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            {t('check.edit')}
          </button>
          <button type="button" className="btn border-white text-white hover:bg-white hover:text-coal" onClick={() => window.print()}>
            {t('check.printRoute')}
          </button>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {czClock && (
            <SafetyBox title={t('check.deadlineTitle')}>
              {deadline ? (
                <>
                  <p className="text-lg">{t('check.deadlineText', { date: fmtDate(deadline.toISOString(), lang) })}</p>
                  <p className="display mt-2 text-3xl font-bold text-orange-deep">
                    {daysUntil(deadline) >= 0 ? t('check.deadlineDays', { days: daysUntil(deadline) }) : t('check.deadlinePassed')}
                  </p>
                </>
              ) : (
                <p>{t('check.deadlineNoDate')}</p>
              )}
            </SafetyBox>
          )}
          {estimate && (
            <div className="card p-5 border-2 !border-coal">
              <p className="display text-xl font-bold">{t('check.estimateTitle')}</p>
              <p className="mt-1 text-2xl font-bold text-orange-deep">
                {t('check.estimateText', { monthly: estimate.monthly.toLocaleString(lang), months: estimate.months })}
              </p>
              <p className="mt-2 text-sm text-coal/70">{t('check.estimateNote')}</p>
            </div>
          )}
          {cross && (
            <div className="card p-5 border-2 !border-orange bg-orange-pale">
              <p className="display text-xl font-bold">🇨🇿 ⇄ 🇵🇱 {t('check.crossTitle')}</p>
              <p className="mt-1">{t('check.crossText')}</p>
            </div>
          )}
        </div>
      </Section>

      {route.length > 0 && (
        <Section title={t('check.routeTitle')}>
          <p className="mb-4 text-coal/70">{t('check.routeHint')}</p>
          <div className="grid gap-6 md:grid-cols-[auto_1fr] items-start">
            <MineLift done={route.filter((p) => done.includes(p.id)).length} total={route.length} />
            <ol className="space-y-3">
              {route.map((p, idx) => (
                <li key={p.id} className={`card p-4 flex gap-4 items-start ${done.includes(p.id) ? 'bg-orange-pale' : ''}`}>
                  <input
                    type="checkbox"
                    className="mt-1 h-7 w-7 accent-[#F47B20] shrink-0"
                    checked={done.includes(p.id)}
                    onChange={() => toggle(p.id)}
                    aria-label={displayName(p, lang)}
                  />
                  <div>
                    <p className="text-lg font-bold">
                      {idx + 1}. {stepText(p.id)}
                    </p>
                    <Link to={`/programmes/${p.id}`} className="text-sm font-semibold underline underline-offset-4 text-orange-deep">
                      {displayName(p, lang)} →
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 no-print">
            {user ? (
              <button type="button" className="btn btn-dark" onClick={() => void saveRoute()} disabled={saved}>
                {saved ? t('common.saved') : t('check.saveRoute')}
              </button>
            ) : (
              <Link to="/account" className="btn btn-outline">
                {t('check.loginToSave')}
              </Link>
            )}
          </div>
        </Section>
      )}

      {(['likely', 'check', 'no'] as const).map((v) => {
        const list = by(v)
        if (!list.length) return null
        return (
          <Section key={v} title={t(v === 'check' ? 'check.checkGroup' : `check.${v}`)}>
            <p className="mb-4 text-coal/70">{t(v === 'check' ? 'check.checkGroupHint' : `check.${v}Hint`)}</p>
            <div className="grid gap-4 md:grid-cols-2">
              {list.map((r) => (
                <ProgrammeCard key={r.programme.id} p={r.programme} reason={r.reason} tone={v} />
              ))}
            </div>
          </Section>
        )
      })}
      {results.length === 0 && (
        <Section>
          <p className="text-lg">{t('check.noneFound')}</p>
        </Section>
      )}
    </>
  )
}
