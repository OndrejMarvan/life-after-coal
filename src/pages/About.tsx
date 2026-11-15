import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader, PhotoCredit, PhotoImg, Section } from '../components/ui'
import { PHOTOS } from '../data/photos'

export default function About() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('about.title')} photo="landek" />
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
          <figure className="mx-auto w-full max-w-72 overflow-hidden rounded-3xl bg-coal">
            <PhotoImg photo={PHOTOS.lamps} sizes="288px" className="block aspect-[4/3] w-full object-cover" />
            <figcaption className="p-4 text-center">
              <p className="display font-bold text-orange">{t('greeting')}</p>
              <PhotoCredit photo={PHOTOS.lamps} className="mt-1 block text-white/70" />
            </figcaption>
          </figure>
        </div>
      </Section>
    </>
  )
}
