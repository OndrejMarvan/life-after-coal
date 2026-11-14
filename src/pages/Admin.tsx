import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Field, PageHeader, Section, StatusBadge, useLang } from '../components/ui'
import { useAuth } from '../lib/auth'
import { insert, list, update, upsert, type Row } from '../lib/store'
import { displayName, fmtDate, useEvents, useProgrammes } from '../lib/content'
import type { Evidence, Lang, Programme, Status } from '../data/types'
import site from '../data/site.json'
import { buildDigest, digestHtml } from './Digest'

const TABS = ['programmes', 'import', 'events', 'callbacks', 'subscribers', 'digest', 'moderation', 'recheck', 'suggestions'] as const
type Tab = (typeof TABS)[number]
const STATUSES: Status[] = ['active', 'upcoming', 'unclear', 'planned', 'closed', 'legacy']
const EVIDENCE: Evidence[] = ['VERIFIED', 'REPORTED', 'UNVERIFIED']
const TEXT_FIELDS = ['intro', 'who_for', 'who_excluded', 'what_you_get', 'conditions', 'how_to_apply', 'operator', 'contact', 'dates', 'known_problems'] as const

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))]
  const cell = (v: unknown) => {
    const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [keys.join(','), ...rows.map((r) => keys.map((k) => cell(r[k])).join(','))].join('\n')
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') q = false
      else cur += c
    } else if (c === '"') q = true
    else if (c === ',') {
      row.push(cur)
      cur = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cur)
      rows.push(row)
      row = []
      cur = ''
    } else cur += c
  }
  if (cur || row.length) {
    row.push(cur)
    rows.push(row)
  }
  const [head, ...body] = rows.filter((r) => r.some((x) => x.trim()))
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ''])))
}

function download(name: string, text: string, type = 'text/csv') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
}

