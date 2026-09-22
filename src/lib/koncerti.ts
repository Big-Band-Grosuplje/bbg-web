/* ============================================================
   Koncerti in dogodki — skupna logika za naslovnico in podstrani.

   Datumsko oblikovanje, ugotavljanje prihajajočih dogodkov in gradnja
   JSON-LD so tu, ker jih potrebujeta naslovnica (izsek) in podstran
   dogodka (polni zapis). Prej je bilo vse v Naslovnica.astro; ob dodajanju
   podstrani bi se moralo podvojiti, zato je prestavljeno.

   Slovarja ta modul ne pozna: prevedljive nize (predlog ob uri, oznake
   zasedb) prejme kot parametre.
   ============================================================ */
import koncertiData from '../data/koncerti.json';
import { jePrihajajoc, natancnostDatuma } from './datumi.mjs';
import {
  PRESLIKAVA_JSONLD,
  imePodpornika,
  opozoriNaGloboko,
  preveriVnosePodpornikov,
  resiPodpornika,
  type KljucPodpornika,
  type LastnostJsonLd,
  type Raven,
  type VnosPodpornika,
} from '../data/podporniki';
import type { Jezik } from '../i18n';

const SITE = 'https://bigband-grosuplje.com';

export type Gost = { naziv: string; tip: string | null };
/* Zunanja objava o dogodku — napovednik na tujem mestu. Samo povezava za
   bralca; v JSON-LD ne gre, ker objava ni ne organizator ne izvajalec. */
export type Objava = { naziv: string; nazivEn?: string; url: string };
/* Kadar dogodek organizira kdo drug (festival, občina, veleposlaništvo),
   smo izvajalec in ne organizator. Brez tega polja velja društvo. */
export type Organizator = { naziv: string; nazivEn?: string; url?: string | null };
export type Lokacija = {
  naziv: string;
  nazivEn?: string;
  ulica?: string | null;
  postna?: string | null;
  kraj: string;
  drzava?: string | null;
} | null;
/* Vnos podpornika, kot se zapiše v koncerti.json. Od VnosPodpornika iz
   registra se loči po tem, da je raven neobvezna: pri dogodku je pogosto
   samoumevna in privzeta vrednost ('sponzor') zadošča. Vnose z izpolnjeno
   ravnijo vrne podpornikiDogodka(). */
export type VnosPodpornikaDogodka = { kljuc: KljucPodpornika; raven?: Raven };

export type Koncert = {
  id: string;
  /* Naslov podstrani; vpisan v koncerti.json in po objavi nespremenljiv. */
  slug: string;
  slugEn: string;
  naziv: string;
  nazivEn?: string;
  opis: string;
  opisEn?: string;
  opisSeo?: string;
  opisSeoEn?: string;
  datumOpisEn?: string;
  gostje: Gost[];
  datumIso: string | null;
  /* Neobvezno; kadar je vpisano, gre za večdnevni dogodek. */
  datumKonecIso?: string | null;
  ura: string | null;
  datumOpis: string;
  lokacija: Lokacija;
  zasedba: 'big-band' | 'combo' | 'mladinski' | 'izobrazevalni';
  vstop: { tip: 'vstopnice' | 'prost' | 'zaprt'; url?: string | null };
  /* true = prost vstop, a z obvezno prijavo prek kontaktnega obrazca. */
  prijava?: boolean;
  /* Neobvezno; brez njega je organizator društvo (glej DRUSTVO). */
  organizator?: Organizator;
  /* Neobvezno; izpiše se samo na podstrani dogodka, ne na kartici. */
  objave?: Objava[];
  /* Podporniki dogodka: ključi v register src/data/podporniki.ts.
     Brez polja zidu logotipov ni. Raven je neobvezna — privzeto 'sponzor'. */
  podporniki?: VnosPodpornikaDogodka[];
  /* Neobvezen lasten naslov nad zidom logotipov; brez njega velja
     privzeto besedilo iz slovarja. */
  podpornikiNaslov?: string;
  podpornikiNaslovEn?: string;
};

