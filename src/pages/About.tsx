import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Headframe, PageHeader, Section } from '../components/ui'

export default function About() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('about.title')} />
      <Section>
        <div className="grid gap-8 md:grid-cols-[1fr_220px] items-start">
          <div className="space-y-4 text-lg">
            <p>{t('about.text1')}</p>
            <p>{t('about.text2')}</p>
            <p>{t('about.text3')}</p>
            <p className="font-semibold">{t('about.disclaimer')}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/portals" className="btn btn-outline">
                {t('nav.portals')}
              </Link>
              <Link to="/gaps" className="btn btn-outline">
                {t('nav.gaps')}
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-72 rounded-3xl bg-coal p-4">
            <Headframe className="block w-full" />
            <p className="display mt-3 text-center font-bold text-orange">{t('greeting')}</p>
          </div>
        </div>
      </Section>
    </>
  )
}
