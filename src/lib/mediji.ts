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
   obstajajo. Polje "opomba" je interno in se na stran nikoli ne izpiše. */
const KREDIT_OZNAKE: [keyof Krediti, string][] = [
  ['kamera', 'Kamera'],
  ['avdio', 'Avdio'],
  ['montaza', 'Montaža'],
  ['posnetek', 'Posnetek'],
  ['kanal', 'Kanal'],
];

export function kreditiVrstica(krediti: Krediti): string | null {
  const deli = KREDIT_OZNAKE.filter(([klic]) => krediti[klic]).map(
    ([klic, oznaka]) => `${oznaka}: ${krediti[klic]}`,
  );
  return deli.length > 0 ? deli.join(' · ') : null;
}

export function slicicaZa(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/* uploadDate zahteva datum, podatki pa hranijo samo leto — zato 1. januar
   tega leta. To ni dejanski datum objave posnetka, ampak najboljši približek
   iz razpoložljivega vira. */
export function videoObject(m: Medij) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: m.naslov,
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
