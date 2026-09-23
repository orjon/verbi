/**
 * Auxiliary selection for Italian compound tenses.
 *
 * `italian-verbs` will build any compound tense, but it does not know whether a
 * verb takes `essere` or `avere`. Ask it for `andare` with `AVERE` and it
 * returns "ho andato" — wrong Italian, no warning. This module makes that call
 * so the rest of the app never has to.
 */
import type { ItalianAux } from '../../types/index.ts';

/**
 * Verbs taking `essere`: intransitives of motion, state, and change of state,
 * plus the prefixed compounds that inherit the choice (venire → provenire).
 *
 * Not exhaustive — Italian has a long tail — but it covers the verbs a learner
 * meets. Anything absent falls back to `avere`, which is the majority case.
 */
const ESSERE = new Set<string>([
  // motion
  'andare', 'arrivare', 'cadere', 'entrare', 'giungere', 'partire', 'fuggire',
  'ricadere', 'rientrare', 'ripartire', 'ritornare', 'salpare', 'scappare',
  'sopraggiungere', 'tornare', 'uscire', 'venire',
  // arrival / origin compounds of venire
  'avvenire', 'convenire', 'divenire', 'intervenire', 'pervenire', 'provenire',
  'sopravvenire', 'svenire',
  // change of state
  'diventare', 'guarire', 'impazzire', 'ingrassare', 'invecchiare', 'morire',
  'nascere', 'perire', 'sbocciare', 'sparire', 'svanire', 'scomparire',
  'comparire', 'apparire', 'sorgere',
  // remaining / staying
  'restare', 'rimanere', 'stare', 'sostare',
  // occurring / happening
  'accadere', 'avvenire', 'capitare', 'occorrere', 'succedere', 'scadere',
  // seeming / pleasing / mattering
  'dispiacere', 'parere', 'piacere', 'sembrare', 'spettare',
  // existing / being
  'esistere', 'essere', 'coesistere',
  // misc intransitives
  'bastare', 'costare', 'dipendere', 'importare', 'risultare', 'riuscire',
  'sopravvivere', 'valere',
]);

/**
 * Verbs that take either auxiliary depending on sense — `avere` when used
 * transitively or of the activity itself, `essere` when intransitive or of a
 * destination reached: "ho corso" (I ran) vs "sono corso a casa" (I ran home).
 *
 * `getAux` returns the more common reading; `isDualAux` lets the UI flag it.
 */
const DUAL: Record<string, ItalianAux> = {
  aumentare: 'ESSERE', cambiare: 'ESSERE', cominciare: 'ESSERE',
  correre: 'AVERE', crescere: 'ESSERE', diminuire: 'ESSERE',
  durare: 'ESSERE', finire: 'ESSERE', iniziare: 'ESSERE',
  mancare: 'ESSERE', migliorare: 'ESSERE', passare: 'ESSERE',
  peggiorare: 'ESSERE', procedere: 'ESSERE', salire: 'ESSERE',
  saltare: 'AVERE', scendere: 'ESSERE', servire: 'ESSERE',
  suonare: 'AVERE', volare: 'AVERE', vivere: 'AVERE',
};

/** True when the verb is reflexive or pronominal (`lavarsi`, `accorgersi`). */
export function isReflexive(verb: string): boolean {
  return verb.endsWith('si');
}

/**
 * The plain infinitive behind a reflexive one: `abbuffarsi` → `abbuffare`.
 *
 * The dictionary does not conjugate reflexives — most of its 46 reflexive
 * entries hold an infinitive and nothing else — so to show `mi lavo` you
 * conjugate the base verb and prepend the pronoun yourself.
 */
export function reflexiveBase(verb: string): string {
  return verb.replace(/rsi$/, 're').replace(/si$/, 'e');
}

/** True when both auxiliaries are correct Italian, with a difference in sense. */
export function isDualAux(verb: string): boolean {
  return verb in DUAL;
}

/**
 * The auxiliary to use when building a compound tense of `verb`.
 *
 * Reflexives always take `essere`; otherwise the lists above decide, defaulting
 * to `avere`. Note that modals (`potere`, `dovere`, `volere`) properly inherit
 * the auxiliary of the verb they govern — "sono dovuto andare" — which needs
 * the governed verb to resolve and so is out of scope here.
 */
export function getAux(verb: string): ItalianAux {
  if (isReflexive(verb)) return 'ESSERE';
  if (verb in DUAL) return DUAL[verb];
  return ESSERE.has(verb) ? 'ESSERE' : 'AVERE';
}

/** Exposed for the test that checks every listed verb exists in the dictionary. */
export const _lists = { ESSERE, DUAL };
