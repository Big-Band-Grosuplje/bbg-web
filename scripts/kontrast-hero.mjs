/* ============================================================
   Kontrast besedila čez hero fotografije.

       npm run kontrast

   Zakaj obstaja: zavesa čez hero fotografijo je naravnana na NAJSLABŠO
   sliko v src/assets/hero/. Ob slideshowu se podlaga menja, zato ena
   svetlejša slika lahko poruši berljivost slogana, ne da bi to kdo opazil
   — build tega sam po sebi ne ujame, opozorilo v dokumentu pa ne prepreči
   ničesar. Ta skripta ga prepreči: ob padcu pod prag vrne izhodno kodo 1
   in ustavi potek v GitHub Actions.

   Kako meri: za vsako sliko sestavi kompozit fotografije z zaveso (ista
   štiristopenjska preliva kot na strani — vrednosti pridejo iz
   src/data/hero-zavesa.mjs, ne iz kopije tukaj), v pasu, kjer stoji
   besedilo, vzame 95. percentil svetlosti kot najslabši realni primer in
   izračuna kontrastno razmerje po WCAG 2.1.

   Sharp pride z Astrom (transitivna odvisnost) — enako kot pri
   scripts/obdelaj-slike.mjs.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  ZAVESA_BARVA,
  ZAVESA_POSTAJE,
  alfaNaVisini,
  OBMOCJE_BESEDILA,
  PERCENTIL,
  BESEDILA,
  TEME,
} from '../src/data/hero-zavesa.mjs';

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAPA = path.join(KOREN, 'src', 'assets', 'hero');

/* Širina, na katero sliko pomanjšamo pred meritvijo. Meritev je statistična
   (percentil svetlosti), zato večja ločljivost rezultata ne spremeni, čas
   pa podaljša. */
const SIRINA_MERITVE = 1400;

/* --- WCAG 2.1 ------------------------------------------------------- */
const vLinearno = (c) => {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};
const svetlost = (r, g, b) =>
  0.2126 * vLinearno(r) + 0.7152 * vLinearno(g) + 0.0722 * vLinearno(b);
const kontrast = (a, b) => {
  const [svetlejsa, temnejsa] = a > b ? [a, b] : [b, a];
  return (svetlejsa + 0.05) / (temnejsa + 0.05);
};
function svetlostHex(hex) {
  const v = hex.replace('#', '');
  return svetlost(
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  );
}

/* --- meritev ena slika ---------------------------------------------- */
async function izmeriSliko(pot) {
  const { data, info } = await sharp(pot)
    .resize({ width: SIRINA_MERITVE })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: K } = info;
  const [zr, zg, zb] = ZAVESA_BARVA;

  const y0 = Math.floor(H * OBMOCJE_BESEDILA.y0);
  const y1 = Math.floor(H * OBMOCJE_BESEDILA.y1);
  const x0 = Math.floor(W * OBMOCJE_BESEDILA.x0);
  const x1 = Math.floor(W * OBMOCJE_BESEDILA.x1);

  const vzorci = [];
  /* Vzorčimo vsak drugi piksel: pri ~1400 px širine je to še vedno nekaj
     sto tisoč vzorcev, percentil pa se ne premakne. */
  for (let y = y0; y < y1; y += 2) {
    const alfa = alfaNaVisini(y / H);
    for (let x = x0; x < x1; x += 2) {
      const i = (y * W + x) * K;
      vzorci.push(
        svetlost(
          data[i] * (1 - alfa) + zr * alfa,
          data[i + 1] * (1 - alfa) + zg * alfa,
          data[i + 2] * (1 - alfa) + zb * alfa,
        ),
      );
    }
  }
  vzorci.sort((a, b) => a - b);
  return vzorci[Math.floor(vzorci.length * PERCENTIL)];
}

/* --- izpis ----------------------------------------------------------- */
const stevilo = (n) => n.toFixed(2).replace('.', ',');

