# Uvoz zgodovine dogodkov — predlog preslikave

> Stanje: **izvedeno, 22. 9. 2026**. Namen: kako se 320 zbranih zapisov iz
> `_vhod/zapisi.json` preslika v arhiv, katere odločitve so bile sprejete in kako
> se posamezen zapis pozneje prestavi med aktualne dogodke.
>
> `src/data/koncerti.json` in shema koncertov sta **nedotaknjena**. Arhiv je
> ločena datoteka in ločena stran. Mapa `_vhod/` ni in ne bo v gitu.

## Kaj gre noter in kaj ne

Po odločitvah ob pregledu (korak 1):

| Skupina | Št. | Ukrep |
|---|---|---|
| za uvoz | **292** | uvozi |
| — od tega združitev podvojenega datuma | −1 | 2007-03-08, dva vira istega snemanja |
| **skupaj za uvoz** | **291** | |
| zaključki projektov (`sql:projekti`) | 14 | ne uvažaj; niso nastopi |
| zasebni dogodki (poroke, zakonski stan) | 9 | ne uvažaj |
| TBD (nepotrjeni, 2026) | 3 | ne uvažaj; ko se potrdijo, gredo v `koncerti.json` po običajni poti |
| odpovedani | 2 | ne v `koncerti.json`; predlog vrstice za kroniko spodaj |

### Zasebni dogodki, ki izpadejo

| Datum | Kraj | Zapis |
|---|---|---|
| 2003-09-06 | Ljubljana | nastop na poročnem slavju (navedena poimensko) |
| 2004-05-22 | Radomlje | poroka zmagovalnega para akcije „Tek nevest" |
| 2007-05-19 | Otočec | „še enega člana smo pospremili v zakonski stan" |
| 2007-05-19 | Otočec | „Nastop na poroki." — isti dogodek, drugi vir |
| 2007-08-13 | Grosuplje | „v zakonski stan smo pospremili našo članico" |
| 2009-06-27 | Medana | nastop na poroki, navedena pevka |
| 2009-08-08 | Bled | nastop na poroki |
| 2019-09-14 | Jezeršek | poroka; gost Savizon |
| 2021-09-18 | Vipava | poroka — Sinatra; gost Blaž Vrbič |

**Devet, ne deset.** V prvem pregledu sem jih naštel deset in mednje po pomoti
uvrstil `2006-10-25` — „samostojni koncert poimenovan *Jesenska glasbena
promenada*". To je **javni koncert** in ostane. Vzorec ga je ujel, ker besedilo
omenja, da je pevska gostja tisti dan praznovala 18. rojstni dan. Izpade osebna
podrobnost, ne dogodek: pri prenosu opisa se ta stavek odreže.

### Predlog vrstice za `docs/kronika.md` (ne dodajam je sam)

```
- **7. 3. 2020** — koncert z Urošem Perićem v Kulturnem domu Grosuplje je bil
  odpovedan (epidemija).
- **december 2021** — božično-novoletni koncert je bil odpovedan.
```

Datum drugega je znan samo do meseca. Razlog odpovedi ni v viru — zgoraj je
zapisan po sklepanju iz datuma in ga je **treba potrditi**, sicer naj stavek v
oklepaju odpade.

## Odločitev, ki je pred preslikavo: kam sploh gredo

To je edino vprašanje, ki spremeni vse ostalo, zato stoji pred tabelo polj.

### Odločeno: zgodovinski vnosi **ne** gredo v `koncerti.json`

