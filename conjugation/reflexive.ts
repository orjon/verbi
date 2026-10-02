/**
 * Reflexive and pronominal verbs (`lavarsi`, `accorgersi`).
 *
 * Kept apart from `aux.ts` so the lexicon build can use these without loading
 * the lexicon it is writing.
 */
import { REFLEXIVE_SUFFIX } from './constants.ts';

/** True when the verb is reflexive or pronominal (`lavarsi`, `accorgersi`). */
export function isReflexive(verb: string): boolean {
  return verb.endsWith(REFLEXIVE_SUFFIX);
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
