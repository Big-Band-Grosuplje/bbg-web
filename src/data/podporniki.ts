// src/data/podporniki.ts
//
// Centralni register podpornikov, sofinancerjev in partnerjev KD Big Band Grosuplje.
// Logotipi so v /public/podporniki/. Ob dodajanju NOVEGA logotipa preveri:
//   1. imamo pisno dovoljenje za objavo,
//   2. upoštevamo CGP dajalca (barve, varovalni prostor, prepoved popačenja),
//   3. datoteka je vektorska (SVG) ali vsaj 480 px visoka s prosojnim ozadjem.
// Podrobnosti o izvoru posamezne datoteke: docs/PODPORNIKI.md

export type Raven =
  | 'sofinancer'    // javna sredstva (občina, JSKD, ministrstvo, veleposlaništvo)
  | 'sponzor'       // gospodarski sponzor
  | 'donator'       // donacija, dotacija, 1 % dohodnine
  | 'partner'       // vsebinski ali organizacijski partner
  | 'medijski'      // medijski pokrovitelj
  | 'soorganizator' // dogodek pripravlja z nami, ne le podpira
  | 'gostitelj';    // prispeva prostor

/**
 * Kako logotip prikažemo na temni podlagi:
 *  - 'belo'    → uporabi ločeno belo (knockout) različico iz `logoTemno`
 *  - 'podlaga' → logotip ostane nespremenjen, komponenta pod njega postavi
 *                belo zaobljeno ploskev (edina CGP-skladna rešitev za
 *                večbarvne logotipe s črno tipografijo)
 *  - 'brez'    → logotip je berljiv na obeh podlagah, nič posebnega
 */
export type TemnaStrategija = 'belo' | 'podlaga' | 'brez';

export interface Podpornik {
  /** Uradno ime, kot ga zahteva dajalec; uporabi se tudi kot alt besedilo. */
  ime: string;
  /** Angleško ime, če se uradno razlikuje. */
  imeEn?: string;
  /** Če izpustiš, se logotip izriše brez povezave. */
  url?: string;
  /**
   * Ali `url` res kaže na uradno stran te organizacije.
   * Privzeto true. Nastavi na false, kadar je povezava za bralca koristna,
   * a ni domača stran dajalca (npr. krovni portal). Vidna povezava na
   * logotipu ostane, iz `Organization.url` v JSON-LD pa se izpusti —
   * strukturirani podatki so trditev o identiteti organizacije in jih
   * iskalniki ter jezikovni modeli povzemajo naprej.
   */
  urlJeUradnaStran?: boolean;
  /** Primarna datoteka (pot znotraj /public). */
  logo: string;
  /** Bela knockout različica — samo pri temnaStrategija: 'belo'. */
  logoTemno?: string;
  temnaStrategija: TemnaStrategija;
  /** Optična utež 0.7–1.5: izenači vizualno težo logotipov različnih formatov. */
  utez: number;
  /**
   * Ali smemo logotip objaviti. Privzeto true.
   * false pomeni PRAVNO in ne tehnično oviro: vnos je pripravljen, pisnega
   * dovoljenja dajalca pa še ni. Vpis takega ključa v koncerti.json ali v
   * PODPORNIKI_DRUSTVA ustavi build — brez tega bi šel logotip v objavo
   * tiho, zgolj zato, ker je ključ v registru že obstajal.
   */
  objavaDovoljena?: boolean;
  /** Interna opomba, se ne izpiše. */
  opomba?: string;
}

