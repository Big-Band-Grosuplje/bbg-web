/* ============================================================
   Angleški slovar vmesnika.

   Ton: informativno in elegantno. Hišna samoironija ostane, a subtilna —
   slovenskih besednih iger ne prevajamo dobesedno, ker v angleščini ne
   delujejo; namesto tega povemo isto z mirnejšim stavkom.

   Ključi morajo biti isti kot v sl.ts; `satisfies Slovar` to preveri ob
   buildu, tako da manjkajoč ali odvečen ključ ustavi build.
   ============================================================ */

import type { Slovar } from './sl';

/* Privzeti avtor fotografij, po istem vzorcu kot AVTOR_PRIVZETI v sl.ts:
   ime arhiva stoji dobesedno samo tu, berejo ga štirje odjemalci — padec
   nazaj pri posamezni fotografiji in trije stavki o kreditih (izsek
   galerije na naslovnici, /galerija, /zgodovina).
   Zapisov je bilo prej več in so se razšli: pod fotografijo je pisalo
   „arhiv KD Big Band Grosuplje", v stavkih o kreditih pa
   „KD Big Band Grosuplje archive". */
const AVTOR_PRIVZETI = 'KD Big Band Grosuplje archive';

export const en = {
  koda: 'en',
  htmlLang: 'en',
  ogLocale: 'en_US',
  imeJezika: 'English',

  nav: {
    oznaka: 'Main navigation',
    znakAlt: 'Big Band Grosuplje — home',
    koncerti: 'Events',
    zgodovina: 'History',
    galerija: 'Gallery',
    multimedija: 'Media',
    cta: "Let's meet",
    tema: 'Toggle theme',
    meni: 'Menu',
    jezik: 'Preklopi na slovenščino',
    jezikKratko: 'SL',
  },

  hero: {
    badge: 'Big band, full force',
    znakAlt: 'Big Band Grosuplje',
    slogan: 'Playing better since 1997/98. Or at least faster. 🙂',
    gumbNastop: 'Invite us',
    gumbPridruzi: 'Join us',
    fotoAlt: 'The conductor leading the orchestra',
    nalepka: 'the conductor, remarkably composed',
    napovedujemo: 'coming up',
    jubilejDrustva: 'years of the society',
    jubilejOrkestra: 'years of the orchestra',
    zvokVklopi: 'turn on sound',
    zvokUtisaj: 'mute',
  },

  napaka404: {
    nadnaslov: 'error 404',
    naslov: 'This page does not exist',
    opis:
      'The link may be wrong, or the page has moved. ' +
      'It happens — we miss an entry now and then, too.',
    gumbNaslovnica: 'Back to the home page',
    gumbKoncerti: 'Where can you find us?',
  },

  koncerti: {
    nadnaslov: 'upcoming',
    naslov: 'When and where to find us',
    praznoPred: 'No events are announced at the moment. We post news on',
    praznoVez: 'and',
    praznoZa: '.',
    brezPrizorisca: 'venue to be confirmed',
    ob: 'at',
    zasedbaBigBand: 'Big band',
    zasedbaCombo: 'Combo',
    zasedbaMladinski: 'Youth ensemble',
    zasedbaIzobrazevalni: 'Workshop',
    vstopProst: 'Free entry',
    vstopZaprt: 'Private event — by invitation',
    prijavaObvezna: 'registration required',
    prijavaGumb: 'Register',
    mimo: 'Past event',
    vsiKoncerti: '← All events',
    gostje: 'Guests',
    vstopnice: 'Tickets',
    organizator: 'Organiser',
    objave: 'More about the event:',
    /* Vse tri zunanje povezave vodijo na slovenske strani; angleški
       bralec to izve iz napisa, iskalnik pa iz hreflang na povezavi. */
    vSlovenscini: ' (in Slovenian)',
    podpornikiNaslov: 'This event was made possible by',
  },

  zgodovinaSekcija: {
    nadnaslov: 'since 1997/98',
    naslov: 'History',
    vec: 'Full history →',
    aktualno: 'current',
  },

  arhiv: {
    nadnaslov: 'since 1998',
    naslov: 'Event archive',
    naslovStrani: 'Event archive — Big Band Grosuplje',
    opisStrani: 'A chronological list of Big Band Grosuplje performances since 1998, along with events the orchestra organised. Dates, venues and short notes from the society archive.',
    uvod: 'What we managed to gather from the old site and internal lists. The records vary in detail — for some, only a date and a place remain. We add to them as we go.',
    izpeljanaZasedba:
      'Only a minority of records state the line-up; for {n} it is inferred — where a record does not mention the combo or a small group, the big band played.',
    obeZasedbi: 'At {n} events both line-ups played, so those events are counted under both.',
    obeZasedbiEna: 'At one event both line-ups played, so that event is counted under both.',
    organizacijaOpomba: 'At {n} events the orchestra did not play but organised them; those are not counted under any line-up.',
    organizacijaOpombaEna: 'At one event the orchestra did not play but organised it; that one is not counted under any line-up.',
    filterZasedba: 'line-up',
    filterKraj: 'place',
    vse: 'all',
    bigBand: 'big band',
    combo: 'combo',
    mladinski: 'youth ensemble',
    izobrazevalni: 'workshop',
    organizacija: 'organiser',
    grosuplje: 'Grosuplje',
    ljubljana: 'Ljubljana',
    drugje: 'elsewhere',
    skoci: 'jump to year',
    brezOpisa: 'record without a description',
    prazno: 'No matches. Try another selection.',
    stevilo: 'records',
    nazajNaZgodovino: '← History',
  },

  galerijaSekcija: {
    nadnaslov: 'from the archive',
    naslov: 'Gallery',
    vec: 'Full gallery →',
    kredit: `Photo: ${AVTOR_PRIVZETI}`,
  },

  multimedijaSekcija: {
    nadnaslov: 'recordings archive',
    naslov: 'Media',
    vec: 'All recordings →',
  },

  kontakt: {
    nadnaslov: 'get in touch',
    naslov: 'Contact',
    organizatorNaslov: 'For organisers',
    organizatorOpis:
      'A gala evening, festival or celebration? A big band adds sparkle to any event — with a repertoire spanning the greatest hits of the big band golden era, Slovenian popevka classics, Latin grooves and more demanding jazz literature, as a full orchestra or a tailored combo.',
    organizatorGumb: 'Enquire about a performance',
    organizatorZadeva: 'Performance enquiry — website',
    pridruzitevNaslov: 'Join us',
    pridruzitevOpis:
      'Do you play trombone, trumpet, saxophone, drums, double bass, guitar or piano? Do you sing? Interested in recording and live sound? We welcome new members to the big band and the youth ensemble, and offer technicians opportunities to learn and work with our equipment.',
    pridruzitevGumb: 'Write to us',
    pridruzitevGumbDelavnica: 'Register',
    pridruzitevDodatek:
      'You can also use this form to register for our educational events and workshops.',
    pridruzitevZadeva: 'Joining the orchestra — website',
    ime: 'Full name',
    eposta: 'Email',
    sporocilo: 'Message',
    podrocje: 'Area',
    podrocjeInstrumentalist: 'Instrumentalist',
    podrocjeVokalist: 'Vocalist',
    podrocjeTehnika: 'Technical support',
    podrocjeDelavnica: 'Workshop registration (Krajnčan, October)',
    delavnicaZadeva: 'Workshop registration — website',
  },

  obrazec: {
    posiljamo: 'Sending …',
    oddano: 'Your message is on its way. We usually reply within a few days.',
    napaka: 'Sending failed. Please write to us at',
    nedeluje: 'The form is not working at the moment. Please write to us at',
  },

  noga: {
    znakAlt: 'Big Band Grosuplje',
    ton: 'The first big band from Grosuplje — since 1997/98.',
    noviceNaslov: 'Never miss a concert',
    noviceOznaka: 'Your email',
    novicePlaceholder: 'you@example.com',
    noviceGumb: 'Subscribe',
    noviceSoglasjePred: 'I agree to the',
    noviceSoglasjePovezava: 'privacy policy',
    noviceSoglasjeZa: '.',
    noviceDrobno: 'A handful of emails a year, concerts only. No spam — brass promise.',
    novicePosiljamo: 'Sending …',
    noviceHvala: 'Thank you, your subscription is recorded.',
    noviceNapaka: 'Subscription failed. Please write to us at',
    noviceNedeluje: 'Subscription is not working at the moment. Please write to us at',
    kanaliOznaka: 'Social media',
    kanaliNaslov: 'Follow us',
    zasebnost: 'Privacy policy',
    podpornikiNaslov: 'Our work is supported by',
    kolofonNaziv: 'Kulturno društvo Big Band Grosuplje · Adamičeva cesta 16, 1290 Grosuplje, Slovenia',
    kolofonDavek: 'Tax number: 12579076 (not liable for VAT) · Registration number: 1179241000 ·',
  },

  mediji: {
    solisti: 'Soloists',
    predvajaj: 'Play recording',
    slicicaAlt: 'Recording thumbnail',
    predvajalnik: 'Recording player',
    zapri: 'Close the player',
    krediti: {
      kamera: 'Camera',
      avdio: 'Audio',
      montaza: 'Editing',
      posnetek: 'Recording',
      kanal: 'Channel',
    },
  },

  deljenje: {
    oznaka: 'Share this event',
    naslov: 'Share',
    kopiraj: 'Copy link',
    kopirano: 'Copied!',
    eposta: 'Email',
    facebook: 'Facebook',
    zapri: 'Close share menu',
  },

  lightbox: {
    oznaka: 'Enlarged photograph',
    prej: 'Previous photograph',
    naprej: 'Next photograph',
    povecaj: 'Enlarge photograph',
  },

  skupno: {
    nazaj: '← Back to home',
    predogledC: 'preview: direction C ·',
    predogledNazaj: 'back',
  },

  galerijaStran: {
    naslovStrani: 'Gallery — Big Band Grosuplje',
    opisStrani:
      'The photographic archive of Big Band Grosuplje: concerts, rehearsals and milestones from the early years to today.',
    nadnaslov: 'from the archive',
    naslov: 'Gallery',
    uvodPred: 'photographs from the association’s archive, newest first. Click a photograph to enlarge it; use the arrows or the ← and → keys to move between them.',
    letoNiPotrjeno: 'Year not confirmed',
    foto: 'Photo',
    avtorPrivzeto: AVTOR_PRIVZETI,
    kredit:
      `Photo: ${AVTOR_PRIVZETI}. Photographs by outside authors are published only once permission is confirmed, and always with the author credited.`,
  },

  multimedijaStran: {
    naslovStrani: 'Media — Big Band Grosuplje',
    opisStrani:
      'Recordings of Big Band Grosuplje: concerts, public recording sessions and festival appearances from 2012 to today.',
    nadnaslov: 'recordings archive',
    naslov: 'Media',
    uvodPred: 'recordings, newest first. The player loads only when you click it — until then nothing is fetched from YouTube except the thumbnail.',
    kredit:
      'Authors are credited with each recording. Where a credit is missing, we have not yet confirmed the source.',
  },

  zgodovinaStran: {
    naslovStrani: 'History — Big Band Grosuplje',
    opisStrani:
      'The history of Big Band Grosuplje from its founding in the 1997/98 school year to today: conductors, milestones, broadcasts and festivals.',
    nadnaslov: 'since 1997/98',
    naslov: 'History',
    jubilejNaslov: 'Thirty years',
    naviNaslov: 'Jump to',
    napovedZnacka: 'looking ahead',
    gostujociNaslov: 'Guest conductors',
    arhivGumb: 'Full event archive →',
    kredit:
      `Photo: ${AVTOR_PRIVZETI}. Photographs by outside authors are published only once permission is confirmed, and always with the author credited. We do not publish the names of orchestra members; conductors, artistic directors and guest artists are credited.`,
  },

  naslovnica: {
    naslovStrani: 'Big Band Grosuplje',
    opisStrani:
      'Big Band Grosuplje — a classic big band active since 1997/98. Concerts, themed programmes and educational workshops.',
  },
} as const satisfies Slovar;
