import type { Group, Need, Programme } from './types'

/**
 * Eligibility guide. It encodes the rules and exclusion tables from the two
 * research databases (14 Nov 2026). It is a guide, not a decision: the office
 * named on each programme decides.
 */

export type WorkCountry = 'PL' | 'CZ'
export type Situation = 'working' | 'leaving' | 'left_lt6' | 'left_gt6'
export type YearsToPension = 'lt1' | '1to4' | '5' | '6to10' | 'gt10' | 'unknown'
export type Service = 'lt2' | '2to3' | '3to5' | '5to15' | '16to24' | '25plus'
export type Age = 'lt50' | '50to54' | '55plus'
export type YesNo = 'yes' | 'no' | 'unknown'

export interface Profile {
  workCountry: WorkCountry
  liveCountry: 'PL' | 'CZ' | 'OTHER'
  group: Group
  employer: string
  situation: Situation
  leaveDate?: string
  plEmployedJan2026?: YesNo
  plLeftWhen?: 'before2021' | '2021to2025' | '2026'
  yearsToPension: YearsToPension
  service: Service
  age: Age
  czShifts?: 'yes' | 'almost' | 'no' | 'unknown'
  czStartBefore2016?: YesNo
  region: string
  needs: Need[]
}

export type Verdict = 'likely' | 'check' | 'no'
export interface Result {
  programme: Programme
  verdict: Verdict
  reason?: string // i18n key under "reason."
}

export const PL_EMPLOYERS = ['PGG', 'PKW', 'WEGLOKOKS', 'JSW', 'SRK', 'BOGDANKA', 'PGSILESIA', 'OTHER']
export const CZ_EMPLOYERS = ['OKD', 'DIAMO', 'SU', 'SEV', 'LISTED', 'OTHER']
export const SUPPORT = ['PGG', 'PKW', 'WEGLOKOKS', 'JSW']
export const SUB7 = ['bielsko', 'bytom', 'gliwice', 'katowice', 'rybnik', 'sosnowiec', 'tychy']
export const PL_REGIONS = [...SUB7, 'malopolska', 'walbrzych', 'elsewhere_pl']
export const CZ_REGIONS = ['msk', 'usti', 'kv', 'elsewhere_cz']
const EMPLOYEE_GROUPS: Group[] = ['underground', 'surface', 'processing', 'office']

type Rule = (p: Profile) => { verdict: Verdict; reason?: string } | null

const stillEmployed = (p: Profile) => p.situation === 'working' || p.situation === 'leaving'
const hasLeft = (p: Profile) => p.situation === 'left_lt6' || p.situation === 'left_gt6'
const isEmployee = (p: Profile) => EMPLOYEE_GROUPS.includes(p.group)
const near = (p: Profile, max: 4 | 5) =>
  p.yearsToPension === 'lt1' || p.yearsToPension === '1to4' || (max === 5 && p.yearsToPension === '5')
const serviceAtLeast = (p: Profile, years: number) => {
  const min: Record<Service, number> = { lt2: 0, '2to3': 2, '3to5': 3, '5to15': 5, '16to24': 16, '25plus': 25 }
  return min[p.service] >= years
}

/** Shared gate for the Polish statutory package (N01-N03, N09). */
function plPackageGate(p: Profile): { verdict: Verdict; reason?: string } | null {
  if (p.group === 'contractor' || p.group === 'supplier') return { verdict: 'no', reason: 'contractorExcluded' }
  if (p.employer === 'PGSILESIA') return { verdict: 'no', reason: 'privateMine' }
  if (!SUPPORT.includes(p.employer)) return { verdict: 'no', reason: 'notSupportEmployer' }
  if (hasLeft(p) && p.plLeftWhen !== '2026') return { verdict: 'no', reason: 'alreadyLeft' }
  if (p.plEmployedJan2026 === 'no') return { verdict: 'no', reason: 'hiredAfter2026' }
  return null
}

