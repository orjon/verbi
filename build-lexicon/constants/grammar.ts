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

/** The conjugation groups, by the infinitive's ending. */
export const CONJUGATION = {
  are: "are",
  ere: "ere",
  ire: "ire",
  rre: "rre",
} as const

/**
 * Accented letters. On `e`, the grave marks an open vowel (*caffè*, the copula
 * *è*) and the acute a closed one (*perché*, the past historic *batté*).
 */
export const ACCENTS = { eGrave: "è", eAcute: "é" } as const

/** The ending of a reflexive verb's infinitive (accorgersi). The build keeps its own copy; the app has another. */
export const REFLEXIVE_SUFFIX = "si"
