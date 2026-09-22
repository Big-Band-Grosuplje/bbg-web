# Hero sekcija — smer b (razdeljeno z napovednikom)

> ⛔ **SMER B JE OPUŠČENA — 22. 9. 2026.** Implementirana je bila in po pregledu
> na živi strani zavrnjena; vrnjen je fullbleed hero. Razlog in kaj je iz smeri b
> preživelo, sta v razdelku *Zakaj je bila smer b opuščena* spodaj.
>
> Zapis se **ne briše**: naslednji bralec mora videti, da je bila razdeljena
> postavitev preizkušena in zakaj ni obstala — sicer jo bo predlagal znova.
>
> Stanje ob potrditvi: 21. 9. 2026. Vir resnice za videz je živa stran
> (`src/components/Hero.astro`).

## Izbrana smer

Razdeljena postavitev: levo kdo smo, desno medijska plošča, pod besedilom
napovednik naslednjega koncerta.

| Del | Kje živi |
|---|---|
| Hero kot celota | `src/components/Hero.astro` |
| Medijska plošča (dve stanji) | `src/components/HeroMedij.astro` |
| Stikalo med stanjema | `src/data/hero-video.ts` |
| Izbira naslednjega dogodka | `naslednjiJavni()` v `src/lib/koncerti.ts` |

**Zakaj b.** Od treh predlaganih smeri je edina, ki obiskovalcu odgovori na
vprašanje, s katerim najpogosteje pride — kdaj je naslednji koncert — brez
drsenja. Smer a (celozaslonska zanka) stoji in pade s kakovostjo posnetka,
ki ga ob odločitvi nimamo. Smer c (naslov čez vse) je vizualno najmočnejša,
a ne pove ničesar, česar obiskovalec ne bi vedel že iz naslovne vrstice.

Predstavitev vseh treh smeri z vzorci v obeh temah in pri 380 px:
<https://claude.ai/code/artifact/2d53ea0a-f882-4371-8b79-788fcc14ae09>

## ⚠️ Zavrnjeno: izrez posnetka čez črke (`background-clip: text`)

Prva izvedba smeri c je spustila video zanko **skozi črke naslova**
(`background-clip: text` + `-webkit-text-fill-color: transparent`).

**Ne poskušaj je oživiti.** Preizkušeno 21. 9. 2026 in opuščeno:

- Na papirju (svetla tema) je učinek dober.
- V **temni temi, ki je privzeta**, je temen kader v črkah na temni podlagi
  naslov skoraj izbrisal — naslov je postal najšibkejši element na strani,
  kar je natanko nasprotje namena tipografske smeri.
- Poskus reševanja z mešanjem kadra z zlato (`background-blend-mode: screen`
  na temnem, `multiply` na papirju) kontrasta ni dovolj dvignil.

Rešitev ni v boljšem kadru: kontrast naslova bi bil odvisen od tega, kateri
posnetek kdo naloži, in bi tiho razpadel ob vsaki menjavi. Smer, ki pade v
svoji privzeti temi, ni smer.

Če se ideja kdaj vrne, je pogoj **izmerjen kontrast na najsvetlejšem in
najtemnejšem kadru zanke**, ne vzorec z eno fotografijo.

## Dve stanji medijske plošče

Plošča ima en vmesnik in dve stanji. Katero velja, določa **izključno**
prisotnost posnetka v `src/data/hero-video.ts`; komponente za preklop ni
treba odpirati.

| | Brez posnetka (stanje ob potrditvi) | S posnetkom |
|---|---|---|
| Vsebina | mirujoča fotografija | tiha zanka, `autoplay muted loop playsinline` |
| Gumb za zvok | ✗ ni ga | ✓ zgornji desni kot **plošče** |
| Preklopnik, namig, „kmalu“ | ✗ ničesar | — |
| `prefers-reduced-motion` | ni razlike | plakat namesto videa, gumb za zvok odpade |

**Hero mora biti v stanju brez posnetka videti dokončan**, ne kot nekaj, kar
čaka na video. Zato ni praznega okvira, ni napisa o posnetku, ki prihaja, in
ni preklopnika brez vsebine. Plošča je v obeh stanjih enako velika in enako
uokvirjena, zato ob prihodu posnetka postavitev ne skoči.

**Gumb za zvok stoji na plošči in ne na strani**: pripada posnetku in se mora
seliti z njim. Pri 380 px plošča zleze nad besedilo in gumb gre z njo.

**Pri `prefers-reduced-motion` gumba za zvok ni.** To ni opustitev, ampak
posledica: brez predvajanja ni česa odtišati.

