/* ============================================================
   Konfiguracija zunanjih storitev.

   Dokler sta konstanti prazni, obrazca delujeta prek mailto —
   stran je statična in brez zaledja, zato je to edini način, ki
   deluje brez tretje osebe. Ob vpisu vrednosti se obrazca
   samodejno preusmerita na ponudnika.

   Ob vklopu katerekoli storitve preveri, da je opisana v
   src/pages/zasebnost.astro.
   ============================================================ */

/* Brevo: URL obrazca iz Brevo > Contacts > Forms > Share (oblika
   https://<id>.brevosend.com/... ali https://sibforms.com/serve/...).
   Prazno = mailto. */
export const BREVO_FORM_URL = '';

/* Web3Forms: javni access key iz web3forms.com (UUID). Ključ je javen
   po zasnovi storitve in sme biti v HTML. Prazno = mailto. */
export const WEB3FORMS_KEY = '';

/* Naslov, na katerega padeta obrazca, kadar storitvi nista nastavljeni. */
export const KONTAKT_EPOSTA = 'info@bigband-grosuplje.com';
