/* ============================================================
   Arhiv dogodkov — 291 zapisov iz let 1998–2026.

   Ločen od koncerti.json namenoma. Utemeljitev je v
   docs/uvoz-zgodovine.md; na kratko: arhivski zapis nima naziva, opisa
   za SEO ne sluga, model koncertov pa vse troje zahteva. Vsiliti ga bi
   pomenilo izmisliti si 291 nazivov in ustvariti 582 tankih podstrani.

   Arhiv je zato SEZNAM, ne zbirka strani: ena stran /arhiv (in
   /en/archive), brez podstrani in brez vpisov v sitemap razen same
   strani.

   DVE DATOTEKI, ENA VRSTA PODATKOV:

     src/data/arhiv-uvoz.json   stroj. Nastane iz _vhod/zapisi.json prek
                                `npm run arhiv`. Vsak zagon jo prepiše v
                                celoti. Sem se ročno NE piše.
     src/data/arhiv-rocno.json  človek. Skripta je nikoli ne piše. Sem
                                gredo dopolnjeni nazivi in popravki.

   Tu se združita: ročna vrednost prevlada nad uvoženo. Ločeni sta zato,
   ker bi ročno delo v skupni datoteki uničil prvi ponovni zagon uvoza —
   in ker se tako v gitu vidi, kaj je človekova odločitev in kaj strojni
   prepis.
   ============================================================ */
import uvozData from '../data/arhiv-uvoz.json';
import rocnoData from '../data/arhiv-rocno.json';
import { formatDatum, koncertiVsi, potDogodka, type Koncert } from './koncerti';
import { jePrihajajoc, natancnostDatuma } from './datumi.mjs';
import type { Jezik } from '../i18n';

/** Dodani sta `mladinski` in `izobrazevalni`: v arhiv se zlivajo tudi
    pretekli dogodki iz koncerti.json, ki poznata obe. */
export type ZasedbaArhiva = 'big-band' | 'combo' | 'mladinski' | 'izobrazevalni';

/**
 * Od kod je zasedba znana.
 *
 * `zapisano` — vir jo je navedel (44 od 291 vnosov).
 * `izpeljano` — sklep iz besedila po domenskem pravilu: kjer zapis ne
 *   omenja comba ali male zasedbe, je igral big band. Pravilo je v
 *   scripts/uvozi-arhiv.mjs; tu je samo njegov rezultat.
 * `rocno` — človek jo je vpisal v arhiv-rocno.json. Nastane šele ob
 *   združitvi; uvoz te vrednosti ne zapiše. Brez nje bi ročni popravek
 *   izpeljane vrednosti ostal videti kot izpeljava.
 *
 * Polje obstaja zato, ker je 210 vnosov označenih kot big band na
 * podlagi ODSOTNOSTI besede. Kdor bo kdaj našel dokaz o nasprotnem,
 * mora videti, da popravlja privzetek in ne zabeleženega podatka.
 */
export type ZasedbaVir = 'zapisano' | 'izpeljano' | 'rocno';

export interface ArhivVnos {
  id: string;
  /** 'YYYY-MM-DD' ali 'YYYY-MM', kadar je znan samo mesec. */
  datumIso: string;
  natancnost: 'dan' | 'mesec';
  ura: string | null;
  kraj: string | null;
  prizorisce: string | null;
  /* Polja s končnico En obstajajo samo pri vnosih iz koncerti.json —
     arhivski vir je slovenski in prevodov nima. Kjer jih ni, koda pade
     nazaj na slovensko, enako kot povsod drugod v podatkih. */
  prizorisceEn?: string | null;
  nazivEn?: string | null;
  opisEn?: string | null;
  /** Množica, ne ena vrednost: na istem dogodku sta lahko nastopila oba. */
  zasedba: ZasedbaArhiva[];
  zasedbaVir: ZasedbaVir;
  /** Vpisan samo, kadar ga je vir res navedel; sicer ga dopolni človek. */
  naziv: string | null;
  opis: string | null;
  /** Provenienca. Interna — na strani se ne izpisuje. */
  vir: string;
  /** Vnos brez opisa; v delovni datoteki ga je treba najti z enim iskanjem. */
  zaDopolnitev?: boolean;
  /**
   * Iz katere datoteke vnos je.
   *
   * `arhiv` — arhiv-uvoz.json (+ arhiv-rocno.json); vrstica brez strani.
   * `koncerti` — pretekli dogodek iz koncerti.json; ima svojo podstran.
   */
  izvor: 'arhiv' | 'koncerti';
  /** Samo pri `izvor: 'koncerti'`: naslova podstrani in vrsta vstopa. */
  slug?: string;
  slugEn?: string;
  vstop?: 'vstopnice' | 'prost' | 'zaprt';
}

