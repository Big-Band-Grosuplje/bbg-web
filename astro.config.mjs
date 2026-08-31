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
for (const razlicice of Object.values(poti)) {
  const povezave = Object.entries(razlicice).map(([jezik, pot]) => ({
    lang: JEZIK_OZNAKA[jezik],
    url: pot,
  }));
  for (const pot of Object.values(razlicice)) PARI.set(pot, povezave);
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
