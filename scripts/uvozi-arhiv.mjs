/* ============================================================
   Uvoz zgodovine dogodkov iz _vhod/zapisi.json v src/data/arhiv-uvoz.json.

       npm run arhiv

   Zakaj ročno in ne ob buildu: vir je v _vhod/, ki ni v gitu. Skripta je
   tu, da je pretvorba zapisana in ponovljiva, ne da bi jo bilo treba
   znova izpeljati iz spomina. Produkcijski build je od nje neodvisen —
   bere samo src/data/arhiv-uvoz.json in src/data/arhiv-rocno.json, oba v gitu.

   Odločitve, ki jih skripta izvaja, so utemeljene v docs/uvoz-zgodovine.md.
   Tu so samo izvedene; če se katera spremeni, popravi oboje.

   Skripta piše SAMO v src/data/arhiv-uvoz.json. Ročne dopolnitve živijo v
   ločeni datoteki src/data/arhiv-rocno.json, ki se je ne dotakne — zato
   ponovni zagon ročnega dela ne more izgubiti. Datoteki združi
   src/lib/arhiv.ts ob gradnji.

   Ročno datoteko skripta prebere samo zato, da POROČA: kje se ročna
   vrednost razhaja z novo uvoženo, kateri ročni vnosi nimajo več svojega
   zapisa v viru in kje je ročna vrednost postala odvečna. O nobenem od
   teh primerov ne odloča sama.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VIR = path.join(KOREN, '_vhod', 'zapisi.json');
const CILJ = path.join(KOREN, 'src', 'data', 'arhiv-uvoz.json');
const ROCNO = path.join(KOREN, 'src', 'data', 'arhiv-rocno.json');

/* ---------- izločitve ------------------------------------------------ */

const ZASEBNI = /porok|poročn|zakonski stan/i;
const TBD = /\bTBD\b/i;
const ODPOVEDANO = /ODPOVEDAN/i;
const ZAKLJUCEK = /zaključek (pod)?projekta/i;

function razlogIzlocitve(z) {
  const b = z.besedilo || '';
  if (ZASEBNI.test(b)) return 'zasebni dogodek';
  if (TBD.test(b)) return 'nepotrjen (TBD)';
  if (ODPOVEDANO.test(b)) return 'odpovedan';
  if (ZAKLJUCEK.test(b)) return 'zaključek projekta';
  return null;
}

/* ---------- poenotenje prizorišč -------------------------------------
   Ključ je prizorišče + kraj in ne prizorišče samo: "Kulturni dom" se v
   viru nanaša na tri različne kraje. Vrednost sme popraviti tudi kraj —
   dvorana big banda je v Spodnji Slivnici, ne v Grosupljem; občina ni
   kraj dogodka. */

const PRIZORISCA = {
  'KD Grosuplje|Grosuplje': ['Kulturni dom Grosuplje', 'Grosuplje'],
  'Kulturni dom|Grosuplje': ['Kulturni dom Grosuplje', 'Grosuplje'],
  'Kulturni dom Grosuplje|Grosuplje': ['Kulturni dom Grosuplje', 'Grosuplje'],

  'Dvorana BBG|Spodnja Slivnica': ['Kulturni dom Spodnja Slivnica', 'Spodnja Slivnica'],
  'Dvorana KD|Spodnja Slivnica': ['Kulturni dom Spodnja Slivnica', 'Spodnja Slivnica'],
  'dvorana KD|Spodnja Slivnica': ['Kulturni dom Spodnja Slivnica', 'Spodnja Slivnica'],
  'KD Spodnja Slivnica|Spodnja Slivnica': ['Kulturni dom Spodnja Slivnica', 'Spodnja Slivnica'],
  'Kulturni dom|Spodnja Slivnica': ['Kulturni dom Spodnja Slivnica', 'Spodnja Slivnica'],
  'KD Spodnja Slivnica - dvorana big banda|Grosuplje': [
    'Kulturni dom Spodnja Slivnica',
    'Spodnja Slivnica',
  ],

  'Studio 14|Ljubljana': ['RTV Slovenija, Studio 14', 'Ljubljana'],
  'Studio 14 RA Slovenija|Ljubljana': ['RTV Slovenija, Studio 14', 'Ljubljana'],
  'RTV Slovenija - Studio 14|Ljubljana': ['RTV Slovenija, Studio 14', 'Ljubljana'],

  'Cankarjev dom – Gallusova dvorana|Ljubljana': ['Cankarjev dom, Gallusova dvorana', 'Ljubljana'],

  'Rezidenca ameriškega veleposlanika v Sloveniji|Ljubljana': [
    'Rezidenca veleposlanika ZDA',
    'Ljubljana',
  ],
  'Rezidenca ameriškega veleposlanika|Ljubljana': ['Rezidenca veleposlanika ZDA', 'Ljubljana'],

  'Mestna knjižnica Grosuplje|Grosuplje': ['Knjižnica Grosuplje', 'Grosuplje'],
  'Knjižnica Grosuplje|Grosuplje': ['Knjižnica Grosuplje', 'Grosuplje'],

  'Hotel Union|Ljubljana': ['Grand hotel Union', 'Ljubljana'],
  'Unionska dvorana|Ljubljana': ['Grand hotel Union', 'Ljubljana'],

  'Hotel & Casino Kongo|Grosuplje': ['Hotel & Casino Kongo', 'Grosuplje'],
  'Kongo Hotel & Casino|Grosuplje': ['Hotel & Casino Kongo', 'Grosuplje'],
};

