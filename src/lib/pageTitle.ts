import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/** Browser-tab title for the current page: "Page · Site name", or the site name alone. */
export function usePageTitle(title?: string) {
  const { t } = useTranslation()
  const app = t('appName')
  useEffect(() => {
    document.title = title ? `${title} · ${app}` : app
  }, [title, app])
}
