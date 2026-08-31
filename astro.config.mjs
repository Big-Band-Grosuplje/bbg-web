// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bigband-grosuplje.com',
  integrations: [
    /* Ustvari sitemap-index.xml in sitemap-0.xml. Na kazalo se sklicuje
       vrstica Sitemap v public/robots.txt — ob spremembi popravi oboje.
       lastmod namenoma ne nastavljamo: vsak build bi vsem stranem pripisal
       trenutni čas in trdil spremembo, ki se ni zgodila. */
    sitemap(),
  ],
});
