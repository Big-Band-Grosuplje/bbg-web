# Vizualne smeri — mockupi in predogled

> Stanje: 31. 8. 2026. Namen: kje živita referenčna mockupa in kaj je
> predogled smeri A na živi strani, ter kaj ta predogled **ni**.

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

Mehanizem: inline skripta v `src/layouts/Layout.astro` postavi `data-skin` na
`<html>` še pred izrisom, tokeni in popravki so v `src/styles/brand.css` pod
`:root[data-skin='a']`, popravki, ki morajo premagati scoped pravila
komponent, pa v samih komponentah (`Nav.astro`, `Noga.astro`,
`VideoModal.astro`, `index.astro`, `zgodovina.astro`).

## ⚠️ Kaj predogled JE in kaj NI

**Je:** približek za odločanje — barve, tipografija, zaobljenosti, umirjena
razigranost. Dovolj, da se A in C primerjata na resnični vsebini, ne na
mockupu.

**Ni končna izvedba A.** Razlike, ki jih predogled zavestno ne pokriva:

| Element | A po mockupu | Predogled |
|---|---|---|
| Hero | fullbleed fotografija čez cel zaslon, `min-height: 88vh`, prelivni tint, znak in besedilo na dnu | ostane C-jeva dvostolpčna postavitev; zamenjana sta samo fotografija in slog |
| Kartica koncerta | datum ločen z navpično zlato črto | ostane C-jev temni blok z datumom, prebarvan |
| Obroba panelov | 1 px | 1 px, a obris fokusa ostane polna zlata (prosojna bi bila na temnem nevidna) |
| Vnosna polja | prosojna z zlato obrobo | prosojna podlaga brez obrobe |
| Svetla tema | je A nima | preklopnik teme je pri `skin=a` skrit, tema je vedno temna |

Te razlike so strukturne (postavitev, ne slog) in bi pomenile predelavo
komponent. Če bo smer A izbrana, jih je treba izvesti posebej.

## Vpliv na privzeto smer C

Nič. Brez atributa `data-skin="a"` se ne uporabi nobeno pravilo predoglega,
zato je izris pri `skin=c` enak kot pred uvedbo.

Pisavi za A (Playfair Display, Source Sans 3) sta uvoženi prek `@fontsource`,
kar doda samo `@font-face` pravila; brskalnik `woff2` prenese šele, ko je
družina dejansko uporabljena. Pri `skin=c` ni nobenega dodatnega prenosa —
preverjeno z `performance.getEntriesByType('resource')`. Isto velja za
A-jevo hero fotografijo: skrita je in ima `loading="lazy"`, zato se ne prenese.

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 31. 8. 2026 | Prva različica; dodan predogled `?skin=a` |