/* Privzeti organizator. Ime je zapisano tu in ne v vsakem dogodku: je
   invarianta, ne spremenljivka — če se razide s pravnim nazivom, je
   pokvarjeno neodvisno od podatkov. */
const DRUSTVO = { naziv: 'Kulturno društvo Big Band Grosuplje', url: SITE };

const koncerti = koncertiData.koncerti as Koncert[];

/* Preverba ob nalaganju modula, po vzoru preveriVnosePodpornikov v
   src/data/podporniki.ts: vnos z manjkajočim ali neprepoznanim datumIso se
   od 22. 9. 2026 ne šteje več med prihajajoče (glej jePrihajajoc v
   datumi.mjs). Tak vnos bi tiho izginil z naslovnice in ne bi dobil
   JSON-LD, zato ob gradnji opozorimo. Opozorilo in ne izjema: sama letnica
   je legitimen zgodovinski zapis, ki ga model še ne podpira, in gradnje
   zaradi njega ne ustavljamo. */
for (const k of koncerti) {
  if (natancnostDatuma(k.datumIso) === null) {
    console.warn(
      `[koncerti] "${k.id}" ima datumIso ${JSON.stringify(k.datumIso)}, kar ni ` +
        `ne YYYY-MM-DD ne YYYY-MM. Dogodek ne bo med prihajajočimi in ne bo dobil ` +
        `JSON-LD. Za zapis, ki mu je znano samo leto, glej ` +
        `docs/predlog-nenatancni-datumi.md.`,
    );
  }
}

/* Vnosi podpornikov iz koncerti.json. Datoteka je uvožena s pretvorbo
   (as Koncert[]), zato tipi vpisa ne preverijo — tipkarska napaka bi ostala
   neopažena do trenutka, ko bi logotip tiho izginil s strani.

   Preverjanje samo je v registru (preveriVnosePodpornikov), ker so ključ,
   raven in dovoljenje za objavo njegove invariante; tu ostane le, kar je
   lastno temu viru — sprehod čez dogodke in navedba, v katerem je napaka.

   Privzeta raven je 'sponzor': vpis brez ravni je veljaven. */
const PRIVZETA_RAVEN: Raven = 'sponzor';

for (const k of koncerti) {
  preveriVnosePodpornikov(k.podporniki ?? [], `dogodek "${k.slug}" v koncerti.json`);
  /* Organizator gre v JSON-LD kot Organization.url, zato zanj velja isto
     merilo kot za podpornike. Polja objave ne pregledujemo — objava je po
     definiciji stran o dogodku in v JSON-LD sploh ne pride; enako vstop.url,
     ki postane Offer.url in tam globoka pot je pravilna. */
  if (k.organizator) {
    opozoriNaGloboko(
      k.organizator.url,
      k.organizator.naziv,
      `organizator dogodka "${k.slug}" v koncerti.json`,
    );
  }
}

/* Vnosi dogodka z izpolnjeno privzeto ravnijo. Uporabljata jo izris zidu in
   gradnja JSON-LD, da se ne moreta raziti. */
function podpornikiDogodka(k: Koncert): VnosPodpornika[] {
  return (k.podporniki ?? []).map((v) => ({ kljuc: v.kljuc, raven: v.raven ?? PRIVZETA_RAVEN }));
}

/* Prizorišče za meta vrstico. Ime prizorišča kraj pogosto že vsebuje
   ("Rezidenca ameriškega veleposlaništva, Ljubljana"), zato ga ne
   pripenjamo dvakrat — brez te preverbe je v vrstici pisalo
   "…, Ljubljana, Ljubljana". V JSON-LD ostaneta ime in addressLocality
   ločena, tam podvojitve ni. */
