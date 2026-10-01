/**
 * The conjugation surface the app uses.
 *
 * Wraps `italian-verbs` so callers ask for a form and get correct Italian back.
 * They never choose an auxiliary, so they cannot choose the wrong one.
 */
import { getConjugation } from 'italian-verbs';
import { verbs } from './lexicon.ts';
import { getAux, isReflexive, reflexiveBase } from './aux.ts';
import { isExcluded } from './excluded.ts';
import type { ConjugateOptions, Numbers, Person, Tense } from './types.ts';
import { COMPOUND_TENSES, PERSONS } from './constants.ts';

export function isCompound(tense: Tense): boolean {
  return COMPOUND_TENSES.includes(tense);
}

/** True when the lexicon has this verb. */
export function hasVerb(verb: string): boolean {
  return Object.prototype.hasOwnProperty.call(verbs, verb);
}

/**
 * The verbs the app offers: every lexicon key except the excluded ones,
 * sorted. Use this for search and listings rather than reading the lexicon
 * directly.
 */
export function listVerbs(): string[] {
  return Object.keys(verbs).filter((v) => !isExcluded(v)).sort();
}

/**
 * One conjugated form.
 *
 * Throws if the verb is not in the lexicon, so a typo surfaces at the call
 * site rather than as a confusing error from inside the library.
 */
export function conjugate(
  verb: string,
  tense: Tense,
  person: Person,
  number: Numbers,
  options: ConjugateOptions = {},
): string {
  if (!hasVerb(verb)) {
    // The lexicon has no reflexive verbs, so point the caller at the base verb.
    if (isReflexive(verb)) {
      throw new Error(
        `${verb} is reflexive and the lexicon does not conjugate it. ` +
          `Conjugate ${reflexiveBase(verb)} and add the reflexive pronoun.`,
      );
    }
    throw new Error(`Unknown verb: ${verb}`);
  }

  const aux = getAux(verb);
  const agrees = aux === 'ESSERE';

  try {
    return getConjugation(verbs, verb, tense, person, number, {
      aux,
      // With `essere` the participle agrees with the subject; with `avere` it
      // stays masculine singular.
      agreeGender: agrees ? (options.gender ?? 'M') : 'M',
      agreeNumber: agrees ? number : 'S',
    });
  } catch (cause) {
    // Defective verbs genuinely lack some tenses: `vigere` has no participle,
    // so no compound tense exists to build.
    throw new Error(`${verb} has no ${tense} form.`, { cause });
  }
}

/**
 * A whole tense, in the order a conjugation table is read:
 * io, tu, lui/lei, noi, voi, loro.
 *
 * The imperative has no first-person singular, so that slot is `null`.
 */
export function conjugateTense(
  verb: string,
  tense: Tense,
  options: ConjugateOptions = {},
): (string | null)[] {
  return PERSONS.map(([person, number]) => {
    try {
      return conjugate(verb, tense, person, number, options);
    } catch {
      return null;
    }
  });
}
