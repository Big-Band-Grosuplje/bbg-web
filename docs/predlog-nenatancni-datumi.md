# Predlog: nenatančni datumi v modelu dogodka

> **Stanje: predlog, ni izveden.** 22. 9. 2026.
> Namen: omogočiti, da `koncerti.json` nosi tudi zgodovinske dogodke, ki jim
> ni znan dan — brez drugega vira in brez izmišljenih datumov.
>
> Podatkov in kode ta dokument ne spreminja. Kar je **že izvedeno**, je samo
> popravek dveh napak, ki sta arhiv onemogočali; opisan je v razdelku
> *Kaj je že popravljeno*.

---

## Zakaj

Arhiv preteklih koncertov mora brati isti vir kot napovednik, da se dogodek
po datumu sam preseli iz enega v drugega. Drugi vir bi pomenil dve resnici o
istem dogodku.

Zgodovinski zapisi so bistveno redkejši od današnjih. Meritev na 75 dogodkih,
izluščenih iz `docs/kronika.md` za mockup `docs/design/arhiv-koncertov.html`:

| Natančnost datuma | Vnosov | Delež |
|---|---|---|
| poln datum (`YYYY-MM-DD`) | 21 | 28 % |
| sam mesec (`YYYY-MM`) | 14 | 19 % |
| **sama letnica** | **40** | **53 %** |

Model danes sprejme prvi dve obliki, tretje ne. Brez nje **več kot polovica
zgodovine v `koncerti.json` ne more biti vpisana**, ne da bi si dan ali mesec
izmislili.

---

## Kje se izpelje natančnost

**Iz oblike `datumIso`. Ločenega polja ne uvajamo.**

Razlog je pravilo o podvojitvi iz `~/.claude/CLAUDE.md`: če bi obstajalo polje
`natancnost`, bi ga bilo treba ob vsaki spremembi `datumIso` popraviti hkrati
z njim. Dve vrednosti, ki ju je treba vzdrževati skupaj, sta spremenljivka na
dveh mestih — in ko se razideta, ni razsodnika. Dolžina zapisa pa natančnost
že **je**; drugič zapisana ne pove ničesar novega.

Isto velja za razvrstitveni ključ: izpelje se, ne shrani.

```js
natancnostDatuma('2003-06-24')  // 'dan'
natancnostDatuma('2003-06')     // 'mesec'
natancnostDatuma('2003')        // 'leto'   ← predlagana novost
natancnostDatuma(null)          // null
```

> ⚠️ Danes `natancnostDatuma` za `'2003'` vrne `null` (neprepoznano).
> Predlog je, da vrne `'leto'` in da `null` ostane samo za manjkajoč ali
> pokvarjen zapis. To je edina sprememba v `src/lib/datumi.mjs`.

---

## Kaj polje sprejme

`datumIso` sprejme tri oblike, vse veljaven ISO 8601:

| Oblika | Primer | Pomen |
|---|---|---|
| `YYYY-MM-DD` | `2015-12-19` | znan dan |
| `YYYY-MM` | `2005-10` | znan mesec, dan ni zabeležen |
| `YYYY` | `2003` | znana letnica, mesec in dan nista zabeležena |

`null` ostane pomensko ločen: **zapisa ni**, ne »ni znan«. Dogodek z `null`
ni ne prihajajoč ne uvrstljiv v arhiv in ob gradnji opozori.

`datumKonecIso` ostane samo poln datum — razpon se izrisuje po dnevih in
razpon dveh letnic ni dogodek, ampak obdobje.

---

## Razvrščanje

Nenatančen datum se **ne sme po naključju izriniti na rob leta**. Nadomestnega
dneva mu ne dodelimo; dobi izpeljan razvrstitveni ključ:

| Zapis | Natančnost | Ključ | Kam pade |
|---|---|---|---|
| `2003-06-24` | dan | `2003-06-24` | na svoj dan |
| `2003-06` | mesec | `2003-06-15` | v sredino junija |
| `2003` | leto | `2003-00-00` | v skupino na vrhu leta |

**Zakaj sredina meseca.** Prvi dan meseca potisne vse mesečne vnose pred vse
dnevne v istem mesecu, zadnji pa za njihov konec. Oboje je sistematična
napaka v eno smer. Sredina jih prepleta — kar je bližje resnici, ker o dnevu
ne vemo ničesar.

**Zakaj letni vnosi v svojo skupino.** Ključ `00-00` jih zbere na vrh leta,
pod naslov »brez znanega meseca«, in nikoli med datirane. Tako se nikdar ne
pojavi vprašanje, zakaj je koncert iz 2003 »januarja« ali »decembra« — ker ni
ne eno ne drugo, in izris tega ne trdi.

