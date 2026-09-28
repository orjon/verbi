/**
 * The names of the slots a verb's forms sit in, and the facts about them that
 * every script needs.
 *
 * A form is addressed as mood → tense → slot, for example
 * `parlare.ind.pres.S1`. Which slots a tense has depends on the tense:
 * conjugated tenses have six persons, participles have four gender and number
 * forms, and the infinitive and gerund have none at all.
 */

/** The moods, as Morph-it names them. */
export const INDICATIVE = "ind"
export const SUBJUNCTIVE = "sub"
export const CONDITIONAL = "cond"
export const IMPERATIVE = "impr"
export const INFINITIVE = "inf"
export const GERUND = "ger"
export const PARTICIPLE = "part"

/** The moods with no person: one form each, or four in the participle's case. */
export const MOODS_WITHOUT_PERSON = [INFINITIVE, GERUND] as const

/** Morph-it's number letters, and ours. */
const NUMBER: Record<string, string> = { s: "S", p: "P" }

/**
 * Morph-it's gender letters, and ours.
 *
 * Masculine is unmarked, so it maps to an empty string: `S` is masculine
 * singular and `SF` feminine singular.
 */
const GENDER: Record<string, string> = { m: "", f: "F" }

/** True for the moods that have a single form and no person. */
export function isInfinitiveOrGerund(mood: string): boolean {
  return mood === INFINITIVE || mood === GERUND
}

/** True for the participle, which varies by gender and number, not person. */
export function isParticiple(mood: string): boolean {
  return mood === PARTICIPLE
}

/**
 * The slot a participle form sits in, from Morph-it's number and gender
 * letters: `s`+`m` is `S`, `p`+`f` is `PF`.
 *
 * Masculine is an empty string rather than a letter, so the gender lookup is
 * tested against `undefined`. A truthiness test would reject every masculine
 * form.
 */
export function participleSlot(number: string, gender: string): string | null {
  const n = NUMBER[number]
  const g = GENDER[gender]
  return n && g !== undefined ? n + g : null
}

/**
 * The slot a conjugated form sits in, from Morph-it's person and number:
 * `1`+`s` is `S1`, `3`+`p` is `P3`.
 *
 * Note the order reverses — Morph-it writes person then number, we write
 * number then person.
 */
export function personSlot(person: string, number: string): string | null {
  const n = NUMBER[number]
  return /^[123]$/.test(person) && n ? n + person : null
}

/**
 * The six person slots in table order: io, tu, lui/lei, noi, voi, loro.
 *
 * A list rather than an object because object keys have no reliable order.
 */
export const PERSON_SLOTS = ["S1", "S2", "S3", "P1", "P2", "P3"] as const

/**
 * The four participle slots: masculine and feminine, singular and plural.
 * Masculine is unmarked, so `S` is masculine singular and `SF` feminine —
 * *parlato, parlata, parlati, parlate*.
 */
export const GENDER_SLOTS = ["S", "SF", "P", "PF"] as const

/**
 * The three slots an imperative has. You cannot command yourself, so there is
 * no first person singular, and Morph-it does not record the polite forms.
 */
export const IMPERATIVE_SLOTS = ["S2", "P1", "P2"] as const

/**
 * The future's endings, which are the same for every Italian verb whatever its
 * stem: *parler-* + *ò*, *sar-* + *ò*, *porr-* + *ò*.
 *
 * Used to check that a verb's six persons agree about their stem. Whether that
 * agreement is guaranteed is item 3a of resources/to-verify.md and is not yet
 * confirmed, so nothing acts on this — it only reports.
 */
export const FUTURE_ENDINGS: Record<string, string> = {
  S1: "ò",
  S2: "ai",
  S3: "à",
  P1: "emo",
  P2: "ete",
  P3: "anno",
}
