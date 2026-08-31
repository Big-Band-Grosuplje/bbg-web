# bbg-web — spletna stran Big Banda Grosuplje

Astro 5 (static) + Vercel. Jezik komunikacije z razvijalcem: slovenščina.
Stran je **dvojezična**: slovenščina (sl-SI) je privzeta in brez predpone,
angleščina (en-US) živi pod `/en/`.

## Dvojezičnost
- **Vir resnice za poti je `src/i18n/poti.json`.** Bere ga `src/i18n/index.ts` (navigacija, hreflang, gumb za jezik, samodejna preusmeritev) **in** `astro.config.mjs` (alternate zapisi v sitemapu). Ob dodajanju strani dopolni samo to datoteko — poti nikoli ne piši drugam
- Slugi so **prevedeni**, ne prepisani: `/zgodovina` ↔ `/en/history`, `/galerija` ↔ `/en/gallery`, `/multimedija` ↔ `/en/media`, `/zasebnost` ↔ `/en/privacy`
- **Besedila vmesnika so v `src/i18n/sl.ts` in `en.ts`.** Nizov ne piši neposredno v komponente
- Ujemanje ključev varujeta dve stvari: `satisfies Slovar` v `en.ts` (opozorilo v urejevalniku) in **preverba ob izvajanju v `src/i18n/index.ts`**, ki ob neujemanju vrže napako z imenom manjkajočega ključa. Samo `satisfies` ne zadošča — Astro prevaja z esbuildom, ki tipe le odstrani in jih ne preverja
- **Vsebina je v `src/data/*.json` s polji s končnico `En`** (`opisEn`, `naslovEn`, `podnapisEn` …). Trdi podatki — datumi, ure, lastna imena oseb in prizorišč, imena datotek — so **skupni in se ne podvajajo**. Kjer angleškega polja ni, koda pade nazaj na slovensko
- Angleška besedila **niso dobesedni prevodi**: slovenske besedne igre v angleščini ne delujejo, zato isto povedo v mirnejšem tonu. Hišna samoironija ostane subtilna
- Vsaka stran je **ena skupna komponenta v `src/components/strani/`** z lastnostjo `jezik`; datoteke v `src/pages/` in `src/pages/en/` so samo tanki ovoji. Označb ne podvajaj
- Skriptam v komponentah prevodov ne podajaj prek `define:vars` (to jih prisili v inline obliko na vsaki strani) — uporabi `data-` atribute na elementu
- Pravno besedilo `/zasebnost` je izjema: obe različici sta v `Zasebnost.astro`, ker je dolgo, ima notranje oznake in ga je treba brati kot celoto. **Ob spremembi storitve posodobi obe**

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
- **Privzeta vizualna smer je A (Zlati klub)**: Playfair Display + Source Sans 3, elegantna, brez rotacij in trdih senc; referenčni mockup `docs/design/smer-a.html`. Potrjena 31. 8. 2026
- **Smer C (Archivo, razigrana) je ohranjena kot predogled prek `?skin=c`** — njena pravila (rotacije, mikrorotacije, trde sence) veljajo **samo znotraj skina C**
- ⚠️ V `brand.css` blok `:root` nosi vrednosti **smeri C**, privzeto smer A pa `:root[data-skin='a']`, ki ga prepiše. Token, dodan samo v `:root`, torej velja le za predogled C. `<html>` nosi `data-skin="a"` že iz strežniškega izrisa, zato privzeta smer velja tudi brez JS
- Tokeni smeri A: zlata #C9A227 (svetla #E3C765), papir #F3EBD8, topla črna #181512, ink #171310; rdečega akcenta A nima — vlogo prevzame zlata, trde sence odpadejo
- Tokeni smeri C: zlata #C9A227 (svetla #E8C95C), rdeč akcent #B8432B (svetli #E4715C), topla črna #141110, ink #191512, paper #FAF3E3
- **Akcent smeri C je zavezan kontrastu.** #B8432B doseže s papirnatim besedilom 4,90 :1 (WCAG AA); prejšnji #D4553B je dosegel 3,68 :1 in ne sme več nastopati kot podlaga badge ali CTA. Kot **besedilo** je #B8432B berljiv samo na papirju — na temnem gre #E4715C. Zato obstajata semantična tokena `--bbg-meta` in `--bbg-napaka`; rdeče barve ne kodiraj trdo
- Pisave so samo-gostovane prek `@fontsource`. Google Fonts CDN NIKOLI — prenesel bi IP obiskovalca tretji osebi. Menjava gre samo prek `--font-display` in `--font-body`; `--bbg-font-naslov`/`--bbg-font-besedilo` sta samo imeni, ki kažeta nanju. Pisav ne navajaj neposredno v komponentah. Pri privzeti smeri se prenesejo samo Playfair Display in Source Sans 3; Archivo se naloži šele ob `?skin=c`
- Vsebinski elementi smeri C (badge „Pozor, hud big band!", nalepka pod hero fotografijo, dvostolpčni hero) ostajajo v oznakah in so pri A samo skriti — **ne briši jih**, so del predoglega C
- Znak: `src/assets/brand/bbg-znak.svg` (currentColor) + statične variante; favicon monogram "B". OG slika in favicon sta skupna obema smerema — zlata na temni deluje za obe
- **Rotacije (samo skin C)**: izrazite (do ±4°) samo za znak, badge in nalepke; mikrorotacije (do ±0,6°) na naslovih h2, karticah in panelih — po vzoru `docs/design/smer-c.html`. Kolofon, obrazci in daljša besedila vedno ravni
- **Gumbi (samo skin C)**: trda senca `box-shadow: 4px 4px 0 var(--bbg-accent)`. Pri A so gumbi pilule brez trdih senc
- Ton besedil (napovedniki, novice): duhovito in samoironično, a informativno — glej `docs/ton-vzorci.md`. Kolofon, uradni in poslovni deli strani ostanejo nevtralni
- Popravki, ki morajo premagati scoped pravila komponent, gredo v same komponente prek `:global(:root[data-skin='a'])`
- Obe smeri imata temno in svetlo temo; vse štiri kombinacije so kontrastno izmerjene in **brez napak po WCAG 2.1 AA**. Meritve in razlogi za izbrane odtenke so v `docs/design/README.md` — pred spreminjanjem zlatih odtenkov ga preberi
- **Sekundarnega besedila ne umirjaj z `opacity`.** Motnost stisne cel poddrevesni izris, torej tudi povezave v istem odstavku, in se množi z motnostjo starša. Uporabi `color: color-mix(in srgb, var(--bbg-besedilo) N%, var(--bbg-bg))` — pri enakem odstotku je barva odstavka identična, povezave pa obdržijo polno moč

## Tehnična pravila
- **Repo je JAVEN — nikoli ne commitaj bbg-osnova.md, pogodb, financ ali osebnih podatkov.**
- **Privzeta tema je temna, brezpogojno.** `prefers-color-scheme` se NE upošteva; svetla velja samo, če jo obiskovalec izbere s preklopnikom (`localStorage`, ključ `bbg-tema`). Ne dodajaj medijskih poizvedb za sistemsko temo
- **Zunanje povezave** (druga domena) vedno `target="_blank" rel="noopener noreferrer"`. Interne povezave in `mailto:` ostanejo v istem oknu
- SEO in AI-najdljivost: schema.org (MusicGroup v `Layout.astro` na vsaki strani, MusicEvent, VideoObject), Open Graph, `@astrojs/sitemap`, `public/robots.txt`, `public/llms.txt`
- Vsaka stran nosi `canonical`, par `hreflang` (sl, en) in `x-default` na slovensko različico; `og:locale` sledi jeziku. MusicGroup ima isti `@id` v obeh jezikih (ista entiteta), po jeziku se spremenita `description` in `inLanguage`
- Sitemap alternate pare sestavlja `serialize` v `astro.config.mjs` iz `poti.json`; vgrajeni i18n sitemapa ne uporabljamo, ker zna spariti samo enake slugove
- V `llms.txt` samo preverljiva dejstva — brez superlativov brez pokritja. Vrstica Sitemap v `robots.txt` in nastavitev sitemapa v `astro.config.mjs` sta ena spremenljivka v dveh datotekah: ob spremembi popravi obe
- `lang` sledi jeziku strani. Datumi: sl-SI `d. M. yyyy` z uro s piko ("18. 9. 2026 ob 19.00"), en-GB `d Month yyyy` z uro z dvopičjem ("18 September 2026 at 19:00")
- **Zaznava jezika**: inline skripta v `<head>` samo na slovenskih straneh; ob prvem obisku (ko `bbg-lang` še ni shranjen) prebere `navigator.languages` in ob odsotnosti "sl" preusmeri na ustrezno `/en/` pot, z ohranjenim query in sidrom. Vsaka izbira — samodejna ali ročna prek gumba SL/EN — se zapiše v `bbg-lang` in se **nikoli več ne preglasi**
- Gumb za jezik je **besedilo, ne zastavica** (zastavica pomeni državo, ne jezika) in je navadna povezava, da deluje tudi brez JS
- Astro.site = https://bigband-grosuplje.com (astro.config.mjs)
- DNS je na Hitrost.com: MX/SPF/Microsoftovih zapisov NIKOLI ne predlagaj spreminjati; ob preklopu domene samo A/CNAME
- Kode ne krajšaj: celotne, ready-to-paste datoteke

## Struktura
- `src/layouts/Layout.astro` — head, favicon, OG, hreflang, inline skripti za skin/temo in za zaznavo jezika
- `src/i18n/` — `poti.json` (preslikava poti), `sl.ts` in `en.ts` (slovarja), `index.ts` (pomočniki)
- `src/components/strani/` — telesa strani, ena komponenta na stran, z lastnostjo `jezik`
- `src/pages/` — slovenski ovoji; `src/pages/en/` — angleški. Oboji so samo nekaj vrstic
- `src/styles/brand.css` — tokeni
- `src/data/` — strukturirani podatki (koncerti, galerija, mediji, zgodovina) s polji `…En`. Besedila zgodovine in mejnikov so v `zgodovina.json`, da naslovnica in `/zgodovina` berete isti vir
- `docs/` — kronika.md, sodelovanja.md, ton-vzorci.md (v gitu); bbg-osnova.md in interno* samo lokalno. Nič od tega ne gre v build
- `public/` — favicon, ikone, `og/og-default.png`

## Commit sporočila
Conventional commits, v slovenščini: `feat: ...`, `fix: ...`, `docs: ...`
