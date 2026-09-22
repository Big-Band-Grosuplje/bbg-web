/* ============================================================
   Sezonske in jubilejne plasti čez hero fotografijo.

   Datumi so TU in ne v komponenti: plast je podatek o koledarju, ne o
   izrisu. Komponenta vpraša, katere plasti veljajo danes, in jih izriše;
   kdaj veljajo, ne ve.

   ⚠️ ODVISNOST OD DNEVNEGA REDEPLOYA
   Stran je statična, zato se "danes" razreši OB GRADNJI in ne v
   brskalniku. Brez nove gradnje bi sneg obvisel do marca. To že pokriva
   .github/workflows/dnevni-redeploy.yml (02.00 UTC vsak dan) — isti
   potek, ki skrbi za filtriranje preteklih koncertov. Če bi ta potek kdaj
   ugasnil, plasti odpovejo tiho: nič se ne pokvari, samo obtičijo.

   Zato tudi ni namenoma nobenega odjemalskega preverjanja datuma —
   takšno bi delovalo brez redeploya, a bi pomenilo, da je obletnica
   odvisna od ure na obiskovalčevem računalniku.
   ============================================================ */

export type TipPlasti = 'sneg' | 'jubilej';

export interface Plast {
  tip: TipPlasti;
  /**
   * Meji vključno. Dve obliki:
   *   'MM-DD'      → ponavlja se vsako leto (npr. sneg vsak december)
   *   'YYYY-MM-DD' → enkraten dogodek (npr. obletnica)
   * Ponavljajoč razpon sme prestopiti letnico ('12-01' → '01-06').
   */
  od: string;
  do: string;
  /** Parametri gredo komponenti nespremenjeni. */
  parametri?: Record<string, string | number>;
  /** Interna opomba, se ne izpiše. */
  opomba?: string;
}

export const HERO_PLASTI: Plast[] = [
  {
    tip: 'sneg',
    od: '12-01',
    do: '01-06',
    parametri: { kosov: 14 },
    opomba:
      'Do svečnice, ne do konca zime. Redke počasne snežinke — ne zimska idila. '
      + 'Število kosov je namenoma majhno: gre za CSS animacijo na omejenem številu '
      + 'elementov in ne za canvas s partikli.',
  },
  {
    tip: 'jubilej',
    od: '2026-11-01',
    do: '2026-11-30',
    parametri: { leta: 25, kaj: 'drustva' },
    opomba:
      'November 2026: 25 let društva. Datum je iz naročila — pred objavo preveri '
      + 'v docs/bbg-osnova.md, ki je edini vir uradnih podatkov.',
  },
  {
    tip: 'jubilej',
    od: '2027-01-01',
    do: '2027-12-31',
    parametri: { leta: 30, kaj: 'orkestra' },
    opomba:
      'Leto 2027: 30 let orkestra. Celo leto, ker je nanj vezan jubilejni projekt. '
      + 'Datum je iz naročila — preveri v docs/bbg-osnova.md.',
  },
];

/* ------------------------------------------------------------
   PRAVILO OB PREKRIVANJU

   1. Plasti RAZLIČNIH tipov se seštevata.
      Sneg je vzdušje čez celotno fotografijo in stoji za vsebino;
      jubilej je znak v kotu. Ne tekmujeta za isto mesto ne za isto
      vlogo, zato bi izključevanje eno od njiju izgubilo brez razloga —
      december 2027 je res hkrati zima in jubilejno leto in obojega ni
      treba skrivati.

   2. Plasti ISTEGA tipa se izključujejo; zmaga OŽJI razpon.
      Če bi kdaj veljala dva jubileja hkrati, je ožji tisti bolj
      določen (en mesec pove več kot celo leto). Brez tega pravila bi
      odločal vrstni red v tem seznamu, kar je naključje.
   ------------------------------------------------------------ */