export const PODPORNIKI = {
  'obcina-grosuplje': {
    ime: 'Občina Grosuplje',
    url: 'https://www.grosuplje.si/',
    logo: '/podporniki/obcina-grosuplje.svg',
    temnaStrategija: 'podlaga',
    utez: 1.4,
    opomba:
      'Vektoriziran iz rastrske predloge. Na voljo tudi sam grb brez napisa: '
      + 'obcina-grosuplje-grb.svg',
  },
  'zkd-grosuplje': {
    ime: 'Zveza kulturnih društev Grosuplje',
    imeEn: 'Cultural Associations Union of Grosuplje',
    url: 'https://www.kultura.si/',
    urlJeUradnaStran: false,
    logo: '/podporniki/zkd-grosuplje.svg',
    logoTemno: '/podporniki/zkd-grosuplje-belo.svg',
    temnaStrategija: 'belo',
    utez: 1.45,
    opomba:
      'kultura.si je krovni portal ljubiteljske kulture, ne stran ZKD Grosuplje. '
      + 'Za bralca, ki klikne logotip, je povezava kljub temu smiselna, zato '
      + 'ostaja; v Organization.url pa ne gre, ker bi tam trdila, da je to '
      + 'domača stran ZKD Grosuplje — od tod jo poberejo iskalniki in jezikovni '
      + 'modeli. Zato urlJeUradnaStran: false. Ko ZKD dobi svojo stran ali '
      + 'podstran na portalu, jo vpiši sem in zastavico odstrani.',
  },
  'jskd': {
    ime: 'Javni sklad Republike Slovenije za kulturne dejavnosti',
    imeEn: 'Public Fund for Cultural Activities of the Republic of Slovenia',
    url: 'https://www.jskd.si/',
    logo: '/podporniki/jskd.webp',
    temnaStrategija: 'podlaga',
    utez: 1.25,
    opomba:
      'Samo rastrski vir (295 px). Mozaik ni primeren za avtomatsko vektorizacijo — '
      + 'zaprosi JSKD za uradni SVG/EPS.',
  },
  'gs-grosuplje': {
    ime: 'Glasbena šola Grosuplje',
    url: 'https://www.gsg.si/',
    logo: '/podporniki/gs-grosuplje.svg',
    temnaStrategija: 'podlaga',
    utez: 1.1,
  },
  'turizem-grosuplje': {
    ime: 'Turizem Grosuplje',
    url: 'https://visitgrosuplje.si/',
    logo: '/podporniki/turizem-grosuplje.svg',
    temnaStrategija: 'brez',
    utez: 0.7,
    opomba: 'Enobarvni oranžni logotip — berljiv na svetli in temni podlagi.',
  },
  'us-embassy': {
    ime: 'Veleposlaništvo Združenih držav Amerike v Ljubljani',
    imeEn: 'U.S. Embassy Ljubljana',
    url: 'https://si.usembassy.gov/',
    logo: '/podporniki/us-embassy.webp',
    objavaDovoljena: false,
    temnaStrategija: 'podlaga',
    utez: 1.3,
    opomba:
      'NE OBJAVLJAJ brez izrecnega pisnega dovoljenja veleposlaništva. Gre za uradni '
      + 'pečat (državni simbol ZDA), ne za prosto uporaben logotip. Pri grant projektih '
      + 'veleposlaništvo praviloma predpiše besedilno atribucijo in pošlje svoj brand asset. '
      + 'Za The Goodwin Legacy velja: šele po odobritvi granta in podpisu pogodbe. '
      + 'Datoteka us-embassy.webp namenoma ni v repozitoriju, dokler dovoljenja ni.',
  },
} as const satisfies Record<string, Podpornik>;

export type KljucPodpornika = keyof typeof PODPORNIKI;

/* Oznake ravni živijo tu in ne v sl.ts/en.ts, ker sta raven in njena oznaka
   ena stvar: raven brez oznake ni izpisljiva. Ob dodajanju ravni je zato
   treba urediti eno datoteko in ne treh. */
export const OZNAKA_RAVNI: Record<Raven, { sl: string; en: string }> = {
  sofinancer: { sl: 'Sofinancer', en: 'Co-funder' },
  sponzor: { sl: 'Sponzor', en: 'Sponsor' },
  donator: { sl: 'Donator', en: 'Donor' },
  partner: { sl: 'Partner', en: 'Partner' },
  medijski: { sl: 'Medijski pokrovitelj', en: 'Media partner' },
  soorganizator: { sl: 'Soorganizator', en: 'Co-organiser' },
  gostitelj: { sl: 'Gostitelj prostora', en: 'Venue host' },
};

