import type { Text3 } from './types'
import type { PhotoKey } from './photos'

/**
 * Short "Did you know?" facts about mining in both parts of Silesia. Each one links to a source;
 * where sources disagree on a detail (exact years, areas), the text avoids the disputed figure.
 */
export interface Fact {
  id: string
  text: Text3
  source: string
  photo?: PhotoKey
  /** Shown in big type at the top of the card when there is no photo */
  highlight?: Text3
}

export const FACTS: Fact[] = [
  {
    id: 'landek',
    photo: 'landek',
    source: 'https://archeologickyatlas.cz/en/lokace/koblov_ov_sidliste_landek',
    text: {
      en: 'Ice Age mammoth hunters burned coal on Landek hill in Ostrava. The finds from their hearths are considered the oldest known evidence of people using black coal.',
      cs: 'Lovci mamutů z doby ledové pálili uhlí na vrchu Landek v Ostravě. Nálezy z jejich ohnišť jsou považovány za nejstarší známý doklad toho, že lidé používali černé uhlí.',
      pl: 'Łowcy mamutów z epoki lodowcowej palili węgiel na wzgórzu Landek w Ostrawie. Znaleziska z ich palenisk uznaje się za najstarszy znany dowód używania węgla kamiennego przez ludzi.',
    },
  },
  {
    id: 'ostrava-1763',
    photo: 'karvina',
    source: 'https://www.ostrava.cz/en/o-meste/historie-mesta',
    text: {
      en: "Ostrava's coal era began in 1763, when coal was found in the Burňa valley in today's Slezská Ostrava. Mining in the Ostrava-Karviná basin ended on 31 January 2026 at the ČSM mine in Stonava, more than 260 years later.",
      cs: 'Uhelná éra Ostravska začala v roce 1763 nálezem uhlí v údolí Burňa v dnešní Slezské Ostravě. Těžba v ostravsko-karvinském revíru skončila 31. 1. 2026 na Dole ČSM ve Stonavě, o více než 260 let později.',
      pl: 'Węglowa epoka Ostrawy zaczęła się w 1763 r., gdy znaleziono węgiel w dolinie Burňa w dzisiejszej Śląskiej Ostrawie. Wydobycie w zagłębiu ostrawsko-karwińskim zakończyło się 31.01.2026 w kopalni ČSM w Stonawie, ponad 260 lat później.',
    },
  },
  {
    id: 'one-basin',
    highlight: { en: 'PL ⅚ · CZ ⅙', cs: 'PL ⅚ · CZ ⅙', pl: 'PL ⅚ · CZ ⅙' },
    source: 'https://en.wikipedia.org/wiki/Upper_Silesian_Coal_Basin',
    text: {
      en: 'The Upper Silesian Coal Basin crosses the border. About five-sixths of it lies in Poland and one-sixth in Czechia, where it is called the Ostrava-Karviná basin.',
      cs: 'Hornoslezská uhelná pánev leží na obou stranách hranice. Asi pět šestin je v Polsku a jedna šestina v Česku, kde se jí říká ostravsko-karvinský revír.',
      pl: 'Górnośląskie Zagłębie Węglowe leży po obu stronach granicy. Ok. pięć szóstych znajduje się w Polsce, a jedna szósta w Czechach, gdzie nazywa się je zagłębiem ostrawsko-karwińskim.',
    },
  },
  {
    id: 'greeting',
    highlight: { en: 'Glück auf!', cs: 'Zdař Bůh!', pl: 'Szczęść Boże!' },
    source: 'https://showcaves.com/english/explain/Terminology/Luck.html',
    text: {
      en: 'Miners greet each other with "Zdař Bůh" in Czech, "Szczęść Boże" in Polish and "Glück auf" in German. The German greeting wishes good luck, and is often read as a wish to come back up safely.',
      cs: 'Horníci se zdraví „Zdař Bůh“, polsky „Szczęść Boże“ a německy „Glück auf“. Německý pozdrav přeje štěstí a často se vykládá jako přání šťastného návratu nahoru.',
      pl: 'Górnicy pozdrawiają się „Szczęść Boże”, po czesku „Zdař Bůh”, a po niemiecku „Glück auf”. Niemieckie pozdrowienie życzy szczęścia i często rozumie się je jako życzenie bezpiecznego powrotu na powierzchnię.',
    },
  },
  {
    id: 'barbara',
    highlight: { en: '4 December', cs: '4. prosince', pl: '4 grudnia' },
    source: 'https://www.national-geographic.pl/historia/wielkie-swieto-wszystkich-gornikow-i-barbar-za-barborka-stoi-poruszajaca-legenda/',
    text: {
      en: "4 December, St Barbara's Day, is the miners' holiday: Barborka in Czechia, Barbórka in Poland. In Polish mining towns the day starts with a mass and a parade of miners' brass bands in dress uniforms with plumed hats.",
      cs: '4. prosince, na svátek svaté Barbory, slaví horníci svůj den: v Česku Barborku, v Polsku Barbórku. V polských hornických městech začíná mší a průvodem hornických dechovek ve slavnostních uniformách s chocholy.',
      pl: '4 grudnia, w dzień św. Barbary, górnicy obchodzą swoje święto: w Polsce Barbórkę, w Czechach Barborkę. W górniczych miastach dzień zaczyna się mszą i przemarszem orkiestr górniczych w galowych mundurach z czakami z pióropuszem.',
    },
  },
  {
    id: 'chains',
    photo: 'chains',
    source: 'https://www.ceskenoviny.cz/zpravy/2436225',
    text: {
      en: "In the miners' changing room, work clothes hung on hooks that were pulled up to the ceiling on chains to dry until the next shift. A chain room like this can still be seen at Michal Mine in Ostrava.",
      cs: 'V hornických šatnách visely pracovní oděvy na háčcích, které se na řetízcích vytahovaly ke stropu, aby do další směny uschly. Takovou řetízkovou šatnu dodnes uvidíte na Dole Michal v Ostravě.',
      pl: 'W górniczej łaźni ubrania robocze wisiały na hakach podciąganych na łańcuszkach pod sufit, gdzie schły do następnej zmiany. Taką łaźnię łańcuszkową można do dziś zobaczyć w kopalni Michal w Ostrawie.',
    },
  },
  {
    id: 'michal',
    photo: 'lamps',
    source: 'https://www.visitostrava.eu/en/discover-ostrava/top-10/474-national-cultural-monument-michal-coalmine.html',
    text: {
      en: 'Michal Mine in Ostrava closed in the early 1990s and was declared a national cultural monument in 1995. Visitors can walk the miners\' route through the changing rooms, the lamp room and the machine hall.',
      cs: 'Důl Michal v Ostravě skončil na začátku 90. let a v roce 1995 byl prohlášen národní kulturní památkou. Návštěvníci mohou projít cestu horníků přes šatny, lampovnu a strojovnu.',
      pl: 'Kopalnia Michal w Ostrawie zakończyła pracę na początku lat 90., a w 1995 r. ogłoszono ją narodowym zabytkiem kultury. Zwiedzający mogą przejść drogą górników przez łaźnię, lampownię i maszynownię.',
    },
  },
  {
    id: 'nikiszowiec',
    photo: 'nikiszowiec',
    source: 'https://katowice.eu/en/Strony/NIKISZOWIEC---OR-THE--NIKISZ.aspx',
    text: {
      en: "Nikiszowiec in Katowice was built from 1908 for the miners of the Giesche company: red-brick blocks around courtyards, with their own church. Since 2011 it has been one of Poland's Historic Monuments.",
      cs: 'Nikiszowiec v Katovicích vznikal od roku 1908 pro horníky firmy Giesche: bloky z červených cihel kolem dvorů s vlastním kostelem. Od roku 2011 patří mezi polské Historické památky (Pomnik historii).',
      pl: 'Nikiszowiec w Katowicach powstawał od 1908 r. dla górników spółki Giesche: bloki z czerwonej cegły wokół podwórek, z własnym kościołem. Od 2011 r. jest Pomnikiem Historii.',
    },
  },
  {
    id: 'prezydent',
    photo: 'prezydent',
    source: 'https://zabytkitechniki.pl/en-US/Poi/Pokaz/1689/57/president-shaft',
    text: {
      en: 'The Prezydent shaft headframe in Chorzów, built in 1933, is a 42-metre reinforced-concrete tower, one of the most modern in Europe at the time. Coal was mined there until 1993.',
      cs: 'Těžní věž jámy Prezydent v Chořově z roku 1933 je 42 metrů vysoká železobetonová stavba, ve své době jedna z nejmodernějších v Evropě. Uhlí se tu těžilo do roku 1993.',
      pl: 'Wieża wyciągowa szybu Prezydent w Chorzowie z 1933 r. to żelbetowa budowla o wysokości 42 m, w swoim czasie jedna z najnowocześniejszych w Europie. Węgiel wydobywano tu do 1993 r.',
    },
  },
  {
    id: 'adit',
    highlight: { en: '14 km', cs: '14 km', pl: '14 km' },
    source: 'https://www.showcaves.com/english/pl/mines/LouiseAdit.html',
    text: {
      en: 'Under Zabrze and Chorzów runs a drainage adit over 14 km long, dug between 1799 and 1863, the longest in European coal mining. Today you can ride a boat through part of it at the Queen Louise Adit in Zabrze.',
      cs: 'Pod Zabrzem a Chořovem vede přes 14 km dlouhá odvodňovací štola, ražená v letech 1799–1863, nejdelší v evropském uhelném hornictví. Část z ní dnes můžete projet lodí ve štole Královna Luisa v Zabrze.',
      pl: 'Pod Zabrzem i Chorzowem biegnie ponad 14-kilometrowa sztolnia odwadniająca, drążona w latach 1799–1863, najdłuższa w europejskim górnictwie węglowym. Dziś jej część można przepłynąć łodzią w Sztolni Królowa Luiza w Zabrzu.',
    },
  },
  {
    id: 'tarnowskie',
    highlight: { en: 'UNESCO', cs: 'UNESCO', pl: 'UNESCO' },
    source: 'https://whc.unesco.org/en/list/1539/',
    text: {
      en: 'The historic lead-silver-zinc mine in Tarnowskie Góry and its underground water system have been on the UNESCO World Heritage List since 2017.',
      cs: 'Historický důl na olovo, stříbro a zinek v Tarnowských Horách a jeho podzemní vodní systém jsou od roku 2017 na Seznamu světového dědictví UNESCO.',
      pl: 'Zabytkowa kopalnia rud ołowiu, srebra i cynku w Tarnowskich Górach wraz z podziemnym systemem gospodarowania wodą jest od 2017 r. na Liście światowego dziedzictwa UNESCO.',
    },
  },
  {
    id: 'carbide',
    photo: 'carbide',
    source: 'https://en.wikipedia.org/wiki/Carbide_lamp',
    text: {
      en: 'Carbide lamps made light from acetylene gas: water dripped onto calcium carbide. An open flame is dangerous in gassy coal mines, so miners there used enclosed safety lamps until electric cap lamps took over.',
      cs: 'Karbidové lampy svítily acetylenem: na karbid vápníku kapala voda. V uhelných dolech, kde se uvolňuje metan, je ale otevřený plamen nebezpečný, a tak se v nich používaly uzavřené bezpečnostní kahany, dokud je nenahradily elektrické svítilny na přilbě.',
      pl: 'Lampy karbidowe świeciły acetylenem: na karbid wapnia kapała woda. Otwarty płomień jest niebezpieczny w gazowych kopalniach węgla, dlatego używano tam zamkniętych lamp bezpieczeństwa, aż zastąpiły je elektryczne lampy nahełmne.',
    },
  },
]