/* Polja, ki jih sme prepisati ročna datoteka.
   `kraj` namenoma NI med njimi: id je izpeljan iz datuma in kraja, zato
   bi ročna sprememba kraja pomenila, da ključ kaže na zapis, ki ga po
   svojem kraju ni več mogoče najti. Napačen kraj se popravi v viru. */
const POLJA_ROCNO = ['naziv', 'opis', 'zasedba', 'prizorisce', 'ura'] as const;
/** Dovoljen, a se ne zlije: razlog za ročni popravek. */
const POLJE_OPOMBA = 'opomba';
type PoljeRocno = (typeof POLJA_ROCNO)[number];
type RocniPopravki = Partial<{
  naziv: string | null;
  opis: string | null;
  prizorisce: string | null;
  ura: string | null;
  zasedba: ZasedbaArhiva[];
  /** Razlog za popravek. Dokumentacija, ne podatek — v vnos se ne zlije. */
  opomba: string;
}>;

const uvozeni = uvozData as unknown as ArhivVnos[];
const rocni = ((rocnoData as { vnosi?: unknown }).vnosi ?? {}) as Record<string, RocniPopravki>;

const ZASEDBE: ZasedbaArhiva[] = ['big-band', 'combo', 'mladinski', 'izobrazevalni'];

function preveriZasedbo(zasedba: unknown, kje: string): asserts zasedba is ZasedbaArhiva[] {
  if (!Array.isArray(zasedba) || zasedba.length === 0) {
    throw new Error(
      `Arhiv: zasedba pri ${kje} ni neprazno polje (${JSON.stringify(zasedba)}). `
        + 'Zasedba je množica — na istem dogodku sta lahko nastopila oba.',
    );
  }
  for (const vrednost of zasedba) {
    if (!ZASEDBE.includes(vrednost as ZasedbaArhiva)) {
      throw new Error(
        `Arhiv: neznana zasedba "${vrednost}" pri ${kje}. Dovoljeni: ${ZASEDBE.join(', ')}.`,
      );
    }
  }
  if (new Set(zasedba).size !== zasedba.length) {
    throw new Error(`Arhiv: ponovljena zasedba pri ${kje}: ${JSON.stringify(zasedba)}.`);
  }
}

/* ---------- preverba uvoženih ----------------------------------------
   Enako strogo kot pri koncertih in podpornikih. */
const vidaneId = new Set<string>();
for (const v of uvozeni) {
  v.izvor = 'arhiv';
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(v.datumIso)) {
    throw new Error(`Arhiv: neveljaven datumIso "${v.datumIso}" pri ${v.id}.`);
  }
  preveriZasedbo(v.zasedba, v.id);
  if (v.zasedbaVir !== 'zapisano' && v.zasedbaVir !== 'izpeljano') {
    throw new Error(
      `Arhiv: neveljaven zasedbaVir "${v.zasedbaVir}" pri ${v.id}. `
        + 'Uvoz ga vedno zapiše; vrednost "rocno" nastane šele ob združitvi.',
    );
  }
  if (vidaneId.has(v.id)) throw new Error(`Arhiv: podvojen id "${v.id}".`);
  vidaneId.add(v.id);
}

/* ---------- preverba ročnih ------------------------------------------
   Ročni vnos brez zapisa v uvozu je tiha izguba dela: vrednost je
   vpisana, na strani je ni. Zato pade gradnja in ne izpis. */