Nov arhivski nabor podatkov (`src/data/arhiv-uvoz.json` +
`src/data/arhiv-rocno.json`, glej „Dve datoteki" spodaj) in **ena** stran
`/arhiv` (`/en/archive`) s kronološkim seznamom. Brez podstrani.

**Zakaj ne v `koncerti.json`:**

1. **Model zahteva, česar v viru ni.** Obveznih polj je dvanajst: `id`, `slug`,
   `slugEn`, `naziv`, `opis`, `gostje`, `datumIso`, `ura`, `datumOpis`,
   `lokacija`, `zasedba`, `vstop`. Vir ima zanesljivo `datumIso` in `kraj`,
   pogojno `prizorisce` (114 od 291) in `zasedba` (44 od 291). Vse ostalo bi
   bilo treba **izmisliti** — pri 291 vnosih to ni dopolnjevanje, ampak
   izmišljanje podatkov.

2. **300 podstrani s tremi vrsticami je SEO breme, ne pridobitev.** Podstrani
   nastanejo iz `koncerti.json` samodejno (`src/pages/dogodki/[slug].astro`),
   torej **582 novih strani** (slovenske in angleške) in prav toliko vpisov v
   sitemap. Vsaka bi nosila en stavek opisa. Tanka vsebina v takem obsegu
   iskalnikom ne pove ničesar novega o strani, razredči pa tiste podstrani, ki
   vsebino imajo.

3. **`koncerti.json` bi izgubil pomen.** Zdaj pomeni „dogodki, ki jih
   napovedujemo in nanje vabimo". Petim vnosom bi jih dodali 291 in datoteka bi
   postala arhiv s petimi aktualnimi vnosi.

4. **Arhivska vrednost je v seznamu, ne v straneh.** Vprašanje, na katerega
   arhiv odgovarja, je „kdaj in kje so igrali" — kronološki seznam nanj odgovori
   bolje kot 291 strani, ki jih je treba odpirati eno po eno.

**Pot za posamezen dogodek ostane odprta.** Če kak zgodovinski dogodek pozneje
zasluži svojo stran (fotografije, posnetek, zgodba), se **prestavi** iz
arhiva v `koncerti.json` in takrat dobi naziv, slug in opis — ročno in
zavestno. Prestavitev je dogodek sam po sebi, ne stranski učinek uvoza.

### Če bi kljub temu šlo v `koncerti.json`

Takrat sta nujna dva dodatka k shemi, ker brez njiju nastane prav tisto breme:

- polje `arhivski: true`, ki podstran označi z `noindex` (lastnost že obstaja v
  `Layout.astro`) **in** jo izloči iz sitemapa (`filter` v `astro.config.mjs`, po
  vzoru izločitve zaprtih dogodkov);
- polje `naziv` bi moralo postati neobvezno, sicer ga je treba pri 291 vnosih
  izmisliti.

Oboje je sprememba sheme in je **zunaj tega predloga**.

## Preslikava polj

Velja za `arhiv-uvoz.json`. Stolpec „ko vira ni" pove, kaj se zgodi, kadar je polje
prazno — nikjer se ne ugiba.

| Ciljno polje | Iz česa nastane | Ko vira ni |
|---|---|---|
| `datumIso` | `datumIso` | ne more manjkati (320/320) |
| `natancnost` | `natancnost` (`dan` \| `mesec`) | — (320/320); pri `mesec` se izpiše „december 2021" brez dneva |
| `ura` | `ura` | `null`; v izpisu se ura izpusti (5 od 291 jo ima) |
| `kraj` | `kraj` | ne more manjkati po popravku (291/291) |
| `prizorisce` | `prizorisce`, poenoteno po tabeli spodaj | `null`; izpiše se samo kraj (114 od 291 ga ima) |
| `zasedba` | `zasedba`: `BBG` → `big-band`, `combo` → `combo`, `BBG in combo` → `big-band` + opomba | `null`; značke ni (44 od 291) |
| `opis` | `besedilo`, očiščeno | `null`; vrstica pokaže samo datum in kraj (16 od 291 je brez) |
| `naziv` | **ne nastane strojno** | `null` — glej spodaj |
| `vir` | `vir` | ne more manjkati; pri združenih vnosih oba vira |
| `id` | `datumIso` + `-` + slug kraja | ne more manjkati |

**Česar v arhivskem zapisu namenoma ni:** `slug`, `slugEn`, `nazivEn`, `opisEn`,
`opisSeo`, `gostje`, `vstop`, `lokacija` kot strukturiran objekt. Arhivska
vrstica ni stran in teh polj ne potrebuje.

### Naziv

**Kjer naziva ni, polje ostane `null` in se ne ugiba.** Ocena iz pregleda: pri
15–20 % je iz besedila mogoče predlagati naziv (ime v navednicah, prepoznavno
ime festivala), pri ostalih ne. Tudi tistih 15–20 % gre skozi tvoj pregled — vsi
so predlog, ne prevzem.

V izpisu se vrstica brez naziva izriše kot **datum · kraj · prizorišče**, z
opisom pod njo. To je popolna vrstica in ne okrnjena: pove natanko to, kar vir
ve.

### Šestnajst vnosov brez besedila

Ostanejo, kot si določil. V `arhiv-uvoz.json` dobijo `opis: null` **in**
`zaDopolnitev: true`. Zastavica je edini razlog za svoj obstoj: v delovni
datoteki jih je z njo mogoče najti z enim iskanjem, brez nje pa bi jih bilo
treba loviti po praznem polju.

Petnajst jih je iz vira „seznam 2015–2018 (kratki zapisi)", eden iz
`sql:leto_2004`.

## Slug

Za arhivski zapis slug **ni potreben** — vrstica ni stran.

Kadar se vnos prestavi v `koncerti.json` in dobi stran, naj slug nastane po
pravilu:

```
YYYY-MM-DD-<kraj>        npr.  2011-04-20-grosuplje
```

**Nikoli iz naziva.** Slug se po objavi ne spreminja (pravilo v `AGENTS.md`),
naziv pa se pri teh vnosih dopolnjuje ročno in se bo spreminjal. Slug, izpeljan
iz naziva, bi se ob prvem popravku naziva razšel s samim seboj ali pa bi zamrznil
napačno ime v naslovu.

Preizkusil sem enoličnost na vseh 291 vnosih: **en sam trk**, in to pri
2007-03-08, ki je ravno podvojeni zapis, ki ga združujemo. Po združitvi je ključ
`datum + kraj` enoličen za vse.

`slugEn` bi moral biti vpisan ročno ob prestavitvi; rezerve na `slug` model
nima (`src/pages/en/events/[slug].astro` bere `koncert.slugEn` neposredno).

## nazivEn

Prevajanje 291 nazivov ni realno in ni potrebno.

- **V arhivu** polja ni. Stran `/en/archive` izpiše isti seznam; prevedejo se
  naslov strani, glave stolpcev in oznake zasedb — teh je manj kot deset in so v
  slovarju. Imena prizorišč in krajev se ne prevajajo (so lastna imena).
- **Ob prestavitvi v `koncerti.json`** je `nazivEn` **neobvezen** in koda pade
  nazaj na slovenski naziv (`nazivPrikaz: en ? (k.nazivEn ?? k.naziv) : k.naziv`).
  To je že uveljavljeno pravilo hiše — angleška stran pokaže slovensko ime,
  dokler prevoda ni.

Obvezen je torej samo `slugEn`, in ta nastane ob prestavitvi, ne ob uvozu.

## Poenotenje prizorišč

Ključ je **prizorišče + kraj**, ne prizorišče samo: „Kulturni dom" se v viru
nanaša na Grosuplje (8), Spodnjo Slivnico (2) in Stično (1).

| Poenotena oblika | Kraj | Kaj se zlije | Zapisov |
|---|---|---|---|
| Kulturni dom Grosuplje | Grosuplje | `KD Grosuplje`, `Kulturni dom`, `Kulturni dom Grosuplje` | 23 |
| Kulturni dom Spodnja Slivnica | **Spodnja Slivnica** | `Dvorana BBG`, `Dvorana KD`, `dvorana KD`, `KD Spodnja Slivnica`, `KD Spodnja Slivnica - dvorana big banda`, `Kulturni dom` | 10 |
| RTV Slovenija, Studio 14 | Ljubljana | `Studio 14`, `Studio 14 RA Slovenija`, `RTV Slovenija - Studio 14` | 4 |
| Cankarjev dom, Gallusova dvorana | Ljubljana | `Cankarjev dom – Gallusova dvorana` | 3 |
| Rezidenca veleposlanika ZDA | Ljubljana | trije zapisi, vključno z `U.S. Embassy, AG` | 3 |
| Knjižnica Grosuplje | Grosuplje | `Mestna knjižnica Grosuplje`, `Knjižnica Grosuplje` | 3 |
| Grand hotel Union | Ljubljana | `Hotel Union`, `Unionska dvorana` | 2 |
| Hotel & Casino Kongo | Grosuplje | dva zapisa | 2 |

**25 zapisov se zlije v 8**, kar zadene 50 od 119 vnosov s prizoriščem; različnih
prizorišč ostane 56 namesto 73.

**Se ne zliva:**

- `RTV Slovenija` (3) in `RTV Slovenija - NLP` (2) nista Studio 14 — NLP je druga
  dvorana;
- navadni `Cankarjev dom` (2) nima navedene dvorane in mu je ni dovoljeno
  pripisati.

Pri dvorani big banda je kraj **Spodnja Slivnica**, ne Grosuplje: gre za
samostojno naselje, občina pa ni kraj dogodka. Vir ima pri dveh zapisih
`kraj: Grosuplje` — to se ob uvozu popravi.

## Združitev podvojenih zapisov

Ostane ena, ker so ostale tri razrešile že izločitve:

| Datum | Kaj se zgodi |
|---|---|
| 2007-03-08 | **Združi.** Obdrži zapis iz `seznam 2007 (podroben)` (navaja Studio 14, aranžmaje Igorja Lundra in gosta), `vir` naj navaja oba. |
| 2005-06-17 | Ni več podvojen: dvojnik je bil zaključek projekta in izpade. |
| 2006-06-01 | Isto. |
| 2007-05-19 | Oba zapisa sta zasebni dogodek in izpadeta. |

## Odprto pred korakom 3

| # | Vprašanje | Prioriteta |
|---|---|---|
| 1 | Arhiv kot ena stran (predlog) ali vnosi v `koncerti.json` s spremembo sheme | 🔴 visoka |
| 2 | Razlog odpovedi pri obeh odpovedanih koncertih — v viru ga ni | 🟠 srednja |
| 3 | Ali arhiv pokaže tudi zasedbo in prizorišče ali le datum, kraj in opis | 🟡 nizka |

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 22. 9. 2026 | Prvi zapis. Predlog preslikave po pregledu 320 zapisov; popravljenih 13 vnosov v viru (ura izluščena iz kraja). |

---

# Izvedba (22. 9. 2026)

## Kaj je nastalo

| Datoteka | Vloga |
|---|---|
| `scripts/uvozi-arhiv.mjs` | pretvorba iz `_vhod/zapisi.json`; `npm run arhiv` |
| `src/data/arhiv-uvoz.json` | 291 vnosov iz skripte, v gitu; skripta jo ob vsakem zagonu prepiše |
| `src/data/arhiv-rocno.json` | ročne dopolnitve, v gitu; skripta je nikoli ne piše |
| `src/lib/arhiv.ts` | tipi, združitev obeh datotek, preverbe ob nalaganju, skupine po letih, števci |
| `src/components/strani/Arhiv.astro` | stran |
| `src/pages/arhiv.astro`, `src/pages/en/archive.astro` | ovoja |
| `src/i18n/poti.json` | par poti `arhiv` |

Izpis uvoza:

```
  prebrano iz vira         320
  − zasebni dogodek          9
  − nepotrjen (TBD)          3
  − odpovedan                2
  − zaključek projekta      14
  − združenih podvojenih     1
  = zapisano v arhiv       291
```

Od 291: naziv iz navednic 22, opis 275, za dopolnitev 16, prizorišče 114,
zasedba 44, ura 5.

## Dve datoteki: zakaj ročno delo ne živi ob uvoženem

Uvoz je stroj in ga bo treba pognati znova; dopolnjevanje 269 manjkajočih
nazivov je delo za mesece. V eni datoteki bi bil konec predvidljiv: prvi
`npm run arhiv` po prvem dopolnjevanju bi ročno delo prepisal. Opozorilo v
dokumentu tega ne prepreči — prepreči ga ločitev.

| Datoteka | Piše | Vloga |
|---|---|---|
| `src/data/arhiv-uvoz.json` | **samo skripta** | strojni prepis vira; vsak zagon jo zamenja v celoti |
| `src/data/arhiv-rocno.json` | **samo človek** | dopolnjeni nazivi in popravki; skripta je ne odpre za pisanje |

`src/lib/arhiv.ts` ju ob gradnji združi po `id`; **ročna vrednost prevlada**.

**Ključ je `id` iz uvoza,** oblike `YYYY-MM-DD-<kraj>`. Dovoljena polja so
`naziv`, `opis`, `zasedba`, `prizorisce`, `ura`. **Polja `kraj` med njimi
namenoma ni:** `id` nastane iz datuma in kraja, zato bi ročna sprememba kraja
podrla lasten ključ. Napačen kraj se popravi v `_vhod/zapisi.json` in uvoz se
požene znova.

```json
{
  "vnosi": {
    "2011-04-20-grosuplje": { "naziv": "Pomladni koncert" }
  }
}
```

**Kaj skripta ob ponovnem zagonu pove — in česa ne stori.** Ročne datoteke
prebere samo za primerjavo in ničesar ne odloči:

| Ugotovitev | Izpis | Kaj naredi skripta |
|---|---|---|
| vir ima drugačno vrednost, kot je ročno vpisana | ⚠ razhajanje, obe vrednosti izpisani | nič; ročna velja naprej, odločiš ti |
| ročni vnos nima več zapisa v uvozu | ⚠ sirota, z razlago vzroka | nič — a **gradnja pade**, ker bi bila vrednost sicer tiho izgubljena |
| vir zdaj navaja isto, kot je ročno vpisano | popravek je odveč, smeš ga izbrisati | nič |

Zagon brez `arhiv-rocno.json` deluje kot prej in to tudi izpiše.

**Preverjeno 22. 9. 2026,** v obeh smereh: ročno vpisana vrednost je preživela
ponovni `npm run arhiv` in se pojavila v `dist/arhiv/index.html`; podtaknjeno
razhajanje je skripta javila z obema vrednostma; sirota, nedovoljeno polje
`kraj`, prazen niz in neznana zasedba vsak zase podrejo `npm run build` z
imenom vnosa v sporočilu.

## Preverbe ob uvozu

Vse tečejo pred zapisom; ob padcu se **ne zapiše nič**, da datoteka nikoli ne
obvisi napol popravljena.

| Preverba | Kaj ujame |
|---|---|
| podvojen `id` | dva zapisa z istim datumom in krajem |
| vnos brez kraja | `id` bi postal `YYYY-MM-DD-brez-kraja` |
| **pokvarjeno kodiranje** | `U+FFFD` in mojibake — glej spodaj |
| **oblika ure** | karkoli, kar ni `HH:MM` |
| razhajanje z `arhiv-rocno.json` | samo izpis, ne pade |
| sirota v `arhiv-rocno.json` | samo izpis; pade `npm run build` |

### Kodiranje

Napačno prebran vir je **tiha** napaka: JSON je veljaven, build steče, vidi se
šele na objavljeni strani. Obliki sta dve in nastaneta v nasprotnih smereh:

| Oblika | Videz | Kaj se je zgodilo | Popravljivo? |
|---|---|---|---|
| `U+FFFD` | „obmo?je" | dekodirnik bajta ni razumel in ga je **zavrgel** | ne — znaka ni več |
| mojibake | „ÄŒatež" | UTF-8 bajti, brani kot latin-1/cp1252 | da — podatek je cel, le narobe razložen |

Mojibake se prepozna po **paru**: vodilni bajt UTF-8 (`Â Ã Ä Å`) in za njim
nadaljevalni bajt, ki ga cp1252 preslika v enega od znakov `0x80–0xBF`. Par je
nujen — sam `Å` nastopa v skandinavskih, `Ã` v portugalskih imenih in bi
lastno ime gosta po krivem podrlo uvoz.

**Preizkušeno 22. 9. 2026 v vseh treh smereh** (podtaknjeno v `_vhod/`, nato
povrnjeno): `U+FFFD` pade z vrsto `U+FFFD`, `ÄŒateÅ¾` pade z vrsto
`mojibake`, zapis „gosta Åsa Nordin (S) in João Álvares" pa **ne** pade.

### Oblika ure

`ura` je vedno `HH:MM` z dvopičjem. Piko postavi šele izpis za slovenščino
(`formatDatum` v `src/lib/koncerti.ts`, `ura.replace(':', '.')`), angleščina
obdrži dvopičje; iz istega polja nastane tudi `${datumIso}T${ura}:00`. Pika v
podatkih bi oboje pokvarila, na slovenski strani pa bi bila videti pravilna —
zato preverba. Preizkušena z začasno zamenjavo dvopičja s piko: pade in našteje
vseh pet vnosov z uro.

## Čiščenje vira

Izvoz iz SQL dumpa ponekod potegne v stolpec `kraj` smeti razčlenjevalnika ali
uro. Popravki so v skripti in **ne** v `_vhod/zapisi.json`:

| Vzorec v viru | Rezultat | Zakaj |
|---|---|---|
| `":: Grosuplje"`, `"-- php"` | predpona odpade | ostanek SQL oziroma PHP komentarja |
| `"19.30; Grosuplje"` | `ura: "19:30"`, `kraj: "Grosuplje"` | dve vrednosti v enem stolpcu |

⚠️ **Zakaj v skripti in ne v viru:** mapa `_vhod/` ni v gitu in se ob novem
izvozu zamenja. Popravek, vpisan tja, se izgubi **tiho**. To se je 22. 9. 2026
tudi zgodilo: nov izvoz (popravljena Č in č) je s seboj prinesel prejšnjo,
nepopravljeno obliko `kraj` in vseh pet ur je izginilo. Čiščenje v skripti se
uveljavi ob vsakem zagonu.

Čiščenje teče **pred** poenotenjem prizorišč, ker je ključ v `PRIZORISCA`
prizorišče + kraj: `"Rezidenca …|:: Ljubljana"` se ne bi ujel z nobenim
pravilom in prizorišče bi ostalo nepoenoteno.

### Kraj, ki je izpadel iz imena prireditve

V preglednici 2019–2026 in v kratkih seznamih 2015–2018 je kraj svoj stolpec,
zato je iz imena prireditve izpadel: „Grosuplje v jeseni" je zapisano kot kraj
`Grosuplje` + besedilo `"v jeseni"`. Na strani ostane vrstica „v jeseni", ki ni
ime ničesar.

⚠️ **Odreza ne dela skripta.** Preverjeno s primerjavo vira in izhoda: z začetka
besedila ne odreže ničesar pri nobenem od 291 zapisov. Odrez je v viru; skripta
ga povrne.

**Varovalo:** kraj se prilepi nazaj samo, kadar se besedilo začne s **predlogom**
(`v`, `na`, `ob`, `pri`, `pod`, `za`, `med` …). Predlog je slovnični znak, da
je besedilo nadaljevanje in ne samostojen stavek.

| Pravilo | Ujame | Napačno |
|---|---|---|
| predlog na začetku | **3** | 0 |
| „začne se z malo začetnico" | 270 | 267 — „Grosuplje županov sprejem", „Ljubljana sprejem ameriškega veleposlaništva" |

Preizkušeno 22. 9. 2026 tudi v napačno smer: z odstranjenim predlogovim
varovalom je skripta povrnila kraj pri 270 zapisih in izpis je pokazal nesmisle;
z varovalom pri treh, vsi pravi. Povrnjene zapise skripta **našteje v poročilu**
— če jih kdaj nastane več, se to vidi in ne zgodi tiho.

Povrnjeni so: `2015-09-19`, `2023-09-15`, `2026-09-18` — vsi „Grosuplje v jeseni".

### Popravki posameznih zapisov

| Datum | Popravek | Podlaga |
|---|---|---|
| `2006-10-25` | iz opisa odpade rojstni dan gostje | osebna podrobnost; dogodek je javni koncert in ostane |
| `1999-07-31` | `ÄŒateÅ¾` → `Čatež` | deterministična odprava napačnega dekodiranja |
| `1999-07-31` | `kraj`: `"-- php"` → `Čatež` | prejšnji izvoz je tu imel isto ime (od tod prejšnji `id` `1999-07-31-atez`) |
| `2008-01-26` | `Eva černe` → `Eva Černe` | mala začetnica je nastala pri popravljanju kodiranja, ne v viru |
| `2026-07-10` | `MarezziJazz` → `Marezijazz` | festival v Marezigah; starejša zapisa (2015, 2022) sta pravilna |

⚠️ **Odprto za človeka pri `1999-07-31`:** besedilo pravi „koncert na
Obolnarjevi kmetiji **v Dolenji vasi** ob zaključku poletnega seminarja **v
Čatežu**". Kraj dogodka je torej morda Dolenja vas, Čatež pa kraj seminarja.
Vir trdi Čatež, zato skripta trdi Čatež in ne odloča sama.

## Zasedba: izpeljava iz besedila

Zasedbo ima **zapisano 44** od 291 vnosov. Za ostale velja domensko pravilo:
*če zapis izrecno ne omenja comba ali male zasedbe, je igral big band.* Pravilo
stoji na tem, kako se je zapisovalo — combo se je vedno navedel, orkester je bil
privzetek.

| Izvor | Vnosov | Kako nastane |
|---|---|---|
| `zapisano` | 44 | vir je polje `zasedba` izpolnil |
| `izpeljano` | 247 | sklep iz besedila (37 combo, 210 big band) |
| `rocno` | 0 | človek je vpisal v `arhiv-rocno.json` |

Vsak vnos nosi polje `zasedbaVir`. **Brez njega bi bilo 210 vnosov videti kot
zabeležen podatek, čeprav so sklep iz odsotnosti besede.** Kdor bo kdaj našel
dokaz, da je bil kak nastop combo, mora videti, da popravlja privzetek.

Izpeljava teče **ob uvozu in ne ob izrisu**: pravilo je zapisano enkrat, njegov
rezultat je v gitu in ga je mogoče prebrati brez poganjanja strani.

### Zasedba je množica

Na istem dogodku sta lahko nastopila oba, zato je `zasedba` **polje** in ne niz:

```json
["big-band"]            samo orkester
["combo"]               samo combo
["big-band", "combo"]   oboje na istem dogodku
```

⚠️ **Dvojno zasedbo pozna samo vir.** Iz besedila je NE izpeljujemo, čeprav
večina zadetkov za combo omenja tudi big band. Zveza „Combo zasedbe **Big Banda
Grosuplje**" je rodilniško določilo — pove, čigav combo je, ne da je poleg igral
še orkester. Tako je zapisanih 19 od 37 zadetkov; mehansko pravilo „omenja oboje
→ oboje" bi jih vse napačno označilo kot dvojne.

V viru ima vrednost `"BBG in combo"` **en sam zapis, 18. 9. 2021 (Zemono)**, in
ta je zasebni dogodek (poroka), torej izločen. **V arhivu zato trenutno ni
nobenega vnosa z obema zasedbama** — model ga podpira, podatka pa ni.

### Pregled vseh 37 zadetkov

Pregledani so bili vsi. **Nobeden ne uporablja besede „combo" v drugem pomenu**
— nikjer ne gre za combo tujega orkestra. Oblike so tri:

| Oblika | Zadetkov | Primer |
|---|---|---|
| „Combo zasedbe Big Banda Grosuplje …" | 19 | 15. 3. 2009, oddaja NLP |
| „Combo BBG" (tudi „X & Combo BBG") | 8 | „Prifarski muzikanti & Combo BBG" |
| „Combo zasedbe …" brez omembe orkestra | 8 | 24. 10. 2013, Ringlšpil Bar |
| „Mala zasedba …" | 2 | 25. in 26. 11. 2013, Prifarski muzikanti |

