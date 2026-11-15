import type { Text3 } from './types'
import karvina1920 from '../assets/photos/karvina-csa-1920.webp'
import karvina960 from '../assets/photos/karvina-csa-960.webp'
import helmet1600 from '../assets/photos/helmet-1600.webp'
import helmet800 from '../assets/photos/helmet-800.webp'
import prezydent1600 from '../assets/photos/prezydent-1600.webp'
import prezydent800 from '../assets/photos/prezydent-800.webp'
import chains1600 from '../assets/photos/michal-chains-1600.webp'
import chains800 from '../assets/photos/michal-chains-800.webp'
import nikiszowiec1600 from '../assets/photos/nikiszowiec-1600.webp'
import nikiszowiec800 from '../assets/photos/nikiszowiec-800.webp'
import landek1600 from '../assets/photos/landek-1600.webp'
import landek800 from '../assets/photos/landek-800.webp'
import lamps900 from '../assets/photos/lamps-900.webp'
import carbide800 from '../assets/photos/carbide-helmet-800.webp'

/**
 * Photos from Wikimedia Commons, resized (and some cropped) for the site; the edited versions
 * keep the original licence. Every photo is credited on its page and on /credits.
 * To add one: put WebP files in src/assets/photos, import them here and fill in the credit.
 */
export interface Photo {
  /** srcset entries, smallest first */
  srcs: { src: string; width: number }[]
  alt: Text3
  /** CSS object-position when the photo is cropped to fill a header */
  position?: string
  credit: { author: string; license: string; licenseUrl: string; page: string; edits: Text3 }
}

const RESIZED: Text3 = { en: 'resized', cs: 'zmenšeno', pl: 'pomniejszone' }
const CROPPED: Text3 = { en: 'cropped and resized', cs: 'oříznuto a zmenšeno', pl: 'przycięte i pomniejszone' }
const BY_SA_4 = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }

