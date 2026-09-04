# Vizualne smeri — mockupa in izbrana smer

> Stanje: 31. 8. 2026. Namen: kje živita referenčna mockupa, katera smer je
> izbrana in kako je druga ohranjena kot predogled.

## ✅ Odločitev — 31. 8. 2026

**Potrjena in privzeta je smer A (Zlati klub).** Obiskovalec brez parametra
in brez shranjene izbire vidi A.

**Smer C (Razigrana medenina) je ohranjena kot predogled** prek `?skin=c`.
Ni odstranjena: njena pravila, vsebinski elementi (badge, nalepka,
dvostolpčni hero) in tokeni ostajajo v kodi in so pri A samo skriti oziroma
prepisani. Odločitev je s tem povratna brez arheologije.

Predhodna odločitev z istega dne, da je potrjena smer C, s tem ne velja več.
Ostaja zapisana tu, ker je del sledi razmisleka.

## Datoteki

| Datoteka | Smer | Vloga |
|---|---|---|
| `smer-a.html` | A — Zlati klub | ✅ **potrjena smer**, referenca za tipografijo, zaobljenosti, hero in kartice |
| `smer-c.html` | C — Razigrana medenina | referenca za predogled `?skin=c` (rotacije, trde sence) |

Mockupa sta samostojni HTML datoteki in nista del builda. Pisave vlečeta z
Google Fonts CDN — to velja **samo zanju**; na strani je CDN prepovedan
(glej `CLAUDE.md`), pisave so samo-gostovane prek `@fontsource`.

## Preklop med smerema

Naslov s parametrom, na katerikoli strani:

```
https://bigband-grosuplje.com/            privzeto: smer A
https://bigband-grosuplje.com/?skin=c     vklop predoglega smeri C
https://bigband-grosuplje.com/?skin=a     vrnitev na privzeto smer A
```

Izbira se shrani v `localStorage` pod ključem `bbg-skin` in velja, dokler je
ne zamenjaš. Javnega gumba za preklop **ni** — obiskovalec brez parametra
predoglega ne more sprožiti. Ob aktivnem predogledu C se na dnu prikaže
plavajoča značka „predogled: smer C · nazaj", ki vrne na A brez tipkanja
naslova.

Obe smeri imata **temno in svetlo temo**; preklopnik v navigaciji deluje v
obeh. Privzeta je temna.

### Mehanizem in ena past

`<html>` nosi `data-skin="a"` **že iz strežniškega izrisa**, ne šele iz
skripte. Zato privzeta smer velja tudi brez JS in se pisave smeri A
uveljavijo ob prvem izrisu — Archivo se ne prenese. Inline skripta v
`src/layouts/Layout.astro` atribut po potrebi prepiše na `c` (iz parametra
ali `localStorage`), enako kot postavi `data-theme`.

⚠️ **Past:** v `src/styles/brand.css` blok `:root` nosi vrednosti **smeri C**,
privzeto smer A pa `:root[data-skin='a']`, ki ga prepiše. Token, dodan samo
v `:root`, torej velja le za predogled C. Struktura je ob obratu ostala taka
namenoma: pravila smeri C so v tej obliki izmerjena in preverjena,
prestavljanje pa bi pomenilo tveganje brez učinka na izris. Popravki, ki
morajo premagati scoped pravila komponent, so v samih komponentah prek
`:global(:root[data-skin='a'])`.

## Kaj je izvedeno po mockupu

| Element | Stanje |
|---|---|
| Paleta, zaobljenosti (pilule), odsotnost trdih senc | ✅ |
| Tipografija Playfair Display / Source Sans 3 | ✅ pogojno naložena, glej spodaj |
| Ugasnjene rotacije in mikrorotacije, brez badgea in nalepke | ✅ |
| **Fullbleed hero** — fotografija čez celo širino, `min-height: 88vh`, prelivni tint, znak in besedilo spodaj levo | ✅ |
| **Datumski blok kartice** — navpično zlato ločilo namesto temnega bloka | ✅ tudi vodoravna različica na ozkem zaslonu |
| Kartica in panel — prosojna podlaga, 1 px zlata obroba | ✅ |
| **Obrobe vnosnih polj** — prosojno polje z zlato obrobo | ✅ |
| **Svetla tema** | ✅ izmerjena do AA |

