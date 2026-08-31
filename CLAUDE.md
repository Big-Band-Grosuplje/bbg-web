# bbg-web — spletna stran Big Banda Grosuplje

Astro 5 (static) + Vercel. Jezik strani in komunikacije: slovenščina (sl-SI).

## Vir resnice
Uradni podatki društva so v `docs/bbg-osnova.md` — VEDNO uporabljaj te.
Datoteka je lokalna in NI v gitu (`.gitignore`); v svežem klonu je ni.
Ključno:
- Polni naziv: **Kulturno društvo Big Band Grosuplje** (nikoli "Kulturno društvo Grosuplje")
- Društvo **NI zavezanec za DDV** — na strani in dokumentih vedno "Davčna številka: 12579076 (nismo zavezanci za DDV)", nikoli "ID za DDV"
- TRR se na javni strani NE objavlja
- Imen članov orkestra NE objavljamo; izjema: dirigenti, umetniško vodstvo, gostujoči umetniki, zgodovinski konteksti
- Izjema od pravila o imenih članov so avtorske navedbe pri gradivih (foto, video, avdio, montaža) — avtorje gradiv vedno navajamo.
- Projekt "The Goodwin Legacy" (2027): do odobritve granta NE objavljaj imen gostujočih umetnikov in podrobnosti; nikoli finančnih podatkov. Na strani samo napovednik "jubilejni mednarodni projekt ob 30-letnici"

## Brand
- Vizualna smer **C**, potrjena 31. 8. 2026. Referenčni mockup: `docs/design/smer-c.html` — od tam povzemaj dimenzije, sence, zaobljenosti in razmike (NE rotacij, glej spodaj)
- Tokeni v `src/styles/brand.css`: zlata #C9A227 (svetla #E8C95C), rdeč akcent #D4553B, topla črna #141110, ink #191512, paper #FAF3E3
- Tipografija: **Archivo Black** (naslovi) + **Archivo** (besedilo, 500/600/800), samo-gostovano prek `@fontsource` paketov. Google Fonts CDN NIKOLI — prenesel bi IP obiskovalca tretji osebi
- Znak: `src/assets/brand/bbg-znak.svg` (currentColor) + statične variante; favicon monogram "B"
- Slog: moderno, minimalistično, črno-zlato; izstopajoči featurji: avdio/video hero, interaktivna postavitev orkestra
- **Rotacije**: rahle rotacije (−4° do +2°) SAMO za znak, badge in nalepke — nikoli za daljša besedila. Največ **trije** zarotirani elementi na zaslon v heroju (znak + badge + nalepka), drugod največ dva. Navigacija ostane ravna, ker je hkrati vidna s hero
- **Gumbi**: trda senca `box-shadow: 4px 4px 0 var(--bbg-accent)`
- Kolofon in poslovni deli strani ostanejo ravni in nevtralni
- Ton besedil (napovedniki, novice): duhovito in samoironično, a informativno — glej `docs/ton-vzorci.md`. Kolofon, uradni in poslovni deli strani ostanejo nevtralni.

## Tehnična pravila
- **Repo je JAVEN — nikoli ne commitaj bbg-osnova.md, pogodb, financ ali osebnih podatkov.**
- SEO in AI-najdljivost: schema.org (MusicGroup, MusicEvent, EducationEvent), Open Graph (og:locale sl_SI), sitemap, llms.txt
- lang="sl", sl-SI formati datumov (d. M. yyyy)
- Astro.site = https://bigband-grosuplje.com (astro.config.mjs)
- DNS je na Hitrost.com: MX/SPF/Microsoftovih zapisov NIKOLI ne predlagaj spreminjati; ob preklopu domene samo A/CNAME
- Kode ne krajšaj: celotne, ready-to-paste datoteke

## Struktura
- `src/layouts/Layout.astro` — head, favicon, OG
- `src/pages/` — strani; `src/styles/brand.css` — tokeni
- `src/data/` — strukturirani podatki (koncerti ipd.)
- `docs/` — kronika.md, sodelovanja.md, ton-vzorci.md (v gitu); bbg-osnova.md in interno* samo lokalno. Nič od tega ne gre v build
- `public/` — favicon, ikone, `og/og-default.png`

## Commit sporočila
Conventional commits, v slovenščini: `feat: ...`, `fix: ...`, `docs: ...`