function krajZaPrikaz(lokacija: NonNullable<Lokacija>, en: boolean): string {
  const naziv = en ? (lokacija.nazivEn ?? lokacija.naziv) : lokacija.naziv;
  const kraj = lokacija.kraj;
  return naziv.includes(kraj) ? naziv : `${naziv}, ${kraj}`;
}

/* Oznaka zasedbe pride iz slovarja; knjižnica slovarja ne pozna, zato jo
   prejme kot preslikavo. Neznana zasedba ustavi build in ne izpiše tiho
   prazne značke. */
export type OznakeZasedb = Record<Koncert['zasedba'], string>;

export function oznakaZasedbe(zasedba: Koncert['zasedba'], oznake: OznakeZasedb): string {
  const o = oznake[zasedba];
  if (!o) throw new Error(`Neznana zasedba v koncerti.json: ${zasedba}`);
  return o;
}

/* Datum v sl-SI zapisu: polni datum kot d. M. yyyy, sam mesec kot "oktober 2026".
   Izvožena, ker isto oblikovanje potrebuje arhiv (src/lib/arhiv.ts) — dve kopiji
   bi pomenili dva zapisa istega datuma na isti strani.
   Ob znani uri se doda "ob 19.00" (slovenski zapis ure s piko). */
export function formatDatum(
  datumIso: string | null,
  ura: string | null,
  jezik: Jezik,
  ob: string,
): string | null {
  const en = jezik === 'en';
  const LOKALA = en ? 'en-GB' : 'sl-SI';
  if (!datumIso) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(datumIso)) {
    const datum = new Intl.DateTimeFormat(LOKALA, {
      day: 'numeric',
      month: en ? 'long' : 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(datumIso + 'T00:00:00Z'));
    /* Slovenski zapis ure je s piko, angleški z dvopičjem. */
    const zapisUre = en ? ura : ura?.replace(':', '.');
    return ura ? `${datum} ${ob} ${zapisUre}` : datum;
  }
  if (/^\d{4}-\d{2}$/.test(datumIso)) {
    return new Intl.DateTimeFormat(LOKALA, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(datumIso + '-01T00:00:00Z'));
  }
  return null;
}

/* Večdnevni dogodek: "10.–11. 10. 2026" oz. "10–11 October 2026".
   Razpon čez mesec ali leto zapišemo z obema polnima datumoma, ker bi
   skrajšani zapis ("10. 10.–2. 11.") bralca lahko zmedel. */
function formatRazpon(zacetekIso: string, konecIso: string, jezik: Jezik, ob: string): string {
  const LOKALA = jezik === 'en' ? 'en-GB' : 'sl-SI';
  const z1 = new Date(zacetekIso + 'T00:00:00Z');
  const z2 = new Date(konecIso + 'T00:00:00Z');
  const istiMesec =
    z1.getUTCFullYear() === z2.getUTCFullYear() && z1.getUTCMonth() === z2.getUTCMonth();
  /* Različna meseca zapišemo z obema polnima datumoma, ker bi skrajšani
     zapis bralca zmedel. */
  if (!istiMesec) {
    return `${formatDatum(zacetekIso, null, jezik, ob)} – ${formatDatum(konecIso, null, jezik, ob)}`;
  }
  /* Znotraj meseca sestavimo "dan začetka – polni končni datum". Ločil ne
     sestavljamo sami: sl-SI dnevu že doda piko ("10."), kombinacija
     month+year pa bi dala "10/2026" namesto "10. 2026" — zato mesec in leto
     prevzamemo iz polnega končnega datuma. */
  const danZacetka = new Intl.DateTimeFormat(LOKALA, {
    day: 'numeric',
    timeZone: 'UTC',
  }).format(z1);
  return `${danZacetka}–${formatDatum(konecIso, null, jezik, ob)}`;
}

