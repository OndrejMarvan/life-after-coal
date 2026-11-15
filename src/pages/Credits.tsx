import { useTranslation } from 'react-i18next'
import { PageHeader, PhotoImg, Section, useLang } from '../components/ui'
import { PHOTOS } from '../data/photos'

/** Attribution for every photo on the site, as their Creative Commons licences require. */
export default function Credits() {
  const { t } = useTranslation()
  const lang = useLang()
  return (
    <>
      <PageHeader title={t('credits.title')} intro={t('credits.intro')} />
      <Section>
        <ul className="grid gap-4 md:grid-cols-2">
          {Object.values(PHOTOS).map((p) => (
            <li key={p.credit.page} className="card overflow-hidden grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr]">
              <PhotoImg photo={p} sizes="160px" className="h-full min-h-32 w-full object-cover" />
              <div className="p-4 text-sm space-y-1 min-w-0">
                <p className="font-semibold text-base">{p.alt[lang]}</p>
                <p>
                  {t('credits.author')}: {p.credit.author}
                </p>
                <p>
                  {t('credits.license')}:{' '}
                  <a href={p.credit.licenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                    {p.credit.license}
                  </a>
                </p>
                <p>
                  {t('credits.edits')}: {p.credit.edits[lang]}
                </p>
                <a href={p.credit.page} target="_blank" rel="noreferrer" className="inline-block font-semibold text-orange-deep underline underline-offset-4">
                  {t('credits.original')} ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-coal/70">{t('credits.logo')}</p>
      </Section>
    </>
  )
}
