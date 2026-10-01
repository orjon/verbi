/**
 * Builds one verb's entry for lexicons/it-verbs.json, deciding each slot in this
 * order — the overrides file, then class-level rules and Morph-it's own
 * forms (chosen between by validate.ts, settled where ambiguous by the
 * conflict rules in corrections.ts) — and records where every decision came
 * from, for lexicons/it-verbs-ledger.json (see build-lexicon/scripts/build-ledger.ts).
 *
 * buildVerb runs these steps, in order, on one shared `verbEntry` (the
 * finished forms) and `ledger` (why each one is what it is):
 *
 *   1. applyCorrections    fix known classes of Morph-it error up front
 *                          (build-lexicon/scripts/build-corrections.ts)
 *   2. decideForms         the main per-slot decision loop
 *   3. fillGerund          derive a missing gerund from the imperfect
 *   4. fillImperative      derive missing imperative persons from the present
 *   5. accentCompounds     add the accent a one-syllable compound needs
 *   6. recordUnresolvedForms  flag what step 2 could not decide at all
 *   7. recordFutureDisagreements  flag a future person whose stem is odd
 *   8. recordAlternatives  gather every valid variant, from every source, and
 *                          write them onto the ledger tagged with sources
 *                          (build-lexicon/scripts/build-alternatives.ts)
 *   9. attachRejected      note Morph-it's own discarded candidates
 *  10. finalizeLedgerEntry  add `regular`/`auxiliary` and store the result
 */
import type { Features } from "./parse-lexicon.ts"
import { choose } from "./validate.ts"
import { absentPaths, accentedCompound } from "./corrections.ts"
import { applyCorrections, resolveConflict } from "./build-corrections.ts"
import { gerundFromImperfect, imperativeFromPresent } from "./derive.ts"
import {
  allForms,
  type FormAt,
  mergeKinds,
  recordAlternatives,
} from "./build-alternatives.ts"
import { regularForms } from "./regular.ts"
// TEMPORARY: reaches into the app code. Goes away when the auxiliaries move into the data (notes/to-do.md).
import { getAux, isDualAux, _lists as auxLists } from "../../conjugation/aux.ts"
import {
  CONJUGATION,
  IMPERATIVE_PERSONS,
  MOOD,
  PERSON,
  PERSONS,
  TENSE,
} from "../constants/grammar.ts"
import {
  ENDING,
} from "../constants/endings.ts"
import {
  formPath,
  PATH,
} from "../constants/feature-paths.ts"
import type { Resolution, Slots, Tree, UnresolvedForm, AlternativeForms } from "../types/build.ts"
import { getForm, getFormAt, setForm } from "./verb-utils.ts"
import { overridesOf } from "./overrides.ts"
import { RULE } from "../constants/rules.ts"
import { type RuleName } from "../types/build.ts"
import type { AuxiliaryEntry, LedgerLeaf, VerbLedger } from "../types/verb-ledger.ts"
import type { Stats } from "./build-stats.ts"

// Marks a slot where Morph-it gives forms but validate.ts rejects them all. It
// never equals a final form, so such a slot always counts as adjusted.
const REJECTED = Symbol("rejected")

const GERUND_SLOT: Features = { mood: MOOD.geru, tense: TENSE.pres, slot: null }
const IMPERFECT_S1: Features = {
  mood: MOOD.indi,
  tense: TENSE.impf,
  slot: PERSON.s1,
}

// -------------------------------------------------------------------------
// Small, shared helpers.
// -------------------------------------------------------------------------

/**
 * Looks up one slot in the overrides file.
 *
 * Returns:
 *   undefined  no override — use Morph-it's form
 *   null       no form exists here — leave the slot empty
 *   string     use this form
 *
 * The file can set null on a whole mood, a whole tense, or a single slot, so
 * all three are checked.
 */
const getOverride = (verb: string, { mood, tense, slot }: Features) => {
  const entries = overridesOf(verb)
  const valueAt = (path: string) => entries[path]?.value

  if (valueAt(mood) === null) return null // the whole mood does not exist
  const tensePath = `${mood}.${tense}`
  const tenseValue = valueAt(tensePath)
  if (tenseValue === null) return null // the whole tense does not exist

  // a tense with no slots, such as `inf.pres`, holds the form directly
  if (typeof tenseValue === "string") return slot ? undefined : tenseValue
  return slot ? valueAt(`${tensePath}.${slot}`) : undefined
}

