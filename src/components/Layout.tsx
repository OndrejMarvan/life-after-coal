import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/auth'
import { isDemo } from '../lib/supabase'
import { fmtDate } from '../lib/content'
import { applyTheme, savedTheme, type Theme } from '../lib/theme'
import { AssistantChat } from './AssistantChat'
import { HeadframeLogo } from './HeadframeLogo'
import { useLang } from './ui'

const MAIN = [
  { to: '/check', key: 'nav.check' },
  { to: '/programmes', key: 'nav.programmes' },
  { to: '/map', key: 'nav.map' },
  { to: '/calendar', key: 'nav.calendar' },
]
const MORE = [
  { to: '/assistant', key: 'nav.assistant' },
  { to: '/forum', key: 'nav.forum' },
  { to: '/stories', key: 'nav.stories' },
  { to: '/children', key: 'nav.children' },
  { to: '/newsletter', key: 'nav.newsletter' },
  { to: '/portals', key: 'nav.portals' },
  { to: '/gaps', key: 'nav.gaps' },
  { to: '/about', key: 'nav.about' },
  { to: '/support', key: 'nav.support' },
]
/** The team, sorted alphabetically by surname. */
const TEAM = ['Krištof Gregor', 'Dmytro Hrebeniuk', 'JánJakub Kola', 'Ondřej Marvan', 'Alexandra Obracajová', 'Olga Yurkova']

