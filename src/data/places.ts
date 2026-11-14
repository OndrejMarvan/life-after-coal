import type { Text3 } from './types'

export type PlaceKind = 'help' | 'mine'
export type MineState = 'active' | 'closing' | 'closed'

export interface Place {
  id: string
  kind: PlaceKind
  country: 'PL' | 'CZ'
  name: string
  address?: string
  phone?: string
  email?: string
  lat: number
  lng: number
  /** Coordinates are approximate (town or street level). Check before travelling. */
  approx: boolean
  note?: Text3
  mineState?: MineState
  programmeIds?: string[]
  regions?: string[]
}

// Seed map points. Addresses and contacts come from the research databases;
// coordinates are approximate and should be checked by the team.
export const seedPlaces: Place[] = [
  // ---------- Help points: Poland ----------
  {
    id: 'hp-wup-katowice', kind: 'help', country: 'PL', name: 'WUP Katowice (Wojewódzki Urząd Pracy)',
    address: 'ul. Sokolska 29, 40-086 Katowice', phone: '+48 32 757 33 11', email: 'funduszeue@wup-katowice.pl',
    lat: 50.2638, lng: 19.0128, approx: true, regions: ['katowice'],
    note: {
      en: 'Runs the Just Transition Fund calls (10.16-10.21) and the EU funds information point.',
      cs: 'Vypisuje výzvy Fondu pro spravedlivou transformaci (10.16-10.21) a provozuje informační místo o fondech EU.',
      pl: 'Prowadzi nabory FST (10.16-10.21) i punkt informacyjny funduszy UE.',
    },
    programmeIds: ['PL-R01', 'PL-R02', 'PL-R03'],
  },
  {
    id: 'hp-marr', kind: 'help', country: 'PL', name: 'MARR S.A. (Małopolska Regional Development Agency)',
    address: 'ul. Kordylewskiego 11, Kraków', lat: 50.0597, lng: 19.9636, approx: true, regions: ['malopolska'],
    note: { en: 'Western Małopolska transition labour projects.', cs: 'Projekty trhu práce v západním Malopolsku.', pl: 'Projekty rynku pracy w Małopolsce Zachodniej.' },
    programmeIds: ['PL-R10', 'PL-L11'],
  },
  {
    id: 'hp-jastrzebie', kind: 'help', country: 'PL', name: 'Urząd Miasta Jastrzębie-Zdrój',
    address: 'al. Piłsudskiego 60, Jastrzębie-Zdrój', phone: '+48 32 47 85 100', email: 'miasto@um.jastrzebie.pl',
    lat: 49.9557, lng: 18.5795, approx: true, regions: ['rybnik'],
    note: { en: 'City hall. No dedicated miners programme found; strategy 2035 under consultation.', cs: 'Městský úřad. Program pro horníky nebyl nalezen; strategie 2035 v konzultaci.', pl: 'Urząd miasta. Brak programu dla górników; strategia 2035 w konsultacjach.' },
    programmeIds: ['PL-L08'],
  },
  {
    id: 'hp-pup-rybnik', kind: 'help', country: 'PL', name: 'PUP Rybnik (Powiatowy Urząd Pracy)',
    email: 'poradnictwo@rybnik.praca.gov.pl', lat: 50.0961, lng: 18.5419, approx: true, regions: ['rybnik'],
    note: { en: 'Start-up grant meetings, KFS sessions for employers, job fairs.', cs: 'Setkání k dotacím na podnikání, KFS pro zaměstnavatele, veletrhy práce.', pl: 'Spotkania o dotacjach, sesje KFS, targi pracy.' },
    programmeIds: ['PL-L02', 'PL-N14'],
  },
  {
    id: 'hp-pgg-ruda', kind: 'help', country: 'PL', name: 'PGG consultation point, KWK Ruda',
    address: 'Ruda Śląska', lat: 50.2563, lng: 18.8559, approx: true, regions: ['katowice'],
    note: { en: 'Busiest PGG advice point (over 4,000 consultations) on leave, severance and procedures. For PGG staff.', cs: 'Nejvytíženější poradna PGG (přes 4 000 konzultací): dovolená, odstupné, postupy. Pro zaměstnance PGG.', pl: 'Najbardziej obłożony punkt konsultacyjny PGG (ponad 4000 porad): urlopy, odprawy, procedury.' },
    programmeIds: ['PL-C02', 'PL-L09'],
  },
  {
    id: 'hp-srk', kind: 'help', country: 'PL', name: 'SRK (Spółka Restrukturyzacji Kopalń)',
    address: 'Bytom', lat: 50.3480, lng: 18.9157, approx: true, regions: ['bytom'],
    note: { en: 'Legacy benefits and recruitment for wind-technician training.', cs: 'Starší dávky a nábor na kurz technika větrných elektráren.', pl: 'Dawne świadczenia i rekrutacja na szkolenia wiatrowe.' },
    programmeIds: ['PL-N10', 'PL-C03', 'PL-C04'],
  },
  // ---------- Help points: Czechia ----------
  {
    id: 'hp-trautom', kind: 'help', country: 'CZ', name: 'MS Pakt zaměstnanosti / TRAUTOM',
    address: 'Varenská 1414/1, Ostrava', lat: 49.8303, lng: 18.2717, approx: true, regions: ['msk'],
    note: { en: 'Free career counselling and help choosing retraining for adults.', cs: 'Bezplatné kariérní poradenství a pomoc s výběrem rekvalifikace pro dospělé.', pl: 'Bezpłatne doradztwo zawodowe i pomoc w wyborze przekwalifikowania.' },
    programmeIds: ['CZ-P17'],
  },
  {
    id: 'hp-arr', kind: 'help', country: 'CZ', name: 'ARR (Agentura pro regionální rozvoj)',
    address: 'Na Jízdárně 7/1245, Ostrava', email: 'mobilita@arr.cz', lat: 49.8367, lng: 18.2876, approx: true, regions: ['msk'],
    note: { en: 'Employee mobility (free ODISka card).', cs: 'Zaměstnanecká mobilita (bezplatná ODISka).', pl: 'Mobilność pracowników (darmowa karta ODISka).' },
    programmeIds: ['CZ-P21'],
  },
  {
    id: 'hp-karvina-social', kind: 'help', country: 'CZ', name: 'Magistrát Karviná, odbor sociální',
    address: 'Fryštátská 72/1, Karviná', phone: '+420 596 387 631', lat: 49.8558, lng: 18.5438, approx: true, regions: ['msk'],
    note: { en: 'Social services information and the carers day. Open to all residents.', cs: 'Informace o sociálních službách a Den pro pečující. Pro všechny obyvatele.', pl: 'Informacje o usługach społecznych i Dzień dla opiekunów.' },
    programmeIds: ['CZ-L3'],
  },
  {
    id: 'hp-up-karvina', kind: 'help', country: 'CZ', name: 'Úřad práce ČR, kontaktní pracoviště Karviná',
    address: 'Karviná', phone: '800 77 99 00', email: 'out@up.gov.cz', lat: 49.8540, lng: 18.5420, approx: true, regions: ['msk'],
    note: { en: 'Registration, unemployment benefit, retraining, Outplacement II. Free call centre 800 77 99 00.', cs: 'Registrace, podpora v nezaměstnanosti, rekvalifikace, Outplacement II. Bezplatná linka 800 77 99 00.', pl: 'Rejestracja, zasiłek, przekwalifikowanie, Outplacement II. Bezpłatna infolinia 800 77 99 00.' },
    programmeIds: ['CZ-P11', 'CZ-P13', 'CZ-P15'],
  },
  {
    id: 'hp-up-havirov', kind: 'help', country: 'CZ', name: 'Úřad práce ČR, kontaktní pracoviště Havířov',
    address: 'Havířov', lat: 49.7800, lng: 18.4370, approx: true, regions: ['msk'], programmeIds: ['CZ-P11', 'CZ-P13', 'CZ-P15'],
  },
  {
    id: 'hp-up-orlova', kind: 'help', country: 'CZ', name: 'Úřad práce ČR, kontaktní pracoviště Orlová',
    address: 'Orlová', lat: 49.8453, lng: 18.4300, approx: true, regions: ['msk'], programmeIds: ['CZ-P11', 'CZ-P13', 'CZ-P15'],
  },
  {
    id: 'hp-up-bohumin', kind: 'help', country: 'CZ', name: 'Úřad práce ČR, kontaktní pracoviště Bohumín',
    address: 'Bohumín', lat: 49.9045, lng: 18.3575, approx: true, regions: ['msk'], programmeIds: ['CZ-P11', 'CZ-P13', 'CZ-P15'],
  },
  {
    id: 'hp-up-fm', kind: 'help', country: 'CZ', name: 'Úřad práce ČR, kontaktní pracoviště Frýdek-Místek',
    address: 'Frýdek-Místek', lat: 49.6880, lng: 18.3490, approx: true, regions: ['msk'], programmeIds: ['CZ-P11', 'CZ-P13', 'CZ-P15'],
  },
  {
    id: 'hp-up-csm', kind: 'help', country: 'CZ', name: 'Úřad práce: mobilní pracoviště v areálu Dolu ČSM',
    address: 'Stonava', lat: 49.8170, lng: 18.5300, approx: true, regions: ['msk'],
    note: { en: 'Labour Office advisers on the mine site (2025-2026). Hours not published.', cs: 'Poradci Úřadu práce přímo na dole (2025-2026). Otevírací doba nebyla zveřejněna.', pl: 'Doradcy urzędu pracy na terenie kopalni (2025-2026).' },
    programmeIds: ['CZ-P12'],
  },
  {
    id: 'hp-diamo', kind: 'help', country: 'CZ', name: 'Diamo, sociální středisko (Ostrava-Vítkovice)',
    address: 'Sirotčí, Ostrava-Vítkovice (address reported in 2017)', lat: 49.8130, lng: 18.2640, approx: true, regions: ['msk'],
    note: { en: 'Receives applications for the state restructuring allowance. Current contact not confirmed.', cs: 'Přijímá žádosti o státní příspěvek. Aktuální kontakt nebyl ověřen.', pl: 'Przyjmuje wnioski o zasiłek państwowy. Aktualny kontakt niepotwierdzony.' },
    programmeIds: ['CZ-P06'],
  },
  // ---------- Mines ----------
  {
    id: 'mine-csm', kind: 'mine', country: 'CZ', name: 'Důl ČSM (OKD), Stonava', lat: 49.8163, lng: 18.5279, approx: true, mineState: 'closing',
    note: { en: 'Mining ended 31 Jan 2026, preparation plant 28 Feb 2026. Technical liquidation until about the turn of 2028/2029; ~670 staff kept, falling to ~70.', cs: 'Těžba skončila 31. 1. 2026, úpravna 28. 2. 2026. Technická likvidace zhruba do přelomu 2028/2029; ~670 lidí, postupně ~70.', pl: 'Wydobycie zakończone 31.01.2026, zakład przeróbki 28.02.2026. Likwidacja do przełomu 2028/2029.' },
    programmeIds: ['CZ-P04', 'CZ-P12'],
  },
  {
    id: 'mine-darkov', kind: 'mine', country: 'CZ', name: 'Důl Darkov (OKD), Karviná', lat: 49.8380, lng: 18.5560, approx: true, mineState: 'closed',
    note: { en: 'Closed in 2020-2021; staff moved to Diamo.', cs: 'Uzavřen v letech 2020-2021; zaměstnanci převedeni do Diamo.', pl: 'Zamknięta w latach 2020-2021; pracownicy przeszli do Diamo.' },
  },
  {
    id: 'mine-csa', kind: 'mine', country: 'CZ', name: 'Důl ČSA (OKD), Karviná', lat: 49.8610, lng: 18.4900, approx: true, mineState: 'closed',
    note: { en: 'Closed in 2020-2021.', cs: 'Uzavřen v letech 2020-2021.', pl: 'Zamknięta w latach 2020-2021.' },
  },
  {
    id: 'mine-lazy', kind: 'mine', country: 'CZ', name: 'Důl Lazy (OKD), Orlová', lat: 49.8560, lng: 18.4430, approx: true, mineState: 'closed',
    note: { en: 'Closed in November 2019.', cs: 'Uzavřen v listopadu 2019.', pl: 'Zamknięta w listopadzie 2019.' },
  },
  {
    id: 'mine-paskov', kind: 'mine', country: 'CZ', name: 'Důl Paskov (OKD)', lat: 49.7050, lng: 18.2850, approx: true, mineState: 'closed',
    note: { en: 'Closed 31 Mar 2017; ~1,350 staff, ~300 kept for liquidation.', cs: 'Uzavřen 31. 3. 2017; ~1 350 zaměstnanců, ~300 zůstalo na likvidaci.', pl: 'Zamknięta 31.03.2017.' },
  },
  {
    id: 'mine-ruda', kind: 'mine', country: 'PL', name: 'KWK Ruda (PGG), Bielszowice section, Ruda Śląska', lat: 50.2740, lng: 18.8390, approx: true, mineState: 'closing',
    note: { en: 'Bielszowice section closing; PGG rail retraining aimed at its staff.', cs: 'Ruch Bielszowice se zavírá; přeškolení na železnici je pro jeho zaměstnance.', pl: 'Ruch Bielszowice w likwidacji; program kolejowy PGG dla jego pracowników.' },
    programmeIds: ['PL-C01'],
  },
  {
    id: 'mine-wujek', kind: 'mine', country: 'PL', name: 'KWK Wujek (PGG), Katowice', lat: 50.2420, lng: 18.9900, approx: true, mineState: 'closing',
    note: { en: 'Section being closed; PGG rail retraining aimed at its staff.', cs: 'Ruch se zavírá; přeškolení na železnici je pro jeho zaměstnance.', pl: 'Ruch w likwidacji; program kolejowy PGG dla jego pracowników.' },
    programmeIds: ['PL-C01'],
  },
  {
    id: 'mine-janina', kind: 'mine', country: 'PL', name: 'ZG Janina (PKW), Libiąż', lat: 50.1050, lng: 19.3150, approx: true, mineState: 'active',
    note: { en: 'Active PKW mine in Western Małopolska.', cs: 'Činný důl PKW v západním Malopolsku.', pl: 'Czynna kopalnia PKW w Małopolsce Zachodniej.' },
    programmeIds: ['PL-R10', 'PL-L11'],
  },
  {
    id: 'mine-brzeszcze', kind: 'mine', country: 'PL', name: 'ZG Brzeszcze (PKW), Brzeszcze', lat: 49.9830, lng: 19.1500, approx: true, mineState: 'active',
    note: { en: 'Active PKW mine in Western Małopolska.', cs: 'Činný důl PKW v západním Malopolsku.', pl: 'Czynna kopalnia PKW w Małopolsce Zachodniej.' },
    programmeIds: ['PL-R10', 'PL-L11'],
  },
]