/* RTV Slovenija in RTV Slovenija - NLP se NE zlivata s Studiom 14 (druga
   dvorana), navadni Cankarjev dom pa ne z Gallusovo (dvorana ni znana). */

/* ---------- zasedba --------------------------------------------------- */

/* Zasedba je MNOŽICA, ne ena vrednost: na istem dogodku sta lahko
   nastopila oba — orkester in combo. */
const ZASEDBE = {
  BBG: ['big-band'],
  combo: ['combo'],
  'BBG in combo': ['big-band', 'combo'],
};

/* ---------- izpeljava zasedbe ----------------------------------------
   Zasedbo ima zapisano 44 od 291 vnosov. Za ostale velja domensko
   pravilo: če zapis izrecno ne omenja comba ali male zasedbe, je igral
   big band. Pravilo je Rokovo in stoji na tem, kako se je zapisovalo —
   combo se je vedno navedel, orkester kot privzetek ne.

   Ker je to sklep iz ODSOTNOSTI besede in ne podatek iz vira, nosi vsak
   vnos polje `zasedbaVir`. Kdor bo kdaj našel dokaz, da je bil kak
   nastop combo, mora videti, da popravlja privzetek in ne zabeleženega
   podatka.

   Izpeljava teče tu in ne ob izrisu: pravilo je zapisano enkrat, njegov
   rezultat je v gitu in ga je mogoče prebrati brez poganjanja strani. */

const MALA_ZASEDBA = /combo|mal[aioe] zasedb\w*|kvartet\w*|kvintet\w*|\btri[oau]\b/i;

/* ⚠️ Big banda iz besedila NE izpeljujemo kot drugo zasedbo, čeprav ga
   večina zadetkov omenja. Zveza "Combo zasedbe Big Banda Grosuplje" je
   rodilniško določilo — pove, čigav combo je, ne da je poleg igral še
   orkester. Tako je zapisanih 19 od 37 zadetkov; mehansko pravilo „omenja
   oboje → oboje" bi jih vse napačno označilo kot dvojne. Dvojno zasedbo
   zato pozna samo vir (vrednost "BBG in combo"). */
function izpeljanaZasedba(opis) {
  return MALA_ZASEDBA.test(opis || '') ? ['combo'] : ['big-band'];
}

/* ---------- predlogi za program in prireditev -------------------------
   PRIREDITEV je dogodek nekoga drugega, na katerem je BBG nastopil
   (Grosuplje v jeseni, Marezijazz, JSKD festival). PROGRAM je lasten
   projekt orkestra, ki živi prek več nastopov (Images, Ellingtonia,
   Poklon Gordonu Goodwinu).

   ⚠️ Skripta tega NE vpisuje v podatke. Registra še ni; dokler ga ni, so
   to samo predlogi za človeka. Zapiše jih v _vhod/predlogi.md, kjer jih
   je mogoče v miru pregledati in potrditi. Register bo nastal iz
   potrjenega seznama in ne obratno.

   Zakaj vzorci in ne prosto iskanje: vsak predlog mora biti izpeljan iz
   besedila, ki ga je mogoče pokazati. Ob vsakem predlogu je zato izsek
   vira, iz katerega je nastal.

   Sinatrovi nastopi so TRIJE programi in ne eden. Ista tema nosi tri
   imena v treh obdobjih in združevanje bi zabrisalo, da gre za tri
   projekte. Vrstni red in polje `razen` skrbita, da se ne prekrivajo:
   zapis iz 2013 pravi "Projekt A Swinging Affair – poklon Franku
   Sinatri" in bi se sicer ujel z vsemi tremi. */

const PREDLOGI_PROGRAMOV = [
  { id: 'sinatra', naziv: 'Sinatra', vzorec: /\bSinatra\b/i, razen: /Swinging|Poklon Franku/i },
  { id: 'a-swinging-affair', naziv: 'A Swinging Affair', vzorec: /A Swinging Affair/i },
  {
    id: 'poklon-franku-sinatri',
    naziv: 'Poklon Franku Sinatri',
    vzorec: /Poklon Franku Sinatri/i,
    razen: /Swinging/i,
  },
  { id: 'glasba-zdruzuje', naziv: 'Glasba združuje', vzorec: /Glasba združuje/i },
  { id: 'poklon-gordonu-goodwinu', naziv: 'Poklon Gordonu Goodwinu', vzorec: /\(Goodwin\)|Gordona Goodwina/i },
  { id: 'ella-fitzgerald-songbook', naziv: 'Ella Fitzgerald Songbook', vzorec: /Ella Fitzgerald Songbook/i },
  { id: 'ellingtonia', naziv: 'Ellingtonia', vzorec: /Ellingtonia/i },
  { id: 'jazz-in-the-coffin', naziv: 'Jazz in the Coffin', vzorec: /Jazz in the Coffin|– Coffin/i },
  { id: 'images', naziv: 'Images', vzorec: /\bImages\b/i },
  { id: 'flying-start', naziv: 'Flying Start', vzorec: /Flying Start/i },
  { id: 'vibraphone-summit', naziv: 'Vibraphone Summit', vzorec: /Vibraphone Summit/i },
  {
    id: 'glasba-glenna-millerja-in-counta-basiea',
    naziv: 'Glasba Glenna Millerja in Counta Basiea',
    vzorec: /Glenna Millerja/i,
  },
];

