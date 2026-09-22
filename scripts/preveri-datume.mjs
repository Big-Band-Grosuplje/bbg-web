/* ============================================================
   Preverba datumske logike in datumov v koncerti.json.

       npm run datumi

   Zakaj obstaja: dve napaki, ki ju gradnja sama ne ujame, ker se obe
   kažeta kot pravilno zgrajena stran z napačno vsebino.

     1. jePrihajajoc() je do 22. 9. 2026 za vsak neprepoznan zapis datuma
        vrnil true. Vnos brez datuma ali s samo letnico bi zato ostal v
        napovedniku za vedno. Nič ne pade, nič ne opozori — koncert iz
        leta 2003 preprosto stoji med prihajajočimi.
     2. Zapis, ki oblike ne ustreza, ne dobi ne prikaza datuma ne JSON-LD.
        Na strani to izgleda kot dogodek brez datuma, v izvorni kodi pa
        kot manjkajoča oznaka — oboje je tiho.

   Skripta preveri logiko na vnaprej znanih primerih IN dejanske datume v
   src/data/koncerti.json. Ob napaki vrne izhodno kodo 1 in ustavi potek v
   GitHub Actions.

   Logika pride iz src/lib/datumi.mjs in ni prepisana sem: kopija bi se
   razšla in preverba bi potrjevala samo sebe.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jePrihajajoc, natancnostDatuma } from '../src/lib/datumi.mjs';

const koren = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* Pritrjen trenutek, da izid ni odvisen od dneva izvajanja. */
const ZDAJ = new Date('2026-09-22T00:00:00Z');

const napake = [];

function trdi(opis, dobljeno, pricakovano) {
  const ok = dobljeno === pricakovano;
  if (!ok) napake.push(`${opis}: dobljeno ${JSON.stringify(dobljeno)}, pričakovano ${JSON.stringify(pricakovano)}`);
  return ok;
}

/* --- 1. Natančnost ------------------------------------------------- */
trdi('natancnostDatuma("2026-12-13")', natancnostDatuma('2026-12-13'), 'dan');
trdi('natancnostDatuma("2026-12")', natancnostDatuma('2026-12'), 'mesec');
trdi('natancnostDatuma("2003")', natancnostDatuma('2003'), null);
trdi('natancnostDatuma(null)', natancnostDatuma(null), null);
trdi('natancnostDatuma(undefined)', natancnostDatuma(undefined), null);
trdi('natancnostDatuma("")', natancnostDatuma(''), null);
trdi('natancnostDatuma("13. 12. 2026")', natancnostDatuma('13. 12. 2026'), null);
trdi('natancnostDatuma("2026-12-13T19:00")', natancnostDatuma('2026-12-13T19:00'), null);

/* --- 2. Prihajajoč ------------------------------------------------- *
   Jedro popravka: neznan datum ni prihodnost. */
trdi('jePrihajajoc(null) — neznan datum ni prihodnost', jePrihajajoc(null, ZDAJ), false);
trdi('jePrihajajoc(undefined)', jePrihajajoc(undefined, ZDAJ), false);
trdi('jePrihajajoc("2003") — sama letnica ni prihodnost', jePrihajajoc('2003', ZDAJ), false);
trdi('jePrihajajoc("nekaj")', jePrihajajoc('nekaj', ZDAJ), false);

trdi('jePrihajajoc("2026-12-13") — prihodnost', jePrihajajoc('2026-12-13', ZDAJ), true);
trdi('jePrihajajoc("2026-09-22") — danes je še prihajajoč', jePrihajajoc('2026-09-22', ZDAJ), true);
trdi('jePrihajajoc("2026-09-21") — včeraj je mimo', jePrihajajoc('2026-09-21', ZDAJ), false);
trdi('jePrihajajoc("1998-02-18") — zgodovina', jePrihajajoc('1998-02-18', ZDAJ), false);

/* Mesečna natančnost velja do konca meseca. */
trdi('jePrihajajoc("2026-09") — tekoči mesec še traja', jePrihajajoc('2026-09', ZDAJ), true);
trdi('jePrihajajoc("2026-08") — pretekli mesec', jePrihajajoc('2026-08', ZDAJ), false);
trdi('jePrihajajoc("2026-10") — prihodnji mesec', jePrihajajoc('2026-10', ZDAJ), true);
trdi('jePrihajajoc("2003-06") — zgodovinski mesec', jePrihajajoc('2003-06', ZDAJ), false);

/* --- 3. Dejanski podatki ------------------------------------------- */
const podatki = JSON.parse(fs.readFileSync(path.join(koren, 'src/data/koncerti.json'), 'utf8'));
const slabi = podatki.koncerti.filter((k) => natancnostDatuma(k.datumIso) === null);
for (const k of slabi) {
  napake.push(
    `koncerti.json: "${k.id}" ima datumIso ${JSON.stringify(k.datumIso)} — ` +
      'ni ne YYYY-MM-DD ne YYYY-MM',
  );
}
/* datumKonecIso je neobvezen, a kadar je vpisan, mora biti poln datum:
   razpon se izriše po dnevih. */
for (const k of podatki.koncerti) {
  if (k.datumKonecIso != null && natancnostDatuma(k.datumKonecIso) !== 'dan') {
    napake.push(
      `koncerti.json: "${k.id}" ima datumKonecIso ${JSON.stringify(k.datumKonecIso)} — ` +
        'večdnevni dogodek potrebuje poln datum YYYY-MM-DD',
    );
  }
}

/* --- Izid ----------------------------------------------------------- */
if (napake.length > 0) {
  console.error('DATUMI PADEJO\n');
  for (const n of napake) console.error(`  ${n}`);
  console.error(
    '\nKaj storiti:\n' +
      '  · Če je padla logika, je pokvarjen src/lib/datumi.mjs — preveri\n' +
      '    natancnostDatuma() in jePrihajajoc(). Neznan datum mora vrniti false.\n' +
      '  · Če je padel podatek, ima vnos v src/data/koncerti.json datum v obliki,\n' +
      '    ki je model ne pozna. Sama letnica ("2003") danes ni podprta —\n' +
      '    predlog razširitve je v docs/predlog-nenatancni-datumi.md.',
  );
  process.exit(1);
}

console.log(
  `Datumi so v redu: ${podatki.koncerti.length} vnosov v koncerti.json, ` +
    'logika prestala vse primere.',
);
