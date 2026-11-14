import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Headframe, Section } from '../components/ui'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <Section>
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto w-32 rounded-2xl bg-orange p-3">
          <Headframe />
        </div>
        <p className="display mt-4 text-6xl font-bold">404</p>
        <Link to="/" className="btn btn-primary mt-6">
          {t('nav.home')}
        </Link>
      </div>
    </Section>
  )
}