---

## Prikaz

Neznani del datuma se **ne nadomesti z znakom**. Pomišljaj ali vprašaj na
mestu dneva bralec prebere kot napako vnosa; prazno mesto prebere kot mejo
vednosti.

| Natančnost | Datumski blok | Vrstica pod naslovom | `<time datetime>` |
|---|---|---|---|
| dan | `19.` / `dec` / `2015` | (je ni) | `2015-12-19` |
| mesec | `okt` / `2005` — dneva ni, mesec prevzame njegovo velikost | »oktober 2005 · dan ni zabeležen« | `2005-10` |
| leto | `2003` v naslovni pisavi, brez okvirja | »leto 2003 · mesec in dan nista zabeležena« | `2003` |

Vsaka natančnost ima torej svojo **obliko**, ne svojega polnila. Videz je
preverjen v `docs/design/arhiv-koncertov.html`, razdelek *Nenatančen datum*.

Za `datumOpis` to pomeni, da pri letni natančnosti ni več le okrasje, ampak
edini berljivi zapis — a ostane izpeljiv iz `datumIso` in ga zato ni treba
vpisovati ročno.

---

## Kaj se zgodi z obstoječimi petimi vnosi

**Nič.** Vseh pet v `src/data/koncerti.json` ima poln `YYYY-MM-DD`:

| `datumIso` | `id` |
|---|---|
| `2026-09-09` | `sprejem-veleposlanistvo-zda-rezidenca-2026` |
| `2026-09-15` | `sprejem-veleposlanistvo-zda-vrt-lili-novy-2026` |
| `2026-09-18` | `grosuplje-v-jeseni-2026` |
| `2026-10-10` | `delavnica-jazz-aranziranje-krajncan-2026` |
| `2026-12-13` | `bbg-x-slon-in-sadez-2026` |

Predlagana razširitev je **čisti dodatek**: obstoječa oblika je še vedno
najnatančnejša in se obravnava enako kot doslej. Migracije podatkov ni,
polj se ne preimenuje, `slug` se ne dotika.

---

## Česa se dotakne

| Datoteka | Sprememba |
|---|---|
| `src/lib/datumi.mjs` | `natancnostDatuma` vrne `'leto'` za `YYYY`; `jePrihajajoc` za letno natančnost primerja konec leta |
| `src/lib/koncerti.ts` | `formatDatum` doda vejo za letnico; `datumBlok` vrne obliko glede na natančnost; nova izpeljava razvrstitvenega ključa |
| `scripts/preveri-datume.mjs` | primeri za `YYYY` se obrnejo iz »ni podprto« v »podprto« |
| `src/components/strani/Dogodek.astro` | vrstica o natančnosti pod naslovom |
| `AGENTS.md` | opis modela koncerta |

Ločenega polja v `koncerti.json` ni, zato shema ostane, kot je.

---

## JSON-LD

`startDate` sprejme delni datum: `"2003-06"` in `"2003"` sta veljavna ISO 8601
in veljavna vrednost za `schema.org/Date`. Zapis torej ostane strojno berljiv
pri vseh treh natančnostih in ničesar ne zaokrožujemo.

⚠️ Googlova dokumentacija za *Event rich results* zahteva `name`, `startDate`,
`location` in `location.address` (preverjeno 22. 9. 2026). Zgodovinski vnos
brez znanega prizorišča torej za Googlov rich result **ni upravičen** — ostane
pa veljaven, strojno berljiv `MusicEvent`, ki ga preberejo splošni pajki in AI
orodja. To je zavesten kompromis: nekaj je več od nič, izmišljen `Place` pa bi
bil manj od nič.

---

## Kaj je že popravljeno

Neodvisno od tega predloga, ker je koristno tudi brez arhiva
(commit `datumi: …`, 22. 9. 2026):

1. **`jePrihajajoc()` je za vsak neprepoznan zapis vrnil `true`.** Vnos brez
   datuma ali s samo letnico bi obstal v napovedniku za vedno. Zdaj vrne
   `false`, ob gradnji pa se izpiše opozorilo z `id` vnosa — da sprememba ni
   tiha.
2. **`musicEvent()` je zavrnil dogodek brez `lokacija`.** Zdaj je pogoj samo
   `datumIso`; `location` se izpusti, kadar prizorišče ni znano.

Obe pokriva `npm run datumi` (`scripts/preveri-datume.mjs`), ki teče tudi v
`.github/workflows/preverbe.yml` pred gradnjo.

---

## Kaj prinese uvoz

