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
- **V svetli temi A je zlato BESEDILO ločeno od dekorativne zlate.** Naslovi, nadnaslovi in meta gredo na `--bbg-zlato-besedilo` (#785F11), dekorativna zlata (`--bbg-gold`, obrobe, ikone, podlage gumbov) ostaja svetla. Merilo je podlaga panela in kartice #EAE2D0, **ne** papir strani: vsak odtenek je na papirju za približno 0,4 boljši, zato papir spusti skozi vrednosti, ki na panelu padejo (#806613 tam doseže le 4,26 :1). Zlate barve za besedilo ne kodiraj trdo in ne izbiraj po papirju — meritve so v `docs/design/README.md`
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
- **IP-jev obiskovalcev ne pošiljamo tretjim osebam, ki niso nujne za delovanje strani.** Izjeme, razkrite v `/zasebnost`: gostitelj Vercel (serviranje + Web Analytics, brezpiškotno), YouTube nocookie šele ob kliku na posnetek, Brevo in Web3Forms ob oddaji obrazca
  - Skripta Web Analytics se v produkciji naloži z lastne poti `/_vercel/insights/script.js`; `va.vercel-scripts.com` je v paketu samo razhroščevalna veja. Dodatnega tujega gostitelja torej ni, obdelovalec pa ostane Vercel. Brevo in Web3Forms sta v oznakah samo kot `action` obrazca — nobene skripte, nobenega zahtevka pred oddajo (preverjeno 4. 9. 2026)
  - **Sličice posnetkov so samo-gostovane** v `src/assets/mediji-thumbs/<id>.jpg` in v gitu. Prenese jih `npm run slicice` (maxresdefault, sicer hqdefault; obstoječih datotek ne prepiše) — **`npm run build` jih namenoma ne prenaša**, da produkcijski build ne kliče YouTuba. Ob dodajanju posnetka v `mediji.json` torej zaženi `npm run slicice`; brez datoteke build pade z napako iz `slicicaZa` in ne izpiše tihe prazne slike. Ali ima sličica črna pasova (hqdefault je 4:3), se ugotovi iz razmerja stranic datoteke in se v podatke ne zapisuje. Odpravljeno 4. 9. 2026; prej je bila sličica vezana na `i.ytimg.com` in je Google dobil IP brez klika
- **Privzeta tema je temna, brezpogojno.** `prefers-color-scheme` se NE upošteva; svetla velja samo, če jo obiskovalec izbere s preklopnikom (`localStorage`, ključ `bbg-tema`). Ne dodajaj medijskih poizvedb za sistemsko temo
- **Zunanje povezave** (druga domena) vedno `target="_blank" rel="noopener noreferrer"`. Interne povezave in `mailto:` ostanejo v istem oknu
- **Stran 404 je ENA datoteka** (`src/pages/404.astro`), ne par sl/en: Vercel pri statični objavi izpiše `404.html` iz korena izhoda za vsako neobstoječo pot, tudi pod `/en/`, in `/en/404.html` ne bi nikoli poiskal. Zato sta obe besedili v strani, skripta pa skrije neveljavno — po poti, nato po `bbg-lang`, nato po `navigator.languages`. Brez JS ostaneta vidni obe; na 404 je to boljše od napačnega jezika. **Nav in noga sta slovenska** tudi pri angleškem besedilu — podvojiti se ne moreta, ker bi se podvojili `id` (gumb za jezik, burger); gumb SL/EN pelje na `/en/`, zato pot naprej ostane. Stran nosi `noindex` (datoteka je dosegljiva tudi na `/404` in tam vrne 200) in `brezKanonicne`: canonical bi trdil, da je stran nekaj drugega, par `hreflang` pa bi kazal na naslova, ki ju ni
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
- Model koncerta v `koncerti.json`: `zasedba` (big-band | combo | mladinski | izobrazevalni) in `vstop` ({ tip: vstopnice | prost | zaprt, url }). Iz njiju nastaneta znački na kartici in `offers` v JSON-LD. Polje `vstopniceUrl` je opuščeno — preseljeno v `vstop.url`
- **Prost vstop dobi `offers` s ceno 0 EUR**, vstopnice ponudbo s povezavo, zaprt dogodek in vstopnice brez znane povezave pa `offers` izpustita: nepopolna ponudba je za iskalnike slabša od nobene. Gumb „Vstopnice" se izpiše samo, kadar je `vstop.url` res znan
- `datumKonecIso` je neobvezno polje za **večdnevne dogodke**: datum se prikaže kot razpon ("10.–11. 10. 2026" / "10–11 October 2026"), dogodek ostane prihajajoč do konca, JSON-LD dobi `endDate`. Razpona **ne sestavljaj sam** — `sl-SI` dnevu piko že doda, kombinacija `month+year` pa vrne "10/2026"; zato se mesec in leto prevzameta iz polnega končnega datuma
- `prijava: true` pomeni prost vstop z **obvezno prijavo**: ob znački se izpiše opomba in gumb, ki pelje na `?prijava=delavnica#kontakt` — query predizbere možnost v izbirniku, zamenja zadevo sporočila in sprosti obveznost polja Sporočilo (ime in e-pošta ostaneta obvezna)
- **`zasedba: "izobrazevalni"` gre v JSON-LD kot `EducationEvent`**, ne `MusicEvent`: tam smo organizator in ne izvajalec, `performer` pa je vodja delavnice
- `organizator` ({ naziv, nazivEn, url }) je **neobvezno**: brez njega je organizator društvo (privzeta vrednost je v `src/lib/koncerti.ts`, ne v vsakem dogodku). Kadar je vpisan, gre v JSON-LD kot `organizer`, na podstrani pa se izpiše vrstica „Organizator" s povezavo. Pri lastnem dogodku vrstice ni — „Organizator: Kulturno društvo Big Band Grosuplje" na lastni strani ne pove ničesar. Vpisan zunanji organizator **ne odvzame** `performer`: pri tujem dogodku smo izvajalec
- `objave` ([{ naziv, nazivEn, url }]) je **neobvezno**: zunanji napovedniki o dogodku. Izpišejo se **samo na podstrani** kot „Več o dogodku:" / „More about the event:", za gumbi, da ne tekmujejo s prijavo ali vstopnicami. Na kartici naslovnice jih ni (vodile bi stran od dogodka, še preden bi ga obiskovalec odprl) in **v JSON-LD ne gredo** — objava ni ne organizator ne izvajalec. Kjer `nazivEn` ni vpisan, koda pade nazaj na slovenski naziv; to je pravilno pri povezavah, ki kažejo na slovensko stran
- ⚠️ **Na angleških podstraneh povezave objav in organizatorja dobijo pripis „ (in Slovenian)" in `hreflang="sl"`** — trdno, ker vse tri obstoječe povezave vodijo na slovenske strani in polja za jezik cilja model nima. Pripis je v slovarju (`koncerti.vSlovenscini`, v `sl.ts` prazen), **ne v podatkih**: `organizator.nazivEn` je hkrati `organizer.name` v JSON-LD, ime organizacije pa ne sme nositi pojasnila o jeziku. Ob dodajanju povezave na stran v drugem jeziku je treba oboje ali odstraniti ali uvesti polje za jezik cilja. **`nazivEn` naj se ne konča z oklepajem** — pripis prinese svojega in nastala bi dva zapored; vir zato zapiši v besedno zvezo („… on kultura.si"), ne v oklepaj
- **Podstrani dogodkov** `/dogodki/<slug>` in `/en/events/<slugEn>` nastanejo iz `koncerti.json`. Sluga sta vpisana v podatkih in se **po objavi ne spreminjata** — objavljena povezava bi se prelomila. Dva sprejema imata enak naslov, zato jih v slugu loči prizorišče
- **Pretekli dogodki se ne brišejo**: podstran ostane (arhivska vrednost, objavljene povezave), le kartica z naslovnice izpade in stran dobi diskretno oznako „Dogodek je mimo". Gumba za vstopnice in prijavo se pri preteklem dogodku ne izpišeta, deljenje ostane (pretekel ni isto kot zaprt — glej naslednjo vrstico)
- **Pri `vstop.tip: "zaprt"` deljenja ni** — ne na kartici ne na podstrani: povezavo dobijo povabljeni neposredno, javno deljenje pa bi vabilo ljudi na dogodek, kamor ne morejo. Podstran ostane, ker je edini naslov, ki ga povabljeni dobi v vabilu
- **Zaprt dogodek se tudi ne indeksira**: podstran nosi `<meta name="robots" content="noindex">` (lastnost `noindex` v `Layout.astro`) in izpade iz sitemapa prek `filter` v `astro.config.mjs`. Obe stvari sta potrebni: sitemap indeksiranja ne prepove, zato bi brez oznake za uvrstitev zadostovala zunanja povezava. `Disallow` v `robots.txt` **ni** pravilna pot — pajek oznake ne bi videl. `canonical` in par `hreflang` na strani ostaneta
- **Vrstica akcij (gumb + deljenje) je `<div>`, nikoli `<p>`.** `Deljenje` izpiše `<div>`, tega pa razčlenjevalnik HTML v odstavku ne dovoli: `<p>` se tiho zapre in ikona pade iz vrstice. V oznakah tega ni videti — pokaže se šele v DOM. Velja za `.kartica__cta` in `.dogodek__akcije`; vrzel v obeh je 12px
- Datumska logika in gradnja JSON-LD sta v `src/lib/koncerti.ts`, ker jih potrebujeta naslovnica (izsek) in podstran (polni zapis). Knjižnica slovarja ne pozna — prevedljive nize prejme kot parametre
- Dinamične strani v `poti.json` ne morejo biti; svoj par poti podajo prek `potiRazlicic` v `Layout`, ki iz njega naredi `canonical`, `hreflang` **in** vpis v preslikavo za samodejno preusmeritev jezika. Sitemap iste pare zgradi iz `koncerti.json`
- **Deljenje** (`Deljenje.astro`): `navigator.share`, kjer je na voljo, sicer meni s kopiranjem povezave, e-pošto in Facebookom prek `sharer.php` v novem zavihku. **Brez SDK** — ta bi naložil Facebookove skripte in obiskovalčev IP predal tretji osebi še pred klikom. `aria-controls` potrebuje enoličen `id`, zato ga komponenta izpelje iz poti dogodka
- `docs/` — kronika.md, sodelovanja.md, ton-vzorci.md (v gitu); bbg-osnova.md in interno* samo lokalno. Nič od tega ne gre v build
- `public/` — favicon, ikone, `og/og-default.png`

## Commit sporočila
Conventional commits, v slovenščini: `feat: ...`, `fix: ...`, `docs: ...`
