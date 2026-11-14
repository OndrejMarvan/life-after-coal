import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import cs from './cs'
import pl from './pl'
import { prefs } from '../lib/store'
import type { Lang } from '../data/types'

function initialLang(): Lang {
  const saved = prefs.get<string>('lang', '')
  if (saved === 'cs' || saved === 'pl' || saved === 'en') return saved
  const nav = (navigator.language || 'cs').slice(0, 2)
  return nav === 'pl' ? 'pl' : nav === 'en' ? 'en' : 'cs'
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, cs: { translation: cs }, pl: { translation: pl } },
  lng: initialLang(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (l) => {
  prefs.set('lang', l)
  document.documentElement.lang = l
})
document.documentElement.lang = i18n.language

export default i18n
