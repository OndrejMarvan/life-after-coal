import { useEffect, useState } from 'react'
import seedProgrammes from '../data/programmes.json'
import { seedEvents, type CalEvent } from '../data/events'
import { seedPlaces, type Place } from '../data/places'
import type { Lang, Programme, Text3 } from '../data/types'
import { list } from './store'

export const SEED_PROGRAMMES = seedProgrammes as unknown as Programme[]

/** Text in the reader's language, falling back to the programme's own language, then English. */
export function pickSummary(p: Programme, lang: Lang): string {
  const local = (p.country === 'PL' ? 'pl' : p.country === 'CZ' ? 'cs' : 'en') as Lang
  return p.i18n?.[lang]?.summary || p.summary[lang] || p.summary[local] || p.summary.en || ''
}

export function pickField(p: Programme, field: keyof Programme, lang: Lang): { text: string; translated: boolean } {
  const tr = p.i18n?.[lang]?.[field as string]
  if (tr) return { text: tr, translated: true }
  return { text: String(p[field] ?? ''), translated: lang === 'en' }
}

/** Official local name for Czech and Polish readers, English name for English readers. */
export function displayName(p: Programme, lang: Lang): string {
  return lang === 'en' ? p.name_en : p.name_local
}

export function t3(text: Text3 | undefined, lang: Lang): string {
  if (!text) return ''
  return text[lang] || text.en
}

/** Seed programmes merged with admin edits stored in the database (database wins). */
export function useProgrammes(): { programmes: Programme[]; loading: boolean; reload: () => void } {
  const [rows, setRows] = useState<Programme[]>(SEED_PROGRAMMES)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let alive = true
    list('programmes')
      .then((db) => {
        if (!alive) return
        const byId = new Map(SEED_PROGRAMMES.map((p) => [p.id, p]))
        for (const r of db as unknown as Programme[]) byId.set(r.id, { ...(byId.get(r.id) ?? ({} as Programme)), ...r })
        setRows([...byId.values()])
      })
      .catch(() => setRows(SEED_PROGRAMMES))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [tick])
  return { programmes: rows, loading, reload: () => setTick((x) => x + 1) }
}

export function useEvents(): CalEvent[] {
  const [rows, setRows] = useState<CalEvent[]>(seedEvents)
  useEffect(() => {
    list('events')
      .then((db) => setRows([...seedEvents, ...(db as unknown as CalEvent[])]))
      .catch(() => setRows(seedEvents))
  }, [])
  return rows
}

export function usePlaces(): Place[] {
  const [rows, setRows] = useState<Place[]>(seedPlaces)
  useEffect(() => {
    list('places')
      .then((db) => setRows([...seedPlaces, ...(db as unknown as Place[])]))
      .catch(() => setRows(seedPlaces))
  }, [])
  return rows
}

const LOCALE: Record<Lang, string> = { cs: 'cs-CZ', pl: 'pl-PL', en: 'en-GB' }
export function fmtDate(iso: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang], opts).format(new Date(iso))
  } catch {
    return iso
  }
}

export function daysUntil(d: Date): number {
  const ms = d.getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(ms / 86400000)
}

/** Builds an .ics file for one all-day event and starts the download. */
export function downloadIcs(id: string, dateIso: string, title: string, description: string) {
  const d = dateIso.replaceAll('-', '').slice(0, 8)
  const next = new Date(dateIso)
  next.setDate(next.getDate() + 1)
  const e = next.toISOString().slice(0, 10).replaceAll('-', '')
  const esc = (s: string) => s.replace(/[\\;,]/g, (m) => '\\' + m).replace(/\n/g, '\\n')
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Life After Coal//EN', 'BEGIN:VEVENT',
    `UID:${id}@lifeaftercoal`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${e}`, `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(description)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${id}.ics`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
