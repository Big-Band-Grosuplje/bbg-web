// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/* Ista tabela poti kot v src/i18n — brana iz JSON, ker konfiguracija Astra
   ne uvozi TypeScripta. Iz nje sestavimo alternate zapise za sitemap. */
const { poti } = JSON.parse(readFileSync('./src/i18n/poti.json', 'utf8'));
const JEZIK_OZNAKA = { sl: 'sl-SI', en: 'en-US' };

/* Pot → par jezikovnih različic. Vgrajeni i18n sitemapa zna spariti samo
   poti, ki se po predponi jezika ujemajo (/x in /en/x); naši slugi so
   prevedeni (zgodovina ↔ history), zato pare sestavimo sami. */
const PARI = new Map();
function dodajPar(razlicice) {
  const povezave = Object.entries(razlicice).map(([jezik, pot]) => ({
    lang: JEZIK_OZNAKA[jezik],
    url: pot,
  }));
  for (const pot of Object.values(razlicice)) PARI.set(pot, povezave);
}
for (const razlicice of Object.values(poti)) dodajPar(razlicice);

/* Podstrani dogodkov nastanejo iz podatkov, zato jih v poti.json ni.
   Pare zgradimo iz istega vira, ki ga uporabljajo strani — slug in slugEn
   sta v koncerti.json. */
const { koncerti } = JSON.parse(readFileSync('./src/data/koncerti.json', 'utf8'));
for (const k of koncerti) {
  dodajPar({ sl: `/dogodki/${k.slug}/`, en: `/en/events/${k.slugEn}/` });
}

/* Zaprti dogodki iz sitemapa izpadejo — v iskalnik ne sodijo, saj nanje
   ni mogoče priti. Podstran vseeno nastane in ostane dosegljiva po
   neposredni povezavi iz vabila, nosi pa <meta name="robots"
   content="noindex"> (glej Layout.astro). Sitemap sam indeksiranja ne
   prepove, zato oznaka ni odveč: brez nje bi zunanja povezava zadostovala
   za uvrstitev v indeks.
   Pare v PARI puščamo tudi za te poti — nikoli se ne izpišejo, ker jih
   filter zavrne, hreflang na sami strani pa ostane. */
const ZAPRTI = new Set();
for (const k of koncerti) {
  if (k.vstop?.tip === 'zaprt') {
    ZAPRTI.add(`/dogodki/${k.slug}/`);
    ZAPRTI.add(`/en/events/${k.slugEn}/`);
  }
}

export default defineConfig({
  site: 'https://bigband-grosuplje.com',

  /* Slovenščina je privzeta in ostane brez predpone, angleščina živi pod
     /en/. Preslikava poti (zgodovina → history ipd.) je v src/i18n/index.ts;
     tu nastavimo samo jezike, da Astro pozna Astro.currentLocale in da
     sitemap zna povezati različici. */
  i18n: {
    defaultLocale: 'sl',
    locales: ['sl', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    /* Ustvari sitemap-index.xml in sitemap-0.xml. Na kazalo se sklicuje
       vrstica Sitemap v public/robots.txt — ob spremembi popravi obe.
       lastmod namenoma ne nastavljamo: vsak build bi vsem stranem pripisal
       trenutni čas in trdil spremembo, ki se ni zgodila.
       serialize vsakemu zapisu doda xhtml:link alternate za drugi jezik.
       Vgrajene možnosti i18n ne uporabljamo, ker zna pariti samo enake
       slugove; naši so prevedeni. */
    sitemap({
      filter: (stran) => !ZAPRTI.has(new URL(stran).pathname),
      serialize(zapis) {
        const pot = new URL(zapis.url).pathname;
        const povezave = PARI.get(pot);
        if (povezave) {
          zapis.links = povezave.map((p) => ({
            lang: p.lang,
            url: new URL(p.url, zapis.url).href,
          }));
        }
        return zapis;
      },
    }),
  ],
});