const PREDLOGI_PRIREDITEV = [
  { id: 'grosuplje-v-jeseni', naziv: 'Grosuplje v jeseni', vzorec: /Grosuplje v jeseni/i },
  { id: 'marezijazz', naziv: 'Marezijazz', vzorec: /marez\w*jazz/i },
  { id: 'zupanov-sprejem', naziv: 'Županov sprejem', vzorec: /županov sprejem/i },
  { id: 'zlati-kljuc-mesta-grosuplje', naziv: 'Zlati ključ mesta Grosuplje', vzorec: /Zlati ključ mesta/i },
  { id: 'prifarci-gremo-v-svet', naziv: 'Prifarci gremo v svet', vzorec: /Prifarci gremo v svet/i },
  { id: 'ameriski-dnevi', naziv: 'Ameriški dnevi', vzorec: /Ameriški dnevi|Ameriških dni/i },
  { id: 'gros-koncerti', naziv: 'Koncerti Študentskega kluba Groš', vzorec: /Ko sosedje obmolknejo|Ko soseda reče/i },
  { id: 'jskd-festival', naziv: 'JSKD festival', vzorec: /\bJSKD\b/i },
  { id: 'jazzinty', naziv: 'Jazzinty', vzorec: /Jazzinty/i },
  { id: 'socn-fest', naziv: "Soč'n Fest", vzorec: /Soč'n Fest/i },
  { id: 'pridi-zvecer-na-grad', naziv: 'Pridi zvečer na grad', vzorec: /Pridi zvečer na grad/i },
  { id: 'jazz-abonma-ravne', naziv: 'Jazz abonma Ravne', vzorec: /Jazz abonmaja Ravne/i },
  { id: 'imago-sloveniae', naziv: 'Noči v stari Ljubljani (Imago Sloveniae)', vzorec: /Imago Sloveniae|Noči v stari Ljubljani/i },
  { id: 'festival-sticna', naziv: 'Festival Stična', vzorec: /Festivala Stična/i },
  { id: 'adamicevi-dnevi', naziv: 'Adamičevi dnevi', vzorec: /Adamičevih dni/i },
];

/** Izsek besedila okoli zadetka — dokaz, iz česa je predlog nastal. */
function izsek(besedilo, vzorec, sirina = 38) {
  const m = besedilo.match(vzorec);
  if (!m) return besedilo.slice(0, 2 * sirina);
  const od = Math.max(0, m.index - sirina);
  const do_ = Math.min(besedilo.length, m.index + m[0].length + sirina);
  return (od > 0 ? '…' : '') + besedilo.slice(od, do_).trim() + (do_ < besedilo.length ? '…' : '');
}

function najdiPredloge(arhiv, definicije) {
  const skupine = [];
  for (const d of definicije) {
    const zadetki = arhiv.filter((v) => {
      const b = `${v.naziv ?? ''} ${v.opis ?? ''}`;
      return d.vzorec.test(b) && !(d.razen && d.razen.test(b));
    });
    if (zadetki.length > 0) skupine.push({ ...d, zadetki });
  }
  /* Najpogostejša imena prva: tam se odločitev najbolj splača. */
  skupine.sort((x, y) => y.zadetki.length - x.zadetki.length || x.naziv.localeCompare(y.naziv, 'sl'));
  return skupine;
}

/* ---------- čiščenje polja kraj --------------------------------------
   Vir je izvožen iz SQL dumpa in v stolpec kraj ponekod potegne smeti
   razčlenjevalnika (predpona ":: ", vrstica "-- php") ali uro, zlepljeno
   pred ime kraja ("19.30; Grosuplje").

   Zakaj to počne skripta in ne popravek v _vhod/zapisi.json: mapa _vhod/
   ni v gitu in se ob vsakem novem izvozu zamenja. Popravek, vpisan tja,
   se izgubi tiho — enkrat se to že je zgodilo. Tu je zapisan, podprt z
   razlogom in se uveljavi ob vsakem zagonu. */

/** Ura, zlepljena pred kraj: "19.30; Grosuplje" → ura 19:30, kraj Grosuplje.
    Zapis v podatkih je vedno HH:MM z dvopičjem — piko postavi šele izpis za
    slovenščino (`formatDatum` v src/lib/koncerti.ts), angleščina obdrži
    dvopičje. Pika v podatkih bi se v angleškem izpisu pokazala takšna. */
const URA_V_KRAJU = /^(\d{1,2})[.:](\d{2})\s*;\s*(.+)$/;
/** Ostanki razčlenjevalnika na začetku vrednosti. */
const SMETI_KRAJA = /^(::|--)\s*/;

function ociscenKraj(surov) {
  if (typeof surov !== 'string') return { kraj: surov ?? null, ura: null };
  let kraj = surov.trim();
  let ura = null;

  const m = kraj.match(URA_V_KRAJU);
  if (m) {
    ura = `${m[1].padStart(2, '0')}:${m[2]}`;
    kraj = m[3].trim();
  }
  kraj = kraj.replace(SMETI_KRAJA, '').trim();

  return { kraj: kraj || null, ura };
}

/* ---------- povrnitev kraja v ime prireditve --------------------------
   V preglednici 2019–2026 in v kratkih seznamih 2015–2018 je kraj svoj
   stolpec, zato je iz imena prireditve izpadel: "Grosuplje v jeseni" je
   zapisano kot kraj "Grosuplje" + besedilo "v jeseni". Na strani ostane
   vrstica "v jeseni", ki ni ime ničesar.

   ⚠️ Odreza NE dela ta skripta — preverjeno s primerjavo vira in izhoda:
   z začetka besedila ne odreže ničesar pri nobenem od 291 zapisov. Odrez
   je v viru in tu ga povrnemo.

   Varovalo: kraj se prilepi nazaj SAMO, kadar se besedilo začne s
   predlogom. Predlog je slovnični znak, da je besedilo nadaljevanje in ne
   samostojen stavek. Ohlapnejše pravilo "začne se z malo začetnico" bi
   ujelo 148 zapisov, od tega 145 napačno — "Grosuplje županov sprejem",
   "Ljubljana sprejem ameriškega veleposlaništva". Predlog jih ujame 3 in
   vsi trije so pravi.

   Povrnjene zapise skripta našteje v poročilu: če jih kdaj nastane več,
   se to vidi in ne zgodi tiho. */

const PREDLOG_NA_ZACETKU =
  /^(v|na|ob|pri|pod|za|med|skozi|iz|do|od|proti|čez|nad|pred)\s+[a-zčšžćđ]/i;

const povrnjeniKraji = [];

function povrniKraj(kraj, opis, id) {
  if (!kraj || !opis || !PREDLOG_NA_ZACETKU.test(opis)) return opis;
  const povrnjen = `${kraj} ${opis}`;
  povrnjeniKraji.push({ id, pred: opis, po: povrnjen });
  return povrnjen;
}

/* ---------- popravki posameznih zapisov ------------------------------- */

const POPRAVKI_OPISA = {
  /* Gostja je javna izvajalka in ime ostane; njen rojstni dan je osebna
     podrobnost in odpade. Dogodek sam je javni koncert in ostane. */
  '2006-10-25': (t) => t.replace(/,\s*ravno na svoj \d+\.\s*rojstni dan,\s*/i, ' '),

  /* Mojibake iz izvoza z dne 22. 9. 2026: "ÄŒateÅ¾" so UTF-8 bajti za
     "Čatež", brani kot cp1252. Popravek je deterministična odprava
     napačnega dekodiranja, ne ugibanje o vsebini. Pravi popravek je čist
     ponovni izvoz vira; dokler ga ni, velja to. */
  '1999-07-31': (t) => t.replace(/ÄŒateÅ¾/g, 'Čatež'),

  /* Isti izvoz je ime pevke zapisal z malo začetnico. Prejšnji izvoz je
     imel na tem mestu pokvarjen znak, torej gre za posledico popravljanja
     kodiranja, ne za zapis vira. */
  '2008-01-26': (t) => t.replace(/\bEva černe\b/, 'Eva Černe'),

  /* Festival v Marezigah se piše Marezijazz. Zapis iz 2026 ga je imel
     kot "MarezziJazz"; starejša zapisa (2015, 2022) sta pravilna. Ime
     poenotimo tu in ne v viru, ker se vir ob vsakem izvozu zamenja. */
  '2026-07-10': (t) => t.replace(/MarezziJazz/g, 'Marezijazz'),

  /* Pri tem zapisu je vse pristalo v stolpcu kraj, polje besedilo je
     prazno. Opis je torej prepis tistega, kar v viru stoji za imenom
     kraja — nič dodanega. Kraj popravi POPRAVKI_KRAJA. */
  '2004-07-10': () =>
    'koncert ob otvoritvi poletne sezone prireditev Hotelov Bernardin v Laguni Bernardin. '
    + 'Kot gostja je z big bandom nastopila pevka Kristina Oberžan',
};

/* Kraj, ki ga iz vira ni mogoče prebrati, ker je na njegovem mestu smet.
   Vrednost ni ugibanje: prejšnji izvoz je tu imel "Čatež" (od tod id
   1999-07-31-atez, ki je nastal iz pokvarjenega zapisa istega imena).

   ⚠️ Odprto vprašanje za človeka: besedilo pravi "koncert na Obolnarjevi
   kmetiji v Dolenji vasi ob zaključku poletnega seminarja v Čatežu" —
   kraj dogodka je torej morda Dolenja vas, Čatež pa kraj seminarja. Vir
   trdi Čatež; skripta zato trdi Čatež in ne odloča namesto tebe. */
const POPRAVKI_KRAJA = {
  '1999-07-31': 'Čatež',

  /* Pri tem zapisu je celotno besedilo pristalo v stolpcu kraj, polje
     besedilo pa je prazno. Razdelitev je razvidna iz same vrednosti:
     "Portorož- koncert ob otvoritvi …". Kraj je Portorož, ostalo je opis
     (glej POPRAVKI_OPISA). */
  '2004-07-10': 'Portorož',
};

/* Datuma, ki se združita: dva vira istega dogodka. Obdržimo bogatejši
   zapis, vir navaja oba. */
const ZDRUZI = {
  '2007-03-08': { obdrzi: 'seznam 2007 (podroben)' },
};

/* ---------- pomožno --------------------------------------------------- */

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/č/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/ć/g, 'c')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* Naziv se jemlje SAMO iz navednic — to je ime, ki ga je zapisal vir, in
   ne ugibanje. Povsod drugod ostane null in ga dopolni človek. */
