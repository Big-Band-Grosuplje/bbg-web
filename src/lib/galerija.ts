import type { ImageMetadata } from 'astro';
import galerijaData from '../data/galerija.json';

export type Fotografija = {
  datoteka: string;
  podnapis: string;
  podnapisEn?: string;
  /* Nadomestno besedilo je ločeno od podnapisa: podnapis pove, kaj je
     dogodek, alt pa kaj je NA sliki. Bralcu zaslonskega bralnika je
     podnapis prebran tako ali tako (figcaption), zato bi ga isti niz v
     altu ponovil. Kjer alt ni vpisan, koda pade nazaj na podnapis —
     bolje podnapis kot prazen alt. */
  alt?: string;
  altEn?: string;
  /* Izbrana za izpis pri eri na /zgodovina. Galerija prikaže vse. */
  poudarek?: boolean;
  /* Avtor fotografije. Imena avtorjev so v obeh jezikih enaka, zato
     angleške različice ni. Kjer polja ni, izris pokaže arhiv društva —
     privzeta vrednost je v slovarju (galerijaStran.avtorPrivzeto), da
     ni zapisana v vsakem vnosu. */
  avtor?: string;
  leto: number | null;
  mesec: string | null;
  priblizno?: boolean;
};

/* Fotografije naložimo prek glob, da jih ni treba uvažati po eni.
   Pot je relativna na to datoteko. */
const datoteke = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/foto/**/*.jpg',
  { eager: true },
);

export function slikaZa(datoteka: string): ImageMetadata {
  const kljuc = Object.keys(datoteke).find((pot) => pot.endsWith('/' + datoteka));
  if (!kljuc) {
    throw new Error(
      `Fotografija "${datoteka}" iz src/data/galerija.json ne obstaja v src/assets/foto.`,
    );
  }
  return datoteke[kljuc].default;
}

/* Razvrstitev od najnovejše: leto padajoče, znotraj leta mesec padajoče.
   Fotografije brez potrjene letnice gredo na konec (leto: null). */
export function razvrsceno(): Fotografija[] {
  const seznam = galerijaData.fotografije as Fotografija[];
  return [...seznam].sort((a, b) => {
    if (a.leto === null && b.leto === null) return 0;
    if (a.leto === null) return 1;
    if (b.leto === null) return -1;
    if (a.leto !== b.leto) return b.leto - a.leto;
    /* Mesec razvršča samo, kadar je znan pri obeh. Kadar ga ima le ena
       fotografija, obvelja vrstni red iz galerija.json — ta je uredniški
       in ga ni mogoče izraziti z meseci, ki jih za vse slike ni.
       Prej je vsaka fotografija z mesecem prehitela vse brez njega; to je
       vplivalo samo na leto 2026, edino leto z mešanim zapisom (druga
       leta imajo mesec pri vseh ali pri nobeni sliki). */
    if (a.mesec && b.mesec) return b.mesec.localeCompare(a.mesec);
    return 0;
  });
}

/* Skupine za vmesne naslove na /galerija. Nepotrjene letnice dobijo
   svojo skupino na koncu. Naslov te skupine je edini prevedljiv niz tu,
   zato pride od zunaj — knjižnica slovarja ne pozna. */
export function poLetih(oznakaBrezLetnice: string): { naslov: string; fotografije: Fotografija[] }[] {
  const skupine = new Map<string, Fotografija[]>();
  for (const foto of razvrsceno()) {
    const naslov = foto.leto === null ? oznakaBrezLetnice : String(foto.leto);
    const obstoj = skupine.get(naslov);
    if (obstoj) obstoj.push(foto);
    else skupine.set(naslov, [foto]);
  }
  return [...skupine.entries()].map(([naslov, fotografije]) => ({ naslov, fotografije }));
}

/* Podnapis v izbranem jeziku. Če angleškega ni, pade nazaj na slovenskega —
   bolje podnapis v napačnem jeziku kot prazen alt. */
export function podnapisZa(foto: Fotografija, jezik: 'sl' | 'en'): string {
  return jezik === 'en' ? (foto.podnapisEn ?? foto.podnapis) : foto.podnapis;
}

/* Avtor fotografije; brez vpisanega polja obvelja privzeta vrednost, ki
   jo poda klicatelj iz slovarja. */