Ocena iz `docs/kronika.md` in `src/data/zgodovina.json`, brez dodatnih virov:

| Postavka | Ocena |
|---|---|
| Razločljivih dogodkov | **~75** (±15, odvisno od členjenja) |
| Od tega samo z letnico | **53 %** |
| Brez prizorišča in kraja | **37 %** |
| Brez gostov | **48 %** |
| Z znano fotografijo | **3** |
| Zajetih let | 27 od 29 (2009 in 2021 brez zapisa) |

Razpon ±15 ni ohlapnost ocene, ampak odločitev, ki jo je treba sprejeti:
turneja po Avstriji 2016 je lahko en vnos ali šest, »Ellingtonia« 2015 pa sta
dva koncerta na dveh prizoriščih ali en program.

### Neskladja med viroma — o teh je treba odločiti

| # | Vprašanje | `docs/kronika.md` | `src/data/zgodovina.json` |
|---|---|---|---|
| 1 | Katero leto je ustanovitev? | »10. obletnica« v 2008 ⇒ **1998**; »20 let« 15. 9. 2017 in »30 let« 2027 ⇒ **1997** | `ustanovitev.obdobje: "1997/98"` — vprašanja ne razreši |
| 2 | Do kdaj vodi Igor Lunder? | tabela: `2004–~2008`, nato `~2008–2012 manj aktivno obdobje` — a časovnica istega dokumenta navaja Lundra kot dirigenta koncerta 17. 7. 2010 | `obdobje: "2004–2011"` |
| 3 | Komu pripada 2019? | tabela: `sept. 2012–2019 Kotar`, `2019–2023 Javornik` | `kotar-prvo: "2012–2019"` in `javornik: "2019–2023"` — obe obdobji vsebujeta 2019 |
| 4 | Komu pripada 2023? | `jesen 2023–danes Kotar` | `javornik` in `kotar-drugo` imata **oba** vnos za 2023 |
| 5 | Koncert v atriju NUK 2022 (gost Peter Savizon, dirigent Kotar) | naveden | ni ga |
| 6 | Poletni seminar Kranjska Gora 2005, delavnica z Elektrik Jazz Quartetom, seminar Kobarid 2007 | navedeni | niso |

Prvi štirje zadevajo **filter po obdobju** in razvrstitev vnosa v obdobje —
brez odločitve bi imela dva vnosa isto leto v dveh obdobjih. Peti in šesti sta
preprosta dopolnitev.

⚠️ Kronika sama opozarja: »Datumi 2019–2024 iz preglednice: leto zanesljivo,
točen datum preveri pred objavo.« Teh letnic torej ni mogoče dvigniti na
dnevno natančnost brez zunanjega vira.

### Delovni obseg

| Korak | Ocena |
|---|---|
| Razširitev modela in koda | pol dneva |
| Odločitve o neskladjih (1–6) | zahteva Rokovo presojo, ne moje |
| Vpis ~75 vnosov | ~10–15 min na vnos ⇒ **13–19 ur** |
| Vez fotografija ↔ dogodek | ni je v modelu; `galerija.json` veže sliko na **leto** |

**Največji posamični vzvod je angleščina.** `nazivEn`, `opisEn` in `opisSeoEn`
za 75 arhivskih vnosov sta polovica zgornje ocene. Koda ob manjkajočem
angleškem polju že pade nazaj na slovensko, zato je mogoče arhivske vnose
vpisati **samo v slovenščini** in angleščino dodajati po potrebi. To je
odločitev, ne opustitev, in sodi v `AGENTS.md`, če se sprejme.

---

## Akcijski seznam

| # | Postavka | Prioriteta | Status |
|---|---|---|---|
| 1 | Odloči o letu ustanovitve (neskladje #1) — vpliva na jubileje in `llms.txt` | 🔴 | ☐ |
| 2 | Odloči o mejah obdobij 2019 in 2023 (#3, #4) | 🔴 | ☐ |
| 3 | Potrdi ali zavrni ta predlog modela | 🔴 | ☐ |
| 4 | Odloči, ali arhivski vnosi potrebujejo angleščino | 🟠 | ☐ |
| 5 | Odloči o členjenju turnej in ponovitev programa | 🟠 | ☐ |
| 6 | Vez fotografija ↔ dogodek v `galerija.json` | 🟠 | ☐ |
| 7 | Dopolni `zgodovina.json` z manjkajočimi dogodki (#5, #6) | 🟡 | ☐ |

---

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 22. 9. 2026 | Prva različica. Nastala ob reviziji podatkov o dogodkih in mockupu `docs/design/arhiv-koncertov.html`. |