function nazivIzBesedila(t) {
  const m = t.match(/[„"]([^„"]{4,80})["""]/);
  return m ? m[1].trim() : null;
}

/* ---------- glavno ---------------------------------------------------- */

if (!fs.existsSync(VIR)) {
  console.error(
    `Vira ${path.relative(KOREN, VIR)} ni. Mapa _vhod/ ni v gitu — gradivo je lokalno.`,
  );
  process.exit(1);
}

const zapisi = JSON.parse(fs.readFileSync(VIR, 'utf8'));
const izloceni = { 'zasebni dogodek': 0, 'nepotrjen (TBD)': 0, odpovedan: 0, 'zaključek projekta': 0 };
const neznanaPrizorisca = new Set();

let kandidati = [];
for (const z of zapisi) {
  const razlog = razlogIzlocitve(z);
  if (razlog) {
    izloceni[razlog]++;
    continue;
  }
  kandidati.push(z);
}

/* Združitev podvojenih datumov. */
const zdruzeni = [];
const poDatumu = new Map();
for (const z of kandidati) {
  if (!poDatumu.has(z.datumIso)) poDatumu.set(z.datumIso, []);
  poDatumu.get(z.datumIso).push(z);
}
for (const [datum, skupina] of poDatumu) {
  if (skupina.length === 1) {
    zdruzeni.push(skupina[0]);
    continue;
  }
  const pravilo = ZDRUZI[datum];
  if (!pravilo) {
    throw new Error(
      `Nepričakovano podvojen datum ${datum} (${skupina.length} zapisov) brez pravila za združitev. `
        + 'Dopolni ZDRUZI v scripts/uvozi-arhiv.mjs ali preveri vir.',
    );
  }
  const glavni = skupina.find((z) => z.vir === pravilo.obdrzi);
  if (!glavni) {
    throw new Error(`Pri ${datum} ni zapisa iz vira "${pravilo.obdrzi}".`);
  }
  zdruzeni.push({ ...glavni, vir: skupina.map((z) => z.vir).join(' + ') });
}

/* Pretvorba. */
const arhiv = zdruzeni.map((z) => {
  /* Čiščenje teče PRED poenotenjem prizorišč: ključ v PRIZORISCA je
     prizorišče + kraj, zato bi smet v kraju ("Rezidenca …|:: Ljubljana")
     razbila ujemanje in bi prizorišče ostalo nepoenoteno. */
  const ocisceno = ociscenKraj(z.kraj);
  let kraj = POPRAVKI_KRAJA[z.datumIso] ?? ocisceno.kraj;
  /* Ura iz vira ima prednost; iz kraja se vzame le, kadar polja ni. */
  let ura = z.ura ?? ocisceno.ura;
  let prizorisce = z.prizorisce;

  if (prizorisce) {
    const kljuc = `${prizorisce}|${kraj ?? ''}`;
    if (PRIZORISCA[kljuc]) {
      [prizorisce, kraj] = PRIZORISCA[kljuc];
    } else {
      neznanaPrizorisca.add(kljuc);
    }
  }

  let opis = (z.besedilo || '').trim();
  if (POPRAVKI_OPISA[z.datumIso]) opis = POPRAVKI_OPISA[z.datumIso](opis).trim();
  opis = opis.replace(/\s+/g, ' ').replace(/\s+\./g, '.');
  /* Teče po čiščenju in po popravkih, da se odloča o končnem besedilu, in
     pred izpeljavo zasedbe, ki bere isti opis. */
  opis = povrniKraj(kraj, opis, `${z.datumIso}-${slug(kraj || 'brez-kraja')}`);

  /* Neznana vrednost v polju zasedba ne sme tiho pasti na izpeljavo —
     izpeljava bi jo označila kot big band in nihče ne bi vedel. */
  let zapisanaZasedba = null;
  if (z.zasedba) {
    zapisanaZasedba = ZASEDBE[z.zasedba];
    if (!zapisanaZasedba) {
      throw new Error(
        `Neznana vrednost polja zasedba "${z.zasedba}" pri ${z.datumIso}. `
          + `Dopolni ZASEDBE v scripts/uvozi-arhiv.mjs. Znane: ${Object.keys(ZASEDBE).join(', ')}.`,
      );
    }
  }

  const vnos = {
    id: `${z.datumIso}-${slug(kraj || 'brez-kraja')}`,
    datumIso: z.datumIso,
    natancnost: z.natancnost,
    ura: ura ?? null,
    kraj: kraj ?? null,
    prizorisce: prizorisce ?? null,
    zasedba: zapisanaZasedba ?? izpeljanaZasedba(opis),
    zasedbaVir: zapisanaZasedba ? 'zapisano' : 'izpeljano',
    naziv: opis ? nazivIzBesedila(opis) : null,
    opis: opis || null,
    vir: z.vir,
  };
  /* Zastavica samo tam, kjer je res potrebna: vnosi brez besedila je treba
     v delovni datoteki najti z enim iskanjem. */
  if (!opis) vnos.zaDopolnitev = true;
  return vnos;
});

/* Najnovejši zgoraj — isti vrstni red kot ga bere stran. */
arhiv.sort((a, b) => b.datumIso.localeCompare(a.datumIso));

/* ---------- preverbe pred zapisom ------------------------------------- */

const idji = arhiv.map((v) => v.id);
const podvojeni = idji.filter((v, i) => idji.indexOf(v) !== i);
if (podvojeni.length > 0) {
  throw new Error(`Podvojeni id: ${[...new Set(podvojeni)].join(', ')}`);
}
const brezKraja = arhiv.filter((v) => !v.kraj);
if (brezKraja.length > 0) {
  throw new Error(`Vnosi brez kraja: ${brezKraja.map((v) => v.datumIso).join(', ')}`);
}
/* Predolg kraj pomeni, da je stolpec posrkal besedilo dogodka. Napaka je
   vidna šele na strani, in to kot 150 znakov dolgo „ime kraja" v vrstici —
   zato preverba. Najdaljši veljaven kraj v podatkih je "Wiener Neustadt,
   Avstrija" (25 znakov); prag je postavljen z rezervo. */
const NAJVEC_ZNAKOV_KRAJA = 40;
const dolgKraj = arhiv.filter((v) => (v.kraj ?? '').length > NAJVEC_ZNAKOV_KRAJA);
if (dolgKraj.length > 0) {
  throw new Error(
    `Kraj daljši od ${NAJVEC_ZNAKOV_KRAJA} znakov — stolpec je najbrž posrkal besedilo: `
      + dolgKraj.map((v) => `${v.datumIso} (${v.kraj.slice(0, 60)}…)`).join('; '),
  );
}

/* Zasedba: množica, nikoli prazna, brez ponovitev in znanih vrednosti. */
const ZNANE_ZASEDBE = ['big-band', 'combo'];
for (const v of arhiv) {
  const zas = v.zasedba;
  if (!Array.isArray(zas) || zas.length === 0) {
    throw new Error(`Zasedba pri ${v.id} ni neprazno polje: ${JSON.stringify(zas)}`);
  }
  for (const vrednost of zas) {
    if (!ZNANE_ZASEDBE.includes(vrednost)) {
      throw new Error(`Neznana zasedba "${vrednost}" pri ${v.id}.`);
    }
  }
  if (new Set(zas).size !== zas.length) {
    throw new Error(`Ponovljena zasedba pri ${v.id}: ${JSON.stringify(zas)}`);
  }
  if (v.zasedbaVir !== 'zapisano' && v.zasedbaVir !== 'izpeljano') {
    throw new Error(`Neveljaven zasedbaVir "${v.zasedbaVir}" pri ${v.id}.`);
  }
}

/* Ura mora biti HH:MM: iz nje src/lib/koncerti.ts sestavi `${datumIso}T${ura}:00`
   in izpis za slovenščino zamenja dvopičje s piko. Pika v podatkih bi oboje
   pokvarila, pa bi bilo na strani videti pravilno. */
const cudnaUra = arhiv.filter((v) => v.ura !== null && !/^\d{2}:\d{2}$/.test(v.ura));
if (cudnaUra.length > 0) {
  throw new Error(
    `Ura ni v obliki HH:MM: ${cudnaUra.map((v) => `${v.id} (${v.ura})`).join(', ')}`,
  );
}

/* ---------- preverba kodiranja ----------------------------------------
   Napačno prebran vir je tiha napaka: JSON je veljaven, build steče,
   pokaže se šele kot „obmo?je" ali „ÄŒatež" na objavljeni strani. Zato
   pade tu in ne tam.

   Oblika sta dve in nastaneta v nasprotnih smereh:

     U+FFFD (nadomestni znak) — bajt, ki ga dekodirnik ni znal razložiti
       in ga je zavrgel. Izvirnega znaka iz njega ni več mogoče dobiti.
     mojibake (ÄŒ, Å¾, Ã©) — UTF-8 bajti, brani kot latin-1/cp1252.
       Podatek je cel, le napačno razložen; popravljiv je s ponovnim
       branjem vira v pravem kodiranju.

   Mojibake se prepozna po paru: vodilni bajt UTF-8 (Â Ã Ä Å) in za njim
   nadaljevalni bajt, ki ga cp1252 preslika v enega od spodnjih znakov.
   Par je nujen — sam znak Å nastopa v skandinavskih, Ã v portugalskih
   imenih in bi lastno ime po krivem podrlo uvoz. */

const NADOMESTNI = String.fromCharCode(0xfffd);

/* Vodilni bajti UTF-8, kot jih izpiše latin-1: 0xC2–0xC5 (Â Ã Ä Å).
   Pokrivajo latinico 1 in 2, torej vse, kar nastopa v teh zapisih. */
const VODILNI_OD = 0xc2;
const VODILNI_DO = 0xc5;

/* Nadaljevalni bajt 0x80–0xBF, kot ga izpiše cp1252: bajti 0xA0–0xBF se
   preslikajo sami vase, 0x80–0x9F pa v tipografske znake spodaj. */
const CP1252_80_9F = [
  0x20ac, 0x81, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x8d, 0x017d, 0x8f, 0x90, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013,
  0x2014, 0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x9d, 0x017e, 0x0178,
];
const NADALJEVALNI = new Set(CP1252_80_9F);
for (let k = 0xa0; k <= 0xbf; k++) NADALJEVALNI.add(k);

function imaMojibake(s) {
  for (let i = 0; i < s.length - 1; i++) {
    const c = s.charCodeAt(i);
    if (c < VODILNI_OD || c > VODILNI_DO) continue;
    if (NADALJEVALNI.has(s.charCodeAt(i + 1))) return true;
  }
  return false;
}

const pokvarjeni = [];
for (const v of arhiv) {
  for (const [polje, vrednost] of Object.entries(v)) {
    if (typeof vrednost !== 'string') continue;
    if (vrednost.includes(NADOMESTNI)) {
      pokvarjeni.push({ id: v.id, polje, vrednost, vrsta: 'U+FFFD' });
    } else if (imaMojibake(vrednost)) {
      pokvarjeni.push({ id: v.id, polje, vrednost, vrsta: 'mojibake' });
    }
  }
}
if (pokvarjeni.length > 0) {
  const vrstice = [
    `Pokvarjeno kodiranje v ${pokvarjeni.length} poljih — NIČ ni zapisano:`,
    ...pokvarjeni.map((n) => `  ${n.id} · ${n.polje} (${n.vrsta}): ${n.vrednost.slice(0, 90)}`),
    'Popravi _vhod/zapisi.json — SQL dump je latin-1, ne UTF-8 — in poženi znova.',
  ];
  throw new Error(vrstice.join(String.fromCharCode(10)));
}

/* ---------- primerjava z ročnimi dopolnitvami -------------------------
   Skripta ročne datoteke ne spreminja. Prebere jo, da pove, kaj se je v
   viru premaknilo pod ročnim delom — odločitev je človekova. */

const POLJA_ROCNO = ['naziv', 'opis', 'zasedba', 'prizorisce', 'ura'];
const razhajanja = [];
const sirote = [];
const odvecni = [];

const imamoRocno = fs.existsSync(ROCNO);

if (imamoRocno) {
  const rocno = JSON.parse(fs.readFileSync(ROCNO, 'utf8')).vnosi ?? {};
  const poId = new Map(arhiv.map((v) => [v.id, v]));

  for (const [id, popravki] of Object.entries(rocno)) {
    const uvozen = poId.get(id);
    if (!uvozen) {
      sirote.push(id);
      continue;
    }
    for (const [polje, rocnaVrednost] of Object.entries(popravki)) {
      if (!POLJA_ROCNO.includes(polje)) continue;
      const uvozena = uvozen[polje] ?? null;
      if (uvozena === null) continue;
      if (uvozena === rocnaVrednost) odvecni.push({ id, polje });
      else razhajanja.push({ id, polje, uvozena, rocnaVrednost });
    }
  }
}

fs.writeFileSync(CILJ, JSON.stringify(arhiv, null, 1) + '\n');

/* ---------- poročilo --------------------------------------------------- */

const s = (n) => String(n).padStart(4);
console.log('Uvoz zgodovine dogodkov\n');
console.log(`  prebrano iz vira        ${s(zapisi.length)}`);
for (const [razlog, n] of Object.entries(izloceni)) console.log(`  − ${razlog.padEnd(21)}${s(n)}`);
console.log(`  − združenih podvojenih  ${s(kandidati.length - zdruzeni.length)}`);
console.log(`  = zapisano v arhiv      ${s(arhiv.length)}\n`);

const zNazivom = arhiv.filter((v) => v.naziv).length;
const zOpisom = arhiv.filter((v) => v.opis).length;
console.log(`  z nazivom (iz navednic) ${s(zNazivom)}  (${Math.round((zNazivom / arhiv.length) * 100)} %)`);
console.log(`  z opisom                ${s(zOpisom)}`);
console.log(`  za dopolnitev           ${s(arhiv.filter((v) => v.zaDopolnitev).length)}`);
console.log(`  s prizoriščem           ${s(arhiv.filter((v) => v.prizorisce).length)}`);
const zapisanaZ = arhiv.filter((v) => v.zasedbaVir === 'zapisano');
const izpeljanaZ = arhiv.filter((v) => v.zasedbaVir === 'izpeljano');
const jeCombo = (v) => v.zasedba.includes('combo');
const jeBigBand = (v) => v.zasedba.includes('big-band');
console.log(`  zasedba zapisana v viru ${s(zapisanaZ.length)}`);
console.log(`  zasedba izpeljana       ${s(izpeljanaZ.length)}`);
console.log(`     od tega combo        ${s(izpeljanaZ.filter(jeCombo).length)}  (zapis omenja combo ali malo zasedbo)`);
console.log(`     od tega big band     ${s(izpeljanaZ.filter((v) => !jeCombo(v)).length)}  (zapis male zasedbe ne omenja)`);
console.log(`  skupaj big band         ${s(arhiv.filter(jeBigBand).length)}`);
console.log(`  skupaj combo            ${s(arhiv.filter(jeCombo).length)}`);
console.log(`  oboje na istem dogodku  ${s(arhiv.filter((v) => v.zasedba.length > 1).length)}`);

if (povrnjeniKraji.length > 0) {
  console.log(`\n  kraj povrnjen v ime prireditve (${povrnjeniKraji.length}):`);
  console.log('  — vir ga ima v svojem stolpcu, zato je iz imena izpadel.');
  for (const p of povrnjeniKraji) console.log(`     ${p.id}: "${p.pred}" → "${p.po}"`);
}
console.log(`  z uro                   ${s(arhiv.filter((v) => v.ura).length)}`);

if (neznanaPrizorisca.size > 0) {
  console.log(`\n  prizorišča brez pravila za poenotenje (${neznanaPrizorisca.size}):`);
  console.log('  — to ni napaka; pravilo potrebujejo samo tista, ki se pišejo različno.');
  for (const p of [...neznanaPrizorisca].sort().slice(0, 8)) console.log(`     ${p}`);
  if (neznanaPrizorisca.size > 8) console.log(`     … in še ${neznanaPrizorisca.size - 8}`);
}

console.log(`\n  zapisano: ${path.relative(KOREN, CILJ)}`);
if (imamoRocno) {
  console.log(`  nedotaknjeno: ${path.relative(KOREN, ROCNO)}`);
} else {
  console.log(`  ročnih dopolnitev ni (${path.relative(KOREN, ROCNO)} ne obstaja).`);
}

/* ---------- razmerje do ročnih dopolnitev ------------------------------
   Skripta tu samo poroča. Kaj je pravilno, ve človek, ki je vnos vpisal. */

if (razhajanja.length > 0) {
  console.log(
    `\n  ⚠ vir se razhaja z ročnim zapisom (${razhajanja.length}) — ročna vrednost velja naprej:`,
  );
  for (const r of razhajanja) {
    console.log(`     ${r.id} · ${r.polje}`);
    console.log(`        vir:   ${JSON.stringify(r.uvozena)}`);
    console.log(`        ročno: ${JSON.stringify(r.rocnaVrednost)}`);
  }
  console.log(
    '     Odloči sam: če velja vir, izbriši polje iz arhiv-rocno.json;'
      + ' če velja ročni zapis, ga pusti.',
  );
}

if (sirote.length > 0) {
  console.log(
    `\n  ⚠ ročni vnosi brez zapisa v viru (${sirote.length}) — gradnja bo padla, dokler tega ne razrešiš:`,
  );
  for (const id of sirote) console.log(`     ${id}`);
  console.log(
    '     Vzrok je navadno spremenjen kraj v viru (id nastane iz datuma in kraja)'
      + ' ali izločen dogodek. Popravi ključ ali vnos odstrani.',
  );
}

if (odvecni.length > 0) {
  console.log(
    `\n  ročne vrednosti, ki jih vir zdaj navaja enako (${odvecni.length}) — smeš jih izbrisati:`,
  );
  for (const o of odvecni) console.log(`     ${o.id} · ${o.polje}`);
}

if (imamoRocno && razhajanja.length === 0 && sirote.length === 0) {
  console.log('  ročne dopolnitve so skladne z virom.');
}

/* ---------- zapis predlogov ------------------------------------------- */

const PREDLOGI = path.join(KOREN, '_vhod', 'predlogi.md');
const programi = najdiPredloge(arhiv, PREDLOGI_PROGRAMOV);
const prireditve = najdiPredloge(arhiv, PREDLOGI_PRIREDITEV);
const vnosovS = (skupine) => new Set(skupine.flatMap((s2) => s2.zadetki.map((v) => v.id)));
const sProgramom = vnosovS(programi);
const sPrireditvijo = vnosovS(prireditve);
const oboje = [...sProgramom].filter((id) => sPrireditvijo.has(id));
const pokriti = new Set([...sProgramom, ...sPrireditvijo]);

function razdelek(naslov, uvod, skupine) {
  const v = [`## ${naslov}`, '', uvod, ''];
  for (const s2 of skupine) {
    v.push(`### ${s2.naziv} — \`${s2.id}\` (${s2.zadetki.length})`);
    v.push('');
    v.push('| ✓ | datum | kraj | izsek iz vira |');
    v.push('|---|---|---|---|');
    for (const z2 of s2.zadetki) {
      const b = `${z2.naziv ?? ''} ${z2.opis ?? ''}`.trim();
      const cel = izsek(b, s2.vzorec).replace(/\|/g, '\\|');
      v.push(`| ☐ | ${z2.datumIso} | ${z2.kraj ?? '—'} | ${cel} |`);
    }
    v.push('');
    v.push('**Odločitev:** (id potrjen / drug id: … / ni program / ni prireditev)');
    v.push('');
  }
  return v;
}

const danes = arhiv[0]?.datumIso ?? '';
const vrsticeMd = [
  '# Predlogi: program in prireditev',
  '',
  `Nastalo z \`npm run arhiv\` iz ${arhiv.length} arhivskih zapisov. Najnovejši zapis v arhivu je ${danes}.`,
  '',
  '**To so predlogi, ne podatki.** Skripta jih ne vpisuje nikamor — v arhivu polj',
  '\`program\` in \`prireditev\` (še) ni. Register bo nastal iz tega seznama, ko ga',
  'potrdiš, in ne obratno.',
  '',
  '**Kako potrjuješ:** v stolpcu ✓ zamenjaj ☐ z ✅ (drži) ali ✗ (ne drži), pod vsako',
  'skupino pa dopolni vrstico *Odločitev*. Datoteka je tvoja — skripta je ne prepiše,',
  'dokler obstaja.',
  '',
  '**Razvrščeno po pogostosti:** najprej imena z največ nastopi, ker se tam odločitev',
  'najbolj splača.',
  '',
  '## Pregled',
  '',
  '| | Imen | Vnosov |',
  '|---|---|---|',
  `| program | ${programi.length} | ${sProgramom.size} |`,
  `| prireditev | ${prireditve.length} | ${sPrireditvijo.size} |`,
  `| **skupaj pokritih** | | **${pokriti.size}** od ${arhiv.length} |`,
  `| brez obojega | | ${arhiv.length - pokriti.size} |`,
  '',
  `Vnosov, ki imajo **oboje hkrati**: ${oboje.length}`,
  `— ${oboje.join(', ') || '—'}`,
  '',
  'To je razlog za dve ločeni polji namesto enega s tipom: program se **izvaja na**',
  'prireditvi.',
  '',
  ...razdelek(
    'Programi',
    'Lasten projekt orkestra, ki živi prek več nastopov.',
    programi,
  ),
  ...razdelek(
    'Prireditve',
    'Dogodek nekoga drugega, na katerem je BBG nastopil.',
    prireditve,
  ),
];

if (fs.existsSync(PREDLOGI)) {
  console.log(
    `\n  predlogi: ${path.relative(KOREN, PREDLOGI)} že obstaja — NE prepisujem.`,
  );
  console.log('     V datoteki so lahko tvoje odločitve. Za osvežitev jo izbriši ali preimenuj.');
} else {
  fs.mkdirSync(path.dirname(PREDLOGI), { recursive: true });
  fs.writeFileSync(PREDLOGI, vrsticeMd.join(String.fromCharCode(10)) + String.fromCharCode(10));
  console.log(`\n  predlogi zapisani: ${path.relative(KOREN, PREDLOGI)}`);
}
console.log(
  `     program ${programi.length} imen / ${sProgramom.size} vnosov · `
    + `prireditev ${prireditve.length} imen / ${sPrireditvijo.size} vnosov · `
    + `oboje ${oboje.length} · skupaj ${pokriti.size} od ${arhiv.length}`,
);