## Pričakovane datoteke in omejitve

Datoteke gredo v `public/video/` in v git.

| Datoteka | Zapis | Avdio sled | Kdaj se prenese |
|---|---|---|---|
| `hero-tiho.webm` | AV1 | **ne** | takoj, vsakemu obiskovalcu |
| `hero-tiho.mp4` | H.264 | **ne** | takoj, kjer AV1 ni podprt |
| `hero-zvok.webm` | AV1 | da | šele ob kliku na gumb |
| `hero-zvok.mp4` | H.264 | da | šele ob kliku, kjer AV1 ni podprt |

| Omejitev | Vrednost | Razlog |
|---|---|---|
| Teža tihe različice | **pod 1,5 MB** | Prenese se ob vsakem obisku naslovnice. Vercel Hobby ima mesečno kvoto prometa; pri 1,5 MB je strošek še obvladljiv, pri 5 MB ni |
| Dolžina zanke | **6–10 s** | Krajša se ponavlja opazno, daljša po nepotrebnem teža |
| Prvi in zadnji kader | čim bolj podobna | Da se prehod zanke ne vidi |
| Kamera | statična | Pan ali zoom naredi rez očiten prav takrat, ko bi moral izginiti |
| Rezi znotraj zanke | brez | En kader, ena poteza |
| Teža polne različice | ni trdne meje | Prenese se šele na klik, torej po obiskovalčevi odločitvi |

**Zakaj dve različici in ne ena z utišanim zvokom:** tiha se naloži takoj,
zato ne sme nositi avdio sledi, ki je nihče ne sliši.

**Zakaj dva zapisa vsake:** AV1 je bistveno manjši, a ga starejše naprave ne
znajo; H.264 stoji v `<source>` za njim kot rezerva.

⚠️ **Posnetek stoji na Vercelu, poleg strani — nikoli na YouTubu.** Vgrajen
predvajalnik bi obiskovalčev IP predal tretji osebi še pred klikom, kar
pravila strani prepovedujejo (glej `AGENTS.md` in `/zasebnost`).

## ⛔ Zakaj je bila smer b opuščena (22. 9. 2026)

Razdeljena postavitev je bila implementirana, objavljena v delovno drevo in
pregledana na živi strani. Ob pregledu se je pokazalo, kar iz vzorcev ni bilo
razvidno: **fotografija čez ves zaslon je močnejša od razdelitve.** Orkester v
polovici širine je fotografija ob besedilu; orkester čez ves zaslon je prizor,
v katerem besedilo stoji. Vzorec te razlike ni pokazal, ker je bil sam po sebi
omejen na širino stolpca.

Vrnjen je fullbleed hero z nadgradnjami, ki jih razdeljena postavitev ni imela:
slideshow iz mape, sezonske in jubilejne plasti ter napovednik kot nalepka.

### Kaj je iz smeri b preživelo

| Kaj | Kako naprej |
|---|---|
| `HeroMedij.astro` | Ostaja in je zdaj **bolj** na mestu: iz dveh stanj je zrasel v tri (posnetek / slideshow / ena slika). Fullbleed ozadje je natanko tisto, kar tak vmesnik potrebuje. |
| Napovednik | Ostaja, a kot **nalepka** čez rob fotografije, ne kot panel v stolpcu. |
| `naslednjiJavni()` | Nespremenjena. |
| `src/data/hero-video.ts` | Nespremenjen; stikalo za posnetek velja naprej. |
| Odstranitev panela „Naslednji javni dogodek“ | Velja naprej — razlog (podvojitev) se z obliko heroja ni spremenil. |

### Kaj je odpadlo

Razdeljena mreža, medijska plošča v stolpcu in napovednik kot panel. Skupaj z
njimi ključa `hero.naslednjic` in `hero.naslednjicGumb` ter `hero.medijAlt`.

## Odstranjen panel „Naslednji javni dogodek“

Ob uvedbi heroja je bil odstranjen `<aside class="izpostavljeni">`, ki je
stal med herojem in sekcijo Koncerti.

**Zakaj.** Hero je prevzel njegovo nalogo. Oba sta dogodek izbirala prek
iste funkcije `naslednjiJavni()`, zato sta **nujno** kazala isti dogodek —
napovednik v heroju in panel sto pikslov pod njim, z istim datumom, istim
nazivom in isto povezavo. To ni bralo kot poudarek, ampak kot napaka.

Odšlo je vse, kar je viselo nanj: spremenljivka `izpostavljeni`, oznake
panela, njegov slog (66 vrstic) in ključa `izpostavljeni.nadnaslov` ter
`izpostavljeni.gumb` iz obeh slovarjev. `naslednjiJavni()` **ostaja** v
`src/lib/koncerti.ts` — zdaj jo uporablja hero.

