import { PERSON } from "./grammar.ts"

/** How Wiktionary writes an empty cell (a form a defective verb lacks). */
export const NO_FORM = "-"

/**
 * Wiktionary labels that mark a form as not valid Italian: `hypercorrect` (a
 * mistake made by over-applying a rule) and `error-unrecognized-form` (a
 * parsing artifact, not a real word). Such a form is never an alternative.
 */
export const DISQUALIFYING_LABELS = new Set([
  "hypercorrect",
  "error-unrecognized-form",
])

/**
 * Wiktionary tags that weaken the label beside them, so the form still counts
 * as standard: "common, sometimes proscribed" (soddisfo, disfi) is common.
 * Matches the fare-compound rule's own choice for these forms
 * (build-lexicon/scripts/corrections.ts).
 */
export const SOFTENING_LABELS = new Set(["sometimes"])

/** The tags that say which form a table cell is. None of them is a label. */
export const GRAMMAR_TAGS = new Set([
  "first-person",
  "second-person",
  "third-person",
  "singular",
  "plural",
  "indicative",
  "subjunctive",
  "conditional",
  "imperative",
  "infinitive",
  "gerund",
  "participle",
  "present",
  "imperfect",
  "past",
  "historic",
  "future",
])

/** A Wiktionary person + number tag pair, as our own person code. */
export const PERSON_BY_TAGS: Record<string, string> = {
  "first-person singular": PERSON.s1,
  "second-person singular": PERSON.s2,
  "third-person singular": PERSON.s3,
  "first-person plural": PERSON.p1,
  "second-person plural": PERSON.p2,
  "third-person plural": PERSON.p3,
}
