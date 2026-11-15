import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLang } from './ui'

/**
 * The hidden mining game (public/game/index.html), shown full screen over the site.
 * Opened by clicking the header logo 5 times or typing the Konami code (see Layout).
 * It is a plain static page in an iframe, so it adds nothing to the site's bundle.
 */
export default function GameModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const lang = useLang()
  const navigate = useNavigate()
  const frame = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    // Messages from the game: Esc pressed inside it (the iframe has the keyboard focus), or the
    // full museum passport's link to a page of the site.
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      const d = e.data as { lacGame?: string; path?: string } | null
      if (d?.lacGame === 'close') onClose()
      else if (d?.lacGame === 'goto' && d.path?.startsWith('/')) {
        onClose()
        navigate(d.path)
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('message', onMsg)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('message', onMsg)
    }
  }, [onClose, navigate])

  return (
    <div role="dialog" aria-modal="true" aria-label={t('game.title')} className="fixed inset-0 z-50 flex flex-col bg-[#120f0d]">
      <div className="flex justify-end px-3 pt-1.5">
        <button type="button" onClick={onClose} className="display rounded-md border-2 border-white/30 px-3 py-1 text-sm font-bold text-white hover:bg-white/10">
          <span aria-hidden="true">✕</span> {t('common.close')}
        </button>
      </div>
      <iframe
        ref={frame}
        src={`${import.meta.env.BASE_URL}game/index.html?lang=${lang}`}
        title={t('game.title')}
        className="w-full flex-1 border-0"
        onLoad={() => frame.current?.contentWindow?.focus()}
      />
    </div>
  )
}