### Svetla tema: omiljena hero in svetle kartice

Mockup ima samo temno različico, zato sta ti dve odločitvi naši.

**Hero.** Preliv je v svetli temi omiljen na `0,35 → 0,08 → 0,55` (v temni
ostane `0,55 → 0,15 → 0,92`). Berljivost je izmerjena na sami fotografiji:
območja, kjer stojijo znak, slogan in gumbi, so vzorčena iz izrezka, ki ga
pokaže `background-size: cover`, in za vsako je vzet 95. percentil svetlosti
— torej najslabši primer, ne povprečje.

| Element | Alfa preliva | Kontrast (najsvetlejših 5 %) |
|---|---|---|
| slogan `--bbg-gold-light` | 0,34 | **9,82 :1** |
| obrisni gumb | 0,44 | 11,70 :1 |

Spodnje postaje zato ni bilo treba potemniti in besedilo ne potrebuje sence.
Znak leži čez osvetljeni napis KAZINA in ima nizek kontrast **v obeh temah**
(1,26 :1 pri temnem prelivu, 1,48 :1 pri omiljenem) — je logotip, za katerega
merilo za besedilo ne velja, in ga ločuje `drop-shadow`.

`filter: brightness()` ni uporabljen: filter na `.hero` bi posvetlil tudi
besedilo in gumbe v njem.

**Kartice.** V svetli temi so svetle (odtenek panela) z zlato hairline obrobo,
ne inverzno temne kot pri C. Podlaga kartice od strani odstopa le za 1,09 :1,
zato mejo nosi obroba — ta gre v svetli temi na 55 % zlate namesto 30 %.
Datumski blok ostane ločen z navpično črto (kot v mockupu), ne kot temen blok.

Izmerjeno proti podlagi kartice `#EAE2D0`: besedilo `#171310` 14,32 :1,
meta vrstica in datum `#785F11` 4,73 :1. Letnica je pri A v temni temi
umirjena na 80 % barve; na svetli kartici nobena stopnja umiritve ne zdrži
(85 % → 3,58 :1, 90 % → 3,94 :1), zato ostane v polni barvi in hierarhijo
nosi velikost.

## ⚠️ Kaj še odstopa

| Element | A po mockupu | Predogled |
|---|---|---|
| Besedila | mockup ima svoja | ostanejo besedila smeri C — predogled primerja **videz**, ne vsebine |
| Obris fokusa | 1 px prosojna zlata kot pri obrobah | polna zlata — prosojna bi bila na temnem nevidna |
| Hero fotografija | `<img>` z `object-fit: cover` | CSS ozadje, torej brez `srcset` (razlog spodaj) |

## Zakaj je hero CSS ozadje in ne `<img>`

Skrit `<img>` Chrome prenese tudi z `loading="lazy"` — `display: none` nima
okvira, zato odložitev odpade. Ko je bila privzeta smer C, bi ta tako plačala
fotografijo, ki je nikoli ne pokaže. Ozadje v `var(--hero-a)` se ne zahteva,
dokler pravilo ne velja; izmerjeno z `performance.getEntriesByType('resource')`.

Zdaj je razmerje obrnjeno: fotografija se prenese pri privzeti smeri A, kjer
je vidna, pri predogledu C pa ne. Cena ostaja ista — pri A ni `srcset`.

## Ohranjenost smeri C

Smer C je bila do 31. 8. 2026 privzeta in je ves čas razvoja smeri A ostala
nedotaknjena: geometrijska primerjava (položaj, velikost, barva, podlaga,
pisava, teža, transform, zaobljenost, senca vseh elementov) proti stanju pred
uvedbo drugega skina je bila identična, razen namernih popravkov kontrasta,
ki so našteti spodaj. Ob obratu vlog se izris smeri C ni spremenil — samo
ni več privzet.