function glava(imena) {
  const sirinaImena = Math.max(12, ...imena.map((i) => i.length));
  return { sirinaImena };
}

async function glavno() {
  if (!fs.existsSync(MAPA)) {
    console.error(`Mape ${path.relative(KOREN, MAPA)} ni.`);
    process.exit(1);
  }
  const datoteke = fs
    .readdirSync(MAPA)
    .filter((d) => /\.(jpg|jpeg|png|webp)$/i.test(d))
    .sort();

  if (datoteke.length === 0) {
    console.error(`V ${path.relative(KOREN, MAPA)} ni nobene slike.`);
    process.exit(1);
  }

  const postajeIzpis = ZAVESA_POSTAJE.map((p) => `${p.alfa} @ ${p.odstotek}%`).join('  ·  ');
  console.log('Kontrast besedila čez hero fotografije');
  console.log(`  zavesa:   ${postajeIzpis}`);
  console.log(
    `  območje:  spodnji pas y ${Math.round(OBMOCJE_BESEDILA.y0 * 100)}–`
      + `${Math.round(OBMOCJE_BESEDILA.y1 * 100)} %, cela širina, `
      + `${Math.round(PERCENTIL * 100)}. percentil svetlosti`,
  );
  console.log(`  slik:     ${datoteke.length}\n`);

  const { sirinaImena } = glava(datoteke);
  const padci = [];

  for (const [imeTeme, barve] of Object.entries(TEME)) {
    const stolpci = BESEDILA.map((b) => `${b.opis} (${stevilo(b.prag)})`);
    console.log(
      `tema ${imeTeme}`.padEnd(sirinaImena + 3)
        + stolpci.map((s) => s.padEnd(22)).join(''),
    );

    for (const datoteka of datoteke) {
      const p95 = await izmeriSliko(path.join(MAPA, datoteka));
      const celice = BESEDILA.map((b) => {
        const barva = barve[b.kljuc];
        if (!barva) {
          throw new Error(
            `Tema "${imeTeme}" v src/data/hero-zavesa.mjs nima barve za "${b.kljuc}".`,
          );
        }
        const razmerje = kontrast(svetlostHex(barva), p95);
        const pade = razmerje < b.prag;
        if (pade) padci.push({ datoteka, tema: imeTeme, kaj: b.opis, razmerje, prag: b.prag });
        return `${pade ? '✗' : '✓'} ${stevilo(razmerje)} ${barva}`.padEnd(22);
      });
      console.log('  ' + datoteka.padEnd(sirinaImena + 1) + celice.join(''));
    }
    console.log();
  }

  if (padci.length > 0) {
    console.error('KONTRAST PADE\n');
    for (const p of padci) {
      console.error(
        `  ${p.datoteka} · tema ${p.tema} · ${p.kaj}: `
          + `${stevilo(p.razmerje)} < ${stevilo(p.prag)}`,
      );
    }
    console.error(
      '\nKaj storiti — ena od dveh poti, tretje ni:\n'
        + '  1. Sliko zamenjaj ali izberi kader z mirnejšim spodnjim predelom.\n'
        + '     Zavesa je naravnana na najslabšo sliko v mapi; ena svetla slika\n'
        + '     potegne za sabo vse ostale.\n'
        + '  2. Prenaravnaj zaveso v src/data/hero-zavesa.mjs (višja motnost v\n'
        + '     spodnjih postajah) in ZAŽENI MERITEV ZNOVA NA VSEH SLIKAH.\n'
        + '     Močnejša zavesa najtemnejšo sliko zadavi v črnino, zato po\n'
        + '     spremembi preveri tudi videz, ne le številke.\n'
        + '\nPodrobnosti: docs/design/hero-smer-b.md, razdelek o kontrastu.',
    );
    process.exit(1);
  }

  console.log('Vse vrednosti so nad pragom.');
}

await glavno();
