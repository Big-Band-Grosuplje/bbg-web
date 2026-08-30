# bbg-web — spletna stran Big Banda Grosuplje

Astro 5 (static) + Vercel. Jezik strani in komunikacije: slovenščina (sl-SI).

## Vir resnice
Uradni podatki društva so v `docs/bbg-osnova.md` — VEDNO uporabljaj te.
Ključno:
- Polni naziv: **Kulturno društvo Big Band Grosuplje** (nikoli "Kulturno društvo Grosuplje")
- Društvo **NI zavezanec za DDV** — na strani in dokumentih vedno "Davčna številka: 12579076 (nismo zavezanci za DDV)", nikoli "ID za DDV"
- TRR se na javni strani NE objavlja
- Imen članov orkestra NE objavljamo; izjema: dirigenti, umetniško vodstvo, gostujoči umetniki, zgodovinski konteksti
- Projekt "The Goodwin Legacy" (2027): do odobritve granta NE objavljaj imen gostujočih umetnikov in podrobnosti; nikoli finančnih podatkov. Na strani samo napovednik "jubilejni mednarodni projekt ob 30-letnici"

## Brand
- Tokeni v `src/styles/brand.css`: zlata #C9A227 (svetla #D4AF37), topla črna #181512, ink #111111, paper #FAF7F0
- Znak: `src/assets/brand/bbg-znak.svg` (currentColor) + statične variante; favicon monogram "B"
- Slog: moderno, minimalistično, črno-zlato; izstopajoči featurji: avdio/video hero, interaktivna postavitev orkestra

## Tehnična pravila
- SEO in AI-najdljivost: schema.org (MusicGroup, MusicEvent, EducationEvent), Open Graph (og:locale sl_SI), sitemap, llms.txt
- lang="sl", sl-SI formati datumov (d. M. yyyy)
- Astro.site = https://bigband-grosuplje.com (astro.config.mjs)
- DNS je na Hitrost.com: MX/SPF/Microsoftovih zapisov NIKOLI ne predlagaj spreminjati; ob preklopu domene samo A/CNAME
- Kode ne krajšaj: celotne, ready-to-paste datoteke

## Struktura
- `src/layouts/Layout.astro` — head, favicon, OG
- `src/pages/` — strani; `src/styles/brand.css` — tokeni
- `src/data/` — strukturirani podatki (koncerti ipd.)
- `docs/` — bbg-osnova.md, arhivsko gradivo (ne gre v build)
- `public/` — favicon, ikone, `og/og-default.png`

## Commit sporočila
Conventional commits, v slovenščini: `feat: ...`, `fix: ...`, `docs: ...`
