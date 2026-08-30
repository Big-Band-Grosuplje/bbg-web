# bbg-web — začetni skelet

## Če je repo prazen (ali samo z src/assets/brand)
1. Razpakiraj VSO vsebino tega zipa v koren repa (povozi obstoječe brand datoteke — identične so).
2. V korenu repa:

    npm install
    npm run dev

3. Odpri http://localhost:4321 — temni hero z zlatim znakom in pravilno nogo (kolofon po bbg-osnova).

## Če Astro projekt že obstaja
Skopiraj samo:
- src/layouts/Layout.astro
- src/pages/index.astro (ali njegov <main> prenesi v svojo stran)
- preveri, da astro.config.mjs vsebuje: site: 'https://bigband-grosuplje.com'

## Deploy (Vercel)
Framework preset: Astro. Build: astro build, output: dist/. DNS ostane na Hitrost — spreminjaš samo A/CNAME za www in koren, MX/SPF/MS zapisov NE.

Commit predlog:
feat: Astro skelet z layoutom, brand tokeni in začetno stranjo
