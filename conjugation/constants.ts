/**
 * Fixed values shared across the app.
 *
 * Structure only — the lists that encode knowledge about Italian live beside
 * the code that explains them, in `conjugation/aux.ts` and `excluded.ts`.
 */
import type { Numbers, Person, Tense, VerbType } from './types.ts';

/** The kinds of verb the list can be filtered by, in the order shown. */
export const VERB_TYPES: readonly VerbType[] = ['are', 'ere', 'ire', 'isc', 'rre'];

/** How each kind of verb is written. */
export const VERB_TYPE_LABEL: Record<VerbType, string> = {
  are: '-are', ere: '-ere', ire: '-ire', isc: '-isc-', rre: '-rre',
};

/**
 * The six persons in the order a conjugation table is read:
 * io, tu, lui/lei, noi, voi, loro.
 */
export const PERSONS: ReadonlyArray<[Person, Numbers]> = [
  [1, 'S'], [2, 'S'], [3, 'S'], [1, 'P'], [2, 'P'], [3, 'P'],
];

/** The ending of a reflexive or pronominal infinitive: lavarsi, accorgersi. */
export const REFLEXIVE_SUFFIX = 'si';

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

/** When a tense places the action, relative to now. */
export type Time = 'past' | 'present' | 'future';

/** The times in the order they are shown, left to right. */
export const TIMES: readonly Time[] = ['past', 'present', 'future'];

/**
 * The moods and tenses of a full conjugation table. Each tense says when it
 * is (`time`) and whether it is a compound tense, the action already done
 * (`done`), so the page can lay them out on those two axes.
 */
export const TENSE_GROUPS: ReadonlyArray<{
  mood: string;
  /** A few words on what the mood is for, shown beside its name. */
  gist: string;
  /** One line of explanation, shown under the name. */
  about: string;
  tenses: ReadonlyArray<{
    tense: Tense;
    label: string;
    time: Time;
    done: boolean;
    note?: string;
  }>;
}> = [
  {
    mood: 'Indicativo',
    gist: 'Facts',
    about: 'What is, was or will be.',
    tenses: [
      { tense: 'IMPERFETTO', label: 'Imperfetto', time: 'past', done: false, note: 'ongoing or habitual' },
      { tense: 'PASSATO_REMOTO', label: 'Passato remoto', time: 'past', done: false, note: 'finished' },
      { tense: 'PRESENTE', label: 'Presente', time: 'present', done: false },
      { tense: 'FUTURO_SEMPLICE', label: 'Futuro semplice', time: 'future', done: false },
      { tense: 'PASSATO_PROSSIMO', label: 'Passato prossimo', time: 'past', done: true },
      { tense: 'TRAPASSATO_PROSSIMO', label: 'Trapassato prossimo', time: 'past', done: true },
      { tense: 'TRAPASSATO_REMOTO', label: 'Trapassato remoto', time: 'past', done: true },
      { tense: 'FUTURO_ANTERIORE', label: 'Futuro anteriore', time: 'future', done: true },
    ],
  },
  {
    mood: 'Condizionale',
    gist: 'What would happen',
    about: 'Also used for polite requests, like vorrei or potrei.',
    tenses: [
      { tense: 'COND_PRESENTE', label: 'Presente', time: 'present', done: false },
      { tense: 'COND_PASSATO', label: 'Passato', time: 'past', done: true },
    ],
  },
  {
    mood: 'Congiuntivo',
    gist: 'Doubt, wish or opinion',
    about: 'For things that are not certain, often after che.',
    tenses: [
      { tense: 'CONG_IMPERFETTO', label: 'Imperfetto', time: 'past', done: false },
      { tense: 'CONG_PRESENTE', label: 'Presente', time: 'present', done: false },
      { tense: 'CONG_TRAPASSATO', label: 'Trapassato', time: 'past', done: true },
      { tense: 'CONG_PASSATO', label: 'Passato', time: 'past', done: true },
    ],
  },
  {
    mood: 'Imperativo',
    gist: 'Commands',
    about: 'Telling someone to do something.',
    tenses: [{ tense: 'IMPERATIVO', label: 'Imperativo', time: 'present', done: false }],
  },
];
