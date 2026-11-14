export type Lang = 'cs' | 'pl' | 'en'
export type Country = 'PL' | 'CZ' | 'XB'
export type Evidence = 'VERIFIED' | 'REPORTED' | 'UNVERIFIED'
export type Status = 'active' | 'upcoming' | 'closed' | 'planned' | 'unclear' | 'legacy'
export type Need = 'money' | 'pension' | 'job' | 'training' | 'business' | 'family' | 'advice' | 'children' | 'other'
export type Group =
  | 'underground' | 'surface' | 'processing' | 'office'
  | 'contractor' | 'supplier' | 'power' | 'retired' | 'family'

export interface Programme {
  id: string
  code: string
  country: Country
  level: string
  lang: string
  name_local: string
  name_en: string
  type: string
  intro: string
  who_for: string
  who_excluded: string
  what_you_get: string
  conditions: string
  how_to_apply: string
  operator: string
  funder?: string
  contact: string
  territory: string
  dates: string
  status_text: string
  legal_basis: string
  take_up: string
  known_problems: string
  evidence: Evidence
  evidence_note: string
  source_note: string
  needs: Need[]
  groups: Group[]
  employers: string[]
  regions: string[]
  status: Status
  individual: boolean
  url: string
  summary: Partial<Record<Lang, string>>
  last_checked: string
  /** Translations added later by admins, keyed by language then field */
  i18n?: Partial<Record<Lang, Partial<Record<string, string>>>>
}

export type Text3 = Record<Lang, string>
