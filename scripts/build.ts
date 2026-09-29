/**
 * Builds the app's verb data from Morph-it.
 *
 * Four inputs, in this order. Each layer may overrule the one before it:
 *
 *   1. resources/morph-it_048.txt   the source, assumed correct
 *   2. scripts/validate.ts          choose between competing forms
 *   3. resources/overrides.json     our corrections, per form
 *   4. scripts/corrections.ts       class-level rules
 *
 * Writes:
 *
 *   data/verbs.json         the finished data
 *   data/unresolved.json    what it could not decide, for to-verify.md
 *   data/adjusted.json      every path changed or decided, with the form chosen
 *   data/alternatives.json  valid variants, copied from resources/alternatives.json
 *
 * Overrides are applied after validation, so validation cannot remove a form
 * the override file specifies.
 *
 * Run with: node scripts/build.ts
 */
import fs from "node:fs"
import path from "node:path"
import { type Features, parseLexicon } from "./parse-lexicon.ts"
import { choose, plausible } from "./validate.ts"
import { withAcutePast } from "./accents.ts"
import {
  absentSlots,
  IGNORED_ENTRIES,
  resolveDiphthong,
  resolveFareCompound,
  type Resolution,
  withFutureS1,
} from "./corrections.ts"
import { gerundFromImperfect, imperativeFromPresent } from "./derive.ts"
import {
  ENDING,
  formPath,
  IMPERATIVE_PERSONS,
  MOOD,
  PATH,
  PERSON,
  PERSONS,
  TENSE,
} from "./vocabulary.ts"

const OUT_DIR = "data"
const OVERRIDES = "resources/overrides.json"

type Slots = Record<string, string>
type Tree = Record<string, any>

// One entry in data/adjusted.json:
//   selected      the form the build shows, or null when it was decided that
//                 there is no form here. Always present.
//   rejected      forms Morph-it gives there that were judged mistakes
//   alternatives  valid variants that were not chosen, from ALTERNATIVES
// rejected and alternatives are left out when they would be empty.
type Adjustment = {
  selected: string | null
  rejected?: string[]
  alternatives?: string[]
}
type Adjusted = Record<string, Record<string, Adjustment>>

// Our corrections for Morph-it's incorrect or missing data, keyed by verb.
const verbFormOverrides: Tree = JSON.parse(fs.readFileSync(OVERRIDES, "utf8"))

// Valid variants of a form that were not chosen — older or modern spellings,
// or other accepted forms. Same shape as the overrides file, with a list of
// forms at each slot.
const ALTERNATIVES = "resources/alternatives.json"
const verbFormAlternatives: Tree = JSON.parse(
  fs.readFileSync(ALTERNATIVES, "utf8"),
)

/**
 * Lists the paths and forms in the alternatives file for a verb.
 *
 * Returns, for possedere: [["part.pres.S", ["possedente"]], ...]
 */
const alternativePaths = (verb: string): [string, string[]][] => {
  const paths: [string, string[]][] = []
  const walk = (node: unknown, prefix: string) => {
    if (Array.isArray(node)) paths.push([prefix, node])
    else if (node && typeof node === "object")
      for (const [k, v] of Object.entries(node as Tree))
        walk(v, prefix ? `${prefix}.${k}` : k)
  }
  walk(verbFormAlternatives[verb], "")
  return paths
}

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
  const overrides = verbFormOverrides[verb]
  if (!overrides) return undefined

  if (overrides[mood] === null) return null // the whole mood does not exist
  const moodOverrides = overrides[mood]
  if (moodOverrides === undefined) return undefined

  if (moodOverrides[tense] === null) return null // the whole tense does not exist
  const tenseOverrides = moodOverrides[tense]
  if (tenseOverrides === undefined) return undefined

  // a tense with no slots, such as `inf.pres`, holds the form directly
  if (typeof tenseOverrides === "string")
    return slot ? undefined : tenseOverrides
  return slot && slot in tenseOverrides ? tenseOverrides[slot] : undefined
}

