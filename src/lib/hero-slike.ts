/* ============================================================
   Fotografije hero sekcije.

   Slike živijo v src/assets/hero/ in ne v public/: tako gredo skozi isto
   Astrovo optimizacijo kot vse ostale slike v repozitoriju (glej
   src/lib/galerija.ts). V public/ bi se prenesle v izvirni velikosti in
   izvirnem zapisu.

   VRSTNI RED določa števčna predpona v imenu datoteke (01-, 02-, 03-),
   ne abeceda po naključju in ne vrstni red, v katerem jih vrne glob.
   Prva slika je LCP element naslovnice, zato je to odločitev in ne
   stranski učinek poimenovanja.

   Dodajanje slike: datoteko z novo predpono daj v mapo. Nič drugega —
   komponenta prešteje, kar najde, in se odloči sama:
     ena slika  → statično ozadje, brez animacije in brez JS
     več slik   → počasno menjavanje s prehodom
   ============================================================ */
import type { ImageMetadata } from 'astro';

const datoteke = import.meta.glob<{ default: ImageMetadata }>('../assets/hero/*.{jpg,jpeg,webp,png}', {
  eager: true,
});

export interface HeroSlika {
  slika: ImageMetadata;
  /** Ime datoteke brez predpone in končnice — za opise in razhroščevanje. */
  ime: string;
  /** Števčna predpona; manjša je prej. */
  zaporedje: number;
}

const VZOREC = /\/(\d+)-(.+)\.(jpg|jpeg|webp|png)$/;

export const HERO_SLIKE: HeroSlika[] = Object.entries(datoteke)
  .map(([pot, modul]) => {
    const ujem = pot.match(VZOREC);
    if (!ujem) {
      throw new Error(
        `Slika "${pot}" v src/assets/hero/ nima števčne predpone. Vrstni red hero slik `
          + 'določa predpona (npr. 01-kazina.jpg), ker je prva slika LCP element '
          + 'naslovnice in mora biti izbrana, ne naključna.',
      );
    }
    return { slika: modul.default, ime: ujem[2], zaporedje: Number(ujem[1]) };
  })
  .sort((a, b) => a.zaporedje - b.zaporedje);

if (HERO_SLIKE.length === 0) {
  throw new Error('V src/assets/hero/ ni nobene slike — hero sekcija ne bi imela ozadja.');
}

/* Dve enaki predponi pomenita, da vrstni red ni določen. Tiho razreševanje
   bi pomenilo, da se LCP slika lahko zamenja med dvema buildoma. */
const predpone = HERO_SLIKE.map((s) => s.zaporedje);
const podvojene = predpone.filter((p, i) => predpone.indexOf(p) !== i);
if (podvojene.length > 0) {
  throw new Error(
    `Podvojena števčna predpona v src/assets/hero/: ${[...new Set(podvojene)].join(', ')}. `
      + 'Vrstni red mora biti enolično določen.',
  );
}

export const IMA_SLIDESHOW = HERO_SLIKE.length > 1;