/**
 * Where the six persons of a future disagree about their stem: which person,
 * and what its stem implies the others should be.
 *
 * The future uses one stem for all six persons. Morph-it's one error there is
 * corrected before choosing, by withFutureS1 in build-lexicon/scripts/corrections.ts, so this
 * should find nothing. It is kept as a check: it reports, and changes nothing.
 * See *Future io form* under Resolved in notes/to-verify.md.
 */
const futureDisagreements = (
  slots: Slots,
): { person: string; expected: string }[] => {
  const stems: string[] = []
  for (const [i, person] of PERSONS.entries()) {
    const form = slots[person]
    const ending = ENDING.futu[i]
    if (form?.endsWith(ending)) stems.push(form.slice(0, -ending.length))
  }
  if (stems.length < 2) return []

  const counts = new Map<string, number>()
  for (const s of stems) counts.set(s, (counts.get(s) ?? 0) + 1)
  const [stem] = [...counts].sort((a, b) => b[1] - a[1])[0]

  const odd: { person: string; expected: string }[] = []
  for (const [i, person] of PERSONS.entries()) {
    const form = slots[person]
    const expected = stem + ENDING.futu[i]
    if (form && form !== expected) odd.push({ person, expected })
  }
  return odd
}

/**
 * Lists the form paths to fill for one verb: every path Morph-it has a form
 * for, plus every path the overrides file gives a form for.
 *
 * Returns, for parlare:
 *
 *   Set { "impr.pres.S2", "ind.pres.S3", "ind.past.S1", ..., "inf.pres" }
 */
const formPaths = (
  infinitive: string,
  featurePaths: Record<string, string[]>,
): Set<string> => {
  const paths = new Set(Object.keys(featurePaths))
  // paths: Set<string> = Set { "impr.pres.S2", "ind.pres.S3", ... }

  for (const [path, { value }] of Object.entries(overridesOf(infinitive))) {
    if (value === undefined) continue // alternatives only
    // a null above a slot (a whole mood or tense) fills no path
    if (value === null && path.split(".").length < 3) continue
    paths.add(path)
  }
  return paths
}

/** Adds `rule` to an existing ledger entry's rule chain, or starts one. */
const addRule = (
  ledger: Map<string, LedgerLeaf>,
  path: string,
  rule: RuleName,
  value: string,
) => {
  const existing = ledger.get(path)
  ledger.set(path, {
    ...existing,
    value,
    source: existing?.source ?? "rule",
    rule: [...(existing?.rule ?? []), rule],
  })
}

// -------------------------------------------------------------------------
// Step 2: the main per-slot decision loop.
// -------------------------------------------------------------------------

type Decision =
  | { source: "rule"; rule: RuleName } // a class-level rule says this form does not exist
  | { source: "override"; form: string | null } // null: the override removes it
  | { source: "morph-it"; form: string }
  | { source: "conflict"; ambiguous: string[] } // Morph-it gives several forms and none is chosen
  | ({ source: "resolved" } & Resolution) // a conflict settled by a rule in corrections.ts
  | { source: "rejected"; rejected: string[] } // every form Morph-it gives fails validate.ts
  | { source: "none" } // Morph-it has nothing for this slot

/**
 * Decides the form for one slot. Checks these in order and stops at the first
 * that answers:
 *
 *   - class-level rules in corrections.ts
 *   - the overrides file
 *   - Morph-it's forms, chosen between by validate.ts
 *   - where Morph-it gives several, the conflict rules in corrections.ts
 *
 * Returns, for example:
 *
 *   calere,     "ind.pres.S1"  →  { source: "override", form: null }
 *   calere,     "ind.pres.S3"  →  { source: "override", form: "cale" }
 *   parlare,    "ind.pres.S1"  →  { source: "morph-it", form: "parlo" }
 *   accrescere, "ind.past.S1"  →  { source: "conflict", ambiguous: ["accrebbi", "accrescei"] }
 *   sedere,     "ger.pres"     →  { source: "rejected", rejected: ["sedevo", "siedevo"] }
 */
