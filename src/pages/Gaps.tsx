import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader, SafetyBox, Section, useLang } from '../components/ui'
import site from '../data/site.json'
import type { Text3 } from '../data/types'
import { t3 } from '../lib/content'

interface Gap {
  who: Text3
  canUse: Text3
  ask: Text3
  ids: string[]
}

const GAPS: Gap[] = [
  {
    who: { en: 'Contractor and supplier-firm staff', cs: 'Zaměstnanci dodavatelů a dodavatelských firem', pl: 'Pracownicy firm wykonawczych i okołogórniczych' },
    canUse: {
      en: 'Poland: outplacement (10.19) and start-up grants (10.20) give mining-related workers priority; labour-office help. Czechia: Outplacement II, Labour Office retraining, TRAUTOM.',
      cs: 'Polsko: outplacement (10.19) a dotace na podnikání (10.20) dávají přednost i pracovníkům navazujících firem; úřad práce. Česko: Outplacement II, rekvalifikace úřadu práce, TRAUTOM.',
      pl: 'Polska: outplacement (10.19) i dotacje na firmę (10.20) dają pierwszeństwo także pracownikom okołogórniczym; urząd pracy. Czechy: Outplacement II, przekwalifikowanie w urzędzie pracy, TRAUTOM.',
    },
    ask: { en: 'Your labour office; WUP Katowice; Úřad práce.', cs: 'Úřad práce; WUP Katovice.', pl: 'Urząd pracy; WUP Katowice; czeski Úřad práce.' },
    ids: ['PL-R01', 'PL-R02', 'PL-N14', 'CZ-P11', 'CZ-P13', 'CZ-P17'],
  },
  {
    who: { en: 'Power-plant workers of firms not on the Czech list', cs: 'Pracovníci elektráren firem, které nejsou na seznamu', pl: 'Pracownicy elektrowni spoza czeskiej listy' },
    canUse: {
      en: 'Czechia: Outplacement II and Labour Office tools. Poland: the shield act for power and lignite workers, if your company is covered.',
      cs: 'Česko: Outplacement II a nástroje úřadu práce. Polsko: zákon o sociálních ochranách pro energetiku a hnědé uhlí, pokud se týká vaší firmy.',
      pl: 'Czechy: Outplacement II i narzędzia urzędu pracy. Polska: ustawa o osłonach socjalnych dla energetyki i węgla brunatnego, jeśli obejmuje twoją firmę.',
    },
    ask: { en: 'Your employer’s HR; the labour office.', cs: 'Personální oddělení zaměstnavatele; úřad práce.', pl: 'Dział kadr pracodawcy; urząd pracy.' },
    ids: ['CZ-P11', 'CZ-P13', 'PL-N11'],
  },
  {
    who: { en: 'Family members', cs: 'Členové rodiny', pl: 'Członkowie rodziny' },
    canUse: {
      en: 'Poland: unemployed family members can join a 10.19 outplacement project with a participant; 10.24 social projects in mining municipalities. Czechia: Labour Office as any job seeker; Karviná social services.',
      cs: 'Polsko: nezaměstnaní členové rodiny se mohou připojit k účastníkovi projektu 10.19; sociální projekty 10.24 v hornických obcích. Česko: úřad práce jako každý uchazeč; sociální služby Karviná.',
      pl: 'Polska: bezrobotni członkowie rodziny mogą dołączyć do projektu 10.19 z uczestnikiem; projekty społeczne 10.24 w gminach górniczych. Czechy: urząd pracy jak każdy szukający pracy; usługi społeczne w Karwinie.',
    },
    ask: { en: 'Your gmina or social-assistance centre; Karviná social department.', cs: 'Sociální odbor města; v Polsku gmina nebo sociální centrum.', pl: 'Gmina lub ośrodek pomocy społecznej; wydział społeczny w Karwinie.' },
    ids: ['PL-R01', 'PL-R04', 'CZ-P13', 'CZ-L3'],
  },
  {
    who: { en: 'PG Silesia (private mine) staff', cs: 'Zaměstnanci PG Silesia (soukromý důl)', pl: 'Pracownicy PG Silesia (kopalnia prywatna)' },
    canUse: {
      en: 'Not covered by the 2026 leave and severance. A draft law (UD377) would help only if the owner goes bankrupt. You can use outplacement, training and the labour office.',
      cs: 'Nevztahuje se na ně dovolená ani odstupné z roku 2026. Návrh zákona UD377 by pomohl jen při bankrotu majitele. Můžete využít outplacement, vzdělávání a úřad práce.',
      pl: 'Nie obejmują ich urlopy i odprawy z 2026 r. Projekt UD377 pomógłby tylko po upadłości właściciela. Możesz skorzystać z outplacementu, szkoleń i urzędu pracy.',
    },
    ask: { en: 'Ministry of Energy; your union; the labour office.', cs: 'Ministerstvo energetiky; odbory; úřad práce.', pl: 'Ministerstwo Energii; związek zawodowy; urząd pracy.' },
    ids: ['PL-N12', 'PL-R01', 'PL-R03', 'PL-N14'],
  },
  {
    who: { en: 'People hired after 1 Jan 2026, or dismissed before 28 May 2021 (Poland)', cs: 'Lidé přijatí po 1. 1. 2026 nebo propuštění před 28. 5. 2021 (Polsko)', pl: 'Zatrudnieni po 1.01.2026 lub zwolnieni przed 28.05.2021 (Polska)' },
    canUse: {
      en: 'Hired after 1 Jan 2026: no statutory leave or severance, but outplacement, training and the labour office. Dismissed before 28 May 2021: adult learning (10.17) and the labour office.',
      cs: 'Přijatí po 1. 1. 2026: bez zákonné dovolené a odstupného, ale outplacement, vzdělávání a úřad práce. Propuštění před 28. 5. 2021: vzdělávání dospělých (10.17) a úřad práce.',
      pl: 'Zatrudnieni po 1.01.2026: bez ustawowego urlopu i odprawy, ale z outplacementem, szkoleniami i urzędem pracy. Zwolnieni przed 28.05.2021: kształcenie dorosłych (10.17) i urząd pracy.',
    },
    ask: { en: 'County labour office (PUP); WUP Katowice.', cs: 'Okresní úřad práce (PUP); WUP Katovice.', pl: 'Powiatowy urząd pracy; WUP Katowice.' },
    ids: ['PL-R03', 'PL-N14', 'PL-R01'],
  },
  {
    who: { en: 'Past the 6-month window, or under 2 years of continuous service (Czechia)', cs: 'Po uplynutí 6 měsíců nebo méně než 2 roky nepřetržitě (Česko)', pl: 'Po upływie 6 miesięcy lub poniżej 2 lat ciągłej pracy (Czechy)' },
    canUse: {
      en: 'The state allowance and Nová šichta are closed to you, but the Labour Office, retraining, TRAUTOM and the business loan are open.',
      cs: 'Státní příspěvek a Nová šichta už nejsou možné, ale úřad práce, rekvalifikace, TRAUTOM a úvěr na podnikání ano.',
      pl: 'Zasiłek państwowy i Nová šichta są zamknięte, ale urząd pracy, przekwalifikowanie, TRAUTOM i pożyczka na firmę są dostępne.',
    },
    ask: { en: 'Úřad práce; TRAUTOM; NRB.', cs: 'Úřad práce; TRAUTOM; NRB.', pl: 'Czeski urząd pracy; TRAUTOM; NRB.' },
    ids: ['CZ-P13', 'CZ-P15', 'CZ-P17', 'CZ-P19'],
  },
]