/* Datum razstavljen za temni blok na kartici: dan, mesec, leto ločeno. */
function datumBlok(datumIso: string | null, konecIso: string | null | undefined, jezik: Jezik) {
  const en = jezik === 'en';
  const LOKALA = en ? 'en-GB' : 'sl-SI';
  if (!datumIso || !/^\d{4}-\d{2}-\d{2}$/.test(datumIso)) return null;
  const d = new Date(datumIso + 'T00:00:00Z');
  const dan = new Intl.DateTimeFormat(LOKALA, { day: 'numeric', timeZone: 'UTC' }).format(d);
  /* Pri večdnevnem dogodku bi ena sama številka v bloku zavajala, zato
     gre vanj razpon dni; CSS ga zmanjša, da se ne razlije. */
  /* sl-SI dnevu piko že doda sam, zato je ne dodajamo. */
  let danPrikaz = dan;
  let razpon = false;
  if (konecIso && /^\d{4}-\d{2}-\d{2}$/.test(konecIso)) {
    const k = new Date(konecIso + 'T00:00:00Z');
    if (k.getUTCMonth() === d.getUTCMonth() && k.getUTCFullYear() === d.getUTCFullYear()) {
      const danK = new Intl.DateTimeFormat(LOKALA, { day: 'numeric', timeZone: 'UTC' }).format(k);
      danPrikaz = `${dan}–${danK}`;
      razpon = true;
    }
  }
  return {
    razpon,
    danPrikaz,
    dan: new Intl.DateTimeFormat(LOKALA, { day: 'numeric', timeZone: 'UTC' }).format(d),
    mesec: new Intl.DateTimeFormat(LOKALA, { month: 'short', timeZone: 'UTC' }).format(d),
    leto: new Intl.DateTimeFormat(LOKALA, { year: 'numeric', timeZone: 'UTC' }).format(d),
  };
}

/* Prihajajoč = datum je znan IN v prihodnosti. Presoja je v src/lib/datumi.mjs,
   ker jo poleg gradnje potrebuje tudi scripts/preveri-datume.mjs.
   Filtriranje se izvede ob buildu — po preteku koncerta je potrebna nova objava. */

/* Časovni odmik za Europe/Ljubljana ob danem trenutku — septembra CEST (+02:00),
   decembra CET (+01:00). Odmika ne zapisujemo v podatke, ker se z datumom spreminja. */
function odmikLjubljana(datumIso: string, ura: string): string {
  const priblizek = new Date(`${datumIso}T${ura}:00Z`);
  const zapis = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Ljubljana',
    timeZoneName: 'longOffset',
  })
    .formatToParts(priblizek)
    .find((del) => del.type === 'timeZoneName')?.value;
  const odmik = (zapis ?? '').replace('GMT', '');
  return odmik === '' ? 'Z' : odmik;
}

/* startDate po ISO 8601: z uro vključno s časovnim odmikom, brez ure samo datum. */
function startDate(datumIso: string, ura: string | null): string {
  if (!ura || !/^\d{4}-\d{2}-\d{2}$/.test(datumIso)) return datumIso;
  return `${datumIso}T${ura}:00${odmikLjubljana(datumIso, ura)}`;
}

/* JSON-LD nastane, čim je znan datum. Lokacija ni pogoj — brez nje se polje
   location izpusti, dogodek pa strukturirane podatke vseeno dobi.

   Prej je bila lokacija pogoj in zapis brez nje ni dobil ničesar. Za
   napovednik je bilo to nedolžno (vsi prihodnji dogodki prizorišče imajo),
   za arhiv pa ne: pri zgodovinskih vnosih prizorišče pogosto ni znano in
   tak vnos bi za iskalnike in AI orodja ostal nem — kar spodnese enega od
   dveh namenov arhiva.

   Kaj je v resnici obvezno (preverjeno 22. 9. 2026):
   - schema.org sam ne zahteva nobene lastnosti; Event brez location je
     veljaven zapis;
   - Googlova dokumentacija za Event rich results zahteva name, startDate,
     location in location.address.

   Posledica je torej zavestna in omejena: dogodek brez znanega prizorišča
   za Googlov rich result ni upravičen, ostane pa veljaven, strojno berljiv
   Event. Nekaj je v obeh primerih več od nič. Pogoj ostane samo datum:
   Event brez startDate ni uvrstljiv v čas in za arhiv nima vrednosti.

   Za description uporabimo nevtralni opisSeo, ne duhovitega besedila s
   kartice. */
