/* ============================================================
   Konfiguracija zunanjih storitev.

   Obe storitvi sta vklopljeni (31. 8. 2026). Stran je statična in brez
   zaledja, zato oddaja teče neposredno iz brskalnika k ponudniku.
   Če se konstanta izprazni, obrazec ne odda ničesar, ampak javi napako
   z našim e-naslovom — mailto rezerve v vmesniku ni več.

   Ob vklopu ali menjavi katerekoli storitve preveri, da je opisana v
   src/pages/zasebnost.astro — tudi to, da ponudnik ob oddaji vidi
   obiskovalčev naslov IP.
   ============================================================ */

/* Brevo: URL obrazca iz Brevo > Contacts > Forms > Share.
   Prazno = obrazec javi napako z našim e-naslovom (mailto rezerve ni).

   Endpoint dovoljuje CORS: na preflight vrne access-control-allow-origin z
   odsevanim izvorom (preverjeno 31. 8. 2026 za produkcijsko domeno, za
   localhost in za poljuben tretji izvor) in access-control-allow-methods s
   POST. Zato oddaja teče prek fetch in obiskovalec ostane na strani; navadni
   POST v novem zavihku ni potreben. Glej opombo v src/components/Noga.astro. */
export const BREVO_FORM_URL =
  'https://2cf6ba6f.sibforms.com/serve/MUIFAMrwSQM1I7fUlx9r7kpApSTiydH4SO89-ug0PBQ53HQCcuRpVywXQTzs69y3p95y8s1JBMC92TRVTsTJTJ4D985PoU2x3ZrmOoBeajC3NSJ96a1PcfVG23zbKg19CxoFyx2iOtBCsgwokvIZNlNBY4BLYRtJ1g2hqpQWPl-zMDC44s8aSb5foOrlB9-O6JsRnHJWPiCXIkuDwA==';

/* Web3Forms: javni access key iz web3forms.com (UUID). Ključ je javen
   po zasnovi storitve in sme biti v HTML.

   API sprejema samo zahteve iz brskalnika — strežniške (curl) zavrne s
   403 in sporočilom "Use our API in client side". Oddaja zato teče prek
   fetch s FormData; ta ima vrsto vsebine multipart/form-data, ki je na
   seznamu varnih za CORS in ne sproži preflighta.

   Prazen ključ pomeni, da obrazec javi napako z našim e-naslovom —
   mailto rezerve v vmesniku ni več. */
export const WEB3FORMS_KEY = '9348bfbe-e85d-48c1-9a87-10c9c95bf89e';

/* Naslov, na katerega padeta obrazca, kadar storitvi nista nastavljeni. */
export const KONTAKT_EPOSTA = 'info@bigband-grosuplje.com';
