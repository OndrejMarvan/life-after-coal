import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Headframe, Section, useLang } from '../components/ui'
import { fmtDate, t3, useEvents, useProgrammes } from '../lib/content'
import type { Need } from '../data/types'

const DOORS: { need: Need; icon: string }[] = [
  { need: 'money', icon: '💰' },
  { need: 'pension', icon: '🕰' },
  { need: 'job', icon: '🦺' },
  { need: 'training', icon: '🛠' },
  { need: 'business', icon: '🏪' },
  { need: 'family', icon: '🏠' },
  { need: 'advice', icon: '💬' },
]

export default function Home() {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes } = useProgrammes()
  const events = useEvents()
  const today = new Date().toISOString().slice(0, 10)
  const next = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3)
  const nPL = programmes.filter((p) => p.country === 'PL').length
  const nCZ = programmes.filter((p) => p.country === 'CZ').length

  return (
    <>
      <section className="relative overflow-hidden bg-coal text-white">
        <div className="absolute inset-0 kit-stripes opacity-25" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20 grid gap-10 md:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <h1 className="text-5xl sm:text-7xl font-bold">
              {t('home.heroTitle').split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-orange">{t('home.heroTitle').split(' ').slice(-1)}</span>
            </h1>
            <p className="mt-5 text-xl max-w-2xl text-white/90">{t('home.heroText')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/check" className="btn btn-primary text-xl !min-h-16 !px-8 shadow-[0_0_40px_rgba(244,123,32,0.55)]">
                {t('home.heroCta')} →
              </Link>
              <Link to="/programmes" className="btn border-white text-white hover:bg-white hover:text-coal">
                {t('nav.programmes')}
              </Link>
            </div>
          </div>
          <Headframe className="mx-auto block w-64 sm:w-80 rotate-2 drop-shadow-2xl" />
        </div>
      </section>

      <section className="bg-charcoal text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-3 gap-3 sm:gap-6">
          {[
            { n: nPL, l: t('home.tilePL') },
            { n: nCZ, l: t('home.tileCZ') },
            { n: 1, l: t('home.tileOne') },
          ].map((x, i) => (
            <div key={i} className="rounded-xl bg-coal border-2 border-orange/60 p-4 text-center">
              <div className="display text-5xl sm:text-6xl font-bold text-orange tabular-nums">{x.n}</div>
              <div className="display text-sm sm:text-lg mt-1">{x.l}</div>
            </div>
          ))}
          <p className="col-span-3 text-center text-sm text-white/60">
            {nPL + nCZ} {t('home.tileNote')}
          </p>
        </div>
      </section>

      <Section title={t('home.doorsTitle')}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {DOORS.map((d) => (
            <Link
              key={d.need}
              to={`/programmes?need=${d.need}`}
              className="card flex flex-col items-start gap-1 p-4 text-base sm:text-lg md:flex-row md:items-center md:gap-3 md:p-5 font-bold hover:border-orange hover:bg-orange-pale border-2"
            >
              <span className="text-3xl" aria-hidden="true">
                {d.icon}
              </span>
              <span className="min-w-0 hyphens-auto [overflow-wrap:anywhere]">{t(`needs.${d.need}`)}</span>
            </Link>
          ))}
          <Link to="/portals" className="card flex items-center gap-3 p-5 text-lg font-bold hover:border-orange hover:bg-orange-pale border-2">
            <span className="text-3xl" aria-hidden="true">
              📍
            </span>
            {t('nav.portals')}
          </Link>
        </div>
      </Section>

      <Section title={t('home.deadlinesTitle')}>
        <ol className="grid gap-3 md:grid-cols-3">
          {next.map((e) => (
            <li key={e.id} className="card p-5 border-l-8 !border-l-orange">
              <p className="display text-lg font-bold text-orange-deep">{e.dateLabel ? t3(e.dateLabel, lang) : fmtDate(e.date, lang)}</p>
              <p className="mt-1 font-semibold">{t3(e.title, lang)}</p>
            </li>
          ))}
        </ol>
        <Link to="/calendar" className="mt-4 inline-block font-semibold underline underline-offset-4">
          {t('home.allDates')} →
        </Link>
      </Section>

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-coal text-white p-6">
            <h2 className="text-3xl font-bold text-orange">{t('home.talkTitle')}</h2>
            <p className="mt-2 text-lg">{t('home.talkText')}</p>
            <Link to="/help" className="btn btn-primary mt-4">
              ☎ {t('nav.help')}
            </Link>
          </div>
          <div className="rounded-2xl bg-orange p-6">
            <h2 className="text-3xl font-bold">{t('home.assistantTitle')}</h2>
            <p className="mt-2 text-lg">{t('home.assistantText')}</p>
            <Link to="/assistant" className="btn btn-dark mt-4">
              {t('nav.assistant')} →
            </Link>
          </div>
        </div>
      </Section>

      <Section title={t('home.whyTitle')}>
        <ul className="grid gap-3 md:grid-cols-3">
          {[t('home.why1'), t('home.why2'), t('home.why3')].map((w, i) => (
            <li key={i} className="card p-5 text-lg">
              <span className="display block text-4xl text-orange font-bold">{i + 1}</span>
              {w}
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
