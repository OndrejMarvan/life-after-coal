import { insert, list, prefs } from './store'

/**
 * Accounts for demo mode (no Supabase). Everything lives in this browser's localStorage.
 * Two accounts are built in; their passwords are in the README ("Demo accounts").
 * Only the admin account can open /admin. Accounts created with "Create account" are ordinary users.
 */

export interface DemoAccount {
  id: string
  email: string
  name: string
  isAdmin: boolean
  pwHash: string
}

export const DEMO_MINER_EMAIL = 'demo@lifeaftercoal.example'

const BUILT_IN: DemoAccount[] = [
  { id: 'demo-miner', email: DEMO_MINER_EMAIL, name: 'Petr Novák', isAdmin: false, pwHash: '97882c588b8c7f9464834e30e4a7ca3b32bc0e70c8411d0decd56aab6d0e2dd6' },
  { id: 'demo-admin', email: 'admin@lifeaftercoal.example', name: 'Admin', isAdmin: true, pwHash: 'a5daed7eac2aad978694ebb6e0c0be0409a097da7f74ed20cacee0996cd3e6c3' },
]

export async function hashPassword(password: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function registered(): DemoAccount[] {
  return prefs.get<DemoAccount[]>('demoAccounts', [])
}

export function findAccount(email: string): DemoAccount | undefined {
  const e = email.trim().toLowerCase()
  return [...BUILT_IN, ...registered()].find((a) => a.email === e)
}

export function addAccount(account: DemoAccount) {
  prefs.set('demoAccounts', [...registered(), account])
}

export function isDemoMiner(id: string): boolean {
  return id === 'demo-miner'
}

/**
 * Gives the demo miner a filled-in dashboard the first time they sign in on this browser:
 * an OKD underground miner who left at the end of October 2026, so the Czech 6-month
 * allowance deadline (30 April 2027) is still running.
 */
export async function seedDemoMiner(userId: string) {
  if ((await list('user_routes', { eq: { user_id: userId } })).length) return
  await insert('user_routes', {
    user_id: userId,
    profile: { workCountry: 'CZ', employer: 'OKD', group: 'underground', situation: 'left', leaveDate: '2026-10-31' },
    steps: ['CZ-P01', 'CZ-P15', 'CZ-P06', 'CZ-P02', 'CZ-P13', 'CZ-P17'],
    done: ['CZ-P01', 'CZ-P15'],
    deadline: '2027-04-30',
  })
  for (const id of ['CZ-P06', 'CZ-P08', 'CZ-P19']) await insert('saved_items', { user_id: userId, programme_id: id })
  const apps = [
    { programme_id: 'CZ-P15', status: 'approved', note: 'Úřad práce Karviná, registrace 3. 11. 2026' },
    { programme_id: 'CZ-P02', status: 'applied', note: 'Virtuální karta vyplněna s konzultantem' },
    { programme_id: 'CZ-P06', status: 'planned', note: 'Formulář z přílohy č. 2, podat přes Diamo do 30. 4. 2027' },
  ]
  for (const a of apps) await insert('applications', { ...a, user_id: userId })
}