const decideForm = (
  infinitive: string,
  featurePath: string,
  features: Features,
  forms: string[] | undefined,
  absent: ReadonlyMap<string, RuleName>,
  resolve: (candidates: string[]) => Resolution | null,
): Decision => {
  const absentRule =
    absent.get(`${features.mood}.${features.tense}`) ?? absent.get(featurePath)
  if (absentRule) return { source: "rule", rule: absentRule }

  const override = getOverride(infinitive, features)
  if (override !== undefined) return { source: "override", form: override }

  if (!forms?.length) return { source: "none" }
  const { form, ambiguous, rejected } = choose(featurePath, forms, infinitive)
  if (form) return { source: "morph-it", form }
  if (ambiguous.length) {
    const settled = resolve(ambiguous)
    if (settled) return { source: "resolved", ...settled }
    return { source: "conflict", ambiguous }
  }
  if (rejected) return { source: "rejected", rejected: [...new Set(forms)] }
  return { source: "none" }
}


/**
 * Decides every slot of the verb, writing each decision into `verbEntry` and
 * `ledger`, and merging any alternatives a conflict rule produced into
 * `ruleAlternatives`.
 *
 * Returns what step 2 alone could not settle (a conflict or a rejected
 * form — later steps may still fill these), and, for every slot, what
 * Morph-it itself gave before any override or rule touched it, for
 * attachRejected to compare the final value against.
 */
const decideForms = (
  infinitive: string,
  featurePaths: Record<string, string[]>,
  morphItPaths: Record<string, string[]>,
  absent: ReadonlyMap<string, RuleName>,
  built: Tree,
  verbEntry: Tree,
  ledger: Map<string, LedgerLeaf>,
  ruleAlternatives: Map<string, AlternativeForms>,
  stats: Stats,
) => {
  const conflictForms: UnresolvedForm[] = []
  const rejectedForms: UnresolvedForm[] = []
  const morphItForms = new Map<string, string | typeof REJECTED | null>()

  for (const featurePath of formPaths(infinitive, featurePaths)) {
    const [mood, tense, slot = null] = featurePath.split(".")
    const features: Features = { mood, tense, slot }
    const forms = featurePaths[featurePath]
    // What Morph-it itself gives, before the accent is corrected.
    const original = morphItPaths[featurePath]
    const morphIt = original?.length
      ? choose(featurePath, original, infinitive)
      : null
    morphItForms.set(
      featurePath,
      morphIt?.rejected ? REJECTED : (morphIt?.form ?? null),
    )
    const decision = decideForm(
      infinitive,
      featurePath,
      features,
      forms,
      absent,
      (candidates) =>
        resolveConflict(
          infinitive,
          featurePath,
          candidates,
          forms ?? [],
          featurePaths,
          built,
        ),
    )

    switch (decision.source) {
      case "rule":
        ledger.set(featurePath, {
          source: "rule",
          rule: [decision.rule],
          absent: true,
        })
        stats.removedByCorrection++
        break
      case "override":
        if (decision.form === null) {
          stats.removedByOverride++
          ledger.set(featurePath, { source: "override", absent: true })
        } else {
          setForm(verbEntry, features, decision.form)
          ledger.set(featurePath, { source: "override", value: decision.form })
          stats.fromOverride++
          stats.forms++
        }
        break
      case "morph-it":
        setForm(verbEntry, features, decision.form)
        ledger.set(featurePath, { source: "morph-it", value: decision.form })
        stats.fromMorphIt++
        stats.forms++
        break
      case "resolved":
        setForm(verbEntry, features, decision.form)
        ledger.set(featurePath, {
          source: "rule",
          rule: [decision.rule],
          value: decision.form,
        })
        if (Object.keys(decision.alternatives).length)
          ruleAlternatives.set(featurePath, decision.alternatives)
        stats.fromConflictRule++
        stats.forms++
        break
      case "conflict":
        conflictForms.push([features, featurePath, decision.ambiguous])
        break
      case "rejected":
        rejectedForms.push([features, featurePath, decision.rejected])
        break
    }
  }

  return { conflictForms, rejectedForms, morphItForms }
}

// -------------------------------------------------------------------------
// Steps 3–5: fill what the main loop left empty, then adjust an accent.
// -------------------------------------------------------------------------