## Zakaj se pisave druge smeri ne prenesejo

Uvoz prek `@fontsource` doda samo `@font-face` pravila; `woff2` se prenese
šele, ko je družina dejansko uporabljena. Ker `<html>` nosi `data-skin="a"`
že iz strežniškega izrisa, je uporabljena družina od prvega izrisa Playfair
Display in Source Sans 3. Izmerjeno z `performance.getEntriesByType('resource')`:
pri privzeti smeri se prenese osem datotek smeri A in nobena Archivo, pri
`?skin=c` obratno.

## Kontrastna revizija (WCAG 2.1 AA)

Merjeno avtomatsko: efektivna podlaga se sestavi po prednikih z upoštevanjem
prosojnosti in motnosti, prag 4,5 :1 oz. 3 :1 za velik tekst. 5 strani ×
4 kombinacije.

| Kombinacija | Preverjenih | Napak |
|---|---|---|
| **C temna** | 437 | **0** |
| **C svetla** | 437 | **0** |
| **A temna** | 445 | **0** |
| **A svetla** | 445 | **0** |

### ✅ Popravljeno

| Napaka | Prej | Zdaj |
|---|---|---|
| Gumbi iz `<a>` (`Kdaj igramo?`, `Vstopnice`) — `a:link` (0,1,1) je premagal `.bbg-gumb` (0,1,0), zato zlato besedilo na zlati podlagi | 1,49 :1 (C temna), 2,34 :1 (C svetla), 1,45 :1 (A) | 7,50 :1 / 7,64 :1 |
| CTA `Najemi band` v svetli temi — `.nav a:link` (0,3,1) je premagal `.nav__cta:link` (0,2,1) | 3,35 :1 | 4,90 :1 |
| `--bbg-gold-dark` kot `--bbg-naslov` in `--bbg-nadnaslov` v svetli temi — 68 pojavitev (nadnaslovi, letnice časovnice, naslovi v nogi, `h3` v panelih) | 4,40 :1 na papirju, 4,06 :1 na panelu | **#806613**: 4,96 :1 na papirju, 4,58 :1 na panelu |
| Povezave v nogi znotraj `.noga__drobno` (`opacity: 0.65`) in `.novice__soglasje` (`0.8`) | 2,64 :1 in 3,47 :1 | motnost zamenjana z izračunano barvo, povezave niso več zatemnjene |
| `.oznaka` (`Gostje`, `Solisti`) pri 11 px in `opacity: 0.7`, ki se je množila z motnostjo starša | 4,04 :1 temna, 3,62 :1 svetla | 12 px brez motnosti |
| `.uvod` na `/zasebnost` z `opacity: 0.95` nad temno zlato | 4,50 :1 C, 4,21 :1 A | motnost odstranjena: 4,96 :1 / 4,62 :1 |

Prve tri napake so bile v smeri C že pred uvedbo predoglega. Gumbi iz
`<button>` so bili ves čas v redu.

**Zakaj mešanje z barvo namesto motnosti:** motnost stisne cel poddrevesni
izris, torej tudi povezave v istem odstavku. `color-mix` z odstotkom, enakim
prejšnji motnosti, da natanko isto barvo odstavka (preverjeno: `rgb(170, 164,
153)` prej in potem), povezave pa obdržijo polno barvo.

**Zakaj #806613 in ne bolj potemnjeno:** doseže AA na obeh svetlih podlagah
smeri C. Na podlagi panela smeri A (`#EAE2D0`) doseže 4,26 :1, kar zadošča,
ker so tam naslovi Playfair 700 pri 22–23 px in zanje velja meja 3 :1. Če bi
kdaj potrebovali AA za normalno besedilo tudi na A-jevem panelu, je najsvetlejša
ustrezna vrednost `#7A6212` (4,55 :1 na vseh štirih podlagah).

