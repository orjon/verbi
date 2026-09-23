/**
 * Fixed values shared across the app.
 *
 * Structure only — the lists that encode knowledge about Italian live beside
 * the code that explains them, in `lib/conjugation/aux.ts` and `excluded.ts`.
 */
import type { Numbers, Person, Tense } from '../types/index.ts';

/**
 * The six persons in the order a conjugation table is read:
 * io, tu, lui/lei, noi, voi, loro.
 */
export const PERSONS: ReadonlyArray<[Person, Numbers]> = [
  [1, 'S'], [2, 'S'], [3, 'S'], [1, 'P'], [2, 'P'], [3, 'P'],
];

/** Subject pronouns, in the same order as `PERSONS`, for labelling rows. */
export const PRONOUNS: readonly string[] = [
  'io', 'tu', 'lui / lei', 'noi', 'voi', 'loro',
];

/** Tenses stored in the dictionary as a single conjugated form. */
export const SIMPLE_TENSES: readonly Tense[] = [
  'PRESENTE', 'IMPERFETTO', 'PASSATO_REMOTO', 'FUTURO_SEMPLICE',
  'CONG_PRESENTE', 'CONG_IMPERFETTO', 'COND_PRESENTE', 'IMPERATIVO',
];

/** Tenses built at runtime from an auxiliary plus the past participle. */
export const COMPOUND_TENSES: readonly Tense[] = [
  'PASSATO_PROSSIMO', 'TRAPASSATO_PROSSIMO', 'TRAPASSATO_REMOTO',
  'FUTURO_ANTERIORE', 'CONG_PASSATO', 'CONG_TRAPASSATO', 'COND_PASSATO',
];
