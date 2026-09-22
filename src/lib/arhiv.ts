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
import { formatDatum } from './koncerti';
import type { Jezik } from '../i18n';

export type ZasedbaArhiva = 'big-band' | 'combo';

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
}

/* Polja, ki jih sme prepisati ročna datoteka.
   `kraj` namenoma NI med njimi: id je izpeljan iz datuma in kraja, zato
   bi ročna sprememba kraja pomenila, da ključ kaže na zapis, ki ga po
   svojem kraju ni več mogoče najti. Napačen kraj se popravi v viru. */
const POLJA_ROCNO = ['naziv', 'opis', 'zasedba', 'prizorisce', 'ura'] as const;
type PoljeRocno = (typeof POLJA_ROCNO)[number];
type RocniPopravki = Partial<{
  naziv: string | null;
  opis: string | null;
  prizorisce: string | null;
  ura: string | null;
  zasedba: ZasedbaArhiva[];
}>;

const uvozeni = uvozData as unknown as ArhivVnos[];
const rocni = ((rocnoData as { vnosi?: unknown }).vnosi ?? {}) as Record<string, RocniPopravki>;

const ZASEDBE: ZasedbaArhiva[] = ['big-band', 'combo'];

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
    if (!(POLJA_ROCNO as readonly string[]).includes(polje)) {
      throw new Error(
        `Arhiv: ročni vnos "${id}" prepisuje polje "${polje}", ki ni dovoljeno. `
          + `Dovoljena: ${POLJA_ROCNO.join(', ')}.`,
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
  const zdruzen = { ...v, ...popravki } as ArhivVnos;
  /* Zastavica velja za vnose brez opisa; ročno dopisan opis jo pobriše. */
  if (zdruzen.opis) delete zdruzen.zaDopolnitev;
  /* Ročno vpisana zasedba ni ne zapisana ne izpeljana — ima svoj izvor.
     Brez tega bi popravek izpeljane vrednosti ostal videti kot izpeljava. */
  if (popravki.zasedba) zdruzen.zasedbaVir = 'rocno';
  return zdruzen;
});

/** Najnovejši zgoraj. Vrstni red je že v datoteki; tu ga zagotovimo. */
export const ARHIV: ArhivVnos[] = [...vnosi].sort((a, b) => b.datumIso.localeCompare(a.datumIso));

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
export function opisZaIzpis(v: ArhivVnos): string | null {
  if (!v.opis) return null;
  if (!v.naziv) return v.opis;
  const ubezan = v.naziv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const vodilni = new RegExp(`^[„"'“]${ubezan}["'”]\\s*[;.,]?\\s*`);
  const ostanek = v.opis.replace(vodilni, '').trim();
  return ostanek === '' ? null : ostanek;
}
