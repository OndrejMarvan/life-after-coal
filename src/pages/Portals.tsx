import { useTranslation } from 'react-i18next'
import { PageHeader, Section, useLang } from '../components/ui'
import site from '../data/site.json'
import { localize } from '../lib/content'

function linkify(s: string) {
  const parts = s.split(/(\b[a-z0-9.-]+\.(?:pl|cz|eu|com)\b(?:\/[^\s;,)]*)?|[\w.+-]+@[\w.-]+\.\w+)/gi)
  return parts.map((p, i) => {
    if (/@/.test(p)) return <a key={i} href={`mailto:${p}`} className="underline break-all">{p}</a>
    if (/\.(pl|cz|eu|com)\b/i.test(p) && !p.includes('[')) return <a key={i} href={`https://${p}`} target="_blank" rel="noreferrer" className="underline break-all">{p}</a>
    return <span key={i}>{p}</span>
  })
}

export default function Portals() {
  const { t } = useTranslation()
  const lang = useLang()
  return (
    <>
      <PageHeader title={t('portals.title')} intro={t('portals.intro')} />
      {(['CZ', 'PL'] as const).map((c) => (
        <Section key={c} title={`${c === 'CZ' ? '🇨🇿' : '🇵🇱'} ${t(`countries.${c}`)}`}>
          <div className="grid gap-3 md:grid-cols-2">
            {site.portals
              .filter((p) => p.country === c)
              .map((x, i) => {
                const p = localize(x, lang)
                return (
                  <div key={i} className="card p-5" lang={p.translated ? lang : 'en'}>
                    <p className="text-lg font-bold">{p.channel}</p>
                    <p className="text-sm text-coal/60">{p.owner}</p>
                    <p className="mt-2">{p.covers}</p>
                    <p className="mt-2 font-semibold">{linkify(p.contact)}</p>
                    <p className="mt-1 text-sm">
                      {t('portals.status')}: {p.status}
                    </p>
                  </div>
                )
              })}
          </div>
        </Section>
      ))}
      <Section title={t('portals.notFoundTitle')}>
        <p className="mb-4">{t('portals.notFoundIntro')}</p>
        <div className="overflow-x-auto card">
          <table className="w-full text-left">
            <thead className="bg-coal text-white">
              <tr>
                <th className="p-3">{t('common.country')}</th>
                <th className="p-3">{t('portals.channel')}</th>
                <th className="p-3">{t('portals.whoConfirm')}</th>
              </tr>
            </thead>
            <tbody>
              {site.notFound.map((x, i) => {
                const n = localize(x, lang)
                return (
                  <tr key={i} className="border-t border-coal/10 align-top" lang={n.translated ? lang : 'en'}>
                    <td className="p-3">{n.country}</td>
                    <td className="p-3">
                      <p className="font-semibold">{n.item}</p>
                      <p className="text-sm text-coal/70">{n.why}</p>
                    </td>
                    <td className="p-3">{n.confirm}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
