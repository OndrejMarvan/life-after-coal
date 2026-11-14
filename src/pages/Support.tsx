import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader, SafetyBox, Section } from '../components/ui'

const USES = ['use1', 'use2', 'use3', 'use4'] as const

/** "Buy us a coffee" crowdfunding page. Payments are not connected yet, so the button is disabled. */
export default function Support() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('support.title')} intro={t('support.intro')} />
      <Section>
        <div className="grid gap-8 md:grid-cols-[1fr_300px] items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('support.usesTitle')}</h2>
              <ul className="space-y-2 text-lg">
                {USES.map((u) => (
                  <li key={u} className="card flex gap-3 p-4">
                    <span aria-hidden="true" className="text-orange-deep font-bold">
                      ✓
                    </span>
                    {t(`support.${u}`)}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-lg font-semibold">{t('support.free')}</p>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('support.otherTitle')}</h2>
              <div className="flex flex-wrap gap-3">
                <Link to="/stories" className="btn btn-outline">
                  {t('support.otherStory')}
                </Link>
                <Link to="/forum" className="btn btn-outline">
                  {t('support.otherForum')}
                </Link>
                <Link to="/newsletter" className="btn btn-outline">
                  {t('nav.newsletter')}
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl bg-orange p-6 text-center">
              <p className="text-7xl" aria-hidden="true">
                ☕
              </p>
              <button type="button" className="btn btn-dark mt-4 w-full" disabled aria-describedby="support-soon">
                {t('support.button')}
              </button>
              <p id="support-soon" className="display mt-2 font-bold">
                {t('support.soon')}
              </p>
            </div>
            <SafetyBox title={t('support.notOpenTitle')}>
              <p>{t('support.notOpenText')}</p>
              <Link to="/newsletter" className="mt-2 inline-block font-semibold text-orange-deep underline underline-offset-4">
                {t('support.notify')} →
              </Link>
            </SafetyBox>
          </div>
        </div>
      </Section>
    </>
  )
}