const RULES: Record<string, Rule> = {
  // ---------------- Poland ----------------
  'PL-N01': (p) => {
    const g = plPackageGate(p)
    if (g) return g
    if (p.group !== 'underground') return { verdict: 'no', reason: 'onlyUnderground' }
    if (hasLeft(p)) return { verdict: 'check', reason: 'leftIn2026' }
    if (near(p, 5)) return { verdict: p.plEmployedJan2026 === 'yes' ? 'likely' : 'check', reason: 'employerMustAgree' }
    if (p.yearsToPension === 'unknown') return { verdict: 'check', reason: 'checkPensionDate' }
    return { verdict: 'no', reason: 'tooFarFromPension5' }
  },
  'PL-N02': (p) => {
    const g = plPackageGate(p)
    if (g) return g
    if (p.group !== 'processing') return null
    if (hasLeft(p)) return { verdict: 'check', reason: 'leftIn2026' }
    if (near(p, 4)) return { verdict: p.plEmployedJan2026 === 'yes' ? 'likely' : 'check', reason: 'employerMustAgree' }
    if (p.yearsToPension === 'unknown') return { verdict: 'check', reason: 'checkPensionDate' }
    return { verdict: 'no', reason: 'tooFarFromPension4' }
  },
  'PL-N03': (p) => {
    const g = plPackageGate(p)
    if (g) return g
    if (!isEmployee(p)) return null
    if (hasLeft(p)) return { verdict: 'check', reason: 'leftIn2026' }
    if (!serviceAtLeast(p, 3)) return { verdict: 'no', reason: 'under3years' }
    if (p.yearsToPension === 'lt1') return { verdict: 'no', reason: 'within12months' }
    const leaveRight = (p.group === 'underground' && near(p, 5)) || (p.group === 'processing' && near(p, 4))
    if (leaveRight) return { verdict: 'no', reason: 'hasLeaveRight' }
    return { verdict: p.plEmployedJan2026 === 'yes' ? 'likely' : 'check', reason: 'employerMustAgree' }
  },
  'PL-N04': (p) => (SUPPORT.includes(p.employer) && stillEmployed(p) ? { verdict: 'check', reason: 'onlyIfMineSold' } : null),
  'PL-N05': (p) => (stillEmployed(p) && p.group !== 'family' && p.group !== 'retired' ? { verdict: 'check', reason: 'ifDismissed' } : null),
  'PL-N06': (p) => (SUPPORT.includes(p.employer) ? { verdict: 'check', reason: 'ifYouHaveAnnuity' } : null),
  'PL-N07': (p) => (SUPPORT.includes(p.employer) && stillEmployed(p) && isEmployee(p) ? { verdict: 'check', reason: 'byAgreement' } : null),
  'PL-N08': (p) => {
    if (p.group === 'office' || p.group === 'family' || p.group === 'supplier') return null
    if (p.group === 'underground' || p.group === 'retired') {
      if (p.service === '25plus') return { verdict: 'likely', reason: 'zusDecides' }
      if (p.service === '16to24') return { verdict: 'check', reason: 'countYourYears' }
      return null
    }
    if (p.group === 'contractor') return { verdict: 'check', reason: 'dependsOnWorkType' }
    return { verdict: 'check', reason: 'onlySomePostsCount' }
  },
  'PL-N09': (p) => {
    if (p.employer !== 'JSW') return null
    const g = plPackageGate(p)
    if (g) return g
    return { verdict: hasLeft(p) ? 'check' : 'likely', reason: 'jswProgramme' }
  },
  'PL-N10': (p) => (p.employer === 'SRK' ? { verdict: 'check', reason: 'legacyOnly' } : null),
  'PL-N11': (p) => (p.group === 'power' ? { verdict: 'check', reason: 'powerCompanies' } : null),
  'PL-N12': (p) => (p.employer === 'PGSILESIA' ? { verdict: 'check', reason: 'plannedLaw' } : null),
  'PL-N14': (p) => (p.liveCountry === 'PL' ? { verdict: 'likely', reason: 'registerWhereYouLive' } : null),
  'PL-N16': (p) => (p.group === 'retired' ? { verdict: 'check', reason: 'rulesNotChecked' } : null),
  'PL-R01': (p) => {
    if (!SUB7.includes(p.region)) return p.region === 'malopolska' || p.region === 'walbrzych' ? null : { verdict: 'no', reason: 'outsideSubregions' }
    if (p.group === 'family') return { verdict: 'check', reason: 'familyOfParticipant' }
    if (p.group === 'retired') return null
    if (hasLeft(p) && p.plLeftWhen === 'before2021') return { verdict: 'no', reason: 'dismissedBefore2021' }
    return { verdict: 'likely', reason: 'recruitsFrom2027' }
  },
  'PL-R02': (p) => {
    if (!SUB7.includes(p.region) || p.group === 'family' || p.group === 'retired') return null
    if (hasLeft(p) && p.plLeftWhen === 'before2021') return { verdict: 'no', reason: 'dismissedBefore2021' }
    return { verdict: 'check', reason: 'callClosedAskProjects' }
  },
  'PL-R03': (p) => (SUB7.includes(p.region) && p.group !== 'retired' ? { verdict: 'likely', reason: 'adultsInSubregions' } : null),
  'PL-R04': (p) => (SUB7.includes(p.region) ? { verdict: 'check', reason: 'askYourGmina' } : null),
  'PL-R07': (p) => (SUB7.includes(p.region) && p.group === 'supplier' ? { verdict: 'check', reason: 'forFirms' } : null),
  'PL-R08': (p) => (SUB7.includes(p.region) && p.needs.includes('children') ? { verdict: 'check', reason: 'forSchools' } : null),
  'PL-R10': (p) => (p.region === 'malopolska' ? { verdict: 'likely', reason: 'residentsOfCounties' } : null),
  'PL-R11': (p) => (p.region === 'walbrzych' ? { verdict: 'likely', reason: 'residentsOfCounties' } : null),
  'PL-C01': (p) => (p.employer === 'PGG' && isEmployee(p) && stillEmployed(p) ? { verdict: 'likely', reason: 'pggStaff' } : null),
  'PL-C02': (p) => (p.employer === 'PGG' && stillEmployed(p) ? { verdict: 'likely', reason: 'pggStaff' } : null),
  'PL-C03': (p) => (p.employer === 'SRK' || (p.workCountry === 'PL' && isEmployee(p) && p.situation !== 'working') ? { verdict: 'check', reason: 'statusUnclear' } : null),
  'PL-C04': (p) => (p.employer === 'SRK' ? { verdict: 'check', reason: 'statusUnclear' } : null),
  'PL-O02': (p) => (p.employer === 'BOGDANKA' ? { verdict: 'check', reason: 'caseByCase' } : null),
  'PL-L02': (p) => (p.region === 'rybnik' ? { verdict: 'likely', reason: 'localOffice' } : null),
  'PL-L05': (p) => (p.region === 'rybnik' && p.group !== 'retired' ? { verdict: 'check', reason: 'datesNotFound' } : null),
  'PL-L09': (p) => (p.employer === 'PGG' && p.region === 'katowice' && stillEmployed(p) ? { verdict: 'check', reason: 'pggStaff' } : null),
  'PL-L11': (p) => (p.region === 'malopolska' || p.employer === 'PKW' ? { verdict: 'likely', reason: 'residentsOfCounties' } : null),

  // ---------------- Czechia ----------------
  'CZ-P01': (p) => {
    if (p.employer !== 'OKD') return null
    if (p.group === 'contractor' || p.group === 'supplier') return { verdict: 'no', reason: 'contractorOwnTerms' }
    if (!isEmployee(p)) return null
    return { verdict: hasLeft(p) ? 'check' : 'likely', reason: 'paidAutomatically' }
  },
  'CZ-P02': (p) => {
    if (p.employer !== 'OKD' || !isEmployee(p)) return null
    if (p.situation === 'left_gt6') return { verdict: 'no', reason: 'past6months' }
    if (p.yearsToPension === 'lt1') return { verdict: 'check', reason: 'notAtPensionAge' }
    return { verdict: 'likely', reason: 'within6months' }
  },
  'CZ-P03': (p) => (p.employer === 'OKD' && stillEmployed(p) ? { verdict: 'check', reason: 'eventsInternal' } : null),
  'CZ-P04': (p) => (p.employer === 'OKD' && p.situation === 'working' ? { verdict: 'check', reason: 'okdSelects' } : null),
  'CZ-P05': (p) => (p.employer === 'OKD' && stillEmployed(p) ? { verdict: 'likely', reason: 'askHR' } : null),
  'CZ-P06': (p) => czAllowance(p, ['OKD', 'DIAMO']),
  'CZ-P07': (p) => czAllowance(p, ['SU', 'SEV', 'LISTED']),
  'CZ-P08': (p) => {
    if (p.group === 'surface' || p.group === 'office' || p.group === 'processing') return { verdict: 'no', reason: 'surfaceNotEligible' }
    if (p.group !== 'underground' && p.group !== 'retired') return null
    if (p.czStartBefore2016 === 'no') return { verdict: 'no', reason: 'startedAfter2016' }
    if (p.czShifts === 'yes') return { verdict: 'likely', reason: 'csszDecides' }
    if (p.czShifts === 'almost') return { verdict: 'check', reason: 'seeHardshipWaiver' }
    if (p.czShifts === 'no') return { verdict: 'no', reason: 'notEnoughShifts' }
    return { verdict: 'check', reason: 'checkShiftsEportal' }
  },
  'CZ-P09': (p) => (p.group === 'underground' && p.czShifts === 'almost' ? { verdict: 'check', reason: 'announcedOnly' } : null),
  'CZ-P10': (p) => (p.group === 'underground' && serviceAtLeast(p, 16) ? { verdict: 'check', reason: 'statusUnclear' } : null),
  'CZ-P11': (p) => {
    if (p.group === 'family' || p.group === 'retired') return null
    if (stillEmployed(p)) return { verdict: 'likely', reason: 'registerAsZajemce' }
    if (p.situation === 'left_lt6') return { verdict: 'check', reason: 'forPeopleInNotice' }
    return null
  },
  'CZ-P12': (p) => (p.employer === 'OKD' && stillEmployed(p) ? { verdict: 'likely', reason: 'walkIn' } : null),
  'CZ-P13': (p) => {
    if (p.group === 'retired') return null
    if (p.liveCountry === 'CZ') return { verdict: 'likely', reason: 'registerAtLabourOffice' }
    return { verdict: 'check', reason: 'crossBorderResidence' }
  },
  'CZ-P15': (p) => {
    if (p.group === 'retired' || p.situation === 'working') return null
    if (p.liveCountry === 'CZ') return { verdict: 'likely', reason: 'registerAtLabourOffice' }
    return { verdict: 'check', reason: 'crossBorderResidence' }
  },
  'CZ-P17': (p) => (p.region === 'msk' && p.group !== 'retired' ? { verdict: 'likely', reason: 'freeCounselling' } : null),
  'CZ-P19': (p) => (['msk', 'usti', 'kv'].includes(p.region) && p.needs.includes('business') ? { verdict: 'check', reason: 'loanMinimum' } : null),
  'CZ-P21': (p) => (p.region === 'msk' && p.needs.includes('job') ? { verdict: 'check', reason: 'rules2017' } : null),
  'CZ-P25': (p) => (p.employer === 'SU' && isEmployee(p) ? { verdict: 'likely', reason: 'throughEmployer' } : null),
  'CZ-L3': (p) => (p.region === 'msk' && (p.needs.includes('family') || p.group === 'family') ? { verdict: 'check', reason: 'allResidents' } : null),

  // ---------------- Cross-border ----------------
  'XB-01': (p) =>
    p.liveCountry !== p.workCountry
      ? { verdict: 'likely', reason: 'crossBorderWorker' }
      : p.needs.includes('job')
        ? { verdict: 'check', reason: 'workAcrossBorder' }
        : null,
}