function Matrix({ data }: { data: { columns: string[]; rows: { group: string; cells: string[] }[] } }) {
  return (
    <div className="overflow-x-auto card" lang="en">
      <table className="w-full text-sm">
        <thead className="bg-coal text-white">
          <tr>
            <th className="p-2 text-left sticky left-0 bg-coal">Group</th>
            {data.columns.map((c) => (
              <th key={c} className="p-2 text-left whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.group} className="border-t border-coal/10 align-top">
              <th className="p-2 text-left font-semibold sticky left-0 bg-white">{r.group}</th>
              {r.cells.map((c, i) => {
                const head = c.trim().charAt(0)
                const cls = head === 'E' ? 'bg-orange-pale' : head === 'N' ? 'bg-stone/15' : ''
                return (
                  <td key={i} className={`p-2 min-w-32 ${cls}`}>
                    {c}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Gaps() {
  const { t } = useTranslation()
  const lang = useLang()
  return (
    <>
      <PageHeader title={t('gaps.title')} intro={t('gaps.intro')} />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {GAPS.map((g, i) => (
            <SafetyBox key={i} title={t3(g.who, lang)}>
              <p>
                <b>{t('gaps.canUse')}:</b> {t3(g.canUse, lang)}
              </p>
              <p className="mt-2">
                <b>{t('gaps.ask')}:</b> {t3(g.ask, lang)}
              </p>
              <p className="mt-2 flex flex-wrap gap-2">
                {g.ids.map((id) => (
                  <Link key={id} to={`/programmes/${id}`} className="rounded-full bg-coal text-white px-3 py-1 text-sm font-semibold">
                    {id}
                  </Link>
                ))}
              </p>
            </SafetyBox>
          ))}
        </div>
      </Section>
      <Section title={t('gaps.matrixPL')}>
        <p className="mb-2 text-sm">{t('gaps.legend')}</p>
        <Matrix data={site.exclusions.PL} />
      </Section>
      <Section title={t('gaps.matrixCZ')}>
        <Matrix data={site.exclusions.CZ} />
      </Section>
    </>
  )
}
