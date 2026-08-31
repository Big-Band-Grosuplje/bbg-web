# Vizualne smeri — mockupi in predogled

> Stanje: 31. 8. 2026. Namen: kje živita referenčna mockupa, kaj je predogled
> smeri A na živi strani in kaj v njem še odstopa od mockupa.

## Datoteki

| Datoteka | Smer | Vloga |
|---|---|---|
| `smer-c.html` | C — Razigrana medenina | ✅ **potrjena smer**, referenca za dimenzije, sence, zaobljenosti, razmike in mikrorotacije |
| `smer-a.html` | A — Zlati klub | referenca za predogled `?skin=a` |

Mockupa sta samostojni HTML datoteki in nista del builda. Pisave vlečeta z
Google Fonts CDN — to velja **samo zanju**; na strani je CDN prepovedan
(glej `CLAUDE.md`), pisave so samo-gostovane prek `@fontsource`.

## Predogled smeri A na živi strani

Naslov s parametrom, na katerikoli strani:

```
https://bigband-grosuplje.com/?skin=a     vklop predoglega
https://bigband-grosuplje.com/?skin=c     vrnitev na potrjeno smer C
```

Izbira se shrani v `localStorage` pod ključem `bbg-skin` in velja, dokler je
ne zamenjaš. Javnega gumba za preklop **ni** — obiskovalec brez parametra
predoglega ne more sprožiti. Ob aktivnem predogledu se na dnu prikaže
plavajoča značka „predogled: smer A · nazaj", ki vrne na C brez tipkanja
naslova.

Obe smeri imata **temno in svetlo temo**; preklopnik v navigaciji deluje v
obeh. Privzeta je temna.

Mehanizem: inline skripta v `src/layouts/Layout.astro` postavi `data-skin` in
`data-theme` na `<html>` še pred izrisom. Tokeni so v `src/styles/brand.css`
pod `:root[data-skin='a']` in `:root[data-skin='a'][data-theme='light']`.
Popravki, ki morajo premagati scoped pravila komponent, so v samih
komponentah prek `:global(:root[data-skin='a'])`.

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

## ⚠️ Kaj še odstopa

| Element | A po mockupu | Predogled |
|---|---|---|
| Besedila | mockup ima svoja | ostanejo besedila smeri C — predogled primerja **videz**, ne vsebine |
| Tint nad hero fotografijo | temen | temen tudi v svetli temi; besedilo nad fotografijo mora ostati svetlo |
| Obris fokusa | 1 px prosojna zlata kot pri obrobah | polna zlata — prosojna bi bila na temnem nevidna |
| Hero fotografija | `<img>` z `object-fit: cover` | CSS ozadje, torej brez `srcset` (razlog spodaj) |

## Zakaj je hero CSS ozadje in ne `<img>`

Skrit `<img>` Chrome prenese tudi z `loading="lazy"` — `display: none` nima
okvira, zato odložitev odpade. Privzeti skin C bi tako plačal fotografijo, ki
je nikoli ne pokaže. Ozadje v `var(--hero-a)` se ne zahteva, dokler pravilo ne
velja; izmerjeno z `performance.getEntriesByType('resource')`.

Isto velja za pisavi: uvoz prek `@fontsource` doda samo `@font-face` pravila,
`woff2` pa se prenese šele, ko je družina uporabljena. Izmerjeno: pri `skin=c`
se prenese osem datotek Archivo in nobena A-jeva, pri `skin=a` obratno.

## Vpliv na privzeto smer C

Geometrijska primerjava (položaj, velikost, barva, podlaga, pisava, teža,
transform, zaobljenost, senca vseh elementov) proti stanju pred uvedbo
predoglega: **na štirih od petih strani identično**. Na naslovnici je ena
namerna razlika — barva besedila na gumbu „Kdaj igramo?", glej spodaj.

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

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 31. 8. 2026 | Prva različica; dodan predogled `?skin=a` |
| 31. 8. 2026 | Predogled nadgrajen v zvesto izvedbo: fullbleed hero, svetla tema, datumski blok, obrobe polj; kontrastna revizija štirih kombinacij |
| 31. 8. 2026 | Popravljene odprte kontrastne napake svetle teme smeri C; vse štiri kombinacije brez napak |