/**
 * Fills an empty gerund from the finished imperfect. Runs after the main
 * loop so an override on the imperfect is already applied. An override of
 * null on the gerund means no gerund, so the rule is skipped.
 */
const fillGerund = (
  infinitive: string,
  verbEntry: Tree,
  ledger: Map<string, LedgerLeaf>,
  derivedPaths: string[],
  stats: Stats,
) => {
  if (
    getForm(verbEntry, GERUND_SLOT) !== undefined ||
    getOverride(infinitive, GERUND_SLOT) !== undefined
  )
    return
  const imperfect = getForm(verbEntry, IMPERFECT_S1)
  const gerund = imperfect && gerundFromImperfect(imperfect)
  if (!gerund) return
  setForm(verbEntry, GERUND_SLOT, gerund)
  addRule(ledger, PATH.geru, RULE.GERUND_FROM_IMPERFECT, gerund)
  derivedPaths.push(PATH.geru)
  stats.fromDerivation++
  stats.forms++
}

/**
 * Fills an empty imperative slot from the finished present tense. Only where
 * Morph-it has nothing for the slot: a conflict or a rejected form is left
 * for review. An override or class rule on the slot means it is skipped.
 */
const fillImperative = (
  infinitive: string,
  featurePaths: Record<string, string[]>,
  absent: ReadonlyMap<string, RuleName>,
  verbEntry: Tree,
  ledger: Map<string, LedgerLeaf>,
  derivedPaths: string[],
  stats: Stats,
) => {
  for (const slot of IMPERATIVE_PERSONS) {
    const features: Features = { mood: MOOD.impr, tense: TENSE.pres, slot }
    const featurePath = formPath(PATH.impr.pres, slot)
    if (
      getForm(verbEntry, features) !== undefined ||
      featurePaths[featurePath]?.length ||
      getOverride(infinitive, features) !== undefined ||
      absent.has(PATH.impr.pres)
    )
      continue
    const form = imperativeFromPresent(
      infinitive,
      verbEntry[MOOD.indi]?.[TENSE.pres] ?? {},
      slot,
    )
    if (!form) continue
    setForm(verbEntry, features, form)
    addRule(ledger, featurePath, RULE.IMPERATIVE_FROM_PRESENT, form)
    derivedPaths.push(featurePath)
    stats.fromDerivation++
    stats.forms++
  }
}

/**
 * Writes the accent a compound's one-syllable form needs: rifa → rifà. Can
 * touch a slot a rule or override already decided, so it adds to that
 * slot's rule chain rather than replacing its entry.
 */
const accentCompounds = (
  infinitive: string,
  featurePaths: Record<string, string[]>,
  verbEntry: Tree,
  ledger: Map<string, LedgerLeaf>,
  ruleAlternatives: Map<string, AlternativeForms>,
  stats: Stats,
) => {
  for (const featurePath of formPaths(infinitive, featurePaths)) {
    const [mood, tense, slot = null] = featurePath.split(".")
    const features: Features = { mood, tense, slot }
    const form = getForm(verbEntry, features)
    const accented = typeof form === "string" && accentedCompound(infinitive, featurePath, form)
    if (!accented) continue
    setForm(verbEntry, features, accented.form)
    addRule(ledger, featurePath, RULE.ACCENTED_COMPOUNDS, accented.form)
    if (Object.keys(accented.alternatives).length)
      ruleAlternatives.set(
        featurePath,
        mergeKinds(ruleAlternatives.get(featurePath) ?? {}, accented.alternatives),
      )
    stats.accentAdded++
  }
}

// -------------------------------------------------------------------------
// Steps 6–7: flag what is still questionable, without changing anything.
// -------------------------------------------------------------------------

/** Records the slots no rule filled, so they can be checked by hand. */
const recordUnresolvedForms = (
  conflictForms: UnresolvedForm[],
  rejectedForms: UnresolvedForm[],
  verbEntry: Tree,
  ledger: Map<string, LedgerLeaf>,
  stats: Stats,
) => {
  for (const [features, featurePath, ambiguous] of conflictForms) {
    if (getForm(verbEntry, features) !== undefined) continue
    ledger.set(featurePath, { source: "none", status: "conflict", candidates: ambiguous })
    stats.conflicts++
  }
  for (const [features, featurePath, rejected] of rejectedForms) {
    if (getForm(verbEntry, features) !== undefined) continue
    ledger.set(featurePath, { source: "none", status: "rejected", candidates: rejected })
    stats.emptied++
  }
}

