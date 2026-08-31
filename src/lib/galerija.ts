import type { ImageMetadata } from 'astro';
import galerijaData from '../data/galerija.json';

export type Fotografija = {
  datoteka: string;
  podnapis: string;
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
    if (a.mesec && b.mesec) return b.mesec.localeCompare(a.mesec);
    if (a.mesec) return -1;
    if (b.mesec) return 1;
    return 0;
  });
}

/* Skupine za vmesne naslove na /galerija. Nepotrjene letnice dobijo
   svojo skupino na koncu. */
export function poLetih(): { naslov: string; fotografije: Fotografija[] }[] {
  const skupine = new Map<string, Fotografija[]>();
  for (const foto of razvrsceno()) {
    const naslov = foto.leto === null ? 'Leto ni potrjeno' : String(foto.leto);
    const obstoj = skupine.get(naslov);
    if (obstoj) obstoj.push(foto);
    else skupine.set(naslov, [foto]);
  }
  return [...skupine.entries()].map(([naslov, fotografije]) => ({ naslov, fotografije }));
}

/* Prvih n najnovejših — za izsek na naslovnici. */
export function najnovejse(n: number): Fotografija[] {
  return razvrsceno().slice(0, n);
}
