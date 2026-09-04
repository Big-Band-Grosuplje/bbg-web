/* ============================================================
   Prenos sličic posnetkov z YouTuba v src/assets/mediji-thumbs/<id>.jpg.

   Zakaj sploh: sličice so bile prej vezane neposredno na i.ytimg.com, zato
   je Google dobil IP obiskovalca že ob nalaganju strani — brez klika na
   posnetek. Zdaj jih gostimo sami.

   Zakaj to NI del `npm run build`: prenesene sličice so v gitu, produkcijski
   build (Vercel) pa ne sme klicati YouTuba. Skripto zato zaženeš ročno ob
   dodajanju posnetka:

       npm run slicice

   Če sličice manjka, build pade z napako iz `slicicaZa` v src/lib/mediji.ts
   in ne izpiše tiho prazne slike.

   Različica: najprej maxresdefault (1280×720, brez črnih pasov), ker je
   ostrejša; kadar je posnetek ni, pade na hqdefault (480×360 s pasovoma).
   Katera je prišla, se v podatke NE zapiše — komponenta to prebere iz
   razmerja stranic same datoteke, da se zapisa ne moreta raziti.
   ============================================================ */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PODATKI = path.join(KOREN, 'src', 'data', 'mediji.json');
const IZHOD = path.join(KOREN, 'src', 'assets', 'mediji-thumbs');

/* Vrstni red je vrstni red poskusov. */
const RAZLICICE = ['maxresdefault', 'hqdefault'];

/* YouTube za manjkajoč maxresdefault vrne 404, a se je zanesti samo na
   status prekratko: nekatera vozlišča vrnejo nadomestno sliko 120×90.
   Zato preverimo še dolžino telesa. */
const NAJMANJSA_DOLZINA = 3000;

function url(id, razlicica) {
  return `https://i.ytimg.com/vi/${id}/${razlicica}.jpg`;
}

async function preveri(naslov) {
  try {
    const o = await fetch(naslov, { method: 'HEAD', redirect: 'follow' });
    const dolzina = Number(o.headers.get('content-length') ?? '0');
    const vrsta = o.headers.get('content-type') ?? '';
    return o.ok && vrsta.startsWith('image/') && dolzina >= NAJMANJSA_DOLZINA;
  } catch (e) {
    return false;
  }
}

async function prenesi(naslov) {
  const o = await fetch(naslov, { redirect: 'follow' });
  if (!o.ok) throw new Error(`${o.status} ${o.statusText} za ${naslov}`);
  const podatki = Buffer.from(await o.arrayBuffer());
  if (podatki.length < NAJMANJSA_DOLZINA) {
    throw new Error(`prekratek odziv (${podatki.length} B) za ${naslov}`);
  }
  /* JPEG se začne s SOI (FF D8) — da ne shranimo HTML strani z napako. */
  if (podatki[0] !== 0xff || podatki[1] !== 0xd8) {
    throw new Error(`odziv ni JPEG za ${naslov}`);
  }
  return podatki;
}

/* Mere iz glave JPEG, da za poročilo ne potrebujemo dodatne odvisnosti. */
function mere(podatki) {
  let i = 2;
  while (i < podatki.length) {
    if (podatki[i] !== 0xff) { i += 1; continue; }
    const oznaka = podatki[i + 1];
    /* SOF0, SOF1, SOF2, SOF9 … nosijo višino in širino. */
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc9, 0xca, 0xcb].includes(oznaka)) {
      return { visina: podatki.readUInt16BE(i + 5), sirina: podatki.readUInt16BE(i + 7) };
    }
    if (oznaka === 0xd8 || oznaka === 0xd9 || (oznaka >= 0xd0 && oznaka <= 0xd7)) { i += 2; continue; }
    i += 2 + podatki.readUInt16BE(i + 2);
  }
  return null;
}

const posnetki = JSON.parse(fs.readFileSync(PODATKI, 'utf8'));
fs.mkdirSync(IZHOD, { recursive: true });

let preneseno = 0;
let obstoja = 0;
const napake = [];

/* Prenesemo za VSE vnose, tudi za tiste z objavi: false — sicer bi
   preklop zastavice zahteval nov prenos in bi bila past. */
for (const m of posnetki) {
  const cilj = path.join(IZHOD, `${m.id}.jpg`);
  if (fs.existsSync(cilj)) {
    const podatki = fs.readFileSync(cilj);
    const d = mere(podatki);
    console.log(
      `  = ${m.id}  že obstaja  ${d ? `${d.sirina}×${d.visina}` : 'mere neznane'}  ` +
        `${(podatki.length / 1024).toFixed(0)} kB`,
    );
    obstoja += 1;
    continue;
  }

  let izbrana = null;
  for (const razlicica of RAZLICICE) {
    if (razlicica === RAZLICICE[RAZLICICE.length - 1] || (await preveri(url(m.id, razlicica)))) {
      izbrana = razlicica;
      break;
    }
    console.log(`    ${m.id}: ${razlicica} ni na voljo, poskusim naprej`);
  }

  try {
    const podatki = await prenesi(url(m.id, izbrana));
    fs.writeFileSync(cilj, podatki);
    const d = mere(podatki);
    console.log(
      `  + ${m.id}  ${izbrana}  ${d ? `${d.sirina}×${d.visina}` : 'mere neznane'}  ` +
        `${(podatki.length / 1024).toFixed(0)} kB  ` +
        `sha256:${createHash('sha256').update(podatki).digest('hex').slice(0, 12)}`,
    );
    preneseno += 1;
  } catch (e) {
    napake.push(`${m.id}: ${e.message}`);
    console.error(`  ! ${m.id}  ${e.message}`);
  }
}

console.log(
  `\nsličic: ${posnetki.length}   preneseno: ${preneseno}   že bilo: ${obstoja}` +
    `   napak: ${napake.length}`,
);
if (napake.length) {
  console.error('\nNeprenesene sličice — brez njih build pade:\n  ' + napake.join('\n  '));
  process.exit(1);
}