/**
 * The future's stem should be the same across all six persons. Flags the
 * odd one out without changing anything — nothing else has confirmed which
 * form (if either) is actually right.
 */
const recordFutureDisagreements = (
  verbEntry: Tree,
  ledger: Map<string, LedgerLeaf>,
  stats: Stats,
) => {
  const fut = verbEntry[MOOD.indi]?.[TENSE.futu] as Slots | undefined
  if (!fut) return
  for (const { person, expected } of futureDisagreements(fut)) {
    const featurePath = formPath(PATH.indi.futu, person)
    const existing = ledger.get(featurePath)
    if (existing) ledger.set(featurePath, { ...existing, status: "futureStemDisagrees", expected })
    stats.futureFlags++
  }
}

// -------------------------------------------------------------------------
// Step 9: Morph-it's own discarded candidates. (Step 8 is in
// build-lexicon/scripts/build-alternatives.ts.)
// -------------------------------------------------------------------------

/**
 * Records, on every path where the final form differs from what Morph-it
 * gives on its own, Morph-it's own candidates for that slot that are not the
 * final form and not a recorded alternative — its own discarded candidates,
 * including one filed under the wrong slot (`addicevo` under `addire`'s
 * gerund).
 */
const attachRejected = (
  morphItForms: Map<string, string | typeof REJECTED | null>,
  morphItPaths: Record<string, string[]>,
  verbEntry: Tree,
  alternatives: Map<string, AlternativeForms>,
  ledger: Map<string, LedgerLeaf>,
) => {
  for (const [featurePath, morphItValue] of morphItForms) {
    if (morphItValue === null) continue
    const selected = getFormAt(verbEntry, featurePath) ?? null
    const valid = alternatives.get(featurePath) ?? {}
    const rejected = [...new Set(morphItPaths[featurePath] ?? [])].filter(
      (f) => f !== selected && !allForms(valid).includes(f),
    )
    if (!rejected.length) continue
    const existing = ledger.get(featurePath)
    if (existing) ledger.set(featurePath, { ...existing, rejected })
  }
}

// -------------------------------------------------------------------------
// Step 10: the verb-level facts (regular, auxiliary), and storing the result.
// -------------------------------------------------------------------------

/**
 * Every regular form of `infinitive`, keyed the same way as the ledger and
 * lexicons/it-verbs.json paths, or undefined if it is not one of the three regular
 * groups.
 */
const flattenRegular = (
  pattern: ReturnType<typeof regularForms>,
): Record<string, string> | undefined => {
  if (!pattern) return undefined
  const out: Record<string, string> = {}
  for (const [path, value] of Object.entries(pattern)) {
    if (typeof value === "string") out[path] = value
    else for (const [k, v] of Object.entries(value)) out[`${path}.${k}`] = v as string
  }
  return out
}

// -ere verbs have two equally regular past historic endings for S1/S3/P3
// (temei/temé/temerono beside temetti/temette/temettero — see
// WEAK_PAST_ENDING in build-lexicon/scripts/corrections.ts); regularForms only encodes the
// first. A verb using the second is no less regular for it.
const ERE_ETTI_PAST: Record<string, string> = { S1: "etti", S3: "ette", P3: "ettero" }

/**
 * Whether a verb conjugates exactly as its ending's textbook pattern says,
 * for every slot it has a value for: `ARE`/`ERE`/`IRE`, or `ISC` for an -ire
 * verb of the finire type. Undefined — not recorded at all — for anything
 * that departs from its pattern anywhere, however small the departure.
 */