Ob odstranitvi je bilo treba popraviti ritem: panel je nosil svoj odmik
(34 px zgoraj, 34 px spodaj), spodnji odmik heroja pa je bil 90 px in
naravnan nanj. Brez panela je vrzel med herojem in prvo sekcijo narasla na
165 px, medtem ko je med sekcijami 149 px. Hero je zato dobil
`padding-bottom: var(--bbg-sekcija)` — isti žeton kot sekcije, brez nove
vrednosti. Izmerjeno po popravku: 149 / 149 / 149.

## Kaj se je spremenilo v smeri A

Do 21. 9. 2026 je hero smeri A stal na **fullbleed fotografiji v ozadju** z
enim stolpcem; razdeljena postavitev je bila element smeri C. Z izbiro smeri
b je A postala razdeljena, ozadje pa je odpadlo — fotografija je zdaj vsebina
plošče in ne tapeta. Mockup `smer-a.html` te spremembe ne pozna in se po
pravilu o zamrznjenih mockupih ne popravlja.

Ob tem sta bili nujni dve popravki, ki sta bili prej skriti v ozadju:

- slogan je bil `--bbg-gold-light`, ker je ležal na temnem prelivu čez
  fotografijo. Na podlagi strani bi bil na papirju neberljiv, zato je zdaj
  `--bbg-naslov`, ki je izmerjen v obeh temah;
- znak je izgubil `drop-shadow`, ki ga je ločeval od fotografije.

Elementi smeri C (badge, nalepka, uokvirjena fotografija) ostajajo v oznakah
in so pri A samo skriti — pravilo iz `AGENTS.md`.

## Odprto

| # | Naloga | Prioriteta | Status |
|---|---|---|---|
| 1 | Posnetek zanke po zgornjih omejitvah | 🟠 srednja | ☐ |
| 2 | Podvojitev z panelom „Naslednji javni dogodek“ | 🔴 visoka | ✅ panel odstranjen 21. 9. 2026 |
| 3 | Prelivanje pri < 400 px v sekciji Kontakt (`.panel` v `.dvostolpca`) | 🟡 nizka | ✅ `min-width: 0` na elemente mreže, 21. 9. 2026 |

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 21. 9. 2026 | Prvi zapis. Potrjena smer b, zavrnjen izrez čez črke, določene omejitve posnetka. |
| 21. 9. 2026 | Odstranjen panel „Naslednji javni dogodek“; spodnji odmik heroja usklajen z ritmom sekcij. |

---

# Fullbleed hero (velja od 22. 9. 2026)

> Stanje: 22. 9. 2026. Namen: kaj je hero po vrnitvi fullbleed oblike, katere
> nadgradnje ima in katere številke so izmerjene.

## Slike in slideshow

Slike živijo v **`src/assets/hero/`** in ne v `public/`: tako gredo skozi isto
Astrovo optimizacijo kot vse ostale slike v repozitoriju (`import.meta.glob`,
glej `src/lib/galerija.ts`). V `public/` bi se prenesle v izvirni velikosti.

**Vrstni red določa števčna predpona** (`01-`, `02-`, `03-`), ne abeceda in ne
vrstni red, v katerem datoteke vrne glob. Prva slika je LCP element naslovnice,
zato je to odločitev in ne stranski učinek poimenovanja. Manjkajoča ali
podvojena predpona **ustavi build** — tiho razreševanje bi pomenilo, da se LCP
slika lahko zamenja med dvema gradnjama.

| Slik v mapi | Kaj se zgodi |
|---|---|
| ena | statično ozadje, brez animacije in brez skripte |
| več | menjavanje: 9 s na sliko, prehod 1,8 s |
| — | `prefers-reduced-motion`: samo prva slika, skripta se ne zažene |

## Prenos — izmerjeno

Meritve z Lighthouse 13.5, `--preset=desktop`, lokalni `astro preview`, isti
stroj in ista nastavitev pred in po.

| | PRED (razdeljen hero) | PO (fullbleed + slideshow) |
|---|---|---|
| **LCP** | **0,6 s** | **0,6 s** |
| FCP | 0,5 s | 0,5 s |
| CLS | 0 | 0 |
| ocena Performance | 100 | 100 |
| hero slik ob obisku | 2 | **1** |
| hero bajtov ob obisku | 71 kB | **68 kB** |

LCP se kljub večji sliki ni poslabšal, ker:

- prva slika ima `fetchpriority="high"`, `loading="eager"` in **preload v
  `<head>`** (`Layout.astro`, samo na naslovnici — drugod heroja ni);
