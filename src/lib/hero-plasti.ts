/* ============================================================
   Katere plasti veljajo danes.

   Funkcija se kliče iz frontmatterja komponente, torej OB GRADNJI. Pri
   statičnem izhodu je `new Date()` v frontmatterju čas builda in ne čas
   obiska — glej opozorilo v src/data/hero-plasti.ts.

   Pravilo ob prekrivanju je tam tudi utemeljeno; tu je samo izvedeno.
   ============================================================ */
import { HERO_PLASTI, type Plast, type TipPlasti } from '../data/hero-plasti';

const JE_PONAVLJAJOC = /^\d{2}-\d{2}$/;
const JE_DATUM = /^\d{4}-\d{2}-\d{2}$/;

function preveriObliko(p: Plast): void {
  for (const meja of [p.od, p.do]) {
    if (!JE_PONAVLJAJOC.test(meja) && !JE_DATUM.test(meja)) {
      throw new Error(
        `Neveljavna meja "${meja}" pri plasti "${p.tip}" v src/data/hero-plasti.ts. `
          + 'Dovoljeni obliki sta MM-DD (ponavljajoče) in YYYY-MM-DD (enkratno).',
      );
    }
  }
  if (JE_PONAVLJAJOC.test(p.od) !== JE_PONAVLJAJOC.test(p.do)) {
    throw new Error(
      `Plast "${p.tip}" meša ponavljajočo in enkratno mejo (${p.od} … ${p.do}). `
        + 'Obe meji morata biti iste oblike, sicer ni določeno, katero leto velja.',
    );
  }
}

/** Dolžina razpona v dnevih — za pravilo "ožji zmaga". */
function sirinaVDnevih(p: Plast): number {
  if (JE_PONAVLJAJOC.test(p.od)) {
    const [m1, d1] = p.od.split('-').map(Number);
    const [m2, d2] = p.do.split('-').map(Number);
    const a = Date.UTC(2001, m1 - 1, d1);
    const b = Date.UTC(m2 < m1 || (m2 === m1 && d2 < d1) ? 2002 : 2001, m2 - 1, d2);
    return (b - a) / 86_400_000;
  }
  return (Date.parse(p.do) - Date.parse(p.od)) / 86_400_000;
}

function velja(p: Plast, zdaj: Date): boolean {
  if (JE_DATUM.test(p.od)) {
    const dan = zdaj.toISOString().slice(0, 10);
    return dan >= p.od && dan <= p.do;
  }
  /* Ponavljajoč razpon: primerjamo samo mesec in dan. Razpon sme prestopiti
     letnico ('12-01' … '01-06'), zato takrat velja zunanjost intervala. */
  const mmdd = `${String(zdaj.getUTCMonth() + 1).padStart(2, '0')}-${String(zdaj.getUTCDate()).padStart(2, '0')}`;
  return p.od <= p.do ? mmdd >= p.od && mmdd <= p.do : mmdd >= p.od || mmdd <= p.do;
}

export interface AktivnaPlast {
  tip: TipPlasti;
  parametri: Record<string, string | number>;
}

/**
 * Plasti, ki veljajo ob danem trenutku (privzeto ob gradnji).
 *
 * Različni tipi se seštevajo; pri istem tipu zmaga ožji razpon. Vrstni red
 * v izhodu sledi vrstnemu redu tipov v src/data/hero-plasti.ts, da je
 * izris ponovljiv.
 */
export function aktivnePlasti(zdaj: Date = new Date()): AktivnaPlast[] {
  HERO_PLASTI.forEach(preveriObliko);

  const poTipu = new Map<TipPlasti, Plast>();
  for (const p of HERO_PLASTI) {
    if (!velja(p, zdaj)) continue;
    const obstojeca = poTipu.get(p.tip);
    if (!obstojeca || sirinaVDnevih(p) < sirinaVDnevih(obstojeca)) poTipu.set(p.tip, p);
  }

  return [...poTipu.values()].map((p) => ({ tip: p.tip, parametri: p.parametri ?? {} }));
}
