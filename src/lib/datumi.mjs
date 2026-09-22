/* ============================================================
   Natančnost zapisa datuma in presoja, ali je dogodek prihajajoč.

   Zakaj svoj modul in zakaj .mjs: to logiko potrebujeta gradnja
   (src/lib/koncerti.ts) in preverba (scripts/preveri-datume.mjs), ki teče
   v golem node in TypeScripta ne prevaja. Isti razlog kot pri
   src/data/hero-zavesa.mjs — en vir, dva odjemalca. Modul nima odvisnosti
   in ne bere podatkov, zato ga je mogoče preizkusiti brez gradnje.
   ============================================================ */

/** Obliki, ki ju zapis datuma sme imeti. Drugih ne sprejemamo. */
export const OBLIKE = {
  dan: /^\d{4}-\d{2}-\d{2}$/,
  mesec: /^\d{4}-\d{2}$/,
};

/**
 * Natančnost zapisa datuma.
 *
 * @param {string | null | undefined} iso
 * @returns {'dan' | 'mesec' | null} `null` pomeni manjkajoč ali neprepoznan
 *   zapis — tudi sama letnica ("2003"), ki je danes model še ne podpira.
 */
export function natancnostDatuma(iso) {
  if (typeof iso !== 'string') return null;
  if (OBLIKE.dan.test(iso)) return 'dan';
  if (OBLIKE.mesec.test(iso)) return 'mesec';
  return null;
}

/**
 * Je dogodek prihajajoč?
 *
 * ⚠️ Neznan ali neprepoznan datum NI prihodnost. Do 22. 9. 2026 je ta
 * funkcija v obeh primerih vrnila `true`, kar pomeni, da bi vnos brez
 * datuma ostal v napovedniku za vedno in iz njega nikoli ne bi izpadel.
 * Za arhiv je to usodno: zgodovinski vnos, ki mu je znano samo leto
 * ("2003"), nobeni od obeh oblik ne ustreza in bi se izrisal med
 * prihajajočimi koncerti.
 *
 * Posledica spremembe: dogodek z `datumIso: null` — napovedan, a še ne
 * uvrščen — zdaj z naslovnice izpade. Ker bi se to zgodilo tiho, ob
 * gradnji opozorimo (glej preverbo ob nalaganju v src/lib/koncerti.ts).
 *
 * Mesečna natančnost velja do konca meseca: dogodek v "2026-09" je
 * prihajajoč do vključno 30. 9. 2026.
 *
 * @param {string | null | undefined} iso
 * @param {Date} [zdaj] Trenutek presoje; privzeto zdaj. Parameter obstaja
 *   zaradi preverbe — brez njega bi bil izid odvisen od dneva izvajanja.
 * @returns {boolean}
 */
export function jePrihajajoc(iso, zdaj) {
  const natancnost = natancnostDatuma(iso);
  if (natancnost === null) return false;

  const danes = zdaj ? new Date(zdaj.getTime()) : new Date();
  danes.setUTCHours(0, 0, 0, 0);

  if (natancnost === 'dan') {
    return new Date(iso + 'T00:00:00Z') >= danes;
  }
  /* Zadnji dan meseca: dan 0 naslednjega meseca. */
  const [leto, mesec] = iso.split('-').map(Number);
  return new Date(Date.UTC(leto, mesec, 0)) >= danes;
}
