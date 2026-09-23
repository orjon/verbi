/**
 * The conjugation surface the app uses.
 *
 * Wraps `italian-verbs` so callers ask for a form and get correct Italian back.
 * They never choose an auxiliary, so they cannot choose the wrong one.
 */
import { getConjugation } from 'italian-verbs';
import verbs from 'italian-verbs-dict/dist/verbs.json' with { type: 'json' };
import { getAux, isReflexive, reflexiveBase } from './aux.ts';

export type Person = 1 | 2 | 3;
export type Numbers = 'S' | 'P';
export type Gender = 'M' | 'F';

export type Tense =
  | 'PRESENTE' | 'IMPERFETTO' | 'PASSATO_REMOTO' | 'FUTURO_SEMPLICE'
  | 'PASSATO_PROSSIMO' | 'TRAPASSATO_PROSSIMO' | 'TRAPASSATO_REMOTO'
  | 'FUTURO_ANTERIORE' | 'CONG_PRESENTE' | 'CONG_PASSATO' | 'CONG_IMPERFETTO'
  | 'CONG_TRAPASSATO' | 'COND_PRESENTE' | 'COND_PASSATO' | 'IMPERATIVO';

/** Tenses built from an auxiliary plus the past participle. */
export const COMPOUND_TENSES: readonly Tense[] = [
  'PASSATO_PROSSIMO', 'TRAPASSATO_PROSSIMO', 'TRAPASSATO_REMOTO',
  'FUTURO_ANTERIORE', 'CONG_PASSATO', 'CONG_TRAPASSATO', 'COND_PASSATO',
];

export function isCompound(tense: Tense): boolean {
  return COMPOUND_TENSES.includes(tense);
}

/** True when the dictionary has this verb. */
export function hasVerb(verb: string): boolean {
  return Object.prototype.hasOwnProperty.call(verbs, verb);
}

export interface ConjugateOptions {
  /**
   * Gender of the subject, for participle agreement in compound tenses formed
   * with `essere`: "sono andato" / "sono andata". Ignored with `avere`, where
   * the participle does not agree with the subject. Defaults to masculine.
   */
  gender?: Gender;
}

/**
 * One conjugated form.
 *
 * Throws if the verb is not in the dictionary, so a typo surfaces at the call
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
    if (isReflexive(verb)) {
      throw new Error(
        `${verb} is reflexive and the dictionary does not conjugate it. ` +
          `Conjugate ${reflexiveBase(verb)} and add the reflexive pronoun.`,
        { cause },
      );
    }
    // Defective verbs genuinely lack some tenses: `vigere` has no participle,
    // so no compound tense exists to build.
    throw new Error(`${verb} has no ${tense} form.`, { cause });
  }
}

const PERSONS: ReadonlyArray<[Person, Numbers]> = [
  [1, 'S'], [2, 'S'], [3, 'S'], [1, 'P'], [2, 'P'], [3, 'P'],
];

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
