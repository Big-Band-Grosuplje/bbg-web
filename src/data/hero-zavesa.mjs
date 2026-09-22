/* ============================================================
   Zavesa čez hero fotografijo — edini vir vrednosti.

   Bereta jo dve strani:
     src/components/Hero.astro   — iz postaj sestavi CSS preliv
     scripts/kontrast-hero.mjs   — z istimi postajami izmeri kontrast

   Podvojitev bi pomenila, da lahko preliv na strani in preliv v meritvi
   razideta, meritev pa bi še naprej poročala, da je vse v redu.

   ⚠️ Zakaj .mjs in ne .ts kot ostalo v src/data/: datoteko mora brati tudi
   navadna skripta, ki teče zunaj Astrovega builda (in v GitHub Actions).
   Node zna luščiti tipe iz .ts, a je to še eksperimentalno; .mjs nima te
   odvisnosti in se enako uvozi iz Astra kot iz node.
   ============================================================ */

/** Barva zavese. Ista kot --bbg-black smeri A (#181512). */
export const ZAVESA_BARVA = [24, 21, 18];

/**
 * Postaje navpičnega preliva: odstotek višine → motnost.
 *
 * Štiri in ne tri: sredina je namenoma skoraj čista, ker enakomerno močna
 * zavesa najtemnejšo fotografijo v mapi zadavi v črnino. Temna je samo
 * spodnja četrtina, kjer besedilo res stoji.
 */
export const ZAVESA_POSTAJE = [
  { odstotek: 0, alfa: 0.45 },
  { odstotek: 38, alfa: 0.08 },
  { odstotek: 68, alfa: 0.6 },
  { odstotek: 100, alfa: 0.94 },
];

/** Vrednost za CSS `background-image`. */
export function prelivCss() {
  const [r, g, b] = ZAVESA_BARVA;
  const postaje = ZAVESA_POSTAJE.map(
    (p) => `rgba(${r}, ${g}, ${b}, ${p.alfa}) ${p.odstotek}%`,
  ).join(', ');
  return `linear-gradient(180deg, ${postaje})`;
}

/** Motnost zavese na dani relativni višini (0–1). */
export function alfaNaVisini(t) {
  const odstotek = t * 100;
  for (let i = 1; i < ZAVESA_POSTAJE.length; i++) {
    const a = ZAVESA_POSTAJE[i - 1];
    const b = ZAVESA_POSTAJE[i];
    if (odstotek <= b.odstotek) {
      const delez = (odstotek - a.odstotek) / (b.odstotek - a.odstotek);
      return a.alfa + (b.alfa - a.alfa) * delez;
    }
  }
  return ZAVESA_POSTAJE[ZAVESA_POSTAJE.length - 1].alfa;
}

/**
 * Pas, v katerem stoji vsebina heroja: spodnja polovica, cela širina.
 *
 * Cela širina namenoma: vodoravni položaj besedila je odvisen od širine
 * zaslona (stolpec .ovoj je največ 1180 px in sredinski), zato meritev ne
 * sme domnevati, da besedilo stoji levo.
 */
export const OBMOCJE_BESEDILA = { x0: 0, x1: 1, y0: 0.55, y1: 0.97 };

/**
 * Percentil svetlosti, ki šteje za "najslabši primer".
 * 95. in ne največja vrednost: posamezna svetla pika (odsev, lučka) ne sme
 * odločati o celotni zavesi, širši svetel predel pa mora.
 */
export const PERCENTIL = 0.95;

/**
 * Kaj merimo in kakšen prag velja.
 *
 * `znak` je logotip in ne besedilo, zato zanj velja prag za grafične
 * elemente (3,0) in ne za besedilo (4,5) — WCAG 2.1, 1.4.11.
 */
export const BESEDILA = [
  { kljuc: 'slogan', opis: 'slogan', prag: 4.5 },
  { kljuc: 'znak', opis: 'znak (grafika)', prag: 3.0 },
];

/**
 * Barve po temah.
 *
 * Danes sta obe temi enaki in to ni naključje: vsebina heroja stoji na
 * zavesi in ne na podlagi strani, zato so barve v smeri A prepisane na
 * svetlo zlato v obeh temah (glej .hero__slogan pri [data-skin='a']).
 * Prav zato je tudi zavesa ista v obeh temah.
 *
 * Tabela ostaja razdeljena po temah, da meritev ujame dan, ko bo katera
 * od barv spet postala odvisna od teme.
 */
export const TEME = {
  temna: { slogan: '#E3C765', znak: '#C9A227' },
  svetla: { slogan: '#E3C765', znak: '#C9A227' },
};