/**
 * Lists every path the overrides file sets for a verb, at the level it is set:
 * a whole mood (`impr`), a whole tense (`part.pres`) or a single slot
 * (`ind.pres.S3`). Covers forms and nulls.
 *
 * Returns, for calere: ["inf.pres", "ger.pres", "ind.pres.S1", ..., "cond", ...]
 */
const overridePaths = (verb: string): string[] => {
  const paths: string[] = []
  const walk = (node: unknown, prefix: string) => {
    if (node === null || typeof node === "string") paths.push(prefix)
    else
      for (const [k, v] of Object.entries(node as Tree))
        walk(v, prefix ? `${prefix}.${k}` : k)
  }
  const overrides = verbFormOverrides[verb]
  if (overrides) walk(overrides, "")
  return paths
}

/**
 * Reports where the six persons of a future disagree about their stem.
 *
 * The future uses one stem for all six persons. Morph-it's one error there is
 * corrected before choosing, by withFutureS1 in scripts/corrections.ts, so this
 * should find nothing. It is kept as a check: it reports, and changes nothing.
 * See *Future io form* under Resolved in resources/to-verify.md.
 */
const futureDisagreements = (verb: string, slots: Slots): string[] => {
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

  const odd: string[] = []
  for (const [i, person] of PERSONS.entries()) {
    const form = slots[person]
    const expected = stem + ENDING.futu[i]
    if (form && form !== expected) {
      odd.push(`${person}: ${form} (others imply ${expected})`)
    }
  }
  return odd
}

const isReflexive = (verb: string): boolean => verb.endsWith("si")

const newStats = () => ({
  verbs: 0,
  forms: 0,
  reflexive: 0,
  dropped: 0,
  fromMorphIt: 0,
  fromOverride: 0,
  fromDerivation: 0,
  accentCorrected: 0,
  futureCorrected: 0,
  fromConflictRule: 0,
  removedByOverride: 0,
  removedByCorrection: 0,
  conflicts: 0,
  emptied: 0,
  futureFlags: 0,
  adjustedVerbs: 0,
  adjustedSlots: 0,
})
type Stats = ReturnType<typeof newStats>

/**
 * Stores a form in a verb's entry, as mood → tense → slot.
 * A tense with no slots, such as `inf.pres`, holds the form directly.
 *
 * verbEntry after setForm(verbEntry, { mood: "ind", tense: "pres", slot: "S1" }, "parlo")
 * and setForm(verbEntry, { mood: "inf", tense: "pres", slot: null }, "parlare"):
 *
 *   { ind: { pres: { S1: "parlo" } }, inf: { pres: "parlare" } }
 */
const setForm = (
  verbEntry: Tree,
  { mood, tense, slot }: Features,
  value: string,
) => {
  const verbMood = (verbEntry[mood] ??= {})
  if (slot) ((verbMood[tense] ??= {}) as Slots)[slot] = value
  else verbMood[tense] = value
}

/** Reads a form from a verb's entry, or undefined when the slot is empty. */
const getForm = (
  verbEntry: Tree,
  { mood, tense, slot }: Features,
): string | undefined => {
  const byTense = verbEntry[mood]?.[tense]
  return slot ? byTense?.[slot] : byTense
}

// Marks a slot where Morph-it gives forms but validate.ts rejects them all. It
// never equals a final form, so such a slot always counts as adjusted.
const REJECTED = Symbol("rejected")

const GERUND_SLOT: Features = { mood: MOOD.geru, tense: TENSE.pres, slot: null }
const IMPERFECT_S1: Features = {
  mood: MOOD.indi,
  tense: TENSE.impf,
  slot: PERSON.s1,
}

/**
 * Lists the slots to fill for one verb: every slot Morph-it has a form for,
 * plus every slot the overrides file gives a form for.
 *
 * Returns, for parlare:
 *
 *   Set { "impr.pres.S2", "ind.pres.S3", "ind.past.S1", ..., "inf.pres" }
 */
