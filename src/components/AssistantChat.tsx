import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ProgrammeCard, useLang } from './ui'
import { displayName, useProgrammes } from '../lib/content'
import { FEELINGS, retrieve } from '../lib/retrieve'
import type { Programme } from '../data/types'

interface Msg {
  role: 'user' | 'assistant'
  text: string
  cards?: Programme[]
  fallback?: boolean
  feelings?: boolean
}

/**
 * The assistant conversation. Full size on the /assistant page; `compact` fits the floating
 * chat window (scrolling message list, programmes as plain links). `onNavigate` runs when a
 * link inside the chat is followed, so the window can close.
 */
export function AssistantChat({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { t } = useTranslation()
  const lang = useLang()
  const { programmes } = useProgrammes()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputId = compact ? 'ask-chat' : 'ask'

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
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }
  }

  const text = compact ? 'text-base' : 'text-lg'
  const examples = msgs.length === 0 && (
    <div className={compact ? '' : 'mb-6'}>
      <p className="display font-bold mb-2">{t('assistant.examples')}</p>
      <div className="flex flex-wrap gap-2">
        {[t('assistant.ex1'), t('assistant.ex2'), t('assistant.ex3')].map((ex) => (
          <button
            key={ex}
            type="button"
            className={`rounded-full border-2 border-coal/20 bg-white px-4 py-2 text-left hover:border-orange ${compact ? 'text-sm' : ''}`}
            onClick={() => void ask(ex)}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )

  const messages = (
    <div className={compact ? 'space-y-3' : 'space-y-4'} aria-live="polite">
      {msgs.map((m, i) =>
        m.role === 'user' ? (
          <div key={i} className={`ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-coal text-white px-4 py-2.5 ${text}`}>
            {m.text}
          </div>
        ) : (
          <div key={i} className="max-w-full">
            <div
              className={`rounded-2xl rounded-bl-sm px-4 py-3 whitespace-pre-wrap ${text} ${
                m.fallback ? 'bg-orange-pale border-2 border-orange' : 'bg-white border-2 border-coal/10'
              }`}
            >
              {m.text.replace(/\[(?:PL|CZ|XB)-[A-Z0-9]+\]/g, '').replace(/\s{2,}/g, ' ')}
            </div>
            {m.feelings && (
              <div className="mt-3 rounded-xl bg-coal text-white p-4">
                {t('assistant.feelings')}{' '}
                <Link to="/help" onClick={onNavigate} className="font-bold text-orange underline">
                  {t('nav.help')}
                </Link>{' '}
                · {t('crisis.short')}
              </div>
            )}
            {m.cards && m.cards.length > 0 && (
              <div className="mt-3">
                <p className="display text-sm font-bold text-coal/70 mb-2">{t('assistant.sources')}</p>
                {compact ? (
                  <ul className="space-y-1.5">
                    {m.cards.map((p) => (
                      <li key={p.id}>
                        <Link to={`/programmes/${p.id}`} onClick={onNavigate} className="font-semibold text-orange-deep underline underline-offset-4">
                          {displayName(p, lang)} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {m.cards.map((p) => (
                      <ProgrammeCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ),
      )}
      {busy && <p className="display font-bold text-coal/60">⛏ {t('assistant.thinking')}</p>}
      <div ref={endRef} />
    </div>
  )

  const form = (
    <form
      className={compact ? 'border-t border-coal/10 bg-white p-3' : `mt-6 card p-4 shadow-lg ${msgs.length ? 'sticky bottom-20' : ''}`}
      onSubmit={(e) => {
        e.preventDefault()
        void ask(q)
      }}
    >
      <label className={compact ? 'label text-sm' : 'label'} htmlFor={inputId}>
        {t('assistant.inputLabel')}
      </label>
      <div className={compact ? 'flex gap-2' : 'flex flex-col sm:flex-row gap-3'}>
        <textarea
          id={inputId}
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
        <button className={`btn btn-primary ${compact ? '!px-3' : ''}`} disabled={busy || !q.trim()}>
          {t('assistant.ask')}
        </button>
      </div>
      {compact && <p className="mt-2 text-xs text-coal/60">{t('assistant.privacy')}</p>}
    </form>
  )

  if (compact)
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          {examples}
          {messages}
        </div>
        {form}
      </div>
    )

  return (
    <>
      {examples}
      {messages}
      {/* Sticky only once a conversation runs, so it never covers the example questions. */}
      {form}
      <p className="mt-3 text-sm text-coal/60">{t('assistant.disclaimer')}</p>
      <p className="mt-1 text-sm text-coal/60">{t('assistant.privacy')}</p>
    </>
  )
}