Pri zadetkih z drugim izvajalcem („Help! A Beatles Tribute Band & Combo BBG",
„Prifarski muzikanti & Combo BBG", „Combo zasedbe big banda s skupino Pop
Design") je drugi izvajalec **gost**, ne naša druga zasedba — zato ostane pri
`["combo"]`.

### Filter po vsebovanosti

Izbira „combo" pokaže tudi dogodke, kjer sta bila oba: ujemanje je po
vsebovanosti in ne po enakosti, tako v `stevci()` kot v skripti na strani.
Števila se s tem prekrivajo in njihova vsota preseže 291.

Da to ni videti kot napaka, stoji pod gumbi vrstica „Pri N dogodkih sta nastopili
obe zasedbi in se štejejo pri obeh izbirah." — **izpiše se samo, kadar takih
dogodkov res je** (danes jih ni, zato vrstice ni). Ednina ima svoj niz, ker bi
zamenjava samo števila dala „pri 1 dogodkih".

Izbira **„ni zapisano" je odpadla**: zasedbo ima zdaj vsak vnos. Namesto nje je
pod uvodom ena vrstica, ki pove, koliko jih je izpeljanih in po kakšnem pravilu.
Prej je število 247 stalo ob izbiri filtra, kjer je bilo videti kot podatek o
dogodkih; zdaj stoji ob razlagi, kjer je podatek o zanesljivosti.

## Naziv v opisu: odrez ob izrisu

Kjer je naziv izluščen iz opisa, ga opis še vedno nosi. Obliki sta dve:

| Oblika | Vnosov | Primer | Izrez |
|---|---|---|---|
| **A** naziv VODI opis | 3 | `"Images"; gostje Klara Lavriša, Žan Cesar` | čist — ostane „gostje Klara Lavriša, Žan Cesar" |
| **B** naziv je SREDI stavka | 19 | `Nastop na prireditvi "Grosuplje v jeseni".` | pusti luknjo — „Nastop na prireditvi ." |

Odrežemo **samo obliko A**, in to **samo ob izrisu** (`opisZaIzpis()` v
`src/lib/arhiv.ts`). Polje `opis` v podatkih ostane celo, zato je odločitev
obrnljiva brez ponovnega uvoza. Oblike B se ne dotikamo: naziv je tam del stavka
in izrez bi zahteval prepis vseh 19 — to je isti obseg dela kot dopolnjevanje
nazivov in sodi v `arhiv-rocno.json`.

Kadar od opisa ne ostane nič, se ne izpiše nič. **To ni isto kot „zapis brez
opisa"** — tista oznaka velja za vnose, ki opisa res nimajo, in tam ni naziva, ki
bi ga nadomestil.

## Predlogi za program in prireditev

**PRIREDITEV** je dogodek nekoga drugega, na katerem je BBG nastopil (Grosuplje v
jeseni, Marezijazz, JSKD festival). **PROGRAM** je lasten projekt orkestra, ki
živi prek več nastopov (Images, Ellingtonia, Poklon Gordonu Goodwinu).

⚠️ **Polj `program` in `prireditev` v podatkih (še) ni in skripta ničesar ne
vpisuje.** Registra še ne delamo. Namesto tega `npm run arhiv` zapiše predloge v
**`_vhod/predlogi.md`**, kjer jih je mogoče pregledati in potrditi. Register bo
nastal iz potrjenega seznama in ne obratno — tako nastane iz podatkov in ne
podatki iz njega.

| | Imen | Vnosov |
|---|---|---|
| program | 12 | 35 |
| prireditev | 15 | 25 |
| **skupaj pokritih** | | **56** od 291 |
| brez obojega | | 235 |

**Zakaj dve polji in ne eno s tipom:** štirje vnosi imajo oboje hkrati —
`2026-07-10` („Marezijazz (Goodwin)"), `2026-05-16` („JSKD festival (Goodwin)"),
`2022-06-09` („Marezijazz – Coffin") in `2013-08-22` (festival Noči v stari
Ljubljani, projekt A Swinging Affair). Program se **izvaja na** prireditvi; eno
polje bi te štiri prisililo v izbiro, ki je ni treba delati.

**Sinatrovi nastopi so trije programi in ne eden:** `poklon-franku-sinatri`
(2005, 1), `a-swinging-affair` (2013, 5), `sinatra` (2019–2025, 9). Ista tema
nosi tri imena v treh obdobjih; združevanje bi zabrisalo, da gre za tri projekte.
Vrstni red in polje `razen` v `PREDLOGI_PROGRAMOV` skrbita, da se ne prekrivajo —
zapis iz 2013 pravi „Projekt A Swinging Affair – poklon Franku Sinatri" in bi se
sicer ujel z vsemi tremi.

⚠️ **Skripta `_vhod/predlogi.md` ne prepiše, dokler datoteka obstaja.** V njej so
lahko že vpisane odločitve, in prav ta napaka — strojni zapis čez ročno delo — je
razlog za delitev arhiva na dve datoteki. Za osvežitev datoteko izbriši.

**Prifarski muzikanti niso prireditev** in so bili iz predlogov odstranjeni: to je
gostujoča skupina, ne dogodek. Prireditev je „Prifarci gremo v svet". Prejšnja
ocena 61 pokritih vnosov je to štela zraven; po popravku jih je 56.

## Filtri

Vprašanje je bilo, kaj je ob 291 vnosih res uporabno.

| Merilo | Izvedba | Zakaj tako |
|---|---|---|
| **leto** | **kazalo za skok**, ne filter | 29 let je preveč za gumbe in premalo za izbirnik. Vnosi so že razvrščeni po letih z naslovi; skok je hitrejši od izbire, deluje **brez JS** in ničesar ne skrije. |
| **zasedba** | filter s **številom pri vsaki izbiri**, vključno z „ni zapisano 247" | Zasedbo ima zapisanih 44 od 291. Filter brez tega števila bi lagal z izpustom: izbira „combo" bi namigovala, da ostalih 247 ni bilo combo — česar ne vemo. S številom je izbira poštena. |
| **kraj** | Grosuplje (91) · Ljubljana (80) · drugje (120) | 74 različnih krajev je za filter nesmisel, dva pa pokrivata 59 % vnosov. Tretja izbira „drugje" pove, da ostalo obstaja, in ne zahteva seznama. |

**Filtra po gostu ni** in ga tudi ne more biti: gostje v arhivskih zapisih niso
strukturirani — so v prostem besedilu opisa in ponekod jih sploh ni.

Filtriranje teče v brskalniku nad že izrisanim seznamom; vseh 291 vrstic je v
oznakah. **Brez JS ostane seznam v celoti berljiv**, le gumbi ne delujejo, kar je
pri arhivu sprejemljivo — njegova naloga je branje, ne iskanje.

Ob filtriranju se skrijejo tudi prazna leta, da med zadetki ni praznih naslovov;
kadar ni nobenega zadetka, se izpiše sporočilo.

## Strukturirani podatki

**Stran:** `CollectionPage` z `name`, `description`, `url`, `inLanguage` in
`about`, ki kaže na obstoječo entiteto orkestra (`#orkester`, isti `@id`, ki ga
na vsaki strani izpiše `Layout.astro`). Vse te trditve so resnične in preverljive
iz same strani.

**Posamezen vnos: nič.** `Event` zahteva vsaj `name`, `startDate` in `location`;
269 vnosov nima naziva, 177 nima prizorišča in nobeden nima naslova prizorišča
ali ponudbe. `Event` z izmišljenim `name` bi bil neresnična trditev, `Event` brez
`name` pa neveljaven. Strukturiranih podatkov ne silimo tja, kjer podatkov ni.

## Navigacija

Arhiv **ni** v glavni navigaciji. Dosegljiv je z gumba na dnu strani Zgodovina
(„Arhiv vseh dogodkov →"), ker je nadaljevanje iste vsebine: zgodovina
pripoveduje, arhiv našteva. V sitemapu sta samo strani sami, torej dva nova
vpisa, ne 291.

## Postopek: prestavitev zapisa med aktualne dogodke

Kadar zgodovinski dogodek zasluži svojo stran (fotografije, posnetek, zgodba),
se **prestavi** iz arhiva med koncerte. Prestavitev je zavestno dejanje in ne
stranski učinek uvoza.

**1. Odloči (ti).** Ali dogodek res zasluži stran? Merilo je, ali ima kaj, česar
vrstica v arhivu ne more pokazati — fotografije, posnetek, zgodbo, zunanje
objave. Če ima samo datum in kraj, ostane v arhivu.

**2. Dopolni manjkajoče (ti).** Arhivski zapis ima največ osem polj, model
koncerta zahteva dvanajst. Vpisati je treba:

| Polje | Od kod |
|---|---|
| `naziv` | ti — iz arhiva le, če ga je vir res navedel |
| `opis` | ti — arhivski `opis` je izhodišče, ne končno besedilo |
| `opisSeo` | ti — nevtralen povzetek, brez hišnega tona |
| `slugEn` | ti — rezerve na `slug` model nima |
| `gostje` | ti — iz opisa, s `tip` (`Person` / `MusicGroup`) |
| `vstop` | ti — `prost`, `vstopnice` ali `zaprt`; za pretekle praviloma `prost` |
| `lokacija` | iz `prizorisce` + `kraj`, dopolnjeno z ulico in pošto |

**3. Sestavi slug (jaz ali ti).** `YYYY-MM-DD-<kraj>`, npr.
`2011-04-20-grosuplje`. Nikoli iz naziva — razlog je zgoraj.

**4. Vpiši v `koncerti.json`** in **odstrani iz arhiva**. Dokler je zapis v
obeh, ga stran pokaže dvakrat — enkrat kot kartico oziroma podstran, enkrat kot
vrstico arhiva. Odstranitev je pri arhivu dvodelna, ker sta datoteki dve:

1. vnos odstrani iz `_vhod/zapisi.json` in poženi `npm run arhiv` — samo
   ročni izbris iz `arhiv-uvoz.json` bi naslednji zagon vrnil nazaj;
2. če je imel dogodek vrstico v `arhiv-rocno.json`, odstrani še njo. Uvoz jo
   javi kot siroto, gradnja pa pade, dokler je ne razrešiš — kar je namen:
   ročno napisanega naziva ni dovoljeno tiho izgubiti. Če je ta naziv tisti, ki
   ga vpisuješ v `koncerti.json`, ga najprej prepiši tja.

**5. Poženi `npm run build`.** Preverbe ob nalaganju modula (neznana zasedba,
podvojen id, neveljaven datum, sirota v ročni datoteki) padejo takoj, če je kaj
narobe.

## Zgodovina revizij

| Datum | Sprememba |
|---|---|
| 22. 9. 2026 | Prvi zapis. Predlog preslikave po pregledu 320 zapisov; popravljenih 13 vnosov v viru (ura izluščena iz kraja). |
| 22. 9. 2026 | Izvedba: 291 vnosov v `arhiv.json`, stran `/arhiv`, filtri, `CollectionPage`, postopek prestavitve. |
| 22. 9. 2026 | Vodilna ponovitev naziva odrezana ob izrisu (3 vnosi); podatki nedotaknjeni. Poenoteno črkovanje Marezijazz. Predlogi za program in prireditev v `_vhod/predlogi.md`. |
| 22. 9. 2026 | Kraj povrnjen v ime prireditve pri treh zapisih („Grosuplje v jeseni"), z varovalom na predlog. Ugotovljeno, da odreza ne dela skripta, ampak vir. |
| 22. 9. 2026 | Zasedba izpeljana za vseh 291 vnosov (44 zapisano, 247 izpeljano), model spremenjen v množico, dodano polje `zasedbaVir`. Filter po vsebovanosti; izbira „ni zapisano" odpade. |
| 22. 9. 2026 | Nov izvoz vira (popravljena Č in č v 6 opisih). Preverbi za kodiranje in obliko ure; čiščenje polja `kraj` preseljeno iz `_vhod/` v skripto, ker ga je zamenjava vira pobrisala. |
| 22. 9. 2026 | Naziv v vrstici arhiva zmanjšan z 18 na 15 px — enako kot kraj. Kontrast izmerjen po spremembi: temna 10,93 : 1, svetla 5,14 : 1. |
| 22. 9. 2026 | Uvoženo in ročno ločeno v dve datoteki (`arhiv-uvoz.json`, `arhiv-rocno.json`); opozorilo, da uvoz prepiše ročno delo, s tem odpade. Prejšnji postopek — „ob ponovnem uvozu ročne dopolnitve prenesi nazaj z `git diff`" — je bil odvisen od tega, da se človek spomni; ne velja več. Skripta razhajanja javi, gradnja pade ob siroti. |
