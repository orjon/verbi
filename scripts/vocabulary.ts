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

/**
 * The kinds of valid alternative to a standard form. `common` and
 * `clipped_common` are equal to the standard and shown beside it; the others are
 * a secondary tier.
 *
 *   common          an equal modern variant: fai beside fa'
 *   colloquial      everyday speech, avoided in writing: disfo
 *   formal          careful or official writing, closer to the Latin root
 *   literary        found mainly in literature: seggo, crescei
 *   uncommon        correct but seldom used: coceva, possedente
 *   regional        used in one area or dialect, not standard elsewhere
 *   dated           sounds old-fashioned to a modern speaker, but still used
 *   archaic         rarely used except deliberately, for effect
 *   obsolete        no longer in real use; found only in historical texts
 *   sense           a different meaning of the verb: ripartisco ("I divide")
 *   clipped_common  a clipped form in everyday use: han, vuol, aver
 *   clipped_poetic  a clipped form found in poetry and song: parlan, furon
 */
export const ALTERNATIVE = {
  common: "common",
  colloquial: "colloquial",
  formal: "formal",
  literary: "literary",
  uncommon: "uncommon",
  regional: "regional",
  dated: "dated",
  archaic: "archaic",
  obsolete: "obsolete",
  sense: "sense",
  clipped_common: "clipped_common",
  clipped_poetic: "clipped_poetic",
} as const

export type AlternativeKind = (typeof ALTERNATIVE)[keyof typeof ALTERNATIVE]

/** Every alternative kind, in the order they are listed and shown. */
export const ALTERNATIVES: readonly AlternativeKind[] = Object.values(ALTERNATIVE)

/** Valid alternatives to one form, by kind: { common: ["fai"] }. */
export type AlternativeForms = Partial<Record<AlternativeKind, string[]>>
