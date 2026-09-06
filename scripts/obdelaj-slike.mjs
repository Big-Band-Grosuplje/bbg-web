/* ============================================================
   Obdelava fotografij za objavo: iz _vhod/ v mapo pod src/assets/foto.

   Zakaj ročno in ne ob buildu: izvirniki so veliki (tudi 20 MB in več) in
   ostanejo lokalno — mapa _vhod/ ni v gitu. V repozitorij gre samo
   obdelana različica, zato je obdelava enkraten korak ob dodajanju slik,
   ne del vsakega builda.

       npm run slike                       -> src/assets/foto/zgodovina
       npm run slike src/assets/foto/orkester

   Kaj naredi: daljša stranica na 2000 px (manjših ne povečuje), JPEG 85,
   brez EXIF. Obstoječih datotek v cilju ne prepiše — ponovni zagon je
   varen in izpiše, kaj je preskočil.

   Ime izhodne datoteke nastane iz imena vhodne (slug). Če hočeš drugo,
   preimenuj datoteko v _vhod/ PRED zagonom; potem se sluga ni treba
   dotikati in poti v galerija.json so takoj pravilne.

   _vhod/ je nabiralnik: po prenosu izvirnike odnesi iz njega. Skripta
   preskoči samo datoteke, katerih SLUG že obstaja v cilju — če je slika
   v cilju pod drugim, uredniškim imenom, je ponovni zagon ne prepozna in
   naredi še eno kopijo pod slug imenom.
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const VHOD = '_vhod';
const PRIVZETI_CILJ = path.join('src', 'assets', 'foto', 'zgodovina');
const DALJSA_STRANICA = 2000;
const KAKOVOST = 85;
const PRIPONE = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'];

const cilj = process.argv[2] ?? PRIVZETI_CILJ;

if (!fs.existsSync(VHOD)) {
  console.error(`Mape ${VHOD}/ ni. Vanjo daj izvirnike in poženi znova.`);
  process.exit(1);
}
fs.mkdirSync(cilj, { recursive: true });

/* Slug iz imena datoteke: šumniki v latinico, vse drugo v vezaje. */
const PRESLIKAVA = { č: 'c', ć: 'c', š: 's', ž: 'z', đ: 'd', Č: 'c', Ć: 'c', Š: 's', Ž: 'z', Đ: 'd' };
function slug(ime) {
  const brezPripone = ime.slice(0, ime.length - path.extname(ime).length);
  return [...brezPripone]
    .map((z) => PRESLIKAVA[z] ?? z)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const datoteke = fs
  .readdirSync(VHOD, { withFileTypes: true })
  .filter((v) => v.isFile() && PRIPONE.includes(path.extname(v.name).toLowerCase()))
  .map((v) => v.name)
  .sort();

if (datoteke.length === 0) {
  console.log(`V ${VHOD}/ ni slik s priponami ${PRIPONE.join(', ')}.`);
  process.exit(0);
}

let obdelanih = 0;
let preskocenih = 0;
const napake = [];

for (const ime of datoteke) {
  const vhodnaPot = path.join(VHOD, ime);
  const izhodnoIme = slug(ime) + '.jpg';
  const izhodnaPot = path.join(cilj, izhodnoIme);

  if (fs.existsSync(izhodnaPot)) {
    console.log(`  = ${izhodnoIme}  že obstaja, preskočeno`);
    preskocenih += 1;
    continue;
  }

  try {
    const pred = await sharp(vhodnaPot).metadata();
    await sharp(vhodnaPot)
      /* rotate() brez argumenta upošteva EXIF orientacijo, preden jo
         zavržemo — brez tega bi se pokončna slika s telefona obrnila. */
      .rotate()
      .resize({
        width: DALJSA_STRANICA,
        height: DALJSA_STRANICA,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: KAKOVOST, mozjpeg: true })
      .toFile(izhodnaPot);

    const po = await sharp(izhodnaPot).metadata();
    const vhodnaVelikost = fs.statSync(vhodnaPot).size;
    const izhodnaVelikost = fs.statSync(izhodnaPot).size;
    console.log(
      `  + ${izhodnoIme}\n` +
        `      iz "${ime}"\n` +
        `      ${pred.width}×${pred.height}, ${(vhodnaVelikost / 1024 / 1024).toFixed(2)} MB` +
        `  ->  ${po.width}×${po.height}, ${(izhodnaVelikost / 1024).toFixed(0)} kB` +
        `  ${po.exif ? 'Z EXIF — NAPAKA' : 'brez EXIF'}` +
        `  ${po.width < po.height ? 'pokončna' : 'ležeča'}`,
    );
    obdelanih += 1;
  } catch (e) {
    napake.push(`${ime}: ${e.message}`);
    console.error(`  ! ${ime}  ${e.message}`);
  }
}

console.log(
  `\ncilj: ${cilj.split(path.sep).join('/')}   slik: ${datoteke.length}` +
    `   obdelanih: ${obdelanih}   preskočenih: ${preskocenih}   napak: ${napake.length}`,
);
if (obdelanih > 0) {
  console.log('Poti novih slik vpiši v src/data/galerija.json (polje datoteka, brez src/assets/foto/).');
}
if (napake.length) {
  console.error('\nNeobdelane:\n  ' + napake.join('\n  '));
  process.exit(1);
}
