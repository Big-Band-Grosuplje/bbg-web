/* ============================================================
   Konfiguracija zunanjih storitev.

   Dokler sta konstanti prazni, obrazca delujeta prek mailto —
   stran je statična in brez zaledja, zato je to edini način, ki
   deluje brez tretje osebe. Ob vpisu vrednosti se obrazca
   samodejno preusmerita na ponudnika.

   Ob vklopu katerekoli storitve preveri, da je opisana v
   src/pages/zasebnost.astro.
   ============================================================ */

/* Brevo: URL obrazca iz Brevo > Contacts > Forms > Share.
   Prazno = mailto.

   Endpoint dovoljuje CORS: na preflight vrne access-control-allow-origin z
   odsevanim izvorom (preverjeno 31. 8. 2026 za produkcijsko domeno, za
   localhost in za poljuben tretji izvor) in access-control-allow-methods s
   POST. Zato oddaja teče prek fetch in obiskovalec ostane na strani; navadni
   POST v novem zavihku ni potreben. Glej opombo v src/components/Noga.astro. */
export const BREVO_FORM_URL =
  'https://2cf6ba6f.sibforms.com/serve/MUIFAMrwSQM1I7fUlx9r7kpApSTiydH4SO89-ug0PBQ53HQCcuRpVywXQTzs69y3p95y8s1JBMC92TRVTsTJTJ4D985PoU2x3ZrmOoBeajC3NSJ96a1PcfVG23zbKg19CxoFyx2iOtBCsgwokvIZNlNBY4BLYRtJ1g2hqpQWPl-zMDC44s8aSb5foOrlB9-O6JsRnHJWPiCXIkuDwA==';

/* Web3Forms: javni access key iz web3forms.com (UUID). Ključ je javen
   po zasnovi storitve in sme biti v HTML. Prazno = mailto. */
export const WEB3FORMS_KEY = '';

/* Naslov, na katerega padeta obrazca, kadar storitvi nista nastavljeni. */
export const KONTAKT_EPOSTA = 'info@bigband-grosuplje.com';
