/** Reading and writing a form in a verb's entry tree (mood → tense → slot). */
import type { Features } from "./parse-lexicon.ts"
import type { Slots, Tree } from "../types/build.ts"
import {
  GENDERS,
  IMPERATIVE_PERSONS,
  PERSONS,
} from "../constants/grammar.ts"
import {
  PATH,
  formPath,
} from "../constants/feature-paths.ts"

/**
 * Stores a form in a verb's entry, as mood → tense → slot.
 * A tense with no slots, such as `inf.pres`, holds the form directly.
 *
 * verbEntry after setForm(verbEntry, { mood: "ind", tense: "pres", slot: "S1" }, "parlo")
 * and setForm(verbEntry, { mood: "inf", tense: "pres", slot: null }, "parlare"):
 *
 *   { ind: { pres: { S1: "parlo" } }, inf: { pres: "parlare" } }
 */
export const setForm = (
  verbEntry: Tree,
  { mood, tense, slot }: Features,
  value: string,
) => {
  const verbMood = (verbEntry[mood] ??= {})
  if (slot) ((verbMood[tense] ??= {}) as Slots)[slot] = value
  else verbMood[tense] = value
}

/** Reads a form from a verb's entry, or undefined when the slot is empty. */
export const getForm = (
  verbEntry: Tree,
  { mood, tense, slot }: Features,
): string | undefined => {
  const byTense = verbEntry[mood]?.[tense]
  return slot ? byTense?.[slot] : byTense
}

/** Reads a form from a verb's entry by its path ("ind.pres.S1"), or undefined. */
export const getFormAt = (
  verbEntry: Tree,
  featurePath: string,
): string | undefined => {
  const [mood, tense, slot = null] = featurePath.split(".")
  const form = getForm(verbEntry, { mood, tense, slot })
  return typeof form === "string" ? form : undefined
}

/**
 * Every form path a complete verb would have: the infinitive, the gerund, the
 * six persons of each finite tense, the three imperative persons, and the four
 * forms of each participle.
 *
 * Not used yet. Kept for a completeness check: a verb missing one of these
 * paths should be explained by a rule or an override.
 */
export const expectedPaths = (): string[] => {
  const paths: string[] = [PATH.infi, PATH.geru]
  for (const tense of [
    PATH.indi.pres,
    PATH.indi.impf,
    PATH.indi.past,
    PATH.indi.futu,
    PATH.cond.pres,
    PATH.subj.pres,
    PATH.subj.impf,
  ])
    for (const person of PERSONS) paths.push(formPath(tense, person))
  for (const person of IMPERATIVE_PERSONS)
    paths.push(formPath(PATH.impr.pres, person))
  for (const tense of [PATH.part.pres, PATH.part.past])
    for (const gender of GENDERS) paths.push(formPath(tense, gender))
  return paths
}
