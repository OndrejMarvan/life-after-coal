// Vercel serverless function: POST /api/assistant
// Answers questions only from the programme database, using Google Gemini (generateContent).
// Set GEMINI_API_KEY (and optionally GEMINI_MODEL) in the Vercel project settings. Use a key
// from a Google Cloud project with billing on: Gemini's terms allow only Paid Services for
// apps used in the EEA, and only then are prompts kept out of Google's model training.
// The few request/response members this function uses. Vercel's Node runtime provides the real
// objects; declaring them here avoids the @vercel/node dev dependency and its audit warnings.
interface VercelRequest {
  method?: string
  body?: unknown
}
interface VercelResponse {
  status(code: number): VercelResponse
  json(body: unknown): VercelResponse
}
import programmes from '../src/data/programmes.json' with { type: 'json' }
import type { Programme } from '../src/data/types.js'

// Retrieval is copied from src/lib/retrieve.ts so the function has no local imports.

/** Simple keyword retrieval over the programme database. Used by the assistant
 *  (to pick the cards it sends to Gemini) and as the offline fallback. */

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

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

function retrieve(question: string, programmes: Programme[], k = 8): Programme[] {
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

const ALL = programmes as unknown as Programme[]
const LANG_NAME: Record<string, string> = { cs: 'Czech', pl: 'Polish', en: 'English' }

function card(p: Programme): string {
  return [
    `[${p.id}] ${p.name_local} / ${p.name_en} (${p.country}, status: ${p.status}, evidence: ${p.evidence})`,
    p.intro && `About: ${p.intro}`,
    p.who_for && `Who can get it: ${p.who_for}`,
    p.who_excluded && `Who cannot: ${p.who_excluded}`,
    p.what_you_get && `What you get: ${p.what_you_get}`,
    p.conditions && `Conditions: ${p.conditions}`,
    p.how_to_apply && `How to apply: ${p.how_to_apply}`,
    p.contact && `Contact: ${p.contact}`,
    p.operator && `Operator: ${p.operator}`,
    p.dates && `Dates: ${p.dates}`,
    p.known_problems && `Watch out: ${p.known_problems}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const key = process.env.GEMINI_API_KEY
  if (!key) return res.status(501).json({ error: 'Assistant not configured' })

  const { question, lang = 'cs', history = [] } = (req.body ?? {}) as {
    question?: string
    lang?: string
    history?: { role: 'user' | 'assistant'; text: string }[]
  }
  if (!question || typeof question !== 'string' || question.length > 2000) return res.status(400).json({ error: 'Bad question' })

  // Always include the core benefits, plus the best keyword matches.
  const core = ['PL-N01', 'PL-N03', 'PL-N08', 'PL-N14', 'PL-R01', 'CZ-P01', 'CZ-P02', 'CZ-P06', 'CZ-P08', 'CZ-P11', 'CZ-P13', 'CZ-P15']
  const picked = new Map<string, Programme>()
  for (const p of retrieve(question + ' ' + history.map((h) => h.text).join(' '), ALL, 14)) picked.set(p.id, p)
  for (const id of core) {
    const p = ALL.find((x) => x.id === id)
    if (p && picked.size < 22) picked.set(id, p)
  }

  const system = `You help miners, former miners and their families in Czech and Polish Silesia find support after coal.
Answer in ${LANG_NAME[lang] ?? 'Czech'}, in plain, short sentences, as you would talk to a miner aged 50 with little computer experience.
Use ONLY the programme cards below. Do not use outside knowledge about benefits, amounts or dates. If the cards do not answer the question, say so and suggest the labour office or the "Need to talk?" page.
After each claim, cite the card ID in square brackets, for example [CZ-P06].
Never say someone is definitely eligible: say what the rules say and who decides. Mention deadlines (such as the Czech 6-month window) when relevant.
If the person sounds distressed, be warm, and point them to the "Need to talk?" page and the emergency number 112.
Keep the answer under 180 words. No markdown headings.

PROGRAMME CARDS (research databases, 14 Nov 2026):
${[...picked.values()].map(card).join('\n\n')}`

  // Gemini calls the assistant's turns "model".
  const contents = [
    ...history.slice(-6).map((h) => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: question }] },
  ]
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
  // Gemini 3 and later think before answering; low keeps answers quick and cheap. Older models reject thinkingLevel.
  const thinking = /^gemini-([3-9]|\d{2})/.test(model) ? { thinkingConfig: { thinkingLevel: 'LOW' } } : {}

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        // Thinking tokens count towards the limit, so leave room for them.
        generationConfig: { maxOutputTokens: 2048, ...thinking },
      }),
    })
    if (!r.ok) return res.status(502).json({ error: `Upstream ${r.status}` })
    const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] }
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const answer = parts.filter((p) => !p.thought).map((p) => p.text ?? '').join('').trim()
    if (!answer) return res.status(502).json({ error: 'Empty answer' })
    const ids = [...new Set([...answer.matchAll(/\[((?:PL|CZ|XB)-[A-Z0-9]+)\]/g)].map((m) => m[1]))].filter((id) => picked.has(id))
    return res.status(200).json({ answer, ids })
  } catch {
    return res.status(502).json({ error: 'Upstream error' })
  }
}
