import type { Text3 } from './types'

export type EventKind = 'deadline' | 'law' | 'mine' | 'call' | 'meeting' | 'fair' | 'community'

export interface CalEvent {
  id: string
  date: string // ISO date (first day of month when only the month is known)
  dateLabel?: Text3 // shown instead of the exact date when the date is approximate
  country: 'PL' | 'CZ' | 'XB'
  kind: EventKind
  title: Text3
  who: Text3
  place?: string
  lat?: number
  lng?: number
  programmeIds?: string[]
  crossBorder?: boolean
  source?: string
}

// Seed calendar, from the two research databases (14 Nov 2026).
export const seedEvents: CalEvent[] = [
  {
    id: 'ev-pl-1019-decision', date: '2026-11-30', country: 'PL', kind: 'call',
    dateLabel: { en: 'Nov 2026 (indicative)', cs: 'listopad 2026 (orientačně)', pl: 'listopad 2026 (orientacyjnie)' },
    title: {
      en: 'Decision on the 10.19 outplacement call (PLN 177.8m); chosen projects then start recruiting',
      cs: 'Rozhodnutí o výzvě 10.19 na outplacement (177,8 mil. PLN); vybrané projekty pak začnou přijímat účastníky',
      pl: 'Rozstrzygnięcie naboru 10.19 na outplacement (177,8 mln zł); wybrane projekty zaczną rekrutację',
    },
    who: { en: 'Current and former mining and mining-related staff', cs: 'Současní i bývalí zaměstnanci těžby a navazujících firem', pl: 'Obecni i byli pracownicy górnictwa i firm okołogórniczych' },
    programmeIds: ['PL-R01'], source: 'PL database, section 7',
  },
  {
    id: 'ev-cz-csm-jih', date: '2026-12-01', country: 'CZ', kind: 'mine',
    dateLabel: { en: 'Dec 2026', cs: 'prosinec 2026', pl: 'grudzień 2026' },
    title: {
      en: 'OKD starts filling the ČSM-Jih shafts; ČSM-Sever follows in Jan-Feb 2027',
      cs: 'OKD začíná zasypávat jámy Dolu ČSM-Jih; ČSM-Sever následuje v lednu a únoru 2027',
      pl: 'OKD zaczyna zasypywać szyby ČSM-Jih; ČSM-Sever w styczniu i lutym 2027',
    },
    who: { en: 'ČSM liquidation staff; staff numbers will fall', cs: 'Zaměstnanci likvidace ČSM; počet lidí bude klesat', pl: 'Pracownicy likwidacji ČSM; zatrudnienie będzie spadać' },
    place: 'Stonava', lat: 49.8163, lng: 18.5279, programmeIds: ['CZ-P04'], source: 'CZ database, calendar',
  },
  {
    id: 'ev-cz-uver', date: '2026-12-31', country: 'CZ', kind: 'deadline',
    title: {
      en: 'Last day to apply for the Úvěr Transformace interest-free business loan',
      cs: 'Poslední den pro žádost o bezúročný Úvěr Transformace',
      pl: 'Ostatni dzień na wniosek o nieoprocentowaną pożyczkę Úvěr Transformace',
    },
    who: { en: 'Ex-miners starting a business (SME or self-employed)', cs: 'Bývalí horníci, kteří začínají podnikat (firma nebo OSVČ)', pl: 'Byli górnicy zakładający firmę' },
    programmeIds: ['CZ-P19'], source: 'CZ database, calendar',
  },
  {
    id: 'ev-pl-ropt-end', date: '2026-12-31', country: 'PL', kind: 'call',
    title: { en: 'ROPT 2.0 transition observatory ends', cs: 'Končí observatoř transformace ROPT 2.0', pl: 'Koniec projektu ROPT 2.0' },
    who: { en: 'Information users', cs: 'Všichni, kdo hledají informace o transformaci', pl: 'Odbiorcy informacji' },
    programmeIds: ['PL-R06'], source: 'PL database, section 7',
  },
  {
    id: 'ev-cz-pension-2027', date: '2027-01-01', country: 'CZ', kind: 'law',
    title: {
      en: 'Planned Czech pension amendment takes effect (scope for miners not stated)',
      cs: 'Plánovaná novela důchodů nabývá účinnosti (dopad na horníky nebyl uveden)',
      pl: 'Wchodzi w życie planowana czeska nowelizacja emerytur (wpływ na górników nieznany)',
    },
    who: { en: 'People near pension age', cs: 'Lidé blízko důchodového věku', pl: 'Osoby blisko wieku emerytalnego' },
    source: 'CZ database, calendar',
  },
  {
    id: 'ev-pl-jsw-2027', date: '2027-01-01', country: 'PL', kind: 'call',
    dateLabel: { en: '2027', cs: '2027', pl: '2027' },
    title: { en: 'JSW protective programme, year 2 (PLN 511m)', cs: 'Program pro JSW, 2. rok (511 mil. PLN)', pl: 'Program osłonowy JSW, rok 2 (511 mln zł)' },
    who: { en: 'JSW staff', cs: 'Zaměstnanci JSW', pl: 'Pracownicy JSW' },
    programmeIds: ['PL-N09'], source: 'PL database, section 7',
  },
  {
    id: 'ev-cz-csm-end', date: '2027-10-01', country: 'CZ', kind: 'mine',
    dateLabel: { en: 'Q4 2027', cs: '4. čtvrtletí 2027', pl: 'IV kwartał 2027' },
    title: {
      en: 'Shaft filling at ČSM ends; more OKD layoffs expected (towards ~70 staff)',
      cs: 'Konec zasypávání jam na ČSM; očekává se další propouštění v OKD (až na asi 70 lidí)',
      pl: 'Koniec zasypywania szybów ČSM; kolejne zwolnienia w OKD (do ok. 70 osób)',
    },
    who: { en: 'OKD liquidation staff', cs: 'Zaměstnanci OKD na likvidaci', pl: 'Pracownicy OKD przy likwidacji' },
    place: 'Stonava', lat: 49.8163, lng: 18.5279, programmeIds: ['CZ-P04', 'CZ-P06', 'CZ-P02'], source: 'CZ database, calendar',
  },
  {
    id: 'ev-xb-jtf-end', date: '2027-12-31', country: 'XB', kind: 'call', crossBorder: true,
    title: {
      en: 'Last year of the 2021-2027 EU programmes; no successor Just Transition Fund agreed yet',
      cs: 'Poslední rok programů EU 2021-2027; nástupce Fondu pro spravedlivou transformaci zatím není',
      pl: 'Ostatni rok programów UE 2021-2027; brak uzgodnionego następcy FST',
    },
    who: { en: 'All coal regions', cs: 'Všechny uhelné regiony', pl: 'Wszystkie regiony węglowe' },
    source: 'PL database, section 7',
  },
  {
    id: 'ev-cz-zaruka-end', date: '2027-12-31', country: 'CZ', kind: 'deadline',
    title: { en: 'Záruka Transformace (NRB loan guarantee) ends', cs: 'Končí Záruka Transformace (NRB)', pl: 'Koniec gwarancji Záruka Transformace (NRB)' },
    who: { en: 'Small firms in the coal regions', cs: 'Malé firmy v uhelných krajích', pl: 'Małe firmy w regionach węglowych' },
    source: 'CZ database, calendar',
  },
  {
    id: 'ev-cz-pension-2028', date: '2028-01-01', country: 'CZ', kind: 'law',
    title: { en: 'Planned "demanding professions" pension change', cs: 'Plánovaná změna důchodů pro náročné profese', pl: 'Planowana zmiana emerytur dla zawodów wymagających' },
    who: { en: 'People in demanding jobs', cs: 'Lidé v náročných profesích', pl: 'Osoby w zawodach wymagających' },
    source: 'CZ database, calendar',
  },
  {
    id: 'ev-cz-outplacement-end', date: '2028-10-31', country: 'CZ', kind: 'deadline',
    title: { en: 'Outplacement II ends', cs: 'Končí projekt Outplacement II', pl: 'Koniec projektu Outplacement II' },
    who: { en: 'People in redundancy and new employers', cs: 'Lidé v hromadném propouštění a noví zaměstnavatelé', pl: 'Osoby zwalniane i nowi pracodawcy' },
    programmeIds: ['CZ-P11'], source: 'CZ database',
  },
  // Recently closed (archive)
  {
    id: 'ev-pl-paper', date: '2026-09-30', country: 'PL', kind: 'deadline',
    title: { en: 'End of paper-only filing for leave applications', cs: 'Konec období, kdy se žádosti o hornickou dovolenou podávaly jen na papíře', pl: 'Koniec okresu składania wniosków o urlop wyłącznie na papierze' },
    who: { en: 'Staff of support-system companies', cs: 'Zaměstnanci firem ze státního programu podpory hornictví', pl: 'Pracownicy spółek objętych systemem wsparcia' },
    programmeIds: ['PL-N01', 'PL-N02'], source: 'PL database, section 7',
  },
  {
    id: 'ev-pl-1019-closed', date: '2026-06-30', country: 'PL', kind: 'call',
    title: { en: '10.19 outplacement call 343/26 closed', cs: 'Uzavřena výzva 10.19 (343/26)', pl: 'Zamknięty nabór 10.19 (343/26)' },
    who: { en: 'Project organisers', cs: 'Organizace, které projekty vedou', pl: 'Realizatorzy projektów' },
    programmeIds: ['PL-R01'], source: 'PL database, section 7',
  },
  {
    id: 'ev-pl-1020-closed', date: '2026-04-30', country: 'PL', kind: 'call',
    title: { en: '10.20 start-up grant call 338/26 closed', cs: 'Uzavřena výzva 10.20 na dotace pro začínající podnikatele', pl: 'Zamknięty nabór 10.20 na dotacje na firmę' },
    who: { en: 'Project organisers', cs: 'Organizace, které projekty vedou', pl: 'Realizatorzy projektów' },
    programmeIds: ['PL-R02'], source: 'PL database, section 7',
  },
  {
    id: 'ev-cz-opst-closed', date: '2026-04-30', country: 'CZ', kind: 'call',
    title: { en: 'OPST calls for craft incubators and social stability closed', cs: 'Uzavřeny výzvy OPST na řemeslné inkubátory a sociální stabilitu', pl: 'Zamknięte nabory OPST (inkubatory rzemiosła, stabilność społeczna)' },
    who: { en: 'Regions, then firms, schools and NGOs', cs: 'Kraje, poté firmy, školy a neziskovky', pl: 'Kraje, potem firmy, szkoły i NGO' },
    programmeIds: ['CZ-P20'], source: 'CZ database',
  },
  {
    id: 'ev-cz-csm-last', date: '2026-01-31', country: 'CZ', kind: 'mine',
    title: { en: 'Coal mining at ČSM ends: the last Czech hard-coal mine', cs: 'Konec těžby na Dole ČSM, posledním černouhelném dole v Česku', pl: 'Koniec wydobycia w ČSM, ostatniej czeskiej kopalni węgla kamiennego' },
    who: { en: '~900 OKD staff left in Jan-Feb 2026', cs: 'asi 900 zaměstnanců OKD odešlo v lednu a únoru 2026', pl: '~900 pracowników OKD odeszło w styczniu i lutym 2026' },
    place: 'Stonava', lat: 49.8163, lng: 18.5279, source: 'CZ database, history',
  },
]

/** Rolling deadline, not a fixed date: shown in the wizard as a personal countdown. */
export const rollingRule: Text3 = {
  en: 'Czechia: you have 6 months after leaving to claim the state allowance (through Diamo) and to register with Nová šichta.',
  cs: 'Česko: na žádost o státní příspěvek (přes Diamo) a registraci v Nové šichtě máte 6 měsíců od odchodu.',
  pl: 'Czechy: na wniosek o zasiłek państwowy (przez Diamo) i zapis do Nové šichty masz 6 miesięcy od odejścia.',
}