const slotPaths = (
  infinitive: string,
  featurePaths: Record<string, string[]>,
): Set<string> => {
  const paths = new Set(Object.keys(featurePaths))
  // paths: Set<string> = Set { "impr.pres.S2", "ind.pres.S3", ... }

  for (const [mood, tenses] of Object.entries(
    verbFormOverrides[infinitive] ?? {},
  )) {
    if (tenses === null || typeof tenses !== "object") continue
    for (const [tense, forms] of Object.entries(tenses as Tree)) {
      if (forms === null) continue
      if (typeof forms === "string") paths.add(`${mood}.${tense}`)
      else
        for (const slot of Object.keys(forms))
          paths.add(`${mood}.${tense}.${slot}`)
    }
  }
  return paths
}

type Decision =
  | { source: "rule" } // a class-level rule says this tense does not exist
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
const decideSlot = (
  infinitive: string,
  featurePath: string,
  features: Features,
  forms: string[] | undefined,
  absent: Set<string>,
  resolve: (candidates: string[]) => Resolution | null,
): Decision => {
  if (absent.has(`${features.mood}.${features.tense}`))
    return { source: "rule" }

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
 * Builds one verb's entry. Counts each decision in stats and records what
 * could not be decided in unresolved.
 *
 * Returns, for calere:
 *
 *   {
 *     inf:  { pres: "calere" },
 *     ger:  { pres: "calendo" },
 *     ind:  { pres: { S3: "cale" }, impf: { S3: "caleva" }, past: { S3: "calse" } },
 *     sub:  { pres: { S3: "calga" }, impf: { S3: "calesse" } },
 *     part: { past: { S: "caluto" } },
 *   }
 *
 * and adds to unresolved, for example:
 *
 *   conflicting:     { accrescere: { "ind.past.S1": ["accrebbi", "accrescei"] } }
 *   emptied:         { sedere: { "part.pres.S": ["sedevo", "siedevo"] } }
 *   futureDisagrees: { accendere: ["S1: accenderà (others imply accenderò)"] }
 *
 * and adds to adjusted the paths that differ from Morph-it, for example:
 *
 *   { sedere: { "ger.pres": { selected: "sedendo", rejected: ["sedevo", "siedevo"] }, ... } }
 */
const buildVerb = (
  infinitive: string,
  morphItPaths: Record<string, string[]>,
  stats: Stats,
  unresolved: Tree,
  adjusted: Adjusted,
  built: Tree,
  generatedAlternatives: Tree,
): Tree => {
  // Morph-it's forms with its spelling errors corrected: the accent on the past
  // historic (scripts/accents.ts) and the future io form (scripts/corrections.ts).
  // The build chooses from these; morphItPaths keeps the originals, to compare
  // against.
  const accented = withAcutePast(morphItPaths)
  if (accented !== morphItPaths) stats.accentCorrected++
  const featurePaths = withFutureS1(accented)
  if (featurePaths !== accented) stats.futureCorrected++
  const absent = new Set(absentSlots(infinitive))
  const verbEntry: Tree = {}
  // Valid alternatives produced by the conflict rules, by path.
  const ruleAlternatives = new Map<string, string[]>()
  // fare's finished forms and alternatives, for the rule on its compounds.
  const fareAlternatives = new Map(alternativePaths("fare"))
  // Slots left empty by the loop, with Morph-it's forms. They are recorded in
  // unresolved only after the rules below have run, since a rule may fill them.
  const conflictSlots: [Features, string, string[]][] = [] // several forms, none chosen
  const rejectedSlots: [Features, string, string[]][] = [] // every form rejected
  // What Morph-it gives for each slot on its own, before overrides and rules:
  // its single form after validate.ts, REJECTED when it gives only forms that
  // validate.ts rejects, or null when it gives none.
  const morphItForms = new Map<string, string | typeof REJECTED | null>()
  // Slots filled by a rule in scripts/derive.ts.
  const derivedPaths: string[] = []
  // Slots where validate.ts rejected a form that is not a clipped variant of
  // a kept one — a form Morph-it filed under the wrong slot, such as `addicevo`
  // under the gerund of `addire`.
  const misfiledSlots: string[] = []

  for (const featurePath of slotPaths(infinitive, featurePaths)) {
    const [mood, tense, slot = null] = featurePath.split(".")
    const features: Features = { mood, tense, slot }
    const forms = featurePaths[featurePath]
    // What Morph-it itself gives, before the accent is corrected.
    const original = morphItPaths[featurePath]
    const morphIt = original?.length
      ? choose(featurePath, original, infinitive)
      : null
    if (original?.length) {
      const valid = original.filter((f) =>
        plausible(featurePath, f, infinitive),
      )
      const misfiled = original.some(
        (f) => !valid.includes(f) && !valid.some((v) => v.startsWith(f)),
      )
      if (misfiled) misfiledSlots.push(featurePath)
    }
    morphItForms.set(
      featurePath,
      morphIt?.rejected ? REJECTED : (morphIt?.form ?? null),
    )
    const decision = decideSlot(
      infinitive,
      featurePath,
      features,
      forms,
      absent,
      (candidates) =>
        resolveFareCompound(
          infinitive,
          featurePath,
          candidates,
          forms ?? [],
          getForm(built.fare ?? {}, features),
          fareAlternatives.get(featurePath) ?? [],
        ) ?? resolveDiphthong(infinitive, featurePath, candidates),
    )

    switch (decision.source) {
      case "rule":
        stats.removedByCorrection++
        break
      case "override":
        if (decision.form === null) stats.removedByOverride++
        else {
          setForm(verbEntry, features, decision.form)
          stats.fromOverride++
          stats.forms++
        }
        break
      case "morph-it":
        setForm(verbEntry, features, decision.form)
        stats.fromMorphIt++
        stats.forms++
        break
      case "resolved":
        setForm(verbEntry, features, decision.form)
        if (decision.alternatives.length)
          ruleAlternatives.set(featurePath, decision.alternatives)
        stats.fromConflictRule++
        stats.forms++
        break
      case "conflict":
        conflictSlots.push([features, featurePath, decision.ambiguous])
        break
      case "rejected":
        rejectedSlots.push([features, featurePath, decision.rejected])
        break
    }
  }

  // Fill an empty gerund from the finished imperfect. It runs after the loop so
  // an override on the imperfect is already applied. An override of null on
  // the gerund means no gerund, so the rule is skipped.
  if (
    getForm(verbEntry, GERUND_SLOT) === undefined &&
    getOverride(infinitive, GERUND_SLOT) === undefined
  ) {
    const imperfect = getForm(verbEntry, IMPERFECT_S1)
    const gerund = imperfect && gerundFromImperfect(imperfect)
    if (gerund) {
      setForm(verbEntry, GERUND_SLOT, gerund)
      derivedPaths.push(PATH.geru)
      stats.fromDerivation++
      stats.forms++
    }
  }

  // Fill an empty imperative slot from the finished present tense. Only where
  // Morph-it has nothing for the slot: a conflict or a rejected form is left
  // for review. An override or class rule on the slot means it is skipped.
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
    if (form) {
      setForm(verbEntry, features, form)
      derivedPaths.push(featurePath)
      stats.fromDerivation++
      stats.forms++
    }
  }

  // Record the slots no rule has filled, so they can be checked by hand.
  for (const [features, featurePath, ambiguous] of conflictSlots) {
    if (getForm(verbEntry, features) !== undefined) continue
    ;((unresolved.conflicting[infinitive] ??= {}) as Tree)[featurePath] =
      ambiguous
    stats.conflicts++
  }
  for (const [features, featurePath, rejected] of rejectedSlots) {
    if (getForm(verbEntry, features) !== undefined) continue
    ;((unresolved.emptied[infinitive] ??= {}) as Tree)[featurePath] = rejected
    stats.emptied++
  }

  // report-only: the future's stem should be the same across all six persons
  const fut = verbEntry[MOOD.indi]?.[TENSE.futu] as Slots | undefined
  if (fut) {
    const odd = futureDisagreements(infinitive, fut)
    if (odd.length) {
      unresolved.futureDisagrees[infinitive] = odd
      stats.futureFlags += odd.length
    }
  }

  // Record every path where we changed or checked Morph-it's data:
  //   - every path an override or a class rule sets, even when the result
  //     matches Morph-it
  //   - every slot where validate.ts rejected a misfiled form
  //   - every slot a rule in derive.ts filled
  //   - every slot whose final form differs from what Morph-it gives on its own
  const changed = new Set<string>([
    ...overridePaths(infinitive),
    ...absent,
    ...misfiledSlots,
    ...derivedPaths,
  ])
  const paths = new Set(morphItForms.keys())
  for (const featurePath of paths) {
    const [mood, tense, slot = null] = featurePath.split(".")
    const final = getForm(verbEntry, { mood, tense, slot }) ?? null
    if (final !== (morphItForms.get(featurePath) ?? null))
      changed.add(featurePath)
  }
  // A path with a valid alternative is listed too: from the alternatives file,
  // or from a conflict rule. The rules' alternatives are also collected for
  // data/alternatives.json.
  const alternatives = new Map(alternativePaths(infinitive))
  for (const [featurePath, forms] of ruleAlternatives) {
    alternatives.set(featurePath, [
      ...new Set([...(alternatives.get(featurePath) ?? []), ...forms]),
    ])
    const [mood, tense, slot] = featurePath.split(".")
    const byTense = (((generatedAlternatives[infinitive] ??= {})[mood] ??=
      {}) as Tree)
    if (slot) (byTense[tense] ??= {})[slot] = forms
    else byTense[tense] = forms
  }
  for (const featurePath of alternatives.keys()) changed.add(featurePath)

  if (changed.size) {
    const entries: Record<string, Adjustment> = {}
    for (const featurePath of [...changed].sort()) {
      const [mood, tense, slot = null] = featurePath.split(".")
      // A path above slot level, such as `part.pres` or `impr`, is only listed
      // when a null was set on it, so its selected is null.
      const form = getForm(verbEntry, { mood, tense, slot })
      const selected = typeof form === "string" ? form : null
      const valid = (alternatives.get(featurePath) ?? []).filter(
        (f) => f !== selected,
      )
      // Morph-it's other forms at this path, less those recorded as valid.
      const rejected = [...new Set(morphItPaths[featurePath] ?? [])].filter(
        (f) => f !== selected && !valid.includes(f),
      )
      const entry: Adjustment = { selected }
      if (rejected.length) entry.rejected = rejected
      if (valid.length) entry.alternatives = valid
      entries[featurePath] = entry
    }
    adjusted[infinitive] = entries
    stats.adjustedVerbs++
    stats.adjustedSlots += changed.size
  }

  return verbEntry
}

