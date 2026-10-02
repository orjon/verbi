/**
 * Builds the app's verb data from Morph-it.
 *
 * Four inputs, in this order. Each layer may overrule the one before it:
 *
 *   1. data-sources/external/morph-it_048.txt  the source, assumed correct
 *   2. build-lexicon/scripts/validate.ts                  choose between competing forms
 *   3. data-sources/overrides.json             our corrections, per form
 *   4. build-lexicon/scripts/corrections.ts               class-level rules
 *
 * The per-verb decision itself is build-lexicon/scripts/build-verb.ts, which fills both
 * lexicons/it-verbs.json's tree and lexicons/it-verbs-ledger.json's record of every
 * decision (see build-lexicon/scripts/build-ledger.ts) in the same pass — one source of
 * truth, not two built separately. This file is the orchestration: read the
 * lexicon, build every verb in order, then write both.
 *
 * Writes:
 *
 *   lexicons/it-verbs.json            the finished data — the small, shippable file, with
 *                              each exactly regular verb as a marker
 *   lexicons/it-verbs-ledger.json every form's value, source, alternatives, and
 *                              what confirms or disagrees with it — see
 *                              build-lexicon/scripts/build-ledger.ts
 *
 * Overrides are applied after validation, so validation cannot remove a form
 * the override file specifies.
 *
 * Run with: pnpm build:lexicon (it is not run by `pnpm dev`)
 */
import fs from "node:fs"
import { basename } from "node:path"
import { parseLexicon } from "./parse-lexicon.ts"
import { FARE } from "../constants/compounds.ts"
import { IGNORED_ENTRIES } from "../constants/defective-verbs.ts"
import { buildVerb } from "./build-verb.ts"
import { newStats, printStats } from "./build-stats.ts"
import { writeLedger, type VerbLedger } from "./build-ledger.ts"
import { readDefinitions, writeDefinitions } from "./build-definitions.ts"
import { compactLexicon, countMarkers, verifyCompact, writeCompact } from "./compact.ts"
import {
  DEFINITIONS_FILE,
  LEDGER_FILE,
  OUT_DIR,
  STATS_FILE,
  VERBS_FILE,
} from "../constants/paths.ts"
import type { Tree } from "../types/build.ts"
// TEMPORARY: reaches into the app code, for the reflexive check only (notes/to-do.md).
import { isReflexive } from "../../conjugation/reflexive.ts"
import { sortKeys } from "../utils/index.ts"

/**
 * Builds every verb, filling both the shipped tree and the dev ledger, then
 * writes lexicons/it-verbs.json and the ledger.
 */
const build = async () => {
  const { verbForms } = parseLexicon()
  const verbs: Tree = {}
  const ledger: VerbLedger = {}
  const stats = newStats()

  // fare is built first: the rule for its compounds reads fare's finished forms.
  const order = Object.keys(verbForms).sort((a, b) =>
    a === FARE ? -1 : b === FARE ? 1 : 0,
  )
  for (const infinitive of order) {
    const featurePaths = verbForms[infinitive]

    // Erroneous entries are dropped before we even look at them
    if (IGNORED_ENTRIES.has(infinitive)) {
      stats.dropped++
      continue
    }

    // reflexive verbs are dropped.TODO: Add reflexive verbs
    if (isReflexive(infinitive)) {
      stats.reflexive++
      continue
    }

    verbs[infinitive] = buildVerb(
      infinitive,
      featurePaths,
      stats,
      verbs,
      ledger,
    )
    stats.verbs++
  }

  // Written alphabetically by infinitive, whatever order they were built in.
  const sorted = sortKeys(verbs)
  fs.mkdirSync(OUT_DIR, { recursive: true })
  // The shipped file: exactly regular verbs as markers, checked against the full
  // lexicon held here, which is not written out.
  const compact = compactLexicon(sorted)
  verifyCompact(sorted, compact)
  writeCompact(compact)
  const { wiktionary } = await writeLedger(ledger, sorted)

  const definitions = await readDefinitions(new Set(Object.keys(sorted)))
  writeDefinitions(definitions)

  return {
    stats,
    wiktionary,
    definitions: Object.keys(definitions).length,
    markers: countMarkers(compact),
    verbs: Object.keys(sorted).length,
  }
}

build().then(({ stats, wiktionary, definitions, markers, verbs }) => {
  printStats(stats, [
    { label: basename(VERBS_FILE), path: VERBS_FILE },
    { label: basename(DEFINITIONS_FILE), path: DEFINITIONS_FILE },
    { label: basename(LEDGER_FILE), path: LEDGER_FILE },
    { label: basename(STATS_FILE), path: STATS_FILE },
  ])
  console.log("")
  console.log(
    "checked against Wiktionary:",
    wiktionary.compared.toLocaleString(),
    "verbs,",
    wiktionary.notInWiktionary.toLocaleString(),
    "with no table",
  )
  console.log("regular as markers   :", markers.toLocaleString(), "of", verbs.toLocaleString(), "verbs")
  console.log("definitions for      :", definitions.toLocaleString(), "verbs")
  console.log("ledger totals in    :", STATS_FILE)
})
