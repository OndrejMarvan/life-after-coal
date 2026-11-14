import { supabase, isDemo } from './supabase'

/**
 * Tiny data layer. With Supabase configured it reads and writes the real tables.
 * Without it (demo mode) the same calls use the browser's localStorage, so the
 * whole site can be clicked through before any backend exists.
 */

export type Row = { id: string; created_at?: string; [k: string]: unknown }

export interface ListOpts {
  eq?: Record<string, unknown>
  order?: string
  ascending?: boolean
  limit?: number
}

const PREFIX = 'lac:db:'

function readLocal(table: string): Row[] {
  try {
    const raw = localStorage.getItem(PREFIX + table)
    return raw ? (JSON.parse(raw) as Row[]) : []
  } catch {
    return []
  }
}

function writeLocal(table: string, rows: Row[]) {
  try {
    localStorage.setItem(PREFIX + table, JSON.stringify(rows))
  } catch {
    /* storage full or blocked: ignore in demo mode */
  }
}

function newId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

export async function list<T extends Row = Row>(table: string, opts: ListOpts = {}): Promise<T[]> {
  if (!isDemo && supabase) {
    let q = supabase.from(table).select('*')
    for (const [k, v] of Object.entries(opts.eq ?? {})) q = q.eq(k, v as never)
    if (opts.order) q = q.order(opts.order, { ascending: opts.ascending ?? false })
    if (opts.limit) q = q.limit(opts.limit)
    const { data, error } = await q
    if (error) throw error
    return (data ?? []) as T[]
  }
  let rows = readLocal(table)
  for (const [k, v] of Object.entries(opts.eq ?? {})) rows = rows.filter((r) => r[k] === v)
  if (opts.order) {
    const key = opts.order
    const asc = opts.ascending ?? false
    rows = [...rows].sort((a, b) => {
      const av = String(a[key] ?? '')
      const bv = String(b[key] ?? '')
      return asc ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }
  if (opts.limit) rows = rows.slice(0, opts.limit)
  return rows as T[]
}

// Tables the public may write to but not read back (row-level security): insert without RETURNING.
const WRITE_ONLY = new Set(['callback_requests', 'newsletter_subscribers', 'suggestions', 'reports', 'stories'])

export async function insert<T extends Row = Row>(table: string, row: Omit<T, 'id'> & { id?: string }): Promise<T> {
  if (!isDemo && supabase) {
    if (WRITE_ONLY.has(table)) {
      const { error } = await supabase.from(table).insert(row as never)
      if (error) throw error
      return { ...row, id: row.id ?? '' } as T
    }
    const { data, error } = await supabase.from(table).insert(row as never).select().single()
    if (error) throw error
    return data as T
  }
  const full = { ...row, id: row.id ?? newId(), created_at: new Date().toISOString() } as T
  writeLocal(table, [...readLocal(table), full])
  return full
}

export async function upsert<T extends Row = Row>(table: string, row: T): Promise<T> {
  if (!isDemo && supabase) {
    const { data, error } = await supabase.from(table).upsert(row as never).select().single()
    if (error) throw error
    return data as T
  }
  const rows = readLocal(table)
  const i = rows.findIndex((r) => r.id === row.id)
  const full = { created_at: new Date().toISOString(), ...row }
  if (i >= 0) rows[i] = { ...rows[i], ...full }
  else rows.push(full)
  writeLocal(table, rows)
  return full
}

export async function update(table: string, id: string, patch: Record<string, unknown>): Promise<void> {
  if (!isDemo && supabase) {
    const { error } = await supabase.from(table).update(patch).eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(
    table,
    readLocal(table).map((r) => (r.id === id ? { ...r, ...patch } : r)),
  )
}

export async function remove(table: string, id: string): Promise<void> {
  if (!isDemo && supabase) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLocal(
    table,
    readLocal(table).filter((r) => r.id !== id),
  )
}

/** Small per-browser preferences (language, last wizard answers), never shared. */
export const prefs = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem('lac:pref:' + key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem('lac:pref:' + key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  },
}
