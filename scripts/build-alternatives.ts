/**
 * A verb's valid alternatives — forms that are correct Italian but were not
 * chosen as the main value — gathered from every source and attached to its
 * ledger entry. Called from buildVerb (scripts/build-verb.ts).
 */
import fs from "node:fs"
import { iscAlternatives } from "./corrections.ts"
import { clippedForms } from "./derive.ts"
import {
  ALTERNATIVES,
  type AlternativeForms,
  type AlternativeKind,
} from "./vocabulary.ts"
import type { LedgerLeaf } from "../types/verb-ledger.ts"
import type { Stats } from "./build-stats.ts"
import { FIXED_ALTERNATIVES } from "../constants/build.ts"
import { RULE } from "../constants/rules.ts"

/** Reads a verb's finished form at a path, or undefined if it has none. */
export type FormAt = (featurePath: string) => string | undefined

// Valid variants of a form that were not chosen, decided one at a time: verb →
// form path → kind → forms. The conflict rules and the clipped forms add more
// as the build runs.
//   { "fare": { "impr.pres.S2": { "common": ["fai"] } } }
const verbFormAlternatives: Record<
  string,
  Record<string, AlternativeForms>
> = JSON.parse(fs.readFileSync(FIXED_ALTERNATIVES, "utf8"))

/** A verb's hand-curated alternatives, by path. */
export const fixedAlternatives = (verb: string): Record<string, AlternativeForms> =>
  verbFormAlternatives[verb] ?? {}

/**
 * Joins two sets of alternatives for one path, keeping each kind's forms in
 * order and without duplicates, and the kinds in ALTERNATIVES order.
 */
export const mergeKinds = (
  a: AlternativeForms,
  b: AlternativeForms,
): AlternativeForms => {
  const out: AlternativeForms = {}
  for (const kind of ALTERNATIVES) {
    const forms = [...new Set([...(a[kind] ?? []), ...(b[kind] ?? [])])]
    if (forms.length) out[kind] = forms
  }
  return out
}

/** Every form in a set of alternatives, whatever its kind. */
export const allForms = (alternatives: AlternativeForms): string[] =>
  Object.values(alternatives).flat() as string[]

/**
 * Every valid alternative for the verb, by path: from
 * resources/fixed-alternatives.json, the conflict rules, the forms without
 * -isc- of a verb that also uses them (aggrinzo), and the clipped forms made
 * from the finished forms by clippedForms (scripts/derive.ts).
 *
 * Also returns which "path.kind.form" triples came from the hand-curated
 * file specifically, so attachAlternatives can tell a hand-added alternative
 * from one derived from Morph-it's own data.
 */
const collectAlternatives = (
  infinitive: string,
  formAt: FormAt,
  ruleAlternatives: ReadonlyMap<string, AlternativeForms>,
  stats: Stats,
) => {
  const alternatives = new Map<string, AlternativeForms>(
    Object.entries(fixedAlternatives(infinitive)),
  )
  const handAdded = new Set<string>() // "path.kind.form" already in the hand-curated file
  for (const [featurePath, forms] of alternatives)
    for (const [kind, values] of Object.entries(forms))
      for (const value of values ?? []) handAdded.add(`${featurePath}.${kind}.${value}`)

  for (const [featurePath, forms] of [
    ...ruleAlternatives,
    ...Object.entries(iscAlternatives(infinitive)),
  ])
    alternatives.set(
      featurePath,
      mergeKinds(alternatives.get(featurePath) ?? {}, forms),
    )

  const clipped = clippedForms(infinitive, formAt)
  for (const [featurePath, [kind, form]] of Object.entries(clipped)) {
    alternatives.set(
      featurePath,
      mergeKinds(alternatives.get(featurePath) ?? {}, { [kind]: [form] }),
    )
    stats[kind]++
  }

  // A form is never an alternative to itself, whichever source listed it.
  for (const [featurePath, forms] of alternatives) {
    const value = formAt(featurePath)
    if (value === undefined) continue
    const kept: AlternativeForms = {}
    for (const [kind, values] of Object.entries(forms) as [AlternativeKind, string[]][]) {
      const others = values.filter((v) => v !== value)
      if (others.length) kept[kind] = others
    }
    if (Object.keys(kept).length) alternatives.set(featurePath, kept)
    else alternatives.delete(featurePath)
  }

  return { alternatives, handAdded }
}

/**
 * Attaches the verb's alternatives to their path's ledger entry, each
 * tagged with where it came from: "hand" for resources/fixed-alternatives.json,
 * "morph-it" for everything derived from Morph-it's own rejected candidates
 * by a rule or by clippedForms. A path with alternatives but no ledger entry
 * yet (a hand-added alternative on an otherwise-untouched Morph-it form)
 * still needs a base entry to hang them off.
 */
const attachAlternatives = (
  alternatives: Map<string, AlternativeForms>,
  handAdded: Set<string>,
  formAt: FormAt,
  ledger: Map<string, LedgerLeaf>,
) => {
  for (const [featurePath, forms] of alternatives) {
    if (!Object.keys(forms).length) continue
    const withSources: LedgerLeaf["alternatives"] = {}
    for (const kind of ALTERNATIVES) {
      const values = forms[kind]
      if (!values?.length) continue
      withSources[kind] = values.map((value) => ({
        value,
        sources: [handAdded.has(`${featurePath}.${kind}.${value}`) ? "hand" : "morph-it"],
      }))
    }
    const existing = ledger.get(featurePath)
    const fallbackForm = formAt(featurePath)
    ledger.set(featurePath, {
      ...(existing ??
        (fallbackForm !== undefined
          ? { source: "morph-it" as const, value: fallbackForm }
          : { source: "rule" as const, rule: [RULE.NO_VALUE], absent: true as const })),
      alternatives: withSources,
    })
  }
}

/**
 * Gathers every valid alternative for the verb and writes them onto its
 * ledger entries, tagged with their sources. Returns what it gathered, by
 * path, for attachRejected to tell a valid variant from a discarded one.
 */
export const recordAlternatives = (
  infinitive: string,
  formAt: FormAt,
  ruleAlternatives: ReadonlyMap<string, AlternativeForms>,
  ledger: Map<string, LedgerLeaf>,
  stats: Stats,
): Map<string, AlternativeForms> => {
  const { alternatives, handAdded } = collectAlternatives(
    infinitive,
    formAt,
    ruleAlternatives,
    stats,
  )
  attachAlternatives(alternatives, handAdded, formAt, ledger)
  return alternatives
}
