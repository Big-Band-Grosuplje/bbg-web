/* ============================================================
   Angleški slovar vmesnika.

   Ton: informativno in elegantno. Hišna samoironija ostane, a subtilna —
   slovenskih besednih iger ne prevajamo dobesedno, ker v angleščini ne
   delujejo; namesto tega povemo isto z mirnejšim stavkom.

   Ključi morajo biti isti kot v sl.ts; `satisfies Slovar` to preveri ob
   buildu, tako da manjkajoč ali odvečen ključ ustavi build.
   ============================================================ */

import type { Slovar } from './sl';

export const en = {
  koda: 'en',
  htmlLang: 'en',
  ogLocale: 'en_US',
  imeJezika: 'English',

  nav: {
    oznaka: 'Main navigation',
    znakAlt: 'Big Band Grosuplje — home',
    koncerti: 'Concerts',
    zgodovina: 'History',
    galerija: 'Gallery',
    multimedija: 'Media',
    cta: 'Book the band',
    tema: 'Toggle theme',
    meni: 'Menu',
    jezik: 'Preklopi na slovenščino',
    jezikKratko: 'SL',
  },

  hero: {
    badge: 'Big band, full force',
    znakAlt: 'Big Band Grosuplje',
    slogan: 'Playing better since 1997/98. Or at least faster.',
    gumbKoncerti: 'When do we play?',
    gumbPridruzi: 'Join us',
    fotoAlt: 'The conductor leading the orchestra',
    nalepka: 'the conductor, remarkably composed',
  },

  koncerti: {
    nadnaslov: 'upcoming',
    naslov: 'When and where we play',
    praznoPred: 'No concerts are announced at the moment. We post news on',
    praznoVez: 'and',
    praznoZa: '.',
    brezPrizorisca: 'venue to be confirmed',
    ob: 'at',
    gostje: 'Guests',
    vstopnice: 'Tickets',
  },

  zgodovinaSekcija: {
    nadnaslov: 'since 1997/98',
    naslov: 'History',
    vec: 'Full history →',
  },

  galerijaSekcija: {
    nadnaslov: 'from the archive',
    naslov: 'Gallery',
    vec: 'Full gallery →',
    kredit: 'Photo: KD Big Band Grosuplje archive',
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
      'A gala evening, a festival or an anniversary? A big band gives an occasion its shine — with a repertoire from Sinatra to Goodwin, as a full orchestra or as a combo.',
    organizatorGumb: 'Enquire about a performance',
    organizatorZadeva: 'Performance enquiry — website',
    pridruzitevNaslov: 'Join us',
    pridruzitevOpis:
      'Do you play trumpet, trombone, saxophone or rhythm? Do you sing? Are you drawn to recording and sound? Our combo and saxophone quintet are the way into the orchestra.',
    pridruzitevGumb: 'Write to us',
    pridruzitevZadeva: 'Joining the orchestra — website',
    ime: 'Full name',
    eposta: 'Email',
    sporocilo: 'Message',
    podrocje: 'Area',
    podrocjeInstrumentalist: 'Instrumentalist',
    podrocjeVokalist: 'Vocalist',
    podrocjeTehnika: 'Technical support',
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
    kredit:
      'Photo: KD Big Band Grosuplje archive. Photographs by outside authors are published only once permission is confirmed, and always with the author credited.',
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
    gostujociNaslov: 'Guest conductors',
    kredit:
      'Photo: KD Big Band Grosuplje archive. Photographs by outside authors are published only once permission is confirmed, and always with the author credited. We do not publish the names of orchestra members; conductors, artistic directors and guest artists are credited.',
  },

  naslovnica: {
    naslovStrani: 'Big Band Grosuplje',
    opisStrani:
      'Big Band Grosuplje — a classic big band active since 1997/98. Concerts, themed programmes and educational workshops.',
  },
} as const satisfies Slovar;
