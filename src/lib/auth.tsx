import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isDemo } from './supabase'
import { prefs } from './store'
import { addAccount, DEMO_MINER_EMAIL, findAccount, hashPassword, isDemoMiner, seedDemoMiner, type DemoAccount } from './demoAccounts'

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

interface AuthCtx {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Demo mode only: sign in as the built-in demo miner (README, "Demo accounts"). */
  signInDemo: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  magicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

async function loadProfile(id: string, email: string): Promise<User> {
  if (!supabase) return { id, email, name: email, isAdmin: false }
  const { data } = await supabase.from('profiles').select('display_name,is_admin').eq('id', id).maybeSingle()
  return { id, email, name: (data?.display_name as string) || email.split('@')[0], isAdmin: Boolean(data?.is_admin) }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo || !supabase) {
      // Re-check the stored session against the accounts: only the built-in admin keeps admin rights.
      const saved = prefs.get<User | null>('demoUser', null)
      const account = saved ? findAccount(saved.email) : undefined
      setUser(saved ? { ...saved, isAdmin: Boolean(account?.isAdmin) } : null)
      setLoading(false)
      return
    }
    const sb = supabase
    sb.auth.getSession().then(async ({ data }) => {
      const s = data.session
      setUser(s?.user ? await loadProfile(s.user.id, s.user.email ?? '') : null)
      setLoading(false)
    })
    const { data: sub } = sb.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ? await loadProfile(session.user.id, session.user.email ?? '') : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function startDemoSession(account: DemoAccount) {
    const u: User = { id: account.id, email: account.email, name: account.name, isAdmin: account.isAdmin }
    if (isDemoMiner(u.id)) await seedDemoMiner(u.id)
    prefs.set('demoUser', u)
    setUser(u)
  }

  async function signIn(email: string, password: string) {
    if (isDemo || !supabase) {
      const account = findAccount(email)
      if (!account || account.pwHash !== (await hashPassword(password))) throw new Error('wrongPassword')
      await startDemoSession(account)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const value: AuthCtx = {
    user,
    loading,
    signIn,
    async signInDemo() {
      const account = findAccount(DEMO_MINER_EMAIL)
      if (isDemo && account) await startDemoSession(account)
    },
    async signUp(email, password, name) {
      if (isDemo || !supabase) {
        const e = email.trim().toLowerCase()
        if (findAccount(e)) throw new Error('accountExists')
        const u: User = { id: 'demo-' + e, email: e, name: name.trim() || e.split('@')[0], isAdmin: false }
        addAccount({ ...u, pwHash: await hashPassword(password) })
        prefs.set('demoUser', u)
        setUser(u)
        return
      }
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } })
      if (error) throw error
    },
    async magicLink(email) {
      if (isDemo || !supabase) throw new Error('magicUnavailable')
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL + 'account' } })
      if (error) throw error
    },
    async signOut() {
      if (isDemo || !supabase) {
        prefs.set('demoUser', null)
        setUser(null)
        return
      }
      await supabase.auth.signOut()
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth outside AuthProvider')
  return c
}
