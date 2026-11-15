import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Field, MineLift, PageHeader, ProgrammeCard, SafetyBox, Section, useLang } from '../components/ui'
import { useAuth } from '../lib/auth'
import { insert, list, remove, update, type Row } from '../lib/store'
import { daysUntil, displayName, fmtDate, useEvents, useProgrammes } from '../lib/content'
import { isDemo } from '../lib/supabase'

const APP_STATUSES = ['planned', 'applied', 'approved', 'refused'] as const

function Login() {
  const { t } = useTranslation()
  const { signIn, signInDemo, signUp, magicLink } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [f, setF] = useState({ email: '', password: '', name: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  return (
    <Section>
      <div className="mx-auto max-w-md card p-6 space-y-4">
        <h2 className="text-3xl font-bold">{mode === 'login' ? t('account.login') : t('account.register')}</h2>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setErr('')
            try {
              if (mode === 'login') await signIn(f.email, f.password)
              else await signUp(f.email, f.password, f.name)
            } catch (x) {
              const m = (x as Error).message
              setErr(t(`account.${m}`, { defaultValue: m || t('common.error') }))
            }
          }}
        >
          {mode === 'register' && (
            <Field label={t('account.name')}>
              <input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
            </Field>
          )}
          <Field label={t('account.email')}>
            <input required type="email" className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
          </Field>
          <Field label={t('account.password')}>
            <input
              required
              type="password"
              minLength={mode === 'register' ? 8 : undefined}
              className="field"
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Field>
          {err && <p className="font-bold text-alarm">{err}</p>}
          {msg && <p className="font-bold text-ok">{msg}</p>}
          <button className="btn btn-primary w-full">{mode === 'login' ? t('account.login') : t('account.register')}</button>
        </form>
        {mode === 'login' && !isDemo && (
          <button
            type="button"
            className="btn btn-outline w-full"
            onClick={async () => {
              if (!f.email) return
              try {
                await magicLink(f.email)
                setMsg(t('account.magicSent'))
              } catch (x) {
                setErr((x as Error).message)
              }
            }}
          >
            ✉ {t('account.magic')}
          </button>
        )}
        {isDemo && mode === 'login' && (
          <div className="rounded-xl border-2 border-dashed border-orange bg-orange-pale p-4">
            <button type="button" className="btn btn-dark w-full" onClick={() => void signInDemo()}>
              {t('account.tryDemo')}
            </button>
            <p className="mt-2 text-sm">{t('account.tryDemoText')}</p>
          </div>
        )}
        <p>
          {mode === 'login' ? t('account.noAccount') : t('account.haveAccount')}{' '}
          <button type="button" className="font-bold underline" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? t('account.register') : t('account.login')}
          </button>
        </p>
      </div>
    </Section>
  )
}

