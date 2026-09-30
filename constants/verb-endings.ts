/**
 * Verb endings used by the correction rules (scripts/corrections.ts).
 */
import { GENDER, PERSON } from "../scripts/vocabulary.ts"

/**
 * The weak past historic endings, by person, for the three persons where a
 * verb can also have a strong form. -ere verbs have two weak sets, -ei and
 * -etti; -are and -ire verbs have one. `ei` holds the ending in the -ei set
 * and `etti` the ending in the -etti set: for lui/lei, *é* and *ette*.
 */
export const WEAK_PAST_ENDING: Record<string, Record<string, { ei: string; etti?: string }>> =
  {
    are: {
      [PERSON.s1]: { ei: "ai" },
      [PERSON.s3]: { ei: "ò" },
      [PERSON.p3]: { ei: "arono" },
    },
    ere: {
      [PERSON.s1]: { ei: "ei", etti: "etti" },
      [PERSON.s3]: { ei: "é", etti: "ette" },
      [PERSON.p3]: { ei: "erono", etti: "ettero" },
    },
    ire: {
      [PERSON.s1]: { ei: "ii" },
      [PERSON.s3]: { ei: "ì" },
      [PERSON.p3]: { ei: "irono" },
    },
  }

/** The endings of a strong past historic, by person: *crebbi, crebbe, crebbero*. */
export const STRONG_PAST_ENDING: Record<string, string> = {
  [PERSON.s1]: "i",
  [PERSON.s3]: "e",
  [PERSON.p3]: "ero",
}

/**
 * The kind of a past historic form: in the weak -ei set, in the weak -etti
 * set, or strong.
 */
export const PAST_KIND = { weakEi: "weakEi", weakEtti: "weakEtti", strong: "strong" } as const

/**
 * The present participle endings of a PARTICIPLE_IENTE_VERBS verb, by gender:
 * *percipiente*, *percipienti*.
 */
export const PARTICIPLE_IENTE_ENDING: Record<string, string> = {
  [GENDER.m]: "iente",
  [GENDER.f]: "iente",
  [GENDER.mp]: "ienti",
  [GENDER.fp]: "ienti",
}