/**
 * Merges two alternatives trees of the same shape as resources/alternatives.json,
 * joining the lists where both give forms for the same path.
 */
const mergeAlternatives = (a: Tree, b: Tree): Tree => {
  const out: Tree = structuredClone(a)
  const merge = (into: Tree, from: Tree) => {
    for (const [k, v] of Object.entries(from)) {
      if (Array.isArray(v)) into[k] = [...new Set([...(into[k] ?? []), ...v])]
      else merge((into[k] ??= {}), v)
    }
  }
  merge(out, b)
  return Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]))
}

/**
 * Writes the four output files:
 *
 *   data/verbs.json         { "abbacchiare": { "ind": { "pres": { "S2": "abbacchi", ... } } }, ... }
 *   data/unresolved.json    { "conflicting": { ... }, "emptied": { ... }, "futureDisagrees": { ... } }
 *   data/adjusted.json      { "sedere": { "ger.pres": { "selected": "sedendo", "rejected": ["sedevo", "siedevo"] }, ... }, ... }
 *   data/alternatives.json  { "cuocere": { "ger": { "pres": ["cocendo"] } }, ... }
 *
 * The alternatives file is resources/alternatives.json merged with the valid
 * alternatives the conflict rules produce, so the app reads everything it needs
 * from data/.
 */