export const PHOTOS = {
  karvina: {
    srcs: [{ src: karvina960, width: 960 }, { src: karvina1920, width: 1920 }],
    alt: {
      en: 'Headframes of the former ČSA mine in Karviná in morning mist, October 2026',
      cs: 'Těžní věže bývalého Dolu ČSA v Karviné v ranní mlze, říjen 2026',
      pl: 'Wieże wyciągowe dawnej kopalni ČSA w Karwinie w porannej mgle, październik 2026',
    },
    position: '70% 40%',
    credit: { author: 'Tadeáš Bednarz', ...BY_SA_4, page: 'https://commons.wikimedia.org/wiki/File:Ocelov%C3%A1_t%C4%9B%C5%BEn%C3%AD_v%C4%9B%C5%BE_Dolu_%C4%8CSA,_Karvin%C3%A1,_2026-10-21_(3).jpg', edits: RESIZED },
  },
  helmet: {
    srcs: [{ src: helmet800, width: 800 }, { src: helmet1600, width: 1600 }],
    alt: { en: "Miner's hard hat with an electric headlamp", cs: 'Hornická přilba s elektrickou svítilnou', pl: 'Kask górniczy z elektryczną lampą' },
    position: '60% 55%',
    credit: { author: 'Mikepascoe', ...BY_SA_4, page: 'https://commons.wikimedia.org/wiki/File:Coal_miner_hard_hat_with_headlamp..jpg', edits: RESIZED },
  },
  prezydent: {
    srcs: [{ src: prezydent800, width: 800 }, { src: prezydent1600, width: 1600 }],
    alt: {
      en: 'The Prezydent shaft headframe in Chorzów, built in 1933',
      cs: 'Těžní věž jámy Prezydent v Chořově z roku 1933',
      pl: 'Wieża wyciągowa szybu Prezydent w Chorzowie z 1933 roku',
    },
    position: '50% 30%',
    credit: { author: 'Nemo5576', ...BY_SA_4, page: 'https://commons.wikimedia.org/wiki/File:Chorz%C3%B3w_szyb_Prezydent_22_10_2011_PA220749.jpg', edits: CROPPED },
  },
  chains: {
    srcs: [{ src: chains800, width: 800 }, { src: chains1600, width: 1600 }],
    alt: {
      en: "Miners' clothes hanging on chains under the ceiling of the changing room at Michal Mine, Ostrava",
      cs: 'Oblečení horníků zavěšené na řetízcích pod stropem šatny Dolu Michal v Ostravě',
      pl: 'Ubrania górników zawieszone na łańcuszkach pod sufitem łaźni kopalni Michal w Ostrawie',
    },
    position: '50% 35%',
    credit: { author: 'Marta Malina Moraczewska', ...BY_SA_4, page: 'https://commons.wikimedia.org/wiki/File:Michal_Mine,_Ostrava-Mich%C3%A1lkovice.jpg', edits: RESIZED },
  },
  nikiszowiec: {
    srcs: [{ src: nikiszowiec800, width: 800 }, { src: nikiszowiec1600, width: 1600 }],
    alt: {
      en: "Nikiszowiec, the miners' housing estate in Katowice, from the air at dusk",
      cs: 'Nikiszowiec, hornická kolonie v Katovicích, letecký pohled za soumraku',
      pl: 'Nikiszowiec, górnicze osiedle w Katowicach, z lotu ptaka o zmierzchu',
    },
    position: '50% 55%',
    credit: { author: 'Pawelsuder', ...BY_SA_4, page: 'https://commons.wikimedia.org/wiki/File:DJI_0708_Nikiszowiec.jpg', edits: RESIZED },
  },
  landek: {
    srcs: [{ src: landek800, width: 800 }, { src: landek1600, width: 1600 }],
    alt: {
      en: 'Headframe of the Anselm mine at Landek Park, Ostrava',
      cs: 'Těžní věž dolu Anselm v Landek Parku v Ostravě',
      pl: 'Wieża wyciągowa kopalni Anselm w Landek Parku w Ostrawie',
    },
    position: '50% 30%',
    credit: { author: 'Palickap', ...BY_SA_4, page: 'https://commons.wikimedia.org/wiki/File:Ostrava,_Landek_Park,_t%C4%9B%C5%BEn%C3%AD_v%C4%9B%C5%BE_dolu_Anselm.jpg', edits: CROPPED },
  },
  lamps: {
    srcs: [{ src: lamps900, width: 900 }],
    alt: {
      en: "Miners' lamps in the lamp room of Michal Mine, Ostrava",
      cs: 'Hornické kahany v lampovně Dolu Michal v Ostravě',
      pl: 'Lampy górnicze w lampowni kopalni Michal w Ostrawie',
    },
    credit: {
      author: 'Boris Renner',
      license: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      page: 'https://commons.wikimedia.org/wiki/File:Lampovna_narodni_kulturni_pamatky_dolu_michal_2008.jpg',
      edits: { en: 'converted', cs: 'převedeno do jiného formátu', pl: 'przekonwertowane' },
    },
  },
  carbide: {
    srcs: [{ src: carbide800, width: 800 }],
    alt: {
      en: "Miner's helmet with a carbide lamp, around the 1940s (museum piece)",
      cs: 'Hornická přilba s karbidovou lampou, kolem 40. let 20. století (muzejní exponát)',
      pl: 'Kask górniczy z lampą karbidową, ok. lat 40. XX wieku (eksponat muzealny)',
    },
    credit: { author: 'Jim Heaphy (Cullen328)', ...BY_SA_4, page: 'https://commons.wikimedia.org/wiki/File:Miner%27s_helmet_with_carbide_lamp.jpg', edits: CROPPED },
  },
} satisfies Record<string, Photo>

export type PhotoKey = keyof typeof PHOTOS

export function srcSet(p: Photo): string {
  return p.srcs.map((s) => `${s.src} ${s.width}w`).join(', ')
}
