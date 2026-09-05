/* ============================================================
   Slovenski slovar vmesnika — izhodiščni jezik.
   Besedila so prenesena dobesedno iz strani pred uvedbo dvojezičnosti;
   ne "izboljšuj" jih ob prenosu.

   Struktura tega slovarja je pogodba: en.ts mora imeti iste ključe.
   TypeScript to preverja prek `satisfies Slovar` v en.ts.
   ============================================================ */

export const sl = {
  koda: 'sl',
  htmlLang: 'sl',
  ogLocale: 'sl_SI',
  imeJezika: 'Slovenščina',

  nav: {
    oznaka: 'Glavna navigacija',
    znakAlt: 'Big Band Grosuplje — naslovnica',
    koncerti: 'Koncerti',
    zgodovina: 'Zgodovina',
    galerija: 'Galerija',
    multimedija: 'Multimedija',
    cta: 'Spoznajmo se',
    tema: 'Preklopi temo',
    meni: 'Meni',
    jezik: 'Switch to English',
    jezikKratko: 'EN',
  },

  hero: {
    badge: 'Pozor, hud big band!',
    znakAlt: 'Big Band Grosuplje',
    slogan: 'Od leta 1997/98 igramo bolje. Ali pa hitreje. Nekaj od tega vsekakor. 🙂',
    gumbKoncerti: 'Kdaj igramo?',
    gumbPridruzi: 'Pridruži se',
    fotoAlt: 'Dirigent med vodenjem orkestra',
    nalepka: 'dirigent, presenetljivo miren',
  },

  /* Stran 404. Ton je hišni — lahek, a pove, kaj se je zgodilo.
     Gumb h koncertom si napis deli s heroom (hero.gumbKoncerti), zato ga
     tu ni: isti niz na dveh mestih bi se razšel. */
  napaka404: {
    nadnaslov: 'napaka 404',
    naslov: 'Te strani ni',
    opis:
      'Povezava je morda napačna ali pa je stran zamenjala naslov. ' +
      'Zgodi se — tudi mi kdaj zgrešimo vstop.',
    gumbNaslovnica: 'Na naslovnico',
  },

  koncerti: {
    nadnaslov: 'prihajajoče',
    naslov: 'Kdaj in kje igramo',
    praznoPred: 'Trenutno ni napovedanih koncertov. Novice objavljamo na',
    praznoVez: 'in',
    praznoZa: '.',
    brezPrizorisca: 'prizorišče še ni potrjeno',
    ob: 'ob',
    /* Značke na kartici — verzalke nastavi CSS, tu so v naravnem zapisu. */
    zasedbaBigBand: 'Big band',
    zasedbaCombo: 'Combo',
    zasedbaMladinski: 'Mladinski ansambel',
    zasedbaIzobrazevalni: 'Delavnica',
    vstopProst: 'Prost vstop',
    vstopZaprt: 'Zaprt dogodek — za povabljence',
    prijavaObvezna: 'obvezna prijava',
    prijavaGumb: 'Prijava',
    mimo: 'Dogodek je mimo',
    vsiKoncerti: '← Vsi koncerti',
    gostje: 'Gostje',
    vstopnice: 'Vstopnice',
    organizator: 'Organizator',
    objave: 'Več o dogodku:',
    /* Pripis o jeziku ciljne strani. Na slovenski strani je prazen: vse
       tri zunanje povezave vodijo na slovenske strani, torej v isti jezik
       kot stran, in pripis ne bi povedal ničesar. Ključ mora obstajati v
       obeh slovarjih (preverba ujemanja v src/i18n/index.ts). */
    vSlovenscini: '',
  },

  zgodovinaSekcija: {
    nadnaslov: 'od 1997/98 do danes',
    naslov: 'Zgodovina',
    vec: 'Celotna zgodovina →',
    /* Značka ob zadnji eri v časovnici. */
    aktualno: 'aktualno',
  },

  galerijaSekcija: {
    nadnaslov: 'iz arhiva',
    naslov: 'Galerija',
    vec: 'Celotna galerija →',
    kredit: 'Foto: arhiv KD Big Band Grosuplje',
  },

  multimedijaSekcija: {
    nadnaslov: 'arhiv posnetkov',
    naslov: 'Multimedija',
    vec: 'Vsi posnetki →',
  },

  kontakt: {
    nadnaslov: 'pišite nam',
    naslov: 'Kontakt',
    organizatorNaslov: 'Za organizatorje',
    organizatorOpis:
      'Gala večer, festival ali praznovanje? Big band doda prireditvi blišč — z repertoarjem največjih uspešnic zlate dobe big bandov, slovenske popevke, latino ali zahtevnejše jazzovske literature, v polni zasedbi ali kot prilagojena, combo zasedba.',
    organizatorGumb: 'Povprašajte za nastop',
    organizatorZadeva: 'Povpraševanje za nastop — spletna stran',
    pridruzitevNaslov: 'Pridruži se',
    /* "Te zanima snemanje" brez predloga — tako je v potrjeni predlogi. */
    pridruzitevOpis:
      'Igraš pozavno, trobento, saksofon, bobne, kontrabas, kitaro ali klavir? Poješ? Te zanima snemanje in ozvočenje? Sprejemamo nove člane v big band in mladinski ansambel, tehnikom pa ponujamo možnost izpopolnjevanja in uporabe naše opreme.',
    pridruzitevGumb: 'Piši nam',
    pridruzitevGumbDelavnica: 'Prijavljam se',
    pridruzitevDodatek:
      'Prek tega obrazca se lahko prijaviš tudi na naše izobraževalne dogodke in delavnice.',
    pridruzitevZadeva: 'Pridružitev orkestru — spletna stran',
    ime: 'Ime in priimek',
    eposta: 'E-pošta',
    sporocilo: 'Sporočilo',
    podrocje: 'Področje',
    podrocjeInstrumentalist: 'Instrumentalist',
    podrocjeVokalist: 'Vokalist',
    podrocjeTehnika: 'Tehnična podpora',
    podrocjeDelavnica: 'Prijava na delavnico (Krajnčan, oktober)',
    delavnicaZadeva: 'Prijava na delavnico — spletna stran',
  },

  obrazec: {
    posiljamo: 'Pošiljamo …',
    oddano: 'Sporočilo je oddano. Oglasimo se v nekaj dneh.',
    napaka: 'Pošiljanje ni uspelo. Piši nam na',
    nedeluje: 'Obrazec trenutno ne deluje. Piši nam na',
  },

  noga: {
    znakAlt: 'Big Band Grosuplje',
    ton: 'Prvi grosupeljski big band — od leta 1997/98.',
    noviceNaslov: 'Ne zamudi koncerta',
    noviceOznaka: 'Tvoja e-pošta',
    novicePlaceholder: 'tvoj@email.si',
    noviceGumb: 'Prijava',
    noviceSoglasjePred: 'Strinjam se s',
    noviceSoglasjePovezava: 'politiko zasebnosti',
    noviceSoglasjeZa: '.',
    noviceDrobno: 'Nekaj obvestil na leto, samo o koncertih. Brez spama, častna jazzovska.',
    novicePosiljamo: 'Pošiljamo …',
    noviceHvala: 'Hvala, prijava je zabeležena.',
    noviceNapaka: 'Prijava ni uspela. Piši nam na',
    noviceNedeluje: 'Prijava trenutno ne deluje. Piši nam na',
    kanaliOznaka: 'Družbena omrežja',
    kanaliNaslov: 'Spremljaj nas',
    zasebnost: 'Politika zasebnosti',
    kolofonNaziv: 'Kulturno društvo Big Band Grosuplje · Adamičeva cesta 16, 1290 Grosuplje',
    kolofonDavek: 'Davčna številka: 12579076 (nismo zavezanci za DDV) · Matična številka: 1179241000 ·',
  },

  mediji: {
    solisti: 'Solisti',
    predvajaj: 'Predvajaj posnetek',
    slicicaAlt: 'Sličica posnetka',
    predvajalnik: 'Predvajalnik posnetka',
    zapri: 'Zapri predvajalnik',
    krediti: {
      kamera: 'Kamera',
      avdio: 'Avdio',
      montaza: 'Montaža',
      posnetek: 'Posnetek',
      kanal: 'Kanal',
    },
  },

  deljenje: {
    oznaka: 'Deli dogodek',
    naslov: 'Deli',
    kopiraj: 'Kopiraj povezavo',
    kopirano: 'Kopirano!',
    eposta: 'E-pošta',
    facebook: 'Facebook',
    zapri: 'Zapri meni za deljenje',
  },

  lightbox: {
    oznaka: 'Povečana fotografija',
    prej: 'Prejšnja fotografija',
    naprej: 'Naslednja fotografija',
    povecaj: 'Povečaj fotografijo',
  },

  skupno: {
    nazaj: '← Nazaj na naslovnico',
    predogledC: 'predogled: smer C ·',
    predogledNazaj: 'nazaj',
  },

  galerijaStran: {
    naslovStrani: 'Galerija — Big Band Grosuplje',
    opisStrani:
      'Fotografski arhiv Big Banda Grosuplje: koncerti, vaje in mejniki od zgodnjih let do danes.',
    nadnaslov: 'iz arhiva',
    naslov: 'Galerija',
    uvodPred: 'fotografij iz arhiva društva, od najnovejših do najstarejših. Klikni fotografijo za povečavo; med njimi listaš s puščicama ali s tipkama ← in →.',
    letoNiPotrjeno: 'Leto ni potrjeno',
    kredit:
      'Foto: arhiv KD Big Band Grosuplje. Fotografije zunanjih avtorjev so objavljene šele po potrjenem dovoljenju in vedno s podpisom avtorja.',
  },

  multimedijaStran: {
    naslovStrani: 'Multimedija — Big Band Grosuplje',
    opisStrani:
      'Posnetki Big Banda Grosuplje: koncerti, javna snemanja in festivalski nastopi od leta 2012 do danes.',
    nadnaslov: 'arhiv posnetkov',
    naslov: 'Multimedija',
    uvodPred: 'posnetkov, od najnovejšega do najstarejšega. Predvajalnik se naloži šele ob kliku — do takrat s YouTuba ne prenesemo ničesar razen sličice.',
    kredit:
      'Avtorje posnetkov navajamo pri vsakem posnetku. Kjer kredit manjka, vira še nismo potrdili.',
  },

  zgodovinaStran: {
    naslovStrani: 'Zgodovina — Big Band Grosuplje',
    opisStrani:
      'Zgodovina Big Banda Grosuplje od ustanovitve v šolskem letu 1997/98 do danes: obdobja dirigentov, mejniki, televizijski nastopi in festivali.',
    nadnaslov: 'od 1997/98 do danes',
    naslov: 'Zgodovina',
    jubilejNaslov: 'Trideset let',
    gostujociNaslov: 'Gostujoči dirigenti',
    kredit:
      'Foto: arhiv KD Big Band Grosuplje. Fotografije zunanjih avtorjev so objavljene šele po potrjenem dovoljenju in vedno s podpisom avtorja. Imen članov orkestra ne objavljamo; podpisujejo se dirigenti, umetniško vodstvo in gostujoči umetniki.',
  },

  naslovnica: {
    naslovStrani: 'Big Band Grosuplje',
    opisStrani:
      'Big Band Grosuplje — klasična big band zasedba, ki deluje od leta 1997/98. Koncerti, tematski programi in izobraževalne delavnice.',
  },
} as const;

/* Slovar kot oblika, ne kot točne vrednosti: literale razširimo v string,
   da lahko en.ts z `satisfies Slovar` preveri samo ujemanje ključev.
   Manjkajoč ali odvečen ključ v en.ts tako ustavi build. */
type Sirok<T> = T extends string ? string : { [K in keyof T]: Sirok<T[K]> };
export type Slovar = Sirok<typeof sl>;
