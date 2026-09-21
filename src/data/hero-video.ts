/* ============================================================
   Hero posnetek — edina stikalna točka med dvema stanjema hero sekcije.

   Dokler je HERO_POSNETEK null, medijska plošča izriše mirujočo
   fotografijo: brez gumba za zvok, brez preklopnika, brez namiga, da kaj
   manjka. Hero je v tem stanju dokončan in ne čaka na video.

   Ko posnetek pride, se spremeni SAMO vrednost spodaj. Komponente
   HeroMedij.astro ni treba odpirati — to je namen tega vmesnika.

   ------------------------------------------------------------
   PRIČAKOVANE DATOTEKE

   Gredo v public/video/ in v git; teže so v docs/design/hero-smer-b.md.

     public/video/hero-tiho.webm    AV1,  BREZ avdio sledi
     public/video/hero-tiho.mp4     H.264, BREZ avdio sledi
     public/video/hero-zvok.webm    AV1,  z zvokom
     public/video/hero-zvok.mp4     H.264, z zvokom

   Zakaj dve različici in ne ena z utišanim zvokom: tiha se naloži takoj
   vsakemu obiskovalcu, zato ne sme nositi avdio sledi, ki je nihče ne
   sliši. Polna se naloži šele ob kliku na gumb za zvok — takrat je
   prenos posledica obiskovalčeve odločitve.

   Zakaj dva zapisa vsake: AV1 je bistveno manjši, a ga starejše naprave
   ne znajo. H.264 je rezerva in stoji v <source> za njim.

   ⚠️ Posnetek stoji na Vercelu, poleg strani — nikoli na YouTubu ali
   drugem tujem gostitelju. Vgrajen predvajalnik bi obiskovalčev IP predal
   tretji osebi še pred klikom, kar pravila strani prepovedujejo
   (glej CLAUDE.md in /zasebnost).
   ============================================================ */

export interface HeroPosnetek {
  /** Tiha različica brez avdio sledi. Naloži se takoj. */
  tiho: { av1: string; h264: string };
  /** Polna različica z zvokom. Naloži se šele ob kliku na gumb. */
  zvok: { av1: string; h264: string };
  /**
   * Plakat — prvi kader posnetka. Neobvezno: brez njega komponenta
   * uporabi isto fotografijo kot v stanju brez posnetka, kar je tudi
   * pravilna izbira, kadar je prvi kader zanke ta fotografija.
   */
  plakat?: string;
}

/* null = stanje brez posnetka. Ob prihodu datotek zamenjaj z objektom
   spodaj; drugih sprememb ni. */
export const HERO_POSNETEK: HeroPosnetek | null = null;

/* Vrednost, ki jo vpiši, ko bodo datoteke v public/video/:

export const HERO_POSNETEK: HeroPosnetek | null = {
  tiho: { av1: '/video/hero-tiho.webm', h264: '/video/hero-tiho.mp4' },
  zvok: { av1: '/video/hero-zvok.webm', h264: '/video/hero-zvok.mp4' },
};

*/