/**
 * Katera lastnost schema.org pripada kateri ravni.
 *
 * Preslikava je ena sama konstanta in ne pogojna logika v gradniku JSON-LD:
 * ob novi ravni je treba dopolniti to tabelo in nič drugega.
 *
 *  - funder      → kdor dogodek plača (javna sredstva, donacije)
 *  - sponsor     → kdor ga podpre v zameno za vidnost
 *  - contributor → kdor prispeva vsebino, organizacijo ali prostor, a ga ne
 *                  plača in ni sponzor; to je ZKD in glasbena šola
 *  - organizer   → kdor dogodek pripravlja z nami; POZOR: Event organizatorja
 *                  že ima, zato se soorganizatorji pridružijo in ga ne
 *                  prepišejo (glej musicEvent() v src/lib/koncerti.ts)
 */
export type LastnostJsonLd = 'funder' | 'sponsor' | 'contributor' | 'organizer';

export const PRESLIKAVA_JSONLD: Record<Raven, LastnostJsonLd> = {
  sofinancer: 'funder',
  donator: 'funder',
  sponzor: 'sponsor',
  medijski: 'sponsor',
  partner: 'contributor',
  soorganizator: 'organizer',
  gostitelj: 'contributor',
};

/* Znane ravni so izpeljane iz tabele oznak — tretjega seznama, ki bi se lahko
   razšel, ni. Da preslikava v JSON-LD ne zaostane za novo ravnijo, jo
   preverimo ob nalaganju: Record<Raven, …> tega ne ujame, ker Astro prevaja
   z esbuildom in tipov ne preverja. Manjkajoč vnos bi pomenil, da podpornik
   tiho izpade iz strukturiranih podatkov. */
export const RAVNI = Object.keys(OZNAKA_RAVNI) as Raven[];

for (const raven of RAVNI) {
  if (!PRESLIKAVA_JSONLD[raven]) {
    throw new Error(
      `Raven "${raven}" je v OZNAKA_RAVNI, v PRESLIKAVA_JSONLD pa je ni. ` +
        `Dopolni preslikavo v src/data/podporniki.ts, sicer podpornik te ravni ` +
        `izpade iz JSON-LD brez opozorila.`,
    );
  }
}

export interface VnosPodpornika {
  kljuc: KljucPodpornika;
  raven: Raven;
}

/**
 * Stalni podporniki društva — izpisani v nogi in na strani /podporniki/.
 * Ostali (JSKD, Glasbena šola, Turizem, veleposlaništvo) se priključujejo
 * po posameznih projektih in se navajajo pri konkretnem dogodku.
 */
export const PODPORNIKI_DRUSTVA: VnosPodpornika[] = [
  { kljuc: 'obcina-grosuplje', raven: 'sofinancer' },
  { kljuc: 'zkd-grosuplje', raven: 'partner' },
];

/**
 * Preveri seznam vnosov in ob napaki ustavi build.
 *
 * Trije razlogi za napako: neznan ključ, neznana raven in podpornik brez
 * dovoljenja za objavo. Vse tri so lastnosti registra, zato preverba živi
 * tu in ne pri posameznem odjemalcu — vsak nov vir vnosov (kak prihodnji
 * zid logotipov) naj pokliče prav to funkcijo in si je ne piše na novo.
 *
 * `vir` pove, kje je sporni vpis; brez tega je sporočilo pri več virih
 * neuporabno.
 */
/**
 * Opozori, kadar naslov, namenjen `Organization.url`, kaže globlje od domače
 * strani.
 *
 * `Organization.url` je naslov ORGANIZACIJE, ne strani o dogodku. Pot kot
 * /dogodki/koncert-… je skoraj vedno napaka pri prepisovanju — enkrat se je
 * že zgodila pri Turizmu Grosuplje.
 *
 * Opozorilo in ne napaka: domača stran organizacije včasih res živi globlje
 * (oddelek na občinskem portalu, podstran krovne zveze). Takega vpisa ne
 * smemo onemogočiti, opaziti pa ga je treba. Kadar globoka pot pripada
 * napačni organizaciji, obstaja `urlJeUradnaStran: false` — tak vnos v
 * JSON-LD sploh ne pride in ga tu ne pregledujemo.
 */