export default function Admin() {
  const { t } = useTranslation()
  const { user, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('programmes')
  if (loading) return <p className="p-8">{t('common.loading')}</p>
  if (!user?.isAdmin)
    return (
      <Section>
        <p className="text-xl">{t('admin.notAdmin')}</p>
        <Link to="/account" className="btn btn-dark mt-4">
          {t('nav.login')}
        </Link>
      </Section>
    )
  return (
    <>
      <PageHeader title={t('admin.title')} />
      <Section>
        <div className="flex flex-wrap gap-2 mb-6" role="tablist">
          {TABS.map((x) => (
            <button key={x} type="button" role="tab" aria-selected={tab === x} onClick={() => setTab(x)} className={`rounded-full px-4 py-2 font-semibold border-2 ${tab === x ? 'bg-orange border-orange' : 'border-coal/20 bg-white'}`}>
              {t(`admin.tab_${x}`)}
            </button>
          ))}
        </div>
        {tab === 'programmes' && <ProgrammesTab />}
        {tab === 'import' && <ImportTab />}
        {tab === 'events' && <EventsTab />}
        {tab === 'callbacks' && <TableTab table="callback_requests" />}
        {tab === 'subscribers' && <TableTab table="newsletter_subscribers" />}
        {tab === 'digest' && <DigestTab />}
        {tab === 'moderation' && <ModerationTab />}
        {tab === 'recheck' && <RecheckTab />}
        {tab === 'suggestions' && <SuggestionsTab />}
      </Section>
    </>
  )
}

function ProgrammesTab() {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes, reload } = useProgrammes()
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState<Programme | null>(null)
  const [trLang, setTrLang] = useState<Lang>('cs')
  const [saved, setSaved] = useState(false)
  const shown = programmes.filter((p) => !q || `${p.id} ${p.name_local} ${p.name_en}`.toLowerCase().includes(q.toLowerCase()))

  if (edit) {
    const set = (patch: Partial<Programme>) => {
      setEdit({ ...edit, ...patch })
      setSaved(false)
    }
    const setTr = (field: string, value: string) => {
      const i18n = { ...(edit.i18n ?? {}) }
      i18n[trLang] = { ...(i18n[trLang] ?? {}), [field]: value }
      set({ i18n })
    }
    return (
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          const today = new Date().toISOString().slice(0, 10)
          await upsert('programmes', { ...edit, last_checked: today, updated_at: new Date().toISOString() } as unknown as Row)
          setSaved(true)
          reload()
        }}
      >
        <h2 className="text-2xl font-bold">
          {t('admin.editProgramme')}: {edit.id}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="ID">
            <input required className="field" value={edit.id} onChange={(e) => set({ id: e.target.value, code: e.target.value })} />
          </Field>
          <Field label={t('common.country')}>
            <select className="field" value={edit.country} onChange={(e) => set({ country: e.target.value as Programme['country'] })}>
              <option value="CZ">CZ</option>
              <option value="PL">PL</option>
              <option value="XB">XB</option>
            </select>
          </Field>
          <Field label="name_local">
            <input className="field" value={edit.name_local} onChange={(e) => set({ name_local: e.target.value })} />
          </Field>
          <Field label="name_en">
            <input className="field" value={edit.name_en} onChange={(e) => set({ name_en: e.target.value })} />
          </Field>
          <Field label={t('programmes.f_status')}>
            <select className="field" value={edit.status} onChange={(e) => set({ status: e.target.value as Status })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`status.${s}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('programmes.f_evidence')}>
            <select className="field" value={edit.evidence} onChange={(e) => set({ evidence: e.target.value as Evidence })}>
              {EVIDENCE.map((s) => (
                <option key={s} value={s}>
                  {t(`evidence.${s}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="URL">
            <input className="field" value={edit.url} onChange={(e) => set({ url: e.target.value })} />
          </Field>
          <label className="flex items-center gap-3 mt-7">
            <input type="checkbox" className="h-6 w-6 accent-[#F47B20]" checked={edit.individual} onChange={(e) => set({ individual: e.target.checked })} />
            {t('programmes.onlyIndividual')}
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {(['cs', 'pl', 'en'] as const).map((l) => (
            <Field key={l} label={`Summary (${l})`}>
              <textarea className="field min-h-28" value={edit.summary[l] ?? ''} onChange={(e) => set({ summary: { ...edit.summary, [l]: e.target.value } })} />
            </Field>
          ))}
        </div>
        <details className="card p-4" open>
          <summary className="display font-bold cursor-pointer">English fields</summary>
          <div className="mt-3 grid gap-3">
            {TEXT_FIELDS.map((k) => (
              <Field key={k} label={k}>
                <textarea className="field min-h-20" value={String(edit[k] ?? '')} onChange={(e) => set({ [k]: e.target.value } as Partial<Programme>)} />
              </Field>
            ))}
          </div>
        </details>
        <details className="card p-4">
          <summary className="display font-bold cursor-pointer">{t('admin.translation')}</summary>
          <div className="mt-3">
            <select className="field max-w-xs" value={trLang} onChange={(e) => setTrLang(e.target.value as Lang)}>
              <option value="cs">Čeština</option>
              <option value="pl">Polski</option>
            </select>
            <div className="mt-3 grid gap-3">
              {TEXT_FIELDS.map((k) => (
                <Field key={k} label={`${k} (${trLang})`}>
                  <textarea className="field min-h-20" value={edit.i18n?.[trLang]?.[k] ?? ''} onChange={(e) => setTr(k, e.target.value)} />
                </Field>
              ))}
            </div>
          </div>
        </details>
        <div className="flex gap-3 items-center">
          <button className="btn btn-primary">{t('common.save')}</button>
          <button type="button" className="btn btn-outline" onClick={() => setEdit(null)}>
            {t('common.back')}
          </button>
          {saved && <span className="font-bold text-ok">✓ {t('common.saved')}</span>}
        </div>
      </form>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input className="field max-w-md" type="search" placeholder={t('programmes.searchPh')} value={q} onChange={(e) => setQ(e.target.value)} />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            setEdit({
              id: 'NEW-01', code: 'NEW-01', country: 'CZ', level: 'local', lang: 'cs', name_local: '', name_en: '', type: '', intro: '', who_for: '',
              who_excluded: '', what_you_get: '', conditions: '', how_to_apply: '', operator: '', contact: '', territory: '', dates: '', status_text: '',
              legal_basis: '', take_up: '', known_problems: '', evidence: 'UNVERIFIED', evidence_note: '', source_note: '', needs: [], groups: [], employers: [],
              regions: [], status: 'active', individual: true, url: '', summary: {}, last_checked: new Date().toISOString().slice(0, 10),
            })
          }
        >
          + {t('admin.newProgramme')}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => download('programmes.csv', toCsv(programmes as unknown as Record<string, unknown>[]))}>
          {t('admin.exportCsv')}
        </button>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-t border-coal/10">
                <td className="p-3 font-mono text-sm whitespace-nowrap">{p.id}</td>
                <td className="p-3">{displayName(p, lang)}</td>
                <td className="p-3">
                  <StatusBadge s={p.status} />
                </td>
                <td className="p-3 text-sm">{fmtDate(p.last_checked, lang)}</td>
                <td className="p-3">
                  <button type="button" className="btn btn-outline !min-h-10" onClick={() => setEdit(p)}>
                    {t('common.edit')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ImportTab() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  return (
    <div className="space-y-3">
      <p>{t('admin.importText')}</p>
      <textarea className="field min-h-64 font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} />
      <button
        type="button"
        className="btn btn-primary"
        onClick={async () => {
          try {
            const trimmed = text.trim()
            const rows: Record<string, unknown>[] = trimmed.startsWith('[') ? JSON.parse(trimmed) : parseCsv(trimmed)
            let n = 0
            for (const r of rows) {
              if (!r.id) continue
              for (const k of ['needs', 'groups', 'employers', 'regions', 'summary', 'i18n'])
                if (typeof r[k] === 'string' && (r[k] as string).trim().match(/^[[{]/)) r[k] = JSON.parse(r[k] as string)
              if (typeof r.individual === 'string') r.individual = r.individual !== 'false'
              await upsert('programmes', { ...r, updated_at: new Date().toISOString() } as unknown as Row)
              n++
            }
            setMsg(t('admin.imported', { count: n }))
          } catch (e) {
            setMsg(String((e as Error).message))
          }
        }}
      >
        {t('admin.importBtn')}
      </button>
      {msg && <p className="font-bold">{msg}</p>}
    </div>
  )
}

function EventsTab() {
  const { t } = useTranslation()
  const lang = useLang()
  const events = useEvents()
  const [f, setF] = useState({ date: '', country: 'CZ', kind: 'meeting', title_cs: '', title_pl: '', title_en: '', who: '', place: '', lat: '', lng: '', programmeIds: '' })
  const [ok, setOk] = useState(false)
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="card p-4 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          const title = { cs: f.title_cs || f.title_en, pl: f.title_pl || f.title_en, en: f.title_en || f.title_cs }
          await insert('events', {
            date: f.date, country: f.country, kind: f.kind, title, who: { cs: f.who, pl: f.who, en: f.who }, place: f.place || undefined,
            lat: f.lat ? Number(f.lat) : undefined, lng: f.lng ? Number(f.lng) : undefined,
            programmeIds: f.programmeIds ? f.programmeIds.split(/[ ,]+/) : undefined,
          })
          setOk(true)
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          <Field label={t('calendar.suggestDate')}>
            <input required type="date" className="field" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </Field>
          <Field label={t('common.country')}>
            <select className="field" value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}>
              <option>CZ</option>
              <option>PL</option>
              <option>XB</option>
            </select>
          </Field>
          <Field label="kind">
            <select className="field" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
              {['deadline', 'law', 'mine', 'call', 'meeting', 'fair', 'community'].map((k) => (
                <option key={k} value={k}>
                  {t(`calendar.kind_${k}`)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {(['cs', 'pl', 'en'] as const).map((l) => (
          <Field key={l} label={`${t('calendar.suggestTitle')} (${l})`}>
            <input className="field" value={f[`title_${l}`]} onChange={(e) => setF({ ...f, [`title_${l}`]: e.target.value })} />
          </Field>
        ))}
        <Field label={t('calendar.who')}>
          <input className="field" value={f.who} onChange={(e) => setF({ ...f, who: e.target.value })} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label={t('calendar.suggestPlace')}>
            <input className="field" value={f.place} onChange={(e) => setF({ ...f, place: e.target.value })} />
          </Field>
          <Field label="lat">
            <input className="field" value={f.lat} onChange={(e) => setF({ ...f, lat: e.target.value })} />
          </Field>
          <Field label="lng">
            <input className="field" value={f.lng} onChange={(e) => setF({ ...f, lng: e.target.value })} />
          </Field>
        </div>
        <Field label="Programme IDs">
          <input className="field" placeholder="CZ-P11, CZ-P13" value={f.programmeIds} onChange={(e) => setF({ ...f, programmeIds: e.target.value })} />
        </Field>
        <button className="btn btn-primary">{t('common.save')}</button>
        {ok && <span className="ml-3 font-bold text-ok">✓</span>}
      </form>
      <ul className="space-y-2">
        {events
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((e) => (
            <li key={e.id} className="card p-3 text-sm">
              <b>{e.date}</b> · {e.country} · {e.title[lang]}
            </li>
          ))}
      </ul>
    </div>
  )
}

function TableTab({ table }: { table: string }) {
  const { t } = useTranslation()
  const [rows, setRows] = useState<Row[]>([])
  const load = () => list(table, { order: 'created_at' }).then(setRows).catch(() => undefined)
  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table])
  const keys = useMemo(() => [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((k) => k !== 'id'), [rows])
  return (
    <div>
      <button type="button" className="btn btn-outline mb-3" onClick={() => download(`${table}.csv`, toCsv(rows))}>
        {t('admin.exportCsv')}
      </button>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-coal text-white">
            <tr>
              {keys.map((k) => (
                <th key={k} className="p-2">
                  {k}
                </th>
              ))}
              {table === 'callback_requests' && <th className="p-2" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={`border-t border-coal/10 ${r.status === 'done' ? 'opacity-50' : ''}`}>
                {keys.map((k) => (
                  <td key={k} className="p-2 align-top">
                    {typeof r[k] === 'object' ? JSON.stringify(r[k]) : String(r[k] ?? '')}
                  </td>
                ))}
                {table === 'callback_requests' && (
                  <td className="p-2">
                    <button
                      type="button"
                      className="btn btn-outline !min-h-9"
                      onClick={async () => {
                        await update(table, r.id, { status: r.status === 'done' ? 'new' : 'done' })
                        await load()
                      }}
                    >
                      {r.status === 'done' ? '↺' : `✓ ${t('admin.done')}`}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DigestTab() {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes } = useProgrammes()
  const events = useEvents()
  const [copied, setCopied] = useState(false)
  const d = buildDigest(programmes, events, lang)
  const html = digestHtml(d, lang, { app: t('appName'), deadlines: t('home.deadlinesTitle'), programmes: t('nav.programmes'), help: `${t('home.talkTitle')} ${t('hotline.emergency')}` })
  return (
    <div className="space-y-4">
      <p>{t('admin.digestText')}</p>
      <div className="flex flex-wrap gap-3">
        <Link to="/newsletter/digest" className="btn btn-primary">
          {t('admin.buildDigest')} (A4)
        </Link>
        <button
          type="button"
          className="btn btn-outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(html)
              setCopied(true)
            } catch {
              download('digest.html', html, 'text/html')
            }
          }}
        >
          {copied ? `✓ ${t('admin.copied')}` : t('admin.copyHtml')}
        </button>
      </div>
      <div className="card p-4" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}

function ModerationTab() {
  const { t } = useTranslation()
  const [reports, setReports] = useState<Row[]>([])
  const [stories, setStories] = useState<Row[]>([])
  const [posts, setPosts] = useState<Row[]>([])
  const [replies, setReplies] = useState<Row[]>([])
  const load = async () => {
    const [r, s, p, rp] = await Promise.all([list('reports', { order: 'created_at' }), list('stories', { order: 'created_at' }), list('forum_posts'), list('forum_replies')])
    setReports(r)
    setStories(s)
    setPosts(p)
    setReplies(rp)
  }
  useEffect(() => {
    void load().catch(() => undefined)
  }, [])
  const target = (r: Row) => (r.target_type === 'post' ? posts : replies).find((x) => x.id === r.target_id)
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="text-2xl font-bold mb-3">{t('forum.report')}</h2>
        <ul className="space-y-2">
          {reports
            .filter((r) => r.status !== 'done')
            .map((r) => {
              const x = target(r)
              return (
                <li key={r.id} className="card p-3">
                  <p className="text-sm text-coal/60">{String(r.target_type)}</p>
                  <p className="font-semibold">{String(x?.title ?? x?.body ?? r.target_id)}</p>
                  <div className="mt-2 flex gap-2">
                    {x && (
                      <button
                        type="button"
                        className="btn btn-dark !min-h-9"
                        onClick={async () => {
                          await update(r.target_type === 'post' ? 'forum_posts' : 'forum_replies', x.id, { hidden: !x.hidden })
                          await load()
                        }}
                      >
                        {x.hidden ? t('admin.show') : t('admin.hide')}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline !min-h-9"
                      onClick={async () => {
                        await update('reports', r.id, { status: 'done' })
                        await load()
                      }}
                    >
                      ✓ {t('admin.done')}
                    </button>
                  </div>
                </li>
              )
            })}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-3">{t('nav.stories')}</h2>
        <ul className="space-y-2">
          {stories.map((s) => (
            <li key={s.id} className="card p-3">
              <p className="font-bold">{String(s.title)}</p>
              <p className="text-sm whitespace-pre-wrap line-clamp-4">{String(s.body)}</p>
              <button
                type="button"
                className={`btn mt-2 !min-h-9 ${s.approved ? 'btn-outline' : 'btn-primary'}`}
                onClick={async () => {
                  await update('stories', s.id, { approved: !s.approved })
                  await load()
                }}
              >
                {s.approved ? t('admin.hide') : t('admin.approve')}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function RecheckTab() {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes, reload } = useProgrammes()
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  const stale = programmes.filter((p) => p.last_checked < cutoff || p.evidence !== 'VERIFIED' || p.status === 'unclear')
  return (
    <div className="space-y-6">
      <p>{t('admin.recheckText')}</p>
      <ul className="space-y-2">
        {stale.map((p) => (
          <li key={p.id} className="card p-3 flex flex-wrap items-center gap-3 justify-between">
            <span>
              <b className="font-mono">{p.id}</b> {displayName(p, lang)} · {t(`evidence.${p.evidence}`)} · {t(`status.${p.status}`)} · {fmtDate(p.last_checked, lang)}
            </span>
            <button
              type="button"
              className="btn btn-outline !min-h-9"
              onClick={async () => {
                await upsert('programmes', { ...p, last_checked: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() } as unknown as Row)
                reload()
              }}
            >
              {t('admin.markChecked')}
            </button>
          </li>
        ))}
      </ul>
      <h2 className="text-2xl font-bold">{t('portals.notFoundTitle')}</h2>
      <ul className="space-y-2" lang="en">
        {site.notFound.map((n, i) => (
          <li key={i} className="card p-3">
            <b>{n.country}</b> · {n.item} · <span className="text-coal/70">{n.confirm}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SuggestionsTab() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<Row[]>([])
  const load = () => list('suggestions', { order: 'created_at' }).then(setRows).catch(() => undefined)
  useEffect(() => {
    void load()
  }, [])
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.id} className={`card p-3 ${r.status === 'done' ? 'opacity-50' : ''}`}>
          <p className="text-sm text-coal/60">{String(r.kind)}</p>
          <p className="font-bold">{String(r.title)}</p>
          <p className="text-sm">{[r.date, r.place, r.link, r.note].filter(Boolean).join(' · ')}</p>
          <div className="mt-2 flex gap-2">
            {r.kind === 'event' && r.status !== 'done' && (
              <button
                type="button"
                className="btn btn-primary !min-h-9"
                onClick={async () => {
                  const title = String(r.title)
                  await insert('events', { date: r.date, country: 'XB', kind: 'community', title: { cs: title, pl: title, en: title }, who: { cs: '', pl: '', en: '' }, place: r.place })
                  await update('suggestions', r.id, { status: 'done' })
                  await load()
                }}
              >
                {t('admin.approve')}
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline !min-h-9"
              onClick={async () => {
                await update('suggestions', r.id, { status: 'done' })
                await load()
              }}
            >
              ✓ {t('admin.done')}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
