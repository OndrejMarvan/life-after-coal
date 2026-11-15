import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Headframe, Section } from '../components/ui'
import { usePageTitle } from '../lib/pageTitle'

export default function NotFound() {
  const { t } = useTranslation()
  usePageTitle('404')
  return (
    <Section>
      <div className="mx-auto max-w-md text-center">
        <Headframe className="mx-auto block w-40" />
        <p className="display mt-4 text-6xl font-bold">404</p>
        <Link to="/" className="btn btn-primary mt-6">
          {t('nav.home')}
        </Link>
      </div>
    </Section>
  )
}