for (const [id, popravki] of Object.entries(rocni)) {
  if (!vidaneId.has(id)) {
    throw new Error(
      `Arhiv: ročni vnos "${id}" v arhiv-rocno.json nima zapisa v arhiv-uvoz.json. `
        + 'Id nastane iz datuma in kraja — če se je kraj v viru spremenil, popravi ključ; '
        + 'če je dogodek izpadel, vnos odstrani.',
    );
  }
  for (const [polje, vrednost] of Object.entries(popravki)) {
    /* `opomba` je razlog za popravek, ne podatek. JSON komentarjev nima,
       vrednost `null` pa brez razlage čez leto dni ne pove ničesar — zato
       ima vsak ročni vnos mesto za svoj zakaj. V vnos se NE zlije. */
    if (polje === POLJE_OPOMBA) {
      if (typeof vrednost !== 'string' || vrednost.trim() === '') {
        throw new Error(`Arhiv: opomba pri "${id}" mora biti neprazen niz.`);
      }
      continue;
    }
    if (!(POLJA_ROCNO as readonly string[]).includes(polje)) {
      throw new Error(
        `Arhiv: ročni vnos "${id}" prepisuje polje "${polje}", ki ni dovoljeno. `
          + `Dovoljena: ${POLJA_ROCNO.join(', ')} in ${POLJE_OPOMBA}.`,
      );
    }
    if (polje === 'zasedba') {
      preveriZasedbo(vrednost, `ročnem vnosu ${id}`);
      continue;
    }
    if (vrednost !== null && typeof vrednost !== 'string') {
      throw new Error(`Arhiv: ročna vrednost "${id}.${polje}" ni niz ne null.`);
    }
    if (typeof vrednost === 'string' && vrednost.trim() === '') {
      throw new Error(
        `Arhiv: ročna vrednost "${id}.${polje}" je prazen niz. `
          + 'Za "ni podatka" vpiši null, za "izbriši popravek" polje odstrani.',
      );
    }
  }
}

/* ---------- združitev -------------------------------------------------
   Ročna vrednost prevlada. Razhajanje med virom in ročnim zapisom javi
   `npm run arhiv`; tu se ne odloča, tu se samo uporabi. */
const vnosi: ArhivVnos[] = uvozeni.map((v) => {
  const popravki = rocni[v.id];
  if (!popravki) return v;
  /* `opomba` pove, ZAKAJ je popravek tu, in ne sme v vnos — drugače bi
     se razlog znašel med podatki in slej ko prej na strani. */
  const { [POLJE_OPOMBA]: _razlog, ...vrednosti } = popravki;
  const zdruzen = { ...v, ...vrednosti } as ArhivVnos;
  /* Zastavica velja za vnose brez opisa; ročno dopisan opis jo pobriše. */
  if (zdruzen.opis) delete zdruzen.zaDopolnitev;
  /* Ročno vpisana zasedba ni ne zapisana ne izpeljana — ima svoj izvor.
     Brez tega bi popravek izpeljane vrednosti ostal videti kot izpeljava. */
  if (vrednosti.zasedba) zdruzen.zasedbaVir = 'rocno';
  return zdruzen;
});

/* ---------- pretekli dogodki iz koncerti.json -------------------------
   Dogodek, ki preteče, izpade iz napovednika. Če ga ni tudi v arhivskem
   viru, ni nikjer — in arhivski vir je strojni prepis stare strani, ki o
   novih dogodkih ne ve ničesar in nikoli ne bo. Zato se pretekli dogodki
   iz koncerti.json zlijejo v arhiv OB GRADNJI.

   Zliva se tu in ne z vpisovanjem v arhiv-uvoz.json: tista datoteka je
   izhod `npm run arhiv` in koncerti.json ni njen vir. Vsak vpis bi
   naslednji zagon pobrisal.

   Merilo za prehod je ISTO kot za napovednik — `jePrihajajoc` nad
   `datumKonecIso ?? datumIso`. Ista funkcija in isti argument pomenita,
   da dogodek ne more biti hkrati v obeh ali za en dan v nobenem. */

/** Prizorišče brez pripetega kraja: v koncerti.json je `lokacija.naziv`
    pogosto "Vrt Lili Novy, Ljubljana", vrstica arhiva pa kraj izpiše
    posebej in bi ga podvojila. */
