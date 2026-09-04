import type { ImageMetadata } from 'astro';
import medijiData from '../data/mediji.json';

export type Krediti = {
  kamera?: string;
  avdio?: string;
  montaza?: string;
  posnetek?: string;
  kanal?: string;
};

export type Medij = {
  id: string;
  naslov: string;
  naslovEn?: string;
  zasedbaEn?: string;
  dogodekEn?: string;
  solistiEn?: string[];
  avtor_glasbe?: string;
  zasedba: string;
  solisti: string[];
  dogodek: string;
  leto: number;
  krediti: Krediti;
  objavi: boolean;
  opomba?: string;
};

/* Vrstni red kreditov je fiksen; izpišejo se samo tisti, ki v podatkih
   obstajajo. Polje "opomba" je interno in se na stran nikoli ne izpiše.
   Oznake pridejo iz slovarja, imena avtorjev so skupna obema jezikoma. */
const KREDIT_ZAPOREDJE: (keyof Krediti)[] = ['kamera', 'avdio', 'montaza', 'posnetek', 'kanal'];

export function kreditiVrstica(
  krediti: Krediti,
  oznake: Record<keyof Krediti, string>,
): string | null {
  const deli = KREDIT_ZAPOREDJE.filter((klic) => krediti[klic]).map(
    (klic) => `${oznake[klic]}: ${krediti[klic]}`,
  );
  return deli.length > 0 ? deli.join(' · ') : null;
}

/* Besedilna polja v izbranem jeziku; brez angleške različice pade nazaj
   na slovensko. */
export function medijV(m: Medij, jezik: 'sl' | 'en') {
  if (jezik !== 'en') return { naslov: m.naslov, zasedba: m.zasedba, dogodek: m.dogodek, solisti: m.solisti };
  return {
    naslov: m.naslovEn ?? m.naslov,
    zasedba: m.zasedbaEn ?? m.zasedba,
    dogodek: m.dogodekEn ?? m.dogodek,
    solisti: m.solistiEn ?? m.solisti,
  };
}

/* Sličice so samo-gostovane v src/assets/mediji-thumbs. Prej so bile
   vezane na i.ytimg.com in je Google dobil IP obiskovalca že ob nalaganju
   strani, brez klika na posnetek. Prenese jih `npm run slicice`; build jih
   namenoma ne prenaša sam, da produkcijski build ne kliče YouTuba.
   Pot je relativna na to datoteko — isti vzorec kot v galerija.ts. */
const slicice = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/mediji-thumbs/*.jpg',
  { eager: true },
);

export function slicicaZa(id: string): ImageMetadata {
  const kljuc = Object.keys(slicice).find((pot) => pot.endsWith(`/${id}.jpg`));
  if (!kljuc) {
    throw new Error(
      `Sličice za posnetek "${id}" ni v src/assets/mediji-thumbs. ` +
        'Zaženi "npm run slicice". Build sličic ne prenaša sam, da ' +
        'produkcijski build ne kliče YouTuba.',
    );
  }
  return slicice[kljuc].default;
}

/* hqdefault je 480×360 (4:3) s črnima pasovoma zgoraj in spodaj,
   maxresdefault pa 16:9 brez njiju. Katera je na disku, ugotovimo iz
   razmerja stranic in ne iz zapisa v podatkih: dva vira bi se lahko
   razšla, datoteka pa je edino stanje, ki šteje. */
export function slicicaImaPasove(slika: ImageMetadata): boolean {
  return slika.width / slika.height < 1.5;
}

/* uploadDate zahteva datum, podatki pa hranijo samo leto — zato 1. januar
   tega leta. To ni dejanski datum objave posnetka, ampak najboljši približek
   iz razpoložljivega vira. */
/* thumbnailUrl mora biti absoluten naslov obdelane sličice na naši
   domeni, zato ga poda klicatelj: pot izdelka pozna šele astro:assets
   (getImage) v komponenti, knjižnica pa ne. */
export function videoObject(m: Medij, jezik: 'sl' | 'en', thumbnailUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: medijV(m, jezik).naslov,
    uploadDate: `${m.leto}-01-01`,
    thumbnailUrl,
    embedUrl: `https://www.youtube.com/embed/${m.id}`,
  };
}

/* Objavljeni posnetki, od najnovejšega. Znotraj istega leta ostane
   vrstni red iz mediji.json. */
export function razvrsceno(): Medij[] {
  return (medijiData as Medij[])
    .filter((m) => m.objavi)
    .sort((a, b) => b.leto - a.leto);
}

export function najnovejsi(n: number): Medij[] {
  return razvrsceno().slice(0, n);
}
