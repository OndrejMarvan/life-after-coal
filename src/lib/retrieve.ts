import type { Programme } from '../data/types'

/** Simple keyword retrieval over the programme database. Used by the assistant
 *  (to pick the cards it sends to Claude) and as the offline fallback. */

const STOP = new Set(
  'a an the and or of to in on for is are was i my me we you it at by with from what how can do does if be have has this that there any ' +
  'a i k s v z o u na do po za ze se je jsem jak co kdy mi mě můj moje mám má jsou pro od ale nebo když ' +
  'i w z na do po za że się jest jestem jak co kiedy mi mój moja mam ma są dla od ale albo czy'.split(' '),
)

const SYNONYMS: Record<string, string[]> = {
  severance: ['odstupné', 'odprawa', 'odprawy'],
  odstupne: ['severance', 'odprawa'],
  odprawa: ['severance', 'odstupné'],
  pension: ['důchod', 'emerytura', 'retirement'],
  duchod: ['pension', 'emerytura', 'retirement'],
  emerytura: ['pension', 'důchod', 'retirement'],
  allowance: ['příspěvek', 'zasiłek'],
  prispevek: ['allowance'],
  leave: ['urlop', 'dovolená'],
  urlop: ['leave'],
  job: ['práce', 'praca', 'work', 'outplacement'],
  prace: ['job', 'work', 'outplacement'],
  praca: ['job', 'work', 'outplacement'],
  retraining: ['rekvalifikace', 'szkolenia', 'training', 'courses'],
  rekvalifikace: ['retraining', 'training'],
  business: ['podnikání', 'firma', 'start-up', 'loan', 'grant'],
  podnikani: ['business', 'start-up', 'loan'],
  firma: ['business', 'start-up', 'grant'],
  contractor: ['dodavatel', 'wykonawcza', 'supplier'],
  shifts: ['směny', 'szychty', 'shift'],
  smeny: ['shifts', 'shift'],
}

export function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

export function retrieve(question: string, programmes: Programme[], k = 8): Programme[] {
  const q = new Set<string>()
  for (const w of tokens(question)) {
    q.add(w)
    for (const s of SYNONYMS[w] ?? []) for (const x of tokens(s)) q.add(x)
  }
  if (!q.size) return []
  const scored = programmes.map((p) => {
    const name = tokens(`${p.id} ${p.name_local} ${p.name_en} ${p.employers.join(' ')} ${p.territory}`)
    const body = tokens(`${p.intro} ${p.who_for} ${p.what_you_get} ${p.how_to_apply} ${Object.values(p.summary).join(' ')}`)
    let score = 0
    for (const w of q) {
      if (name.some((n) => n.startsWith(w) || w.startsWith(n))) score += 3
      if (body.some((n) => n === w)) score += 1
    }
    if (p.status === 'closed' || p.status === 'legacy') score *= 0.4
    if (!p.individual) score *= 0.6
    return { p, score }
  })
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((x) => x.p)
}

export const FEELINGS = /(alone|lonely|depress|anxious|hopeless|can't cope|suicid|sam |samotn|deprese|úzkost|nemůžu|zoufal|depresj|lęk|nie daję|beznadziej|smut)/i
