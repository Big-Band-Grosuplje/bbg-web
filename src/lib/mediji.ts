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

export function slicicaZa(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/* uploadDate zahteva datum, podatki pa hranijo samo leto — zato 1. januar
   tega leta. To ni dejanski datum objave posnetka, ampak najboljši približek
   iz razpoložljivega vira. */
export function videoObject(m: Medij, jezik: 'sl' | 'en' = 'sl') {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: medijV(m, jezik).naslov,
    uploadDate: `${m.leto}-01-01`,
    thumbnailUrl: slicicaZa(m.id),
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