const writeOutput = (
  verbs: Tree,
  unresolved: Tree,
  adjusted: Adjusted,
  alternatives: Tree,
) => {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, "verbs.json"), JSON.stringify(verbs))
  fs.writeFileSync(
    path.join(OUT_DIR, "unresolved.json"),
    JSON.stringify(unresolved, null, 1),
  )
  fs.writeFileSync(
    path.join(OUT_DIR, "adjusted.json"),
    JSON.stringify(adjusted, null, 1),
  )
  fs.writeFileSync(
    path.join(OUT_DIR, "alternatives.json"),
    JSON.stringify(alternatives, null, 1),
  )
}

/**
 * Prints the counts, for example:
 *
 *   verbs written         : 6,076
 *     forms               : 332,732
 *       from Morph-it     : 332,563
 *       from an override  : 169
 *   ...
 *   verbs.json            : 7.14 MB
 */
const printStats = (s: Stats) => {
  console.log("verbs written         :", s.verbs.toLocaleString())
  console.log("  forms               :", s.forms.toLocaleString())
  console.log("    from Morph-it     :", s.fromMorphIt.toLocaleString())
  console.log("    from an override  :", s.fromOverride.toLocaleString())
  console.log("    from a derivation :", s.fromDerivation.toLocaleString())
  console.log("  accent corrected in :", s.accentCorrected.toLocaleString(), "verbs")
  console.log("  future io corrected:", s.futureCorrected.toLocaleString(), "verbs")
  console.log("    from a conflict rule:", s.fromConflictRule.toLocaleString())
  console.log("  removed by override :", s.removedByOverride.toLocaleString())
  console.log("  removed by rule     :", s.removedByCorrection.toLocaleString())
  console.log("skipped reflexive     :", s.reflexive.toLocaleString())
  console.log("skipped non-verbs     :", s.dropped.toLocaleString())
  console.log("")
  console.log("unresolved:")
  console.log(
    "  Morph-it gives two forms, nothing chooses :",
    s.conflicts.toLocaleString(),
  )
  console.log(
    "  every form rejected, slot left empty      :",
    s.emptied.toLocaleString(),
  )
  console.log(
    "  future disagrees with its own stem        :",
    s.futureFlags.toLocaleString(),
    "(reported only)",
  )
  console.log("")
  console.log(
    "adjusted from Morph-it:",
    s.adjustedSlots.toLocaleString(),
    "paths in",
    s.adjustedVerbs.toLocaleString(),
    "verbs",
  )
  for (const f of [
    "verbs.json",
    "unresolved.json",
    "adjusted.json",
    "alternatives.json",
  ]) {
    console.log(
      `${f.padEnd(22)}: ${(fs.statSync(path.join(OUT_DIR, f)).size / 1e6).toFixed(2)} MB`,
    )
  }
}

