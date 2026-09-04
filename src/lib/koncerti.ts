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
import type { Jezik } from '../i18n';

const SITE = 'https://bigband-grosuplje.com';

export type Gost = { naziv: string; tip: string | null };
export type Lokacija = {
  naziv: string;
  nazivEn?: string;
  ulica?: string | null;
  postna?: string | null;
  kraj: string;
  drzava?: string | null;
} | null;
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
};

const koncerti = koncertiData.koncerti as Koncert[];

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
   Ob znani uri se doda "ob 19.00" (slovenski zapis ure s piko). */
function formatDatum(
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

/* Prihajajoč = brez znanega datuma (napovedan, a še ne uvrščen) ali datum v prihodnosti.
   Filtriranje se izvede ob buildu — po preteku koncerta je potrebna nova objava. */
function jePrihajajoc(datumIso: string | null): boolean {
  if (!datumIso) return true;
  const danes = new Date();
  danes.setUTCHours(0, 0, 0, 0);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datumIso)) {
    return new Date(datumIso + 'T00:00:00Z') >= danes;
  }
  if (/^\d{4}-\d{2}$/.test(datumIso)) {
    const [leto, mesec] = datumIso.split('-').map(Number);
    return new Date(Date.UTC(leto, mesec, 0)) >= danes;
  }
  return true;
}

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

/* JSON-LD nastane samo, če sta znana datum in lokacija — nepopoln MusicEvent
   je za iskalnike slabši od nobenega. Za description uporabimo nevtralni
   opisSeo, ne duhovitega besedila s kartice. */
function musicEvent(k: Koncert, jezik: Jezik, url?: string) {
  const en = jezik === 'en';
  if (!k.datumIso || !k.lokacija) return null;
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
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(izobrazevalni
      ? k.gostje.length > 0
        ? { performer: k.gostje.filter((g) => g.tip).map((g) => ({ '@type': g.tip, name: g.naziv })) }
        : {}
      : { performer: izvajalci }),
    organizer: {
      '@type': 'Organization',
      name: 'Kulturno društvo Big Band Grosuplje',
      url: SITE,
    },
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

export function najdiPoSlugu(slug: string, jezik: Jezik): Koncert | undefined {
  return koncerti.find((k) => (jezik === 'en' ? k.slugEn : k.slug) === slug);
}