function czAllowance(p: Profile, employers: string[]): { verdict: Verdict; reason?: string } | null {
  if (!employers.includes(p.employer)) {
    if ((p.group === 'contractor' || p.group === 'supplier' || p.group === 'power') && employers.includes('OKD'))
      return { verdict: 'no', reason: 'notListedFirm' }
    return null
  }
  if (!isEmployee(p)) return null
  if (p.service === 'lt2') return { verdict: 'no', reason: 'under2years' }
  if (p.situation === 'left_gt6') return { verdict: 'no', reason: 'past6months' }
  if (p.situation === 'working') return { verdict: 'check', reason: 'ifOrganisationalReasons' }
  return { verdict: 'likely', reason: 'claimWithin6months' }
}

/** Programmes that depend on where you live, not where you worked (shown for the home country too). */
const RESIDENCE_BASED = new Set([
  'PL-N14', 'PL-R01', 'PL-R02', 'PL-R03', 'PL-R04', 'PL-R10', 'PL-R11', 'PL-L02', 'PL-L05', 'PL-L11',
  'CZ-P13', 'CZ-P15', 'CZ-P17', 'CZ-P19', 'CZ-P21', 'CZ-L3',
])

export function evaluate(p: Profile, programmes: Programme[]): Result[] {
  const out: Result[] = []
  for (const prog of programmes) {
    if (!prog.individual) continue
    if (prog.status === 'closed') continue
    const relevantCountry =
      prog.country === 'XB' || prog.country === p.workCountry || (p.liveCountry !== 'OTHER' && prog.country === p.liveCountry)
    if (!relevantCountry) continue
    if (prog.country !== 'XB' && prog.country !== p.workCountry && !RESIDENCE_BASED.has(prog.id)) continue
    const rule = RULES[prog.id]
    if (rule) {
      const r = rule(p)
      if (r) out.push({ programme: prog, ...r })
      continue
    }
    // Fallback for programmes without a written rule: match on tags.
    const groupOk = prog.groups.length === 0 || prog.groups.includes(p.group)
    const employerOk = prog.employers.length === 0 || prog.employers.includes(p.employer)
    const regionOk = prog.regions.length === 0 || prog.regions.includes(p.region)
    const needOk = p.needs.length === 0 || prog.needs.some((n) => p.needs.includes(n))
    if (groupOk && employerOk && regionOk && needOk && prog.status !== 'legacy')
      out.push({ programme: prog, verdict: 'check', reason: 'generalMatch' })
  }
  const rank: Record<Verdict, number> = { likely: 0, check: 1, no: 2 }
  const needRank = (r: Result) => (p.needs.length && r.programme.needs.some((n) => p.needs.includes(n)) ? 0 : 1)
  return out.sort((a, b) => rank[a.verdict] - rank[b.verdict] || needRank(a) - needRank(b))
}