- druga in tretja slika **nimata atributa `src`**. Pot nosita v `data-src`,
  skripta jo pripne 2,5 s pred menjavo, torej ~6,5 s po nalaganju. Potrjeno z
  omrežnimi zahtevki: ob obisku se prenese ena sama slika.

Kdor naslovnico zapusti v treh sekundah, prenese eno sliko — ne glede na to,
koliko jih je v mapi.

## Kontrast — izmerjeno na vseh slikah

Fullbleed fotografija vrne problem, ki ga je razdeljena postavitev odpravila:
zlato besedilo čez svetle dele fotografije. Pri slideshowu se podlaga **menja**,
zato mora zavesa jamčiti kontrast za najslabšo sliko, ne za prvo.

Metoda: kompozit fotografije z zaveso, 95. percentil svetlosti v pasu, kjer
stoji besedilo (y 55–97 %, cela širina) — torej najslabši realni primer.

**Izhodišče (prejšnja zavesa 0,55 / 0,15 / 0,92 v temni, 0,35 / 0,08 / 0,55 v svetli):**

| Slika | slogan, temna | slogan, svetla |
|---|---|---|
| `01-kazina` | 7,93 | 7,18 |
| `02-oder-temni` | 6,48 | 5,45 |
| `03-oder-siroki` | 4,67 | **3,37** ⚠️ pade |

Prejšnja meritev v `README.md` („slogan doseže 9,82 :1“) je bila narejena samo
na sliki Kazina in je veljala samo zanjo.

**Zavrnjena rešitev:** enotna močnejša zavesa (0,55 / 0,28 / 0,86) je kontrastno
varna (najslabše 5,14 :1), a najtemnejšo fotografijo v mapi zadavi v črnino —
preverjeno na izrisu.

**Zavrnjena rešitev:** temna ploskev pod besedilom (`radial-gradient`) je
kontrastno odlična (najslabše 7,02 :1), a mora biti zasidrana na odstotek
**širine zaslona**, medtem ko besedilo stoji v stolpcu `.ovoj` (največ 1180 px,
sredinsko). Na 3440 px se razideta in ploskev konča levo od besedila.

**Izbrana rešitev:** en navpičen preliv s **štirimi** postajami —
`0,45 → 0,08 (38 %) → 0,60 (68 %) → 0,94 (100 %)`. Sredina ostane skoraj čista,
temna je samo spodnja četrtina, kjer besedilo res stoji. Ni odvisen od širine
zaslona in je **isti v obeh temah**: fotografija se s temo ne menja, zato se ne
sme ne zavesa.

| Slika | slogan `#E3C765` (prag 4,5) | znak `#C9A227` (grafika, prag 3,0) |
|---|---|---|
| `01-kazina` | 9,17 | 6,31 |
| `02-oder-temni` | 9,82 | 6,75 |
| `03-oder-siroki` | **6,32** | **4,35** |

### Meritev je samodejna

Zgornje številke niso enkraten ročni izračun — reproducira jih skripta:

```
npm run kontrast
```

`scripts/kontrast-hero.mjs` prebere **vse** slike iz `src/assets/hero/`, sestavi
kompozit z zaveso, v pasu besedila vzame 95. percentil svetlosti in izračuna
kontrast za obe barvi in obe temi. Ob padcu pod prag vrne **izhodno kodo 1**.

Vrednosti preliva **niso podvojene**: skripta in `Hero.astro` bereta isti vir,
`src/data/hero-zavesa.mjs`. Komponenta iz postaj sestavi CSS preliv, skripta
z istimi postajami meri. Dve kopiji bi se lahko razšli, meritev pa bi še naprej
poročala, da je vse v redu.

Preverba teče tudi v CI: `.github/workflows/preverbe.yml` jo požene ob vsakem
pull requestu in ob potisku na `main`, pred gradnjo. Neuspeh ustavi potek.

#### Ko skripta pade

Sta dve poti in tretje ni:

1. **Zamenjaj sliko** ali izberi kader z mirnejšim spodnjim predelom. Zavesa je
   naravnana na najslabšo sliko v mapi, zato ena svetla slika potegne za sabo
   vse ostale — vsem bi bilo treba pritemniti podlago zaradi ene.
2. **Prenaravnaj zaveso** v `src/data/hero-zavesa.mjs` (višja motnost v spodnjih
   postajah) in **meritev ponovi na vseh slikah**. Močnejša zavesa najtemnejšo
   sliko zadavi v črnino — to se je zgodilo pri prvi različici — zato po
   spremembi preveri tudi videz, ne le številke.

