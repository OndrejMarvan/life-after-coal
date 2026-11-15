import type { Text3 } from './types'

export interface CrisisLine {
  country: 'EU' | 'CZ' | 'PL'
  kind: 'emergency' | 'crisis'
  number: string
  name: Text3
  note: Text3
}

// Checked on 15 Nov 2026 against portal.gov.cz ("Čísla 116") and gov.pl (Ministry of Health,
// "Gdzie uzyskać pomoc psychologiczną i psychiatryczną"). Calls to 116 numbers are free.
export const CRISIS_LINES: CrisisLine[] = [
  {
    country: 'EU', kind: 'emergency', number: '112',
    name: { cs: 'Tísňové volání', pl: 'Numer alarmowy', en: 'Emergency number' },
    note: {
      cs: 'Ohrožení života, zdraví nebo majetku. Funguje v Česku, v Polsku i v celé EU.',
      pl: 'Zagrożenie życia, zdrowia lub mienia. Działa w Czechach, w Polsce i w całej UE.',
      en: 'Danger to life, health or property. Works in Czechia, Poland and across the EU.',
    },
  },
  {
    country: 'CZ', kind: 'emergency', number: '155',
    name: { cs: 'Zdravotnická záchranná služba', pl: 'Pogotowie ratunkowe w Czechach', en: 'Ambulance in Czechia' },
    note: { cs: 'Úraz, náhlé onemocnění.', pl: 'Wypadek, nagłe zachorowanie.', en: 'Injury or sudden illness.' },
  },
  {
    country: 'CZ', kind: 'crisis', number: '116 123',
    name: { cs: 'Linka první psychické pomoci', pl: 'Telefon pierwszej pomocy psychicznej', en: 'First psychological aid line' },
    note: {
      cs: 'Pro dospělé v krizi. Nonstop, zdarma a anonymně.',
      pl: 'Dla dorosłych w kryzysie. Całą dobę, bezpłatnie i anonimowo. Po czesku.',
      en: 'For adults in crisis. Day and night, free and anonymous. In Czech.',
    },
  },
  {
    country: 'CZ', kind: 'crisis', number: '116 111',
    name: { cs: 'Linka bezpečí', pl: 'Linka bezpečí (telefon zaufania)', en: 'Linka bezpečí (helpline)' },
    note: {
      cs: 'Pro děti a studenty do 26 let. Nonstop a zdarma.',
      pl: 'Dla dzieci i uczniów do 26 lat. Całą dobę, bezpłatnie. Po czesku.',
      en: 'For children and students up to 26. Day and night, free. In Czech.',
    },
  },
  {
    country: 'PL', kind: 'emergency', number: '999',
    name: { cs: 'Záchranná služba v Polsku', pl: 'Pogotowie ratunkowe', en: 'Ambulance in Poland' },
    note: { cs: 'Úraz, náhlé onemocnění.', pl: 'Wypadek, nagłe zachorowanie.', en: 'Injury or sudden illness.' },
  },
  {
    country: 'PL', kind: 'crisis', number: '116 123',
    name: { cs: 'Linka pro lidi v emoční krizi', pl: 'Telefon dla osób w kryzysie emocjonalnym', en: 'Line for people in emotional crisis' },
    note: {
      cs: 'Nonstop a zdarma. Hovoří se polsky.',
      pl: 'Całą dobę, bezpłatnie.',
      en: 'Day and night, free. In Polish.',
    },
  },
  {
    country: 'PL', kind: 'crisis', number: '800 70 2222',
    name: { cs: 'Centrum Wsparcia', pl: 'Centrum Wsparcia dla Osób Dorosłych w Kryzysie Psychicznym', en: 'Centrum Wsparcia (support centre)' },
    note: {
      cs: 'Pro dospělé v psychické krizi. Nonstop a zdarma. Hovoří se polsky.',
      pl: 'Dla dorosłych w kryzysie psychicznym. Całą dobę, bezpłatnie.',
      en: 'For adults in a mental-health crisis. Day and night, free. In Polish.',
    },
  },
  {
    country: 'PL', kind: 'crisis', number: '116 111',
    name: { cs: 'Linka pro děti a mládež', pl: 'Telefon Zaufania dla Dzieci i Młodzieży', en: 'Helpline for children and young people' },
    note: { cs: 'Zdarma a anonymně. Hovoří se polsky.', pl: 'Bezpłatnie i anonimowo.', en: 'Free and anonymous. In Polish.' },
  },
]