/** Order in which "likely" programmes become steps of the personal route. */
export const STEP_ORDER = [
  'CZ-P12', 'CZ-P05', 'PL-C02', 'PL-L09',
  'PL-N01', 'PL-N02', 'PL-N03', 'PL-N09', 'CZ-P01', 'CZ-P25',
  'CZ-P06', 'CZ-P07',
  'CZ-P11', 'CZ-P15', 'CZ-P13', 'PL-N14',
  'CZ-P02', 'PL-C01', 'PL-R01', 'PL-R10', 'PL-R11', 'PL-L11',
  'CZ-P17', 'PL-R03', 'PL-L02',
  'PL-N08', 'CZ-P08',
  'XB-01',
]

export interface AllowanceEstimate {
  monthly: number
  months: string
}

/** Czech restructuring allowance (NV 167/2016, NV 342/2016): rough estimate only. */
export function czAllowanceEstimate(p: Profile): AllowanceEstimate | null {
  if (!['OKD', 'DIAMO', 'SU', 'SEV', 'LISTED'].includes(p.employer) || !isEmployee(p) || p.service === 'lt2') return null
  const monthly = p.group === 'underground' ? 8000 : 5300
  let months = '3'
  if (p.service === '5to15') months = '6-36'
  if (p.service === '16to24') months = '36'
  if (p.service === '25plus') {
    const long =
      (p.group === 'underground' && p.age !== 'lt50' && p.czShifts === 'yes') ||
      (p.group !== 'underground' && p.age === '55plus')
    months = long ? '60' : '36'
  }
  return { monthly, months }
}

export function addMonths(iso: string, n: number): Date {
  const d = new Date(iso)
  const day = d.getDate()
  d.setMonth(d.getMonth() + n)
  if (d.getDate() < day) d.setDate(0)
  return d
}