export default function Account() {
  const { t } = useTranslation()
  const lang = useLang()
  const { user, signOut, loading } = useAuth()
  const { programmes } = useProgrammes()
  const events = useEvents()
  const [saved, setSaved] = useState<Row[]>([])
  const [routes, setRoutes] = useState<Row[]>([])
  const [apps, setApps] = useState<Row[]>([])
  const [newApp, setNewApp] = useState({ programme_id: '', status: 'planned', note: '' })

  async function load() {
    if (!user) return
    const [s, r, a] = await Promise.all([
      list('saved_items', { eq: { user_id: user.id } }),
      list('user_routes', { eq: { user_id: user.id }, order: 'created_at' }),
      list('applications', { eq: { user_id: user.id }, order: 'created_at' }),
    ])
    setSaved(s)
    setRoutes(r)
    setApps(a)
  }
  useEffect(() => {
    void load().catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) return <p className="p-8">{t('common.loading')}</p>
  if (!user)
    return (
      <>
        <PageHeader title={t('account.title')} />
        <Login />
      </>
    )

  const route = routes[0]
  const routeSteps = (route?.steps as string[] | undefined) ?? []
  const routeDone = (route?.done as string[] | undefined) ?? []
  const savedProgs = saved.map((s) => programmes.find((p) => p.id === s.programme_id)).filter(Boolean)
  const today = new Date().toISOString().slice(0, 10)
  const relevantIds = new Set([...routeSteps, ...saved.map((s) => s.programme_id as string)])
  const myEvents = events.filter((e) => e.date >= today && e.programmeIds?.some((id) => relevantIds.has(id)))

  return (
    <>
      <PageHeader title={t('account.hello', { name: user.name })}>
        <button type="button" className="btn btn-primary mt-4" onClick={() => void signOut()}>
          {t('account.logout')}
        </button>
      </PageHeader>

      <Section title={t('account.deadlines')}>
        {route?.deadline ? (
          <SafetyBox title={t('check.deadlineTitle')}>
            <p className="text-lg">{t('check.deadlineText', { date: fmtDate(String(route.deadline), lang) })}</p>
            <p className="display text-2xl font-bold text-orange-deep">
              {daysUntil(new Date(String(route.deadline))) >= 0 ? t('check.deadlineDays', { days: daysUntil(new Date(String(route.deadline))) }) : t('check.deadlinePassed')}
            </p>
          </SafetyBox>
        ) : null}
        <ul className="mt-4 space-y-2">
          {myEvents.map((e) => (
            <li key={e.id} className="card p-4">
              <b className="text-orange-deep">{e.dateLabel ? e.dateLabel[lang] : fmtDate(e.date, lang)}</b>: {e.title[lang]}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('account.route')}>
        {routeSteps.length ? (
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <MineLift done={routeSteps.filter((s) => routeDone.includes(s)).length} total={routeSteps.length} />
            <ol className="space-y-2">
              {routeSteps.map((id, i) => {
                const p = programmes.find((x) => x.id === id)
                const isDone = routeDone.includes(id)
                return (
                  <li key={id} className={`card p-4 flex items-center gap-3 ${isDone ? 'bg-orange-pale' : ''}`}>
                    <input
                      type="checkbox"
                      className="h-6 w-6 accent-[#F47B20]"
                      checked={isDone}
                      onChange={async () => {
                        const next = isDone ? routeDone.filter((x) => x !== id) : [...routeDone, id]
                        await update('user_routes', route!.id, { done: next })
                        await load()
                      }}
                    />
                    <span className="font-semibold">
                      {i + 1}. {t(`step.${id}`, { defaultValue: p ? displayName(p, lang) : id })}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        ) : (
          <p>
            {t('account.emptyRoute')}{' '}
            <Link to="/check" className="btn btn-primary ml-2">
              {t('account.makeRoute')}
            </Link>
          </p>
        )}
      </Section>

      <Section title={t('account.applications')}>
        <form
          className="card p-4 grid gap-3 sm:grid-cols-[2fr_1fr_2fr_auto] items-end mb-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!newApp.programme_id) return
            await insert('applications', { ...newApp, user_id: user.id })
            setNewApp({ programme_id: '', status: 'planned', note: '' })
            await load()
          }}
        >
          <Field label={t('account.appProgramme')}>
            <select className="field" value={newApp.programme_id} onChange={(e) => setNewApp({ ...newApp, programme_id: e.target.value })}>
              <option value="">…</option>
              {programmes
                .filter((p) => p.individual && p.status !== 'closed')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} · {displayName(p, lang)}
                  </option>
                ))}
            </select>
          </Field>
          <Field label={t('account.appStatus')}>
            <select className="field" value={newApp.status} onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}>
              {APP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`account.st_${s}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('account.appNote')}>
            <input className="field" value={newApp.note} onChange={(e) => setNewApp({ ...newApp, note: e.target.value })} />
          </Field>
          <button className="btn btn-primary">+ {t('account.addApp')}</button>
        </form>
        <ul className="space-y-2">
          {apps.map((a) => {
            const p = programmes.find((x) => x.id === a.programme_id)
            return (
              <li key={a.id} className="card p-4 grid gap-2 sm:grid-cols-[2fr_1fr_auto] items-center">
                <div>
                  <Link to={`/programmes/${a.programme_id}`} className="font-bold underline underline-offset-4">
                    {p ? displayName(p, lang) : String(a.programme_id)}
                  </Link>
                  {a.note ? <p className="text-sm text-coal/70">{String(a.note)}</p> : null}
                </div>
                <select
                  className="field"
                  value={String(a.status)}
                  onChange={async (e) => {
                    await update('applications', a.id, { status: e.target.value })
                    await load()
                  }}
                >
                  {APP_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`account.st_${s}`)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={async () => {
                    await remove('applications', a.id)
                    await load()
                  }}
                >
                  {t('common.delete')}
                </button>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title={t('account.saved')}>
        {savedProgs.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {savedProgs.map((p) => (
              <ProgrammeCard key={p!.id} p={p!} />
            ))}
          </div>
        ) : (
          <p>{t('account.emptySaved')}</p>
        )}
      </Section>
    </>
  )
}