function LangSwitch() {
  const { i18n, t } = useTranslation()
  const lang = useLang()
  return (
    <div role="group" aria-label={t('nav.language')} className="flex rounded-lg border-2 border-white/30 overflow-hidden">
      {(['cs', 'pl', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => void i18n.changeLanguage(l)}
          aria-pressed={lang === l}
          className={`display px-2.5 py-1.5 text-sm font-bold ${lang === l ? 'bg-orange text-coal' : 'text-white hover:bg-white/10'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** Dark/light background switch, next to the language buttons. */
function ThemeSwitch() {
  const { t } = useTranslation()
  const [theme, setTheme] = useState<Theme>(savedTheme)
  const label = theme === 'dark' ? t('nav.themeLight') : t('nav.themeDark')
  return (
    <button
      type="button"
      onClick={() => {
        const next = theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        setTheme(next)
      }}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-white/30 text-lg text-white hover:bg-white/10"
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  )
}

/** Floating message button on the left that opens the assistant in a small window. */
function ChatLauncher() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  if (pathname === '/assistant') return null
  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={t('nav.assistant')}
          className="no-print fixed inset-x-2 top-28 bottom-20 z-50 flex flex-col overflow-hidden rounded-2xl border-2 border-coal bg-paper shadow-2xl sm:inset-x-auto sm:left-4 sm:top-auto sm:h-[min(620px,calc(100vh-11rem))] sm:w-[400px]"
        >
          <div className="chrome flex items-center justify-between gap-3 bg-coal px-4 py-3 text-white">
            <p className="display font-bold">{t('nav.assistant')}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label={t('common.close')} className="grid h-9 w-9 place-items-center rounded-lg text-xl hover:bg-white/10">
              ✕
            </button>
          </div>
          <AssistantChat compact onNavigate={() => setOpen(false)} />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('nav.assistant')}
        className="no-print fixed bottom-4 left-4 z-40 btn btn-dark shadow-xl border-2 border-orange !rounded-full !px-4"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5h16v11H9l-5 4z" />
          <path d="M8 9.5h8M8 12.5h5" strokeLinecap="round" />
        </svg>
        <span className="hidden sm:inline">{t('chat.open')}</span>
      </button>
    </>
  )
}

export default function Layout() {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    setOpen(false)
    setMoreOpen(false)
    // Links like /stories#facts land on that section; other page changes start at the top
    const target = loc.hash ? document.getElementById(decodeURIComponent(loc.hash.slice(1))) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [loc.pathname, loc.hash])

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `display px-3 py-2 rounded-md text-[15px] font-semibold ${isActive ? 'bg-orange text-coal' : 'text-white hover:bg-white/10'}`

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-orange focus:p-3">
        {t('common.skipToContent')}
      </a>
      {isDemo && <div className="no-print bg-orange-pale text-coal text-center text-sm py-1.5 px-3 border-b border-orange">{t('common.demoBanner')}</div>}
      <header className="chrome bg-coal text-white sticky top-0 z-40 border-b-4 border-orange">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={t('nav.home')}>
            <HeadframeLogo className="h-14 w-14 shrink-0" />
            <span className="display text-lg sm:text-xl font-bold leading-none hidden min-[420px]:inline">{t('appName')}</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1 ml-4" aria-label={t('nav.menu')}>
            {MAIN.map((m) => (
              <NavLink key={m.to} to={m.to} className={linkCls}>
                {t(m.key)}
              </NavLink>
            ))}
            <div className="relative">
              <button type="button" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} className="display px-3 py-2 rounded-md text-[15px] font-semibold hover:bg-white/10">
                {t('nav.more')} ▾
              </button>
              {moreOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-coal border-2 border-orange p-2 shadow-xl">
                  {MORE.map((m) => (
                    <NavLink key={m.to} to={m.to} className={({ isActive }) => `block rounded-md px-3 py-2 ${isActive ? 'bg-orange text-coal' : 'hover:bg-white/10'}`}>
                      {t(m.key)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeSwitch />
            <LangSwitch />
            <div className="hidden lg:flex items-center gap-1">
              {user?.isAdmin && (
                <NavLink to="/admin" className={linkCls}>
                  {t('nav.admin')}
                </NavLink>
              )}
              <NavLink to="/account" className={linkCls}>
                {user ? t('nav.account') : t('nav.login')}
              </NavLink>
            </div>
            <button type="button" className="lg:hidden btn btn-primary !min-h-10 !px-3" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {t('nav.menu')}
            </button>
          </div>
        </div>
        {open && (
          <nav className="lg:hidden bg-coal border-t border-white/10 px-4 pb-4" aria-label={t('nav.menu')}>
            {[...MAIN, ...MORE].map((m) => (
              <NavLink key={m.to} to={m.to} className={({ isActive }) => `block rounded-md px-3 py-3 text-lg ${isActive ? 'bg-orange text-coal' : 'hover:bg-white/10'}`}>
                {t(m.key)}
              </NavLink>
            ))}
            <NavLink to="/help" className="block rounded-md px-3 py-3 text-lg font-bold text-orange">
              {t('nav.help')}
            </NavLink>
            {user?.isAdmin && (
              <NavLink to="/admin" className="block rounded-md px-3 py-3 text-lg">
                {t('nav.admin')}
              </NavLink>
            )}
            <NavLink to="/account" className="block rounded-md px-3 py-3 text-lg">
              {user ? t('nav.account') : t('nav.login')}
            </NavLink>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <ChatLauncher />
      <Link
        to="/help"
        className="need-to-talk no-print fixed bottom-4 right-4 z-40 btn btn-primary shadow-xl border-2 border-coal !rounded-full !px-5"
      >
        <span aria-hidden="true">☎</span> <span className="hidden sm:inline">{t('nav.help')}</span>
        <span className="sr-only sm:hidden">{t('nav.help')}</span>
      </Link>

      <footer className="chrome bg-coal text-white mt-12">
        <div className="kit-stripes h-3" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="display text-2xl font-bold text-orange">{t('greeting')}</p>
            <p className="mt-2 text-white/80">{t('footer.madeFor')}</p>
            <Link to="/support" className="btn btn-primary mt-5">
              <span aria-hidden="true">☕</span> {t('nav.support')}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 text-white/90">
            {[...MAIN, ...MORE].map((m) => (
              <Link key={m.to} to={m.to} className="hover:text-orange">
                {t(m.key)}
              </Link>
            ))}
          </div>
          <div className="text-sm text-white/70 space-y-2">
            <p>{t('about.disclaimer')}</p>
            <p>{t('footer.sources')}</p>
            <p>
              <Link to="/credits" className="underline underline-offset-2 hover:text-orange">
                {t('credits.title')}
              </Link>
            </p>
            <p>
              <Link to="/help" className="font-semibold text-white underline underline-offset-2 hover:text-orange">
                {t('crisis.short')}
              </Link>
            </p>
          </div>
        </div>
        {/* Extra bottom padding keeps the floating "Need to talk?" button off the text. */}
        <div className="border-t border-white/15">
          <div className="mx-auto max-w-6xl px-4 pt-5 pb-24 flex flex-col gap-2 text-sm text-white/70 md:flex-row md:justify-between md:gap-6">
            <p>
              © {t('appName')}, {fmtDate(__BUILD_DATE__, lang, { month: 'long', year: 'numeric' })}
            </p>
            <p>
              <span className="text-orange" aria-hidden="true">♥</span> {t('footer.madeWithLove')} {TEAM.join(', ')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
