/**
 * The progressive tenses: *stare* followed by the verb's gerund, as in "sto
 * cominciando". A verb with no gerund in the lexicon has none.
 */
import { conjugateTense } from './conjugate.ts';
import { gerund } from './forms.ts';
import type { Tense } from './types.ts';

/**
 * A whole progressive tense, in the order of `conjugateTense`: stare in
 * `tense`, then the gerund. Every slot is null when the verb has no gerund.
 */
export function progressiveTense(verb: string, tense: Tense): (string | null)[] {
  const ger = gerund(verb);
  return conjugateTense('stare', tense).map((form) =>
    ger && form !== null ? `${form} ${ger}` : null,
  );
}
