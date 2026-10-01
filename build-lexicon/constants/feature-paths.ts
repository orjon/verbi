import { GENDERS, IMPERATIVE_PERSONS, MOOD, PERSONS, TENSE } from "./grammar.ts"

const path = <M extends string, T extends string>(mood: M, tense: T) =>
  `${mood}.${tense}` as const

/**
 * The path to each tense. Only the tenses that exist are listed, so a path such
 * as a future subjunctive cannot be written. The infinitive and gerund have one
 * form each, so their path is a string rather than a set of tenses.
 */
export const PATH = {
  indi: {
    pres: path(MOOD.indi, TENSE.pres),
    impf: path(MOOD.indi, TENSE.impf),
    past: path(MOOD.indi, TENSE.past),
    futu: path(MOOD.indi, TENSE.futu),
  },
  subj: {
    pres: path(MOOD.subj, TENSE.pres),
    impf: path(MOOD.subj, TENSE.impf),
  },
  cond: { pres: path(MOOD.cond, TENSE.pres) },
  impr: { pres: path(MOOD.impr, TENSE.pres) },
  part: {
    pres: path(MOOD.part, TENSE.pres),
    past: path(MOOD.part, TENSE.past),
  },
  infi: path(MOOD.infi, TENSE.pres),
  geru: path(MOOD.geru, TENSE.pres),
} as const

/**
 * The path to one form: a tense's path and a person or gender.
 *
 *   formPath(PATH.impr.pres, PERSON.s2)  →  "impr.pres.S2"
 */
export const formPath = (tensePath: string, key: string): string =>
  `${tensePath}.${key}`

/** Every form path of one tense, keyed by person or gender. */
const formsOf = <T extends string, K extends string>(
  tensePath: T,
  keys: readonly K[],
) =>
  Object.fromEntries(keys.map((k) => [k, `${tensePath}.${k}`])) as {
    [P in K]: `${T}.${P}`
  }

/**
 * The path to every form, by mood, tense and person or gender — only the
 * ones that exist, so `PATH_TO.impr.pres.S1` does not compile. For a fixed
 * form; use formPath where the person comes from a variable.
 *
 *   PATH_TO.indi.futu.S1  →  "ind.fut.S1"
 *   PATH_TO.part.past.S   →  "part.past.S"
 */
export const PATH_TO = {
  indi: {
    pres: formsOf(PATH.indi.pres, PERSONS),
    impf: formsOf(PATH.indi.impf, PERSONS),
    past: formsOf(PATH.indi.past, PERSONS),
    futu: formsOf(PATH.indi.futu, PERSONS),
  },
  subj: {
    pres: formsOf(PATH.subj.pres, PERSONS),
    impf: formsOf(PATH.subj.impf, PERSONS),
  },
  cond: { pres: formsOf(PATH.cond.pres, PERSONS) },
  impr: { pres: formsOf(PATH.impr.pres, IMPERATIVE_PERSONS) },
  part: {
    pres: formsOf(PATH.part.pres, GENDERS),
    past: formsOf(PATH.part.past, GENDERS),
  },
} as const

/** The tenses that have six persons. */
export const PERSON_TENSES = [
  PATH.indi.pres,
  PATH.indi.impf,
  PATH.indi.past,
  PATH.indi.futu,
  PATH.cond.pres,
  PATH.subj.pres,
  PATH.subj.impf,
]
