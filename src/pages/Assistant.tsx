import { useTranslation } from 'react-i18next'
import { AssistantChat } from '../components/AssistantChat'
import { PageHeader, Section } from '../components/ui'

export default function Assistant() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('assistant.title')} intro={t('assistant.intro')} />
      <Section>
        <div className="mx-auto max-w-4xl">
          <AssistantChat />
        </div>
      </Section>
    </>
  )
}