const verbRegularity = (
  infinitive: string,
  verbEntry: Tree,
): "ARE" | "ERE" | "IRE" | "ISC" | undefined => {
  const plainPattern = flattenRegular(regularForms(infinitive))
  if (!plainPattern) return undefined
  const matches = (pattern: Record<string, string>) =>
    Object.entries(pattern).every(
      ([path, expected]) => getFormAt(verbEntry, path) === expected,
    )

  // regularForms' isc flag only changes anything for an -ire verb — for
  // -are/-ere it silently returns the same plain pattern, which would make
  // every regular verb match trivially if this ran unconditionally.
  if (infinitive.endsWith(CONJUGATION.ire)) {
    const iscPattern = flattenRegular(regularForms(infinitive, true))
    if (iscPattern && matches(iscPattern)) return "ISC"
    return matches(plainPattern) ? "IRE" : undefined
  }
  if (matches(plainPattern))
    return infinitive.endsWith(CONJUGATION.are) ? "ARE" : "ERE"
  if (infinitive.endsWith(CONJUGATION.ere)) {
    const stem = infinitive.slice(0, -3)
    const ettiPattern = { ...plainPattern }
    for (const [person, ending] of Object.entries(ERE_ETTI_PAST))
      ettiPattern[formPath(PATH.indi.past, person)] = stem + ending
    if (matches(ettiPattern)) return "ERE"
  }
  return undefined
}

/** The verb's auxiliary (avere/essere), and a second sense's if it is dual. */
const verbAuxiliary = (
  infinitive: string,
): { primary: AuxiliaryEntry; secondary?: AuxiliaryEntry } => {
  const dual = isDualAux(infinitive)
  const listed = dual || auxLists.ESSERE.has(infinitive)
  const primaryValue = getAux(infinitive) === "ESSERE" ? "essere" : "avere"
  const primary: AuxiliaryEntry = {
    value: primaryValue,
    source: listed ? "list" : "default",
  }
  const entry: { primary: AuxiliaryEntry; secondary?: AuxiliaryEntry } = { primary }
  if (dual)
    entry.secondary = {
      value: primaryValue === "essere" ? "avere" : "essere",
      source: "list",
    }
  return entry
}

/** Adds `regular`/`auxiliary` to the verb's ledger entry, and stores it. */
const finalizeLedgerEntry = (
  infinitive: string,
  verbEntry: Tree,
  ledger: Map<string, LedgerLeaf>,
  ledgerOut: VerbLedger,
) => {
  if (!ledger.size) return
  const entry: VerbLedger[string] = {
    ...Object.fromEntries([...ledger].sort(([a], [b]) => a.localeCompare(b))),
    auxiliary: verbAuxiliary(infinitive),
  }
  const regular = verbRegularity(infinitive, verbEntry)
  if (regular) entry.regular = regular
  ledgerOut[infinitive] = entry
}

// -------------------------------------------------------------------------
// The orchestrator.
// -------------------------------------------------------------------------

/**
 * Builds one verb's entry for lexicons/it-verbs.json, and its full ledger entry
 * (every path's value and where it came from, plus what could not be
 * decided) into ledgerOut. See the steps listed at the top of this file.
 */
export const buildVerb = (
  infinitive: string,
  morphItPaths: Record<string, string[]>,
  stats: Stats,
  built: Tree,
  ledgerOut: VerbLedger,
): Tree => {
  const ledger = new Map<string, LedgerLeaf>()
  const verbEntry: Tree = {}
  const ruleAlternatives = new Map<string, AlternativeForms>()
  const derivedPaths: string[] = []

  const featurePaths = applyCorrections(infinitive, morphItPaths, built, stats)
  const absent = absentPaths(infinitive)

  const { conflictForms, rejectedForms, morphItForms } = decideForms(
    infinitive,
    featurePaths,
    morphItPaths,
    absent,
    built,
    verbEntry,
    ledger,
    ruleAlternatives,
    stats,
  )

  fillGerund(infinitive, verbEntry, ledger, derivedPaths, stats)
  fillImperative(infinitive, featurePaths, absent, verbEntry, ledger, derivedPaths, stats)
  accentCompounds(infinitive, featurePaths, verbEntry, ledger, ruleAlternatives, stats)
  recordUnresolvedForms(conflictForms, rejectedForms, verbEntry, ledger, stats)
  recordFutureDisagreements(verbEntry, ledger, stats)

  const formAt: FormAt = (featurePath) => getFormAt(verbEntry, featurePath)
  const alternatives = recordAlternatives(
    infinitive,
    formAt,
    ruleAlternatives,
    ledger,
    stats,
  )
  attachRejected(morphItForms, morphItPaths, verbEntry, alternatives, ledger)

  finalizeLedgerEntry(infinitive, verbEntry, ledger, ledgerOut)
  return verbEntry
}
