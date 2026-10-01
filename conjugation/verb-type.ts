/**
 * The kind of verb, for filtering the verb list. Needs the lexicon, so it runs
 * on the server; the list itself only receives the result.
 */
import { verbs } from './lexicon.ts';
import type { VerbType } from './types.ts';

/** The present-tense endings that mark an -isc- verb, by person. */
const ISC_ENDINGS: Record<string, string> = {
  S1: 'isco', S2: 'isci', S3: 'isce', P3: 'iscono',
};

/**
 * The kind of a verb, or null if its infinitive ends in none of the five.
 *
 * `-rre` is checked first: those verbs are contracted -ere verbs (porre,
 * condurre). An -ire verb is `isc` when its present has one of the -isc- forms,
 * which also finds the verbs that exist only in the third person (imbrunisce).
 */
export function verbType(verb: string): VerbType | null {
  if (verb.endsWith('rre')) return 'rre';
  if (verb.endsWith('ire')) {
    const present = verbs[verb]?.ind?.pres as Record<string, string> | undefined;
    const isc = Object.entries(ISC_ENDINGS).some(([person, ending]) =>
      present?.[person]?.endsWith(ending),
    );
    return isc ? 'isc' : 'ire';
  }
  if (verb.endsWith('are')) return 'are';
  if (verb.endsWith('ere')) return 'ere';
  return null;
}