Skripta oba koraka izpiše ob padcu, da jih ni treba iskati tu.

## Plasti

Sezonske in jubilejne plasti so vodene podatkovno v **`src/data/hero-plasti.ts`**
(razpon, tip, parametri). Datumi niso v komponenti.

⚠️ **Odvisnost od dnevnega redeploya.** Stran je statična, zato se „danes“
razreši **ob gradnji** (`aktivnePlasti()` se kliče iz frontmatterja) in ne v
brskalniku. Brez nove gradnje bi sneg obvisel do marca. To pokriva
`.github/workflows/dnevni-redeploy.yml` (02.00 UTC vsak dan) — isti potek, ki
skrbi za filtriranje preteklih koncertov. Odjemalskega preverjanja datuma
namenoma ni: delovalo bi brez redeploya, a bi obletnico vezalo na uro na
obiskovalčevem računalniku.

| Plast | Razpon | Parametri |
|---|---|---|
| `sneg` | 1. 12. – 6. 1., vsako leto | 14 kosov, CSS animacija, brez canvasa |
| `jubilej` | november 2026 | 25 let društva |
| `jubilej` | vse leto 2027 | 30 let orkestra |

Datuma obletnic sta **iz naročila** in nista preverjena v `docs/bbg-osnova.md`
— pred objavo ju potrdi.

### Pravilo ob prekrivanju

1. **Različni tipi se seštevajo.** Sneg je vzdušje čez celotno fotografijo in
   stoji za vsebino, jubilej je znak v kotu. Ne tekmujeta za isto mesto ne za
   isto vlogo; december 2027 je res hkrati zima in jubilejno leto in obojega ni
   treba skrivati.
2. **Isti tip se izključuje; zmaga ožji razpon.** Če bi veljala dva jubileja
   hkrati, je ožji bolj določen (en mesec pove več kot celo leto). Brez tega
   pravila bi odločal vrstni red v seznamu, kar je naključje.

Oboje je preizkušeno: ob začasno prestavljenih datumih sta se izrisali obe
plasti hkrati, jubilejev pa samo eden — ožji.

### ⚠️ Jubilejni znak je placeholder

Pentljica v `Hero.astro` je **začasna**: pravokotnik z izrezom in številko.
Za dokončni element potrebujem:

- **SVG, ena barva** (`currentColor`), brez besedila v krivuljah — številka se
  menja (25, 30) in mora ostati besedilo ali pa jo je treba podati kot parameter;
- **razmerje stranic in varovalni prostor** — znak stoji v levem zgornjem kotu
  čez fotografijo, zato mora delovati na poljubni podlagi;
- odločitev, ali je **napis ob znaku** („let društva“) del grafike ali ostane
  besedilo. Zdaj je besedilo, ker se prevaja (`hero.jubilejDrustva`,
  `hero.jubilejOrkestra`) — če gre v grafiko, potrebujemo dve različici.

## Napovednik kot nalepka

Nadnaslov „napovedujemo“, pod njim datum z uro, naziv dogodka in kraj. Cel
element je povezava na podstran dogodka. **Brez prihajajočega javnega dogodka
nalepke ni** — nadomestnega besedila namenoma nima, ker prazna nalepka ni
nalepka, ampak luknja.

| Zahteva | Rešitev | Izmerjeno |
|---|---|---|
| dotikalna tarča ≥ 44 × 44 px | cel blok je povezava, `min-height: 44px` | 318 × 140 px pri 380 px |
| pri 380 px ne prekriva naslova, slogana, gumbov | pri ≤ 820 px izstopi iz absolutne postavitve in gre **pod gumbe** | prekrivanja ni; nalepka se začne pod gumbi |
| rotirano besedilo berljivo | −2,6° na namiznem, −1,2° pri ≤ 820 px | potrjeno |
| fokusni obroč sledi zasuku | `transform` je na samem elementu, ne na ovoju, zato ga `outline` sledi | — |

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 21. 9. 2026 | Prvi zapis. Potrjena smer b, zavrnjen izrez čez črke, določene omejitve posnetka. |
| 21. 9. 2026 | Odstranjen panel „Naslednji javni dogodek“; spodnji odmik heroja usklajen z ritmom sekcij. |
| 22. 9. 2026 | **Smer b opuščena**, vrnjen fullbleed hero s slideshowom, plastmi in nalepko. Zavesa preračunana na vse slike v mapi. |
| 22. 9. 2026 | Meritev kontrasta avtomatizirana (`npm run kontrast`, CI ob PR in push na main); vrednosti preliva preseljene v en vir. |
