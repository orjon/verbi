/**
 * The names the verb data uses for moods, tenses, persons and genders, and the
 * endings shared by more than one script.
 *
 * A form is addressed by a path: mood, tense, then person or gender, for
 * example `ind.pres.S1` for *parlo*. The keys below are the data's own codes,
 * written in lowercase and padded to four letters where the code is shorter,
 * so `MOOD.indi` is `"ind"` and `TENSE.futu` is `"fut"`.
 *
 * How Morph-it writes these in its own tags is handled in scripts/slots.ts.
 */

/** The moods. */
export const MOOD = {
  indi: "ind", // indicativo
  subj: "sub", // congiuntivo
  cond: "cond", // condizionale
  impr: "impr", // imperativo
  infi: "inf", // infinito
  geru: "ger", // gerundio
  part: "part", // participio
} as const

/** The tenses. `past` is the passato remoto, and the past participle. */
export const TENSE = {
  pres: "pres",
  impf: "impf",
  past: "past",
  futu: "fut",
} as const

/** The six persons: io, tu, lui/lei, noi, voi, loro. */
export const PERSON = {
  s1: "S1",
  s2: "S2",
  s3: "S3",
  p1: "P1",
  p2: "P2",
  p3: "P3",
} as const

/** The six persons in table order. */
export const PERSONS = [
  PERSON.s1,
  PERSON.s2,
  PERSON.s3,
  PERSON.p1,
  PERSON.p2,
  PERSON.p3,
] as const

/**
 * The persons an imperative has. You cannot command yourself, so there is no
 * first person singular, and Morph-it does not record the polite forms.
 */
export const IMPERATIVE_PERSONS = [PERSON.s2, PERSON.p1, PERSON.p2] as const

/**
 * A participle's gender and number. Masculine is unmarked, so `S` is masculine
 * singular and `SF` feminine singular — *parlato, parlata, parlati, parlate*.
 */
export const GENDER = { m: "S", f: "SF", mp: "P", fp: "PF" } as const

/** The four genders in table order. */
export const GENDERS = [GENDER.m, GENDER.f, GENDER.mp, GENDER.fp] as const

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

/** The conjugation groups, by the infinitive's ending. */
export const CONJUGATION = {
  are: "are",
  ere: "ere",
  ire: "ire",
  rre: "rre",
} as const

/**
 * Endings shared by more than one script. Lists are in person order, S1 to P3.
 *
 * The future and conditional endings are the same for every Italian verb,
 * whatever its stem: *parler-* + *ò*, *sar-* + *ò*, *porr-* + *ò*. The others
 * depend on the conjugation group.
 */
export const ENDING = {
  futu: ["ò", "ai", "à", "emo", "ete", "anno"],
  cond: ["ei", "esti", "ebbe", "emmo", "este", "ebbero"],
  impf: { are: "avo", ere: "evo", ire: "ivo" },
  geru: { are: "ando", ere: "endo", ire: "endo" },
  part: {
    pres: { are: "ante", ere: "ente", ire: "ente" },
    past: { are: "ato", ere: "uto", ire: "ito" },
  },
} as const

/**
 * Accented letters. On `e`, the grave marks an open vowel (*caffè*, the copula
 * *è*) and the acute a closed one (*perché*, the past historic *batté*).
 */
export const ACCENTS = { eGrave: "è", eAcute: "é" } as const
