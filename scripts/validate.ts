import { PERSON_SLOTS } from './slots.ts';

/**
 * Chooses one form per slot from Morph-it's candidates. scripts/build.ts calls
 * `choose` for every slot that has no override.
 *
 * A slot whose forms are all rejected is left empty. The build then tries the
 * rules in scripts/derive.ts, and records any slot still empty in the
 * `emptied` section of data/temp-unresolved.json.
 *
 * There is no `ind.fut` rule: it would assume the future endings are the same
 * across all six persons, which is the open question in item 3a of
 * resources/to-verify.md. Every rule below was measured against the whole
 * dictionary with no counter-example.
 *
 * ---
 *
 * Shape rules for a conjugated form.
 *
 * Italian irregularity lives in the stem, not the ending, so these endings hold
 * for every verb. They are used to reject a candidate that has been filed under
 * the wrong slot upstream — an imperfect indicative tagged as a gerund, say.
 */
const PERSON_ENDINGS: Record<string, (RegExp | null)[]> = {
  // order: S1 S2 S3 P1 P2 P3
  // No ind.impf, cond.pres or sub.impf rules: their endings are regular for
  // almost every verb but not all — `essere` gives ero/eri/era — and rejecting
  // a correct irregular form causes it to be replaced by an invented one.
  // Clipped variants are already removed by preferring the longest form.
  // No ind.fut rule either. The endings below hold for every verb *if* the
  // future stem is invariant across the six persons, which is item 3a of
  // resources/to-verify.md and is not yet confirmed:
  //     S1 -ò   S2 -ai   S3 -à   P1 -emo   P2 -ete   P3 -anno
  // scripts/build.ts reports where a verb's own persons disagree, without
  // acting on it. Enforce this only once 3a is answered.
  //
  // Not every person of these is fixed, so only the reliable ones are listed.
  // Each was measured across the whole dictionary with no counter-example:
  // ind.pres P1/P3, sub.pres P1/P2, and ind.past S2/P1/P2.
  'ind.pres': [null, null, null, /iamo$/, null, /no$/],
  'sub.pres': [null, null, null, /iamo$/, /iate$/, null],
  'ind.past': [null, /sti$/, null, /mmo$/, /ste$/, null],
};

const SHAPE: Record<string, RegExp> = {
  'ger.pres': /(ando|endo)$/,
  'part.pres': /(ante|ente|anti|enti)$/,
  'part.past': /[aeio]$/,
};

/** False when a form cannot belong in this slot. */
export function plausible(path: string, form: string, verb: string): boolean {
  if (path === 'inf.pres') return form === verb;

  const shape = SHAPE[path.split('.').slice(0, 2).join('.')];
  if (shape && !shape.test(form)) return false;

  const [mood, tense, slot] = path.split('.');
  const endings = PERSON_ENDINGS[`${mood}.${tense}`];
  if (endings && slot) {
    const i = (PERSON_SLOTS as readonly string[]).indexOf(slot);
    const rule = i >= 0 ? endings[i] : null;
    if (rule && !rule.test(form)) return false;
  }
  return true;
}

/**
 * Picks one form for a slot.
 *
 * Apocopated variants (`abbacchian` for `abbacchiano`) are dropped by
 * preferring the longest when every candidate is a prefix of it — that covers
 * 98.7% of collisions. Implausible forms are rejected first.
 */
export function choose(
  path: string,
  forms: string[],
  verb: string,
): { form: string | null; ambiguous: string[]; rejected: boolean } {
  const uniq = [...new Set(forms)];
  const valid = uniq.filter((f) => plausible(path, f, verb));
  // No candidate can belong here — leave the slot empty rather than store a
  // form we know is wrong. `sedere` has only "siedevo" for its participle.
  // Morph-it offered something here but none of it can belong in this slot —
  // the caller should regenerate rather than leave a gap.
  if (valid.length === 0) return { form: null, ambiguous: [], rejected: true };

  // Drop apocopated variants: a clipped form is a proper prefix of the full one
  // (`abbacchian` of `abbacchiano`, `debbon` of `debbono`). These are literary
  // elisions, not forms worth offering.
  const full = valid.filter((f) => !valid.some((g) => g !== f && g.startsWith(f)));
  const pool = full.length ? full : valid;

  if (pool.length === 1) return { form: pool[0], ambiguous: [], rejected: false };
  return { form: null, ambiguous: pool, rejected: false };
}
