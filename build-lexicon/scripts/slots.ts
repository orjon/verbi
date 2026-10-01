/**
 * Reads Morph-it's own notation for person, number and gender, and turns it into
 * the names in build-lexicon/constants/grammar.ts.
 *
 * Which of those a form has depends on its tense: conjugated tenses have six
 * persons, participles have four gender and number forms, and the infinitive
 * and gerund have none at all.
 */
import { MOOD } from "../constants/grammar.ts"

/** Morph-it's number letters, and ours. */
const MORPHIT_NUMBER: Record<string, string> = { s: "S", p: "P" }

/**
 * Morph-it's gender letters, and ours.
 *
 * Masculine is unmarked, so it maps to an empty string: `S` is masculine
 * singular and `SF` feminine singular.
 */
const MORPHIT_GENDER: Record<string, string> = { m: "", f: "F" }

/** True for the moods that have a single form and no person. */
export function isInfinitiveOrGerund(mood: string): boolean {
  return mood === MOOD.infi || mood === MOOD.geru
}

/** True for the participle, which varies by gender and number, not person. */
export function isParticiple(mood: string): boolean {
  return mood === MOOD.part
}

/**
 * The gender a participle form takes, from Morph-it's number and gender
 * letters: `s`+`m` is `S`, `p`+`f` is `PF`.
 *
 * Masculine is an empty string rather than a letter, so the gender lookup is
 * tested against `undefined`. A truthiness test would reject every masculine
 * form.
 */
export function participleSlot(number: string, gender: string): string | null {
  const n = MORPHIT_NUMBER[number]
  const g = MORPHIT_GENDER[gender]
  return n && g !== undefined ? n + g : null
}

/**
 * The person a conjugated form takes, from Morph-it's person and number:
 * `1`+`s` is `S1`, `3`+`p` is `P3`.
 *
 * Note the order reverses — Morph-it writes person then number, we write
 * number then person.
 */
export function personSlot(person: string, number: string): string | null {
  const n = MORPHIT_NUMBER[number]
  return /^[123]$/.test(person) && n ? n + person : null
}
