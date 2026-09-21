# Logotipi podpornikov — izvor, obdelava in pravila uporabe

Pripravljeno 21. 9. 2026. Vse datoteke v `public/podporniki/`.

## Kako so datoteke nastale

Izvorni logotipi so bili prejeti v rastrski obliki (JPEG/PNG, deloma z belo
podlago). Obdelava:

1. **Odstranitev bele podlage** — samo zunanja belina, prek flood-fill od robov,
   da beline *znotraj* oblik (ščit grba, notranjost pečata, polnila v znaku ZKD)
   ostanejo nedotaknjene. Robovi imajo dvopikselski mehki prehod.
2. **Obrez** praznih robov, normalizacija na 480 px višine.
3. **Vektorizacija** (VTracer, spline, nato SVGO) tam, kjer je rezultat vizualno
   zvest izvirniku. Preverjeno s primerjavo renderjev.
4. Izvoz PNG (fallback), WebP in SVG.

## Stanje po logotipu

| Ključ | Primarna datoteka | Vektor | Opomba |
|---|---|---|---|
| `obcina-grosuplje` | `obcina-grosuplje.svg` | ✅ vektoriziran | Na voljo tudi sam grb brez napisa (`obcina-grosuplje-grb.svg`) |
| `zkd-grosuplje` | `zkd-grosuplje.svg` | ✅ vektoriziran | Enobarven; bela knockout različica `zkd-grosuplje-belo.svg` |
| `gs-grosuplje` | `gs-grosuplje.svg` | ✅ vektoriziran | |
| `turizem-grosuplje` | `turizem-grosuplje.svg` | ✅ vektoriziran | Najčistejši rezultat (3,9 kB) |
| `jskd` | `jskd.webp` | ❌ | Mozaik iz pik se pri avtomatski vektorizaciji zlije — **zaprosi JSKD za uradni SVG/EPS** |
| `us-embassy` | `us-embassy.webp` | ❌ | Glej opozorilo spodaj |

**Vektorizacija je rekonstrukcija, ne izvirnik.** Pri vseh štirih vektoriziranih
logotipih velja: če dajalec pošlje uradno vektorsko datoteko, jo zamenjaj.
Za uradne datoteke zaprosi na:

- Občina Grosuplje — Urad za družbene dejavnosti (CGP občine)
- ZKD Grosuplje — tajništvo
- Glasbena šola Grosuplje — tajništvo
- JSKD — območna izpostava Grosuplje ali služba za odnose z javnostmi

## Pravila uporabe

- **Logotipov ne barvamo, ne popačimo, ne rotiramo in ne dodajamo učinkov.**
  Zato v `LogoZid.astro` ni sivinskega filtra: na temni podlagi večbarvni
  logotipi dobijo belo ploskev (`temnaStrategija: 'podlaga'`), enobarvni pa
  ločeno belo različico (`'belo'`).
- Logotip objavimo šele, ko imamo **pisno potrditev** dajalca za konkretni
  dogodek oziroma za stalno navajanje.
- Sofinancerji praviloma zahtevajo navedbo v vseh materialih projekta
  (vabila, plakati, program, spletna stran, družbena omrežja) — preveri pogodbo
  ali sklep o sofinanciranju.

### Veleposlaništvo ZDA — posebna previdnost

Datoteka `us-embassy.webp` je **uradni pečat veleposlaništva**, torej državni
simbol ZDA, ne prosto uporaben logotip. Ne objavljaj ga brez izrecnega pisnega
dovoljenja veleposlaništva. Pri grant projektih veleposlaništvo praviloma
predpiše obliko atribucije in pošlje svoje brand gradivo; do takrat uporabi
zgolj besedilno navedbo, če je ta dogovorjena.

Za projekt **The Goodwin Legacy (2027)** velja pravilo iz `bbg-osnova.md`:
nič javno do odobritve granta in podpisa pogodb.

## Dodajanje novega podpornika

1. Datoteko daj v `public/podporniki/<kljuc>.svg` (ali `.webp`, če vektorja ni).
2. V `src/data/podporniki.ts` dodaj zapis z `ime`, `url`, `logo`,
   `temnaStrategija` in `utez`.
3. `utez` določi po optični teži: širok in masiven logotip dobi manj (0,7),
   ozek in visok več (1,4). Preveri v obeh temah, preden commitaš.
4. Pri dogodku ga navedi v frontmatterju (`podporniki: [{ kljuc, raven }]`),
   pri stalnem podporniku pa v `PODPORNIKI_DRUSTVA`.
