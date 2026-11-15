import { prefs } from './store'

/** "dark" (black header, footer and page headers) is the default; "light" turns them white. */
export type Theme = 'dark' | 'light'

export function savedTheme(): Theme {
  return prefs.get<string>('theme', 'dark') === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#FFFFFF' : '#0D0D0D')
  prefs.set('theme', theme)
}
