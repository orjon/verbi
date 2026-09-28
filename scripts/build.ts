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
 *   data/temp-verbs.json        the finished data
 *   data/temp-unresolved.json   what it could not decide, for to-verify.md
 *
 * Overrides are applied after validation, so validation cannot remove a form
 * the override file specifies.
 *
 * Run with: node scripts/build.ts
 */
import fs from "node:fs"
import path from "node:path"
import { type Features, parseLexicon } from "./parse-lexicon.ts"
import { choose } from "./validate.ts"
import { absentSlots, IGNORED_ENTRIES } from "./corrections.ts"
import { gerundFromImperfect } from "./derive.ts"
import { FUTURE_ENDINGS, PERSON_SLOTS } from "./slots.ts"

const OUT_DIR = "data"
const OVERRIDES = "resources/overrides.json"

type Slots = Record<string, string>
type Tree = Record<string, any>

// Our corrections for Morph-it's incorrect or missing data, keyed by verb.
const verbFormOverrides: Tree = JSON.parse(fs.readFileSync(OVERRIDES, "utf8"))

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
 * Reports where the six persons of a future disagree about their stem.
 *
 * The rule that the endings are invariant is not yet confirmed — see item 3a of
 * resources/to-verify.md — so this only reports. Nothing is changed on it.
 */
const futureDisagreements = (verb: string, slots: Slots): string[] => {
  const stems: string[] = []
  for (const s of PERSON_SLOTS) {
    const form = slots[s]
    if (form?.endsWith(FUTURE_ENDINGS[s]))
      stems.push(form.slice(0, -FUTURE_ENDINGS[s].length))
  }
  if (stems.length < 2) return []

  const counts = new Map<string, number>()
  for (const s of stems) counts.set(s, (counts.get(s) ?? 0) + 1)
  const [stem] = [...counts].sort((a, b) => b[1] - a[1])[0]

  const odd: string[] = []
  for (const s of PERSON_SLOTS) {
    const form = slots[s]
    if (form && form !== stem + FUTURE_ENDINGS[s]) {
      odd.push(`${s}: ${form} (others imply ${stem + FUTURE_ENDINGS[s]})`)
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
  removedByOverride: 0,
  removedByCorrection: 0,
  conflicts: 0,
  emptied: 0,
  futureFlags: 0,
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

const GERUND_SLOT: Features = { mood: "ger", tense: "pres", slot: null }
const IMPERFECT_S1: Features = { mood: "ind", tense: "impf", slot: "S1" }

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
  | { source: "rejected"; rejected: string[] } // every form Morph-it gives fails validate.ts
  | { source: "none" } // Morph-it has nothing for this slot

/**
 * Decides the form for one slot. Checks these in order and stops at the first
 * that answers:
 *
 *   - class-level rules in corrections.ts
 *   - the overrides file
 *   - Morph-it's forms, chosen between by validate.ts
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
): Decision => {
  if (absent.has(`${features.mood}.${features.tense}`))
    return { source: "rule" }

  const override = getOverride(infinitive, features)
  if (override !== undefined) return { source: "override", form: override }

  if (!forms?.length) return { source: "none" }
  const { form, ambiguous, rejected } = choose(featurePath, forms, infinitive)
  if (form) return { source: "morph-it", form }
  if (ambiguous.length) return { source: "conflict", ambiguous }
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
 */
const buildVerb = (
  infinitive: string,
  featurePaths: Record<string, string[]>,
  stats: Stats,
  unresolved: Tree,
): Tree => {
  const absent = new Set(absentSlots(infinitive))
  const verbEntry: Tree = {}
  // Slots left empty by the loop, with Morph-it's forms. They are recorded in
  // unresolved only after the rules below have run, since a rule may fill them.
  const conflictSlots: [Features, string, string[]][] = [] // several forms, none chosen
  const rejectedSlots: [Features, string, string[]][] = [] // every form rejected

  for (const featurePath of slotPaths(infinitive, featurePaths)) {
    const [mood, tense, slot = null] = featurePath.split(".")
    const features: Features = { mood, tense, slot }
    const forms = featurePaths[featurePath]
    const decision = decideSlot(
      infinitive,
      featurePath,
      features,
      forms,
      absent,
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
  const fut = verbEntry.ind?.fut as Slots | undefined
  if (fut) {
    const odd = futureDisagreements(infinitive, fut)
    if (odd.length) {
      unresolved.futureDisagrees[infinitive] = odd
      stats.futureFlags += odd.length
    }
  }

  return verbEntry
}

/**
 * Writes the two output files:
 *
 *   data/temp-verbs.json       { "abbacchiare": { "ind": { "pres": { "S2": "abbacchi", ... } } }, ... }
 *   data/temp-unresolved.json  { "conflicting": { ... }, "emptied": { ... }, "futureDisagrees": { ... } }
 */
const writeOutput = (verbs: Tree, unresolved: Tree) => {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, "temp-verbs.json"), JSON.stringify(verbs))
  fs.writeFileSync(
    path.join(OUT_DIR, "temp-unresolved.json"),
    JSON.stringify(unresolved, null, 1),
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
 *   temp-verbs.json       : 7.14 MB
 */
const printStats = (s: Stats) => {
  console.log("verbs written         :", s.verbs.toLocaleString())
  console.log("  forms               :", s.forms.toLocaleString())
  console.log("    from Morph-it     :", s.fromMorphIt.toLocaleString())
  console.log("    from an override  :", s.fromOverride.toLocaleString())
  console.log("    from a derivation :", s.fromDerivation.toLocaleString())
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
  for (const f of ["temp-verbs.json", "temp-unresolved.json"]) {
    console.log(
      `${f.padEnd(22)}: ${(fs.statSync(path.join(OUT_DIR, f)).size / 1e6).toFixed(2)} MB`,
    )
  }
}

const build = () => {
  const { verbForms } = parseLexicon()
  const verbs: Tree = {}
  const unresolved: Tree = { conflicting: {}, emptied: {}, futureDisagrees: {} }
  const stats = newStats()

  for (const [infinitive, featurePaths] of Object.entries(verbForms)) {
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

    verbs[infinitive] = buildVerb(infinitive, featurePaths, stats, unresolved)
    stats.verbs++
  }

  writeOutput(verbs, unresolved)
  return stats
}

printStats(build())
