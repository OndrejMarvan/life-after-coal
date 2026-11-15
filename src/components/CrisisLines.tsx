import { useTranslation } from 'react-i18next'
import { CRISIS_LINES, type CrisisLine } from '../data/crisisLines'
import { t3 } from '../lib/content'
import { CountryTag, useLang } from './ui'

const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`

/** Emergency and crisis phone lines for Czechia and Poland, with tap-to-call buttons. */
export function CrisisLines() {
  const { t } = useTranslation()
  const lang = useLang()
  const row = (l: CrisisLine) => (
    <li key={l.country + l.number} className="card p-4 flex items-center justify-between gap-3">
      <span>
        <span className="block font-bold">{t3(l.name, lang)}</span>
        <span className="block text-sm text-coal/70">{t3(l.note, lang)}</span>
      </span>
      <a href={tel(l.number)} className={`btn !min-h-11 whitespace-nowrap ${l.kind === 'emergency' ? 'bg-alarm text-white' : 'btn-dark'}`}>
        {l.number}
      </a>
    </li>
  )
  return (
    <section id="crisis" aria-labelledby="crisis-title">
      <h2 id="crisis-title" className="text-2xl sm:text-3xl font-bold mb-2">
        {t('crisis.title')}
      </h2>
      <p className="mb-4 max-w-3xl text-lg">{t('crisis.intro')}</p>
      {CRISIS_LINES.filter((l) => l.country === 'EU').map((l) => (
        <a key={l.number} href={tel(l.number)} className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl bg-alarm p-5 text-white">
          <span className="display text-4xl font-bold">☎ {l.number}</span>
          <span>
            <span className="display block text-xl font-bold">{t3(l.name, lang)}</span>
            <span className="block">{t3(l.note, lang)}</span>
          </span>
        </a>
      ))}
      <div className="grid gap-6 md:grid-cols-2">
        {(['CZ', 'PL'] as const).map((c) => (
          <div key={c}>
            <h3 className="mb-3 text-xl">
              <CountryTag c={c} />
            </h3>
            <ul className="space-y-3">{CRISIS_LINES.filter((l) => l.country === c).map(row)}</ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-coal/60">
        {t('crisis.checked')}{' '}
        <a className="underline" href="https://portal.gov.cz/informace/cisla-116--harmonizovane-sluzby-se-socialni-hodnotou-INF-415">
          portal.gov.cz
        </a>
        ,{' '}
        <a className="underline" href="https://www.gov.pl/web/zdrowie/gdzie-uzyskac-pomoc-psychologiczna-i-psychiatryczna">
          gov.pl
        </a>
      </p>
    </section>
  )
}
