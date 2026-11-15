import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CountryTag, EvidenceBadge, Headframe, SafetyBox, Section, StatusBadge, useLang } from '../components/ui'
import { usePageTitle } from '../lib/pageTitle'
import { displayName, downloadIcs, fmtDate, pickField, pickSummary, t3, useEvents, usePlaces, useProgrammes } from '../lib/content'
import type { Programme } from '../data/types'
import { useAuth } from '../lib/auth'
import { insert, list, remove } from '../lib/store'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="text-lg leading-relaxed">{children}</div>
    </div>
  )
}

const HR_IDS = ['PL-N01', 'PL-N02', 'PL-N03', 'PL-N04', 'PL-N07', 'PL-N09', 'CZ-P01', 'CZ-P25']

export default function ProgrammePage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes } = useProgrammes()
  const places = usePlaces()
  const events = useEvents()
  const { user } = useAuth()
  const p = programmes.find((x) => x.id === id)
  const [savedId, setSavedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !p) return
    list('saved_items', { eq: { user_id: user.id, programme_id: p.id } })
      .then((r) => setSavedId(r[0]?.id ?? null))
      .catch(() => undefined)
  }, [user, p])

  usePageTitle(p ? displayName(p, lang) : t('programme.notFound'))
  if (!p) {
    return (
      <Section>
        <p className="text-xl">{t('programme.notFound')}</p>
        <Link to="/programmes" className="btn btn-dark mt-4">
          {t('programme.backToList')}
        </Link>
      </Section>
    )
  }

  const field = (k: keyof Programme) => pickField(p, k, lang)
  const showEnglishNote = lang !== 'en' && !p.i18n?.[lang]
  const helpHere = places.filter((x) => x.programmeIds?.includes(p.id))
  const evHere = events.filter((e) => e.programmeIds?.includes(p.id))

  async function toggleSave() {
    if (!user || !p) return
    if (savedId) {
      await remove('saved_items', savedId)
      setSavedId(null)
    } else {
      const r = await insert('saved_items', { user_id: user.id, programme_id: p.id })
      setSavedId(r.id)
    }
  }

  const rows: [string, keyof Programme][] = [
    ['programme.whoFor', 'who_for'],
    ['programme.whoNot', 'who_excluded'],
    ['programme.whatYouGet', 'what_you_get'],
    ['programme.conditions', 'conditions'],
  ]

  return (
    <>
      <section className="bg-coal text-white">
        <div className="kit-stripes h-2" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_auto] items-start">
          <div>
            <Link to="/programmes" className="text-white/80 underline underline-offset-4 no-print">
              ← {t('programme.backToList')}
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CountryTag c={p.country} />
              <StatusBadge s={p.status} />
              <EvidenceBadge e={p.evidence} />
              <span className="text-sm text-white/60">
                {p.id} · {t(`levels.${p.level}`)}
              </span>
            </div>
            <h1 className="mt-3 text-3xl sm:text-5xl font-bold">{displayName(p, lang)}</h1>
            {lang !== 'en' && p.name_en !== p.name_local && <p className="mt-1 text-white/70">{p.name_en}</p>}
            <p className="mt-4 text-xl max-w-3xl">{pickSummary(p, lang)}</p>
          </div>
          <Headframe className="hidden md:block w-36 shrink-0" />
        </div>
      </section>

      <Section>
        <div className="flex flex-wrap gap-3 no-print mb-6">
          {user ? (
            <button type="button" className="btn btn-dark" onClick={() => void toggleSave()}>
              {savedId ? `★ ${t('programme.saved')}` : `☆ ${t('programme.save')}`}
            </button>
          ) : null}
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            {t('common.print')}
          </button>
        </div>

        {!p.individual && (
          <div className="mb-6">
            <SafetyBox>{t('programme.forFirmsNote')}</SafetyBox>
          </div>
        )}
        {p.evidence !== 'VERIFIED' && (
          <div className="mb-6">
            <SafetyBox title={t(`evidence.${p.evidence}`)}>{t('common.confirmFirst')}</SafetyBox>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {p.intro && (
              <div className="card p-5 text-lg leading-relaxed">
                {showEnglishNote && <p className="mb-3 rounded-lg bg-orange-pale px-3 py-2 text-sm font-semibold">{t('common.detailsInEnglish')}</p>}
                <p lang={field('intro').translated ? lang : 'en'}>{field('intro').text}</p>
              </div>
            )}
            {rows.map(([label, key]) =>
              field(key).text ? (
                <Block key={key} title={t(label)}>
                  <p lang={field(key).translated ? lang : 'en'}>{field(key).text}</p>
                </Block>
              ) : null,
            )}
            {field('how_to_apply').text && (
              <Block title={t('programme.howToApply')}>
                {HR_IDS.includes(p.id) && <p className="mb-2 font-bold text-orange-deep">{t('programme.hrNote')}</p>}
                <p lang={field('how_to_apply').translated ? lang : 'en'}>{field('how_to_apply').text}</p>
              </Block>
            )}
            <details className="card p-5">
              <summary className="cursor-pointer display text-xl font-bold">{t('common.details')}</summary>
              <dl className="mt-4 grid gap-4">
                {(
                  [
                    ['programme.operator', field('operator')],
                    ['programme.funder', field('funder')],
                    ['programme.territory', field('territory')],
                    ['programme.dates', field('dates')],
                    ['programme.status', field('status_text')],
                    ['programme.legal', field('legal_basis')],
                    ['programme.takeUp', field('take_up')],
                    ['programme.problems', field('known_problems')],
                    [
                      'programme.evidenceNote',
                      {
                        text: [field('evidence_note').text, field('source_note').text].filter(Boolean).join(' · '),
                        translated: field('evidence_note').translated,
                      },
                    ],
                  ] as [string, { text: string; translated: boolean }][]
                )
                  .filter(([, v]) => v.text)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-bold">{t(k)}</dt>
                      <dd lang={v.translated ? lang : 'en'}>{v.text}</dd>
                    </div>
                  ))}
              </dl>
            </details>
            <p className="text-sm text-coal/60">
              {t('common.lastChecked')}: {fmtDate(p.last_checked, lang)}
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border-4 border-orange bg-white p-5">
              <h2 className="text-xl font-bold mb-3">{t('programme.howToApply')}</h2>
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="btn btn-primary w-full mb-3">
                  {t('common.applyOnline')} ↗
                </a>
              )}
              {p.contact && <p className="mb-3">{p.contact}</p>}
              <p className="display font-bold mb-2">{t('common.helpInPerson')}</p>
              {helpHere.length ? (
                <ul className="space-y-3">
                  {helpHere.map((h) => (
                    <li key={h.id} className="rounded-lg bg-paper p-3">
                      <p className="font-bold">{h.name}</p>
                      {h.address && <p>{h.address}</p>}
                      {h.phone && (
                        <p>
                          <a className="underline" href={`tel:${h.phone.replace(/\s/g, '')}`}>
                            {h.phone}
                          </a>
                        </p>
                      )}
                      {h.email && (
                        <p>
                          <a className="underline break-all" href={`mailto:${h.email}`}>
                            {h.email}
                          </a>
                        </p>
                      )}
                      <Link to={`/map?focus=${h.id}`} className="text-sm font-semibold text-orange-deep underline">
                        {t('nav.map')} →
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-coal/70">{t('programme.noHelpPoint')}</p>
              )}
            </div>
            {evHere.length > 0 && (
              <div className="card p-5">
                <h2 className="text-xl font-bold mb-3">{t('nav.calendar')}</h2>
                <ul className="space-y-3">
                  {evHere.map((e) => (
                    <li key={e.id}>
                      <p className="display font-bold text-orange-deep">{e.dateLabel ? t3(e.dateLabel, lang) : fmtDate(e.date, lang)}</p>
                      <p>{t3(e.title, lang)}</p>
                      <button type="button" className="text-sm font-semibold underline" onClick={() => downloadIcs(e.id, e.date, t3(e.title, lang), t3(e.who, lang))}>
                        {t('common.addToCalendar')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Link to="/help" className="btn btn-dark w-full">
              ☎ {t('nav.help')}
            </Link>
          </aside>
        </div>
      </Section>
    </>
  )
}
