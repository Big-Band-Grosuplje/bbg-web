/* ============================================================
   Dvojezičnost — slovenščina privzeto, angleščina pod /en/.

   Ena sama tabela POTI je vir resnice za preslikavo poti med jezikoma.
   Iz nje živijo navigacija, hreflang v <head>, gumb za preklop jezika in
   samodejna preusmeritev ob prvem obisku. Če se poti razidejo, se razide
   vse troje hkrati — zato jih ne podvajaj drugje.
   ============================================================ */

import { sl, type Slovar } from './sl';
import { en } from './en';
import potiData from './poti.json';

export type Jezik = 'sl' | 'en';

export const PRIVZETI_JEZIK: Jezik = 'sl';
export const JEZIKI: Jezik[] = ['sl', 'en'];

const SLOVARJI = { sl, en } as const;

/* `satisfies Slovar` v en.ts opozori v urejevalniku, BUILDA pa ne ustavi:
   Astro prevaja z esbuildom, ki tipe samo odstrani in jih ne preverja
   (preverjeno tako, da smo ključ začasno odstranili — build je šel skozi).
   Zato isto preverimo še ob izvajanju. Ta modul se naloži pri izrisu vsake
   strani, torej med buildom: neujemanje ključev takoj ustavi build. */
function kljuciPoti(vrednost: unknown, predpona = ''): string[] {
  if (typeof vrednost !== 'object' || vrednost === null) return [predpona];
  return Object.entries(vrednost).flatMap(([k, v]) =>
    kljuciPoti(v, predpona ? `${predpona}.${k}` : k),
  );
}

{
  const vSl = new Set(kljuciPoti(sl));
  const vEn = new Set(kljuciPoti(en));
  const manjka = [...vSl].filter((k) => !vEn.has(k));
  const odvec = [...vEn].filter((k) => !vSl.has(k));
  if (manjka.length || odvec.length) {
    throw new Error(
      'Slovarja sl in en se ne ujemata.' +
        (manjka.length ? ` V en.ts manjka: ${manjka.join(', ')}.` : '') +
        (odvec.length ? ` V en.ts je odveč: ${odvec.join(', ')}.` : ''),
    );
  }
}

export function slovar(jezik: Jezik): Slovar {
  return SLOVARJI[jezik];
}

/* Ključ strani → pot po jezikih. Poti se končajo s poševnico, ker Astro
   statične strani gradi kot mapo z index.html.
   Tabela živi v poti.json, ker jo poleg te datoteke bere tudi
   astro.config.mjs za alternate zapise v sitemapu — konfiguracija Astra
   TypeScripta ne uvozi. */
export type Stran = keyof typeof potiData.poti;

export const POTI = potiData.poti as Record<Stran, Record<Jezik, string>>;

export function pot(stran: Stran, jezik: Jezik): string {
  return POTI[stran][jezik];
}

/* Sidra na naslovnici: znotraj naslovnice ostanejo relativna, drugod
   pokažejo na naslovnico ustreznega jezika. */
export function sidro(stran: Stran, jezik: Jezik, ime: string): string {
  return stran === 'naslovnica' ? `#${ime}` : `${pot('naslovnica', jezik)}#${ime}`;
}

/* Par poti za hreflang in za gumb za preklop jezika. */
export function razlicice(stran: Stran): { jezik: Jezik; pot: string }[] {
  return JEZIKI.map((jezik) => ({ jezik, pot: POTI[stran][jezik] }));
}

export function drugiJezik(jezik: Jezik): Jezik {
  return jezik === 'sl' ? 'en' : 'sl';
}

/* Tabela za inline skripto v <head>, ki ob prvem obisku preusmeri
   angleško govorečega obiskovalca. Skripta teče pred izrisom in nima
   dostopa do modulov, zato ji tabelo vrinemo kot JSON. */
export function preslikavaZaSkripto(): Record<string, string> {
  const zemljevid: Record<string, string> = {};
  for (const stran of Object.keys(POTI) as Stran[]) {
    zemljevid[POTI[stran].sl] = POTI[stran].en;
  }
  return zemljevid;
}