export function opozoriNaGloboko(url: string | null | undefined, kdo: string, vir: string): void {
  if (!url) return;
  let pot: string;
  try {
    pot = new URL(url).pathname;
  } catch {
    console.warn(`[podporniki] Neveljaven URL (${vir}, ${kdo}): "${url}".`);
    return;
  }
  if (pot === '/' || pot === '') return;
  console.warn(
    `[podporniki] Organization.url za "${kdo}" (${vir}) kaže globlje od domače ` +
      `strani: "${url}". Organization.url je naslov organizacije, ne strani o ` +
      `dogodku — preveri, ali ne gre za povezavo, ki sodi med objave. Če je ` +
      `globoka pot res domača stran te organizacije, opozorilo prezri.`,
  );
}

export function preveriVnosePodpornikov(
  vnosi: readonly { kljuc: string; raven?: Raven }[],
  vir: string,
): void {
  for (const v of vnosi) {
    if (!(v.kljuc in PODPORNIKI)) {
      throw new Error(
        `Neznan ključ podpornika (${vir}): "${v.kljuc}". ` +
          `Znani ključi: ${Object.keys(PODPORNIKI).join(', ')}`,
      );
    }
    if (v.raven !== undefined && !RAVNI.includes(v.raven)) {
      throw new Error(
        `Neznana raven podpornika (${vir}, podpornik "${v.kljuc}"): "${v.raven}". ` +
          `Znane ravni: ${RAVNI.join(', ')}`,
      );
    }
    /* Ključ v registru še ne pomeni dovoljenja za objavo. Vnos brez
       dovoljenja ustavi build in ne konča kot logotip na strani in kot
       navedba v strukturiranih podatkih — oboje je javna objava. */
    const p = (PODPORNIKI as Record<string, Podpornik>)[v.kljuc];
    if (p.objavaDovoljena === false) {
      throw new Error(
        `Podpornik "${v.kljuc}" (${p.ime}) nima dovoljenja za objavo, vpisan pa je v ` +
          `${vir}. V registru ima objavaDovoljena: false — to ni tehnična ovira, ` +
          `ampak pravna: pisnega dovoljenja dajalca še nimamo.\n` +
          `Kaj narediti: pridobi pisno dovoljenje dajalca, shrani dogovorjeno ` +
          `datoteko logotipa v public/podporniki/ in šele nato odstrani zastavico ` +
          `objavaDovoljena iz src/data/podporniki.ts. Do takrat vpis odstrani; ` +
          `kadar dajalec namesto logotipa predpiše besedilno atribucijo, gre ta ` +
          `v opis dogodka in ne v zid logotipov.` +
          (p.opomba ? `\nOpomba iz registra: ${p.opomba}` : ''),
      );
    }
    /* Samo vnosi, ki v JSON-LD res pridejo: pri urlJeUradnaStran: false se
       url izpusti in globoka pot ni težava. */
    if (p.urlJeUradnaStran !== false) {
      opozoriNaGloboko(p.url, p.ime, `register, vpisan v ${vir}`);
    }
  }
}

/* Stalni podporniki društva se izrišejo v nogi, torej na vsaki strani.
   Preverba stoji tu in ne pri odjemalcu: je invarianta registra in mora
   steči ob vsakem uvozu tega modula, ne šele takrat, ko kaka stran uvozi
   src/lib/koncerti.ts. */
preveriVnosePodpornikov(PODPORNIKI_DRUSTVA, 'PODPORNIKI_DRUSTVA v src/data/podporniki.ts');

/** Razreši ključ v celoten zapis; vrne null in opozori, če ključa ni. */
export function resiPodpornika(kljuc: string): Podpornik | null {
  const p = (PODPORNIKI as Record<string, Podpornik>)[kljuc];
  if (!p) {
    console.warn(`[podporniki] Neznan ključ: "${kljuc}" — logotip je izpuščen.`);
    return null;
  }
  return p;
}

/** Ime v izbranem jeziku. */
export function imePodpornika(p: Podpornik, jezik: 'sl' | 'en'): string {
  return jezik === 'en' ? (p.imeEn ?? p.ime) : p.ime;
}
