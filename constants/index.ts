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

/**
 * The moods and tenses of a full conjugation table, in the order they are
 * shown: simple tenses first within each mood, then the compound ones.
 */
export const TENSE_GROUPS: ReadonlyArray<{
  mood: string;
  tenses: ReadonlyArray<{ tense: Tense; label: string }>;
}> = [
  {
    mood: 'Indicativo',
    tenses: [
      { tense: 'PRESENTE', label: 'Presente' },
      { tense: 'IMPERFETTO', label: 'Imperfetto' },
      { tense: 'PASSATO_REMOTO', label: 'Passato remoto' },
      { tense: 'FUTURO_SEMPLICE', label: 'Futuro semplice' },
      { tense: 'PASSATO_PROSSIMO', label: 'Passato prossimo' },
      { tense: 'TRAPASSATO_PROSSIMO', label: 'Trapassato prossimo' },
      { tense: 'TRAPASSATO_REMOTO', label: 'Trapassato remoto' },
      { tense: 'FUTURO_ANTERIORE', label: 'Futuro anteriore' },
    ],
  },
  {
    mood: 'Congiuntivo',
    tenses: [
      { tense: 'CONG_PRESENTE', label: 'Presente' },
      { tense: 'CONG_IMPERFETTO', label: 'Imperfetto' },
      { tense: 'CONG_PASSATO', label: 'Passato' },
      { tense: 'CONG_TRAPASSATO', label: 'Trapassato' },
    ],
  },
  {
    mood: 'Condizionale',
    tenses: [
      { tense: 'COND_PRESENTE', label: 'Presente' },
      { tense: 'COND_PASSATO', label: 'Passato' },
    ],
  },
  {
    mood: 'Imperativo',
    tenses: [{ tense: 'IMPERATIVO', label: 'Imperativo' }],
  },
];