function prizorisceBrezKraja(naziv: string, kraj: string): string {
  const rep = new RegExp(`,\\s*${kraj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
  return naziv.replace(rep, '').trim() || naziv;
}

function izKoncerta(k: Koncert): ArhivVnos | null {
  const natancnost = natancnostDatuma(k.datumIso);
  /* Brez razvrstljivega datuma vnosa v kronološki seznam ni kam dati.
     Isti pogoj že velja v napovedniku (glej jePrihajajoc v datumi.mjs). */
  if (!k.datumIso || natancnost === null) return null;
  const kraj = k.lokacija?.kraj ?? null;
  return {
    id: k.id,
    datumIso: k.datumIso,
    natancnost,
    ura: k.ura,
    kraj,
    prizorisce: k.lokacija && kraj ? prizorisceBrezKraja(k.lokacija.naziv, kraj) : null,
    prizorisceEn:
      k.lokacija?.nazivEn && kraj ? prizorisceBrezKraja(k.lokacija.nazivEn, kraj) : null,
    /* Zasedba je v koncerti.json vpisana in ne izpeljana — zato
       'zapisano'. Vrednost je ena; polje je množica zaradi arhivskih
       vnosov, kjer sta lahko nastopili obe zasedbi. */
    zasedba: [k.zasedba],
    zasedbaVir: 'zapisano',
    naziv: k.naziv,
    nazivEn: k.nazivEn ?? null,
    opis: k.opis,
    opisEn: k.opisEn ?? null,
    vir: 'koncerti.json',
    izvor: 'koncerti',
    slug: k.slug,
    slugEn: k.slugEn,
    vstop: k.vstop.tip,
  };
}

/** Ključ za ujemanje med viroma. Isti ključ, iz katerega uvozna skripta
    sestavi `id` arhivskega vnosa (datum + kraj), le brez sluganja — tu
    primerjamo surova niza in ne potrebujemo pravila za pretvorbo. */
const kljucDogodka = (datumIso: string, kraj: string | null) => `${datumIso}|${kraj ?? ''}`;

const preteklikoncerti = koncertiVsi
  .filter((k) => !jePrihajajoc(k.datumKonecIso ?? k.datumIso))
  .map(izKoncerta)
  .filter((v): v is ArhivVnos => v !== null);

/* Dogodek, ki je v obeh virih, prevzame zapis iz koncerti.json: ta ima
   naziv, opis, uro, prizorišče in podstran, arhivski vir pa je skopa
   vrstica. ⚠️ Ujemanje je po datumu in kraju, torej po istem ključu, po
   katerem je arhiv že zdaj enoličen. Dva RAZLIČNA dogodka istega dne v
   istem kraju bi se zato zlila v enega — ista omejitev, kot jo ima id
   arhiva, in zaenkrat brez primera v podatkih. */
const kljuciKoncertov = new Set(preteklikoncerti.map((v) => kljucDogodka(v.datumIso, v.kraj)));
const brezPodvojenih = vnosi.filter((v) => !kljuciKoncertov.has(kljucDogodka(v.datumIso, v.kraj)));

/** Najnovejši zgoraj. Vrstni red je že v datoteki; tu ga zagotovimo. */
export const ARHIV: ArhivVnos[] = [...brezPodvojenih, ...preteklikoncerti]
  /* ⚠️ Isto merilo velja tudi za arhivske vnose, ne le za tiste iz
     koncerti.json. Preglednica 2019–2026 je v vir prinesla tudi še
     nenastopljene datume; brez tega bi bil tak dogodek hkrati kartica na
     naslovnici in vrstica v arhivu. Ko preteče, se vrne sam — iz
     koncerti.json, če ga ima, sicer iz uvoza. */
  .filter((v) => !jePrihajajoc(v.datumIso))
  .sort((a, b) => b.datumIso.localeCompare(a.datumIso));

export const LETA: number[] = [...new Set(ARHIV.map((v) => Number(v.datumIso.slice(0, 4))))].sort(
  (a, b) => b - a,
);

/** Vnosi po letih, najnovejše leto prvo. */
export function poLetih(): { leto: number; vnosi: ArhivVnos[] }[] {
  return LETA.map((leto) => ({
    leto,
    vnosi: ARHIV.filter((v) => Number(v.datumIso.slice(0, 4)) === leto),
  }));
}

/**
 * Števci za filtre.
 *
 * Zasedba se šteje po VSEBOVANOSTI in ne po enakosti: dogodek, na katerem
 * sta nastopila oba, se šteje pri obeh izbirah. Vsota big band + combo
 * zato lahko preseže število vseh vnosov. To ni napaka in stran to na
 * mestu, kjer se pozna, tudi pove — glej `obeZasedbi`.
 *
 * Izbire „ni zapisano" ni več: zasedbo ima zdaj vsak vnos, pri 247 od 291
 * izpeljano iz besedila. Koliko jih je izpeljanih, pove `izpeljanih`;
 * stran to izpiše v uvodu, da število ne obljublja več, kot je vredno.
 */
export function stevci() {
  const zasedba = {
    vse: ARHIV.length,
    bigBand: ARHIV.filter((v) => v.zasedba.includes('big-band')).length,
    combo: ARHIV.filter((v) => v.zasedba.includes('combo')).length,
    /* Zasedbi, ki ju pozna samo koncerti.json. Izbiri se izpišeta le,
       kadar v arhivu res kaj je — sicer bi gumb z 0 obljubljal vsebino. */
    mladinski: ARHIV.filter((v) => v.zasedba.includes('mladinski')).length,
    izobrazevalni: ARHIV.filter((v) => v.zasedba.includes('izobrazevalni')).length,
    obeZasedbi: ARHIV.filter((v) => v.zasedba.length > 1).length,
    izpeljanih: ARHIV.filter((v) => v.zasedbaVir === 'izpeljano').length,
  };
  const kraj = {
    vse: ARHIV.length,
    grosuplje: ARHIV.filter((v) => v.kraj === 'Grosuplje').length,
    ljubljana: ARHIV.filter((v) => v.kraj === 'Ljubljana').length,
    drugje: ARHIV.filter((v) => v.kraj !== 'Grosuplje' && v.kraj !== 'Ljubljana').length,
  };
  return { zasedba, kraj };
}

/** Oznaka kraja za filter; ujema se z data atributom na vrstici. */
export function kljucKraja(kraj: string | null): 'grosuplje' | 'ljubljana' | 'drugje' {
  if (kraj === 'Grosuplje') return 'grosuplje';
  if (kraj === 'Ljubljana') return 'ljubljana';
  return 'drugje';
}

/** Datum za izpis; oblikovanje je isto kot pri koncertih. */
export function datumZaIzpis(v: ArhivVnos, jezik: Jezik, ob: string): string {
  return formatDatum(v.datumIso, v.ura, jezik, ob) ?? v.datumIso;
}

/**
 * Pot do podstrani dogodka, kadar jo vnos ima.
 *
 * Arhivski vnosi je nimajo — to je vrstica, ne stran. Imajo jo vnosi iz
 * koncerti.json.
 *
 * ⚠️ Zaprt dogodek povezave NE dobi. Njegova podstran nosi `noindex` in
 * je izločena iz sitemapa prav zato, da je ne najde nekdo, ki ni bil
 * povabljen; javna povezava iz arhiva bi to razveljavila. Vrstica sama
 * ostane — dogodek se je zgodil in v kroniki mu je mesto.
 */
export function potVnosa(v: ArhivVnos, jezik: Jezik): string | null {
  if (v.izvor !== 'koncerti' || !v.slug || !v.slugEn) return null;
  if (v.vstop === 'zaprt') return null;
  return potDogodka(jezik === 'en' ? v.slugEn : v.slug, jezik);
}

/**
 * Opis brez vodilne ponovitve naziva.
 *
 * Kjer je naziv izluščen iz opisa, ga opis še vedno nosi. Obliki sta dve:
 *
 *   A  naziv VODI opis — `"Images"; gostje Klara Lavriša, Žan Cesar`
 *   B  naziv je SREDI stavka — `Nastop na prireditvi "Grosuplje v jeseni".`
 *
 * Odrežemo samo obliko A (3 od 22 vnosov). Pri obliki B je naziv del
 * stavka in bi izrez pustil luknjo — `Nastop na prireditvi .` — zato se
 * je ne dotikamo.
 *
 * Odrez je SAMO ob izrisu: `opis` v podatkih ostane cel, zato je
 * odločitev obrnljiva brez ponovnega uvoza.
 *
 * Vrne `null`, kadar od opisa ne ostane nič — takrat naj izris ne pokaže
 * ničesar. To ni isto kot vnos brez opisa: naziv je izpisan nad njim.
 */
export function opisZaIzpis(v: ArhivVnos, jezik: Jezik): string | null {
  const opis = (jezik === 'en' ? (v.opisEn ?? v.opis) : v.opis) ?? null;
  const naziv = nazivZaIzpis(v, jezik);
  if (!opis) return null;
  if (!naziv) return opis;
  const ubezan = naziv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const vodilni = new RegExp(`^[„"'“]${ubezan}["'”]\\s*[;.,]?\\s*`);
  const ostanek = opis.replace(vodilni, '').trim();
  return ostanek === '' ? null : ostanek;
}

/** Naziv v jeziku strani; brez angleškega pade nazaj na slovenskega. */
export function nazivZaIzpis(v: ArhivVnos, jezik: Jezik): string | null {
  return (jezik === 'en' ? (v.nazivEn ?? v.naziv) : v.naziv) ?? null;
}

/** Prizorišče v jeziku strani; brez angleškega pade nazaj na slovensko. */
export function prizorisceZaIzpis(v: ArhivVnos, jezik: Jezik): string | null {
  return (jezik === 'en' ? (v.prizorisceEn ?? v.prizorisce) : v.prizorisce) ?? null;
}