export function avtorZa(foto: Fotografija, privzeti: string): string {
  return foto.avtor ?? privzeti;
}

/* Nadomestno besedilo v izbranem jeziku, z zaporednim padcem nazaj:
   altEn → alt → podnapisEn → podnapis. */
export function altZa(foto: Fotografija, jezik: 'sl' | 'en'): string {
  if (jezik === 'en') return foto.altEn ?? foto.alt ?? podnapisZa(foto, 'en');
  return foto.alt ?? foto.podnapis;
}

/* Prvih n najnovejših — za izsek na naslovnici. */
export function najnovejse(n: number): Fotografija[] {
  return razvrsceno().slice(0, n);
}

/* ============================================================
   Fotografije po erah dirigentov na /zgodovina.

   Prej je vsaka era nosila statičen seznam imen datotek v zgodovina.json.
   Ta seznam je nastal, ko fotografije še niso imele potrjenih letnic, in
   se po datiranju ni popravil sam: Lundrove slike (2004, 2005, 2006) so
   ostale pod Doblekarjem, blejski koncert 2010 pa pod Javornikom. Zato je
   dodelitev zdaj IZPELJANA iz podatkov same fotografije — seznama, ki bi
   se lahko razšel z letnico, ni več.

   Vrstni red pravil:
   1. Če je v slovenskem napisu imenovan eden od erinih dirigentov, odloči
      ta — ne glede na leto. Tako pripade koncert v atriju NUK 2022, kjer
      je dirigiral Kotar, njegovi drugi eri, čeprav je 2022 Javornikovo
      leto. Kotar vodi dve eri, zato pri njem izbere še leto.
   2. Sicer odloči leto. Meji 2019 in 2023 sta deljeni; brez imenovanega
      dirigenta pripade slika eri, ki se v tem letu KONČUJE.
   Napis beremo slovenski, ker je izhodiščni — dodelitev mora biti v obeh
   jezikih enaka.
   ============================================================ */
export type EraId =
  | 'ustanovitev'
  | 'doblekar'
  | 'lunder'
  | 'kotar-prvo'
  | 'javornik'
  | 'kotar-drugo';

/* Vzorci so na koren imena, ne na celo ime: slovenska sklanjatev pri
   Lundru izpusti e ("z dirigentom Igorjem Lundrom"), zato iskanje po
   "Lunder" tega zapisa ne bi našlo. */
const DIRIGENTI: { vzorec: RegExp; era: (leto: number) => EraId }[] = [
  { vzorec: /Doblekar/, era: () => 'doblekar' },
  { vzorec: /Lundr|Lunder/, era: () => 'lunder' },
  { vzorec: /Javornik/, era: () => 'javornik' },
  { vzorec: /Kotar/, era: (leto) => (leto <= 2019 ? 'kotar-prvo' : 'kotar-drugo') },
];

function eraPoLetu(leto: number): EraId {
  if (leto <= 1998) return 'ustanovitev';
  if (leto <= 2003) return 'doblekar';
  if (leto <= 2011) return 'lunder';
  if (leto <= 2019) return 'kotar-prvo';
  if (leto <= 2023) return 'javornik';
  return 'kotar-drugo';
}

export function eraFotografije(foto: Fotografija): EraId | null {
  if (foto.leto === null) return null;
  const zadetki = DIRIGENTI.filter((d) => d.vzorec.test(foto.podnapis));
  /* Dva imenovana dirigenta na isti fotografiji sta dvoumna; takrat naj
     odloči leto, da izbira ni odvisna od vrstnega reda v seznamu. */
  if (zadetki.length === 1) return zadetki[0].era(foto.leto);
  return eraPoLetu(foto.leto);
}

/* Fotografije ere za izpis na /zgodovina: največ tri, izbrane po polju
   poudarek. Kadar poudarkov ni, gredo prve tri po letu — galerija ostane
   popolna, omejena je samo ta stran. */
export function fotografijeEre(era: EraId, najvec = 3): Fotografija[] {
  const vse = razvrsceno().filter((f) => eraFotografije(f) === era);
  const poudarjene = vse.filter((f) => f.poudarek);
  return (poudarjene.length > 0 ? poudarjene : vse).slice(0, najvec);
}