const build = () => {
  const { verbForms } = parseLexicon()
  const verbs: Tree = {}
  const unresolved: Tree = { conflicting: {}, emptied: {}, futureDisagrees: {} }
  const adjusted: Adjusted = {}
  const generatedAlternatives: Tree = {}
  const stats = newStats()

  // fare is built first: the rule for its compounds reads fare's finished forms.
  const order = Object.keys(verbForms).sort((a, b) =>
    a === "fare" ? -1 : b === "fare" ? 1 : 0,
  )
  for (const infinitive of order) {
    const featurePaths = verbForms[infinitive]
    // Erroneous entries are dropped before we even look at them
    if (IGNORED_ENTRIES.has(infinitive)) {
      stats.dropped++
      continue
    }

    // reflexive verbs are dropped
    // TODO: Add reflexive verbs
    if (isReflexive(infinitive)) {
      stats.reflexive++
      continue
    }

    verbs[infinitive] = buildVerb(
      infinitive,
      featurePaths,
      stats,
      unresolved,
      adjusted,
      verbs,
      generatedAlternatives,
    )
    stats.verbs++
  }

  // Written in Morph-it's order, whatever order the verbs were built in.
  const inOrder = <T>(byVerb: Record<string, T>) =>
    Object.fromEntries(
      Object.keys(verbForms)
        .filter((v) => v in byVerb)
        .map((v) => [v, byVerb[v]]),
    )
  const alternatives = mergeAlternatives(verbFormAlternatives, generatedAlternatives)
  writeOutput(inOrder(verbs), unresolved, inOrder(adjusted), alternatives)
  return stats
}

printStats(build())
