import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader, ProgrammeCard, Section, useLang } from '../components/ui'
import { useProgrammes } from '../lib/content'
import { FEELINGS, retrieve } from '../lib/retrieve'
import type { Programme } from '../data/types'

interface Msg {
  role: 'user' | 'assistant'
  text: string
  cards?: Programme[]
  fallback?: boolean
  feelings?: boolean
}

export default function Assistant() {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes } = useProgrammes()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  async function ask(question: string) {
    if (!question.trim()) return
    const history = msgs.slice(-6).map((m) => ({ role: m.role, text: m.text }))
    setMsgs((m) => [...m, { role: 'user', text: question }])
    setQ('')
    setBusy(true)
    const feelings = FEELINGS.test(question)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang, history }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { answer: string; ids: string[] }
      const cards = data.ids.map((id) => programmes.find((p) => p.id === id)).filter(Boolean) as Programme[]
      setMsgs((m) => [...m, { role: 'assistant', text: data.answer, cards, feelings }])
    } catch {
      const cards = retrieve(question, programmes, 5)
      setMsgs((m) => [...m, { role: 'assistant', text: t('assistant.fallback'), cards, fallback: true, feelings }])
    } finally {
      setBusy(false)
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <>
      <PageHeader title={t('assistant.title')} intro={t('assistant.intro')} />
      <Section>
        <div className="mx-auto max-w-4xl">
          {msgs.length === 0 && (
            <div className="mb-6">
              <p className="display font-bold mb-2">{t('assistant.examples')}</p>
              <div className="flex flex-wrap gap-2">
                {[t('assistant.ex1'), t('assistant.ex2'), t('assistant.ex3')].map((ex) => (
                  <button key={ex} type="button" className="rounded-full border-2 border-coal/20 bg-white px-4 py-2 text-left hover:border-orange" onClick={() => void ask(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4" aria-live="polite">
            {msgs.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-coal text-white px-5 py-3 text-lg">
                  {m.text}
                </div>
              ) : (
                <div key={i} className="max-w-full">
                  <div className={`rounded-2xl rounded-bl-sm px-5 py-4 text-lg whitespace-pre-wrap ${m.fallback ? 'bg-orange-pale border-2 border-orange' : 'bg-white border-2 border-coal/10'}`}>
                    {m.text.replace(/\[(?:PL|CZ|XB)-[A-Z0-9]+\]/g, '').replace(/\s{2,}/g, ' ')}
                  </div>
                  {m.feelings && (
                    <div className="mt-3 rounded-xl bg-coal text-white p-4">
                      {t('assistant.feelings')}{' '}
                      <Link to="/help" className="font-bold text-orange underline">
                        {t('nav.help')}
                      </Link>{' '}
                      · {t('crisis.short')}
                    </div>
                  )}
                  {m.cards && m.cards.length > 0 && (
                    <div className="mt-3">
                      <p className="display text-sm font-bold text-coal/70 mb-2">{t('assistant.sources')}</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {m.cards.map((p) => (
                          <ProgrammeCard key={p.id} p={p} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
            {busy && <p className="display font-bold text-coal/60">⛏ {t('assistant.thinking')}</p>}
            <div ref={endRef} />
          </div>
          <form
            className="mt-6 card p-4 flex flex-col sm:flex-row gap-3 sticky bottom-20 shadow-lg"
            onSubmit={(e) => {
              e.preventDefault()
              void ask(q)
            }}
          >
            <label className="sr-only" htmlFor="ask">
              {t('assistant.title')}
            </label>
            <textarea
              id="ask"
              className="field min-h-14 flex-1"
              rows={2}
              placeholder={t('assistant.placeholder')}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void ask(q)
                }
              }}
            />
            <button className="btn btn-primary" disabled={busy || !q.trim()}>
              {t('assistant.ask')}
            </button>
          </form>
          <p className="mt-3 text-sm text-coal/60">{t('assistant.disclaimer')}</p>
          <p className="mt-1 text-sm text-coal/60">{t('assistant.privacy')}</p>
        </div>
      </Section>
    </>
  )
}
