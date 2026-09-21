# Hero sekcija — smer b (razdeljeno z napovednikom)

> Stanje: **potrjeno 21. 9. 2026**. Namen: zapisati, katera smer je izbrana,
> kaj je bilo pri tem zavrnjeno in zakaj, ter pod katerimi pogoji bo dodan
> video posnetek. Posnetek ob potrditvi še ne obstaja.
>
> Ta zapis je **posnetek stanja ob potrditvi** in se ne posodablja sproti.
> Vir resnice za videz je živa stran (`src/components/Hero.astro`).

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
pravila strani prepovedujejo (glej `CLAUDE.md` in `/zasebnost`).

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
in so pri A samo skriti — pravilo iz `CLAUDE.md`.

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