function musicEvent(k: Koncert, jezik: Jezik, url?: string) {
  const en = jezik === 'en';
  if (!k.datumIso) return null;
  const izvajalci: Record<string, string>[] = [
    { '@type': 'MusicGroup', name: 'Big Band Grosuplje', url: SITE },
  ];
  for (const gost of k.gostje) {
    if (gost.tip) izvajalci.push({ '@type': gost.tip, name: gost.naziv });
  }
  /* Delavnica ni koncert: gre za EducationEvent, kjer smo organizator in
     ne izvajalec. Vodja delavnice je performer — to je vloga, ki jo
     schema.org za predavatelja predvideva. */
  const izobrazevalni = k.zasedba === 'izobrazevalni';
  const dogodek: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': izobrazevalni ? 'EducationEvent' : 'MusicEvent',
    name: en ? (k.nazivEn ?? k.naziv) : k.naziv,
    description: en ? (k.opisSeoEn ?? k.opisEn ?? k.opis) : (k.opisSeo ?? k.opis),
    startDate: startDate(k.datumIso, k.ura),
    ...(k.datumKonecIso ? { endDate: k.datumKonecIso } : {}),
    /* Na podstrani dogodka dodamo url — tam je dogodek glavna vsebina in
       ga iskalnik lahko naveže na svojo stran. Na naslovnici polja ni,
       ker so tam dogodki samo izsek. */
    ...(url ? { url } : {}),
    /* sameAs: naslovi, ki opisujejo ISTI dogodek drugje. Polje objave je
       natanko to, zato gre vanj — v organizer, sponsor ali funder pa ne,
       ker objava ni ne organizator ne podpornik. Vidnega izpisa objav to
       ne spremeni.

       Seznam je enak v obeh jezikih: sameAs govori o naslovih, ne o
       besedilu, in objave slovenske ter angleške različice ne ločijo.
       Prazno polje izpustimo, enako kot pri vseh drugih lastnostih. */
    ...(k.objave?.length ? { sameAs: k.objave.map((o) => o.url) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(izobrazevalni
      ? k.gostje.length > 0
        ? { performer: k.gostje.filter((g) => g.tip).map((g) => ({ '@type': g.tip, name: g.naziv })) }
        : {}
      : { performer: izvajalci }),
    /* Organizator: kadar je vpisan zunanji, gre v JSON-LD ta, sicer
       društvo. Pri dogodku, ki ga organizira kdo drug, smo v performer in
       ne v organizer — trditev, da dogodek organiziramo mi, bi bila
       napačna, iskalnikom pa jo je nemogoče preklicati. */
    organizer: {
      '@type': 'Organization',
      name: k.organizator
        ? (en ? (k.organizator.nazivEn ?? k.organizator.naziv) : k.organizator.naziv)
        : DRUSTVO.naziv,
      ...(k.organizator
        ? (k.organizator.url ? { url: k.organizator.url } : {})
        : { url: DRUSTVO.url }),
    },
    /* Neznano prizorišče: polja ni. Prazen ali izmišljen Place bi bil
       slabši od odsotnosti — trdil bi nekaj, česar ne vemo. */
    ...(k.lokacija
      ? {
          location: {
            '@type': 'Place',
            name: en ? (k.lokacija.nazivEn ?? k.lokacija.naziv) : k.lokacija.naziv,
            address: {
              '@type': 'PostalAddress',
              ...(k.lokacija.ulica ? { streetAddress: k.lokacija.ulica } : {}),
              ...(k.lokacija.postna ? { postalCode: k.lokacija.postna } : {}),
              addressLocality: k.lokacija.kraj,
              addressCountry: k.lokacija.drzava ?? 'SI',
            },
          },
        }
      : {}),
  };
  /* offers po vrsti vstopa:
     - prost: cena 0 EUR, da iskalniki brezplačen dogodek prepoznajo kot tak;
     - vstopnice z znanim URL: ponudba s povezavo;
     - vstopnice brez URL (še ni v prodaji) in zaprt dogodek: offers
       izpustimo — nepopolna ponudba je za iskalnike slabša od nobene.
     eventAttendanceMode ostane v vseh primerih, ker se vrsta vstopa ne
     tiče tega, ali je dogodek v živo. */
  if (k.vstop.tip === 'prost') {
    dogodek.offers = {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    };
  } else if (k.vstop.tip === 'vstopnice' && k.vstop.url) {
    dogodek.offers = {
      '@type': 'Offer',
      url: k.vstop.url,
      availability: 'https://schema.org/InStock',
    };
  }
  /* Podporniki. Katera lastnost schema.org pripada kateri ravni, pove
     PRESLIKAVA_JSONLD v registru — tu ni nobenega seznama ravni, zato nova
     raven ne zahteva posega v to funkcijo. Prazne lastnosti ne dodajamo:
     "sponsor": [] iskalniku ne pove ničesar, pove pa, da smo polje pozabili
     izpolniti.

     logo je absoluten, ker relativna pot v strukturiranih podatkih nima
     izhodišča. Sestavimo ga iz SITE, iste konstante kot url društva. */
  const skupine = new Map<LastnostJsonLd, Record<string, string>[]>();
  for (const v of podpornikiDogodka(k)) {
    const p = resiPodpornika(v.kljuc);
    if (!p) continue;
    const lastnost = PRESLIKAVA_JSONLD[v.raven];
    const zapis = {
      '@type': 'Organization',
      name: imePodpornika(p, jezik),
      /* url izpustimo, kadar povezava ni domača stran organizacije
         (urlJeUradnaStran: false). Organization.url je trditev o identiteti
         in ne priročna povezava — krovni portal bi tu trdil nekaj, kar ne
         drži, iskalniki in jezikovni modeli pa to povzemajo naprej. Vidna
         povezava na logotipu ostane. */
      ...(p.url && p.urlJeUradnaStran !== false ? { url: p.url } : {}),
      ...(p.logo ? { logo: new URL(p.logo, SITE).href } : {}),
    };
    const obstojece = skupine.get(lastnost);
    if (obstojece) obstojece.push(zapis);
    else skupine.set(lastnost, [zapis]);
  }

  for (const [lastnost, organizacije] of skupine) {
    if (organizacije.length === 0) continue;
    /* organizer je edina lastnost, ki je na dogodku že zasedena: zgoraj
       vanjo zapišemo društvo oziroma zunanjega organizatorja. Soorganizatorji
       se ji zato PRIDRUŽIJO — zapis bi sicer izbrisal organizatorja dogodka,
       kar je hujša napaka od manjkajočega soorganizatorja. Obstoječo vrednost
       najprej pretvorimo v polje, ker je doslej vedno en sam objekt. */
    if (lastnost === 'organizer') {
      const doslej = dogodek.organizer;
      const kotPolje = Array.isArray(doslej) ? doslej : doslej ? [doslej] : [];
      dogodek.organizer = [...kotPolje, ...organizacije];
      continue;
    }
    dogodek[lastnost] = organizacije;
  }
  return dogodek;
}

/* Vsa besedilna in datumska polja enega dogodka, pripravljena za izris.
   Kliče jo naslovnica za vsako kartico in podstran za svoj dogodek. */
export function pripravi(
  k: Koncert,
  jezik: Jezik,
  besedila: { ob: string; brezPrizorisca: string },
  url?: string,
) {
  const en = jezik === 'en';
  return {
    ...k,
    nazivPrikaz: en ? (k.nazivEn ?? k.naziv) : k.naziv,
    opisPrikaz: en ? (k.opisEn ?? k.opis) : k.opis,
    opisSeoPrikaz: en ? (k.opisSeoEn ?? k.opisEn ?? k.opis) : (k.opisSeo ?? k.opis),
    lokacijaPrikaz: k.lokacija ? krajZaPrikaz(k.lokacija, en) : null,
    datumPrikaz:
      (k.datumIso && k.datumKonecIso
        ? formatRazpon(k.datumIso, k.datumKonecIso, jezik, besedila.ob)
        : formatDatum(k.datumIso, k.ura, jezik, besedila.ob)) ??
      (en ? (k.datumOpisEn ?? k.datumOpis) : k.datumOpis),
    blok: datumBlok(k.datumIso, k.datumKonecIso, jezik),
    /* Organizator se izpiše samo, kadar ni naš — "Organizator: Kulturno
       društvo Big Band Grosuplje" na lastni strani ne pove ničesar. */
    organizatorPrikaz: k.organizator
      ? {
          naziv: en ? (k.organizator.nazivEn ?? k.organizator.naziv) : k.organizator.naziv,
          url: k.organizator.url ?? null,
        }
      : null,
    objavePrikaz: (k.objave ?? []).map((o) => ({
      naziv: en ? (o.nazivEn ?? o.naziv) : o.naziv,
      url: o.url,
    })),
    /* Vnosi z izpolnjeno privzeto ravnijo; prazno polje pomeni, da zidu
       logotipov ni. */
    podpornikiPrikaz: podpornikiDogodka(k),
    /* Lasten naslov nad zidom; null pomeni, da velja privzeto besedilo iz
       slovarja — knjižnica slovarja ne pozna. */
    podpornikiNaslovPrikaz:
      (en ? (k.podpornikiNaslovEn ?? k.podpornikiNaslov) : k.podpornikiNaslov) ?? null,
    jsonLd: musicEvent(k, jezik, url),
    /* Pretekli dogodek: podstran ostane (arhivska vrednost), le označimo ga. */
    jeMimo: !jePrihajajoc(k.datumKonecIso ?? k.datumIso),
    slugPrikaz: en ? k.slugEn : k.slug,
  };
}

export const koncertiVsi = koncerti;

export function prihajajociKoncerti(): Koncert[] {
  return koncerti.filter((k) => jePrihajajoc(k.datumKonecIso ?? k.datumIso));
}

/**
 * Naslednji javni dogodek z znanim datumom.
 *
 * Zaprtega ne izpostavljamo — povabljeni povezavo dobijo neposredno, javno
 * vabilo pa bi vabilo ljudi tam, kamor ne morejo. Dogodek brez datumIso ni
 * razvrstljiv in zato izpade.
 *
 * Razvrstimo izrecno po datumu in se ne zanašamo na zaporedje v
 * koncerti.json: klicalec trdi "naslednji", torej mora biti res prvi.
 * Filter vrne novo polje, zato vhodni seznam ostane nespremenjen.
 *
 * Funkcija je tu in ne pri klicalcu: izbiro potrebuje napovednik v heroju,
 * pred njim pa jo je imel panel pod herojem. Tu ostaja, ker je vprašanje
 * "kateri je naslednji" lastnost podatkov in ne enega izrisa.
 */
export function naslednjiJavni<T extends { datumIso: string | null; vstop: { tip: string } }>(
  koncerti: T[],
): T | null {
  return (
    koncerti
      .filter((k) => k.datumIso && k.vstop.tip !== 'zaprt')
      .sort((a, b) => (a.datumIso as string).localeCompare(b.datumIso as string))[0] ?? null
  );
}

export function najdiPoSlugu(slug: string, jezik: Jezik): Koncert | undefined {
  return koncerti.find((k) => (jezik === 'en' ? k.slugEn : k.slug) === slug);
}