### Zlato besedilo v A-svetli — ločen token, 4. 9. 2026

Zgornji odstavek je za smer C še vedno točen, za smer A pa **ne velja več**.
Trdil je, da 4,26 :1 na A-jevem panelu zadošča, ker gre za velik tekst. To po
WCAG drži (Playfair 700 pri 23 px je velik tekst, meja 3 :1) in kontrastna
revizija tam ni kazala napake — a je bila rezerva ničelna: prvi naslov v
manjši stopnji ali v lažjem rezu bi padel pod mejo neopazno, ker bi ostal
videti enak.

Zato ima svetla tema smeri A zdaj **ločen token za zlato besedilo**:

| Token | Vrednost | Vloga |
|---|---|---|
| `--bbg-zlato-besedilo` | `#785F11` | naslovi, nadnaslovi, meta, datumski blok |
| `--bbg-gold` | `#C9A227` | dekorativna zlata: črte, ikone, podlage gumbov |
| `--bbg-obroba-mocna` | `#806613` | hairline obrobe in obrisi fokusa (meja 3 :1) |

Merilo je **podlaga panela in kartice** `#EAE2D0` (color-mix ink 4 % čez
papir), ne papir strani `#F3EBD8` — vsak odtenek je na papirju za približno
0,4 boljši, zato je papir prešibko merilo:

| Odtenek | panel #EAE2D0 | papir #F3EBD8 | H / S |
|---|---|---|---|
| `#785F11` ✅ | **4,73 :1** | 5,14 :1 | 45° / 75 % |
| `#786117` | 4,63 :1 | 5,02 :1 | 46° / 68 % |
| `#7A6212` | 4,55 :1 | 4,94 :1 | 46° / 74 % |
| `#7F6210` | 4,45 :1 | 4,84 :1 | 44° / 78 % |
| `#806613` (prej) | 4,26 :1 | 4,62 :1 | 46° / 74 % |
| `#8A6A0F` | 3,93 :1 | 4,26 :1 | 44° / 80 % |
| `#946E00` | 3,63 :1 | 3,94 :1 | 45° / 100 % |

`#785F11` je bil v datoteki že prisoten kot zlato besedilo na kartici
(`--bbg-meta`, `--bbg-blok-besedilo`); z uvedbo tokena je ista vrednost
zapisana enkrat namesto dvakrat, naslovi pa se ji pridružijo.

**Zlata ostane zlata:** H=45°, S=75 % je bolj nasičeno od dekorativne
`#C9A227` (H=46°, S=68 %) in od prejšnjega naslova `#806613` odstopa le za
dve stopnji svetlosti. Vizualno preverjeno na A-svetli: naslova „Za
organizatorje" in „Pridruži se" berljivo zlata, brez rjavega zdrsa.
Nasičenejši `#946E00` ni bil potreben in kontrasta ne bi prenesel.

Velikosti in reza pisave popravek ne spreminja; temne teme in smeri C ne
zadeva.

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 31. 8. 2026 | Prva različica; dodan predogled `?skin=a` |
| 31. 8. 2026 | Predogled nadgrajen v zvesto izvedbo: fullbleed hero, svetla tema, datumski blok, obrobe polj; kontrastna revizija štirih kombinacij |
| 31. 8. 2026 | Popravljene odprte kontrastne napake svetle teme smeri C; vse štiri kombinacije brez napak |
| 31. 8. 2026 | Svetla tema A omiljena: svetlejša hero fotografija in svetle kartice koncertov |
| **31. 8. 2026** | **Potrjena smer A kot privzeta; smer C ohranjena kot predogled `?skin=c`.** Prejšnja odločitev z istega dne (potrjena smer C) s tem ne velja več |
| 4. 9. 2026 | Zlato besedilo v A-svetli dobi svoj token `--bbg-zlato-besedilo` `#785F11` (panel 4,73 :1); prej so naslovi stali na `#806613` pri 4,26 :1 brez rezerve. Dekorativna zlata in obrobe nespremenjene |
