/**
 * Builds the app's verb data from Morph-it.
 *
 * Four inputs, in this order. Each layer may overrule the one before it:
 *
 *   1. resources/external/morph-it_048.txt  the source, assumed correct
 *   2. scripts/validate.ts                  choose between competing forms
 *   3. resources/overrides.json             our corrections, per form
 *   4. scripts/corrections.ts               class-level rules
 *
 * The per-verb decision itself is scripts/build-verb.ts, which fills both
 * data/verbs.json's tree and resources/verb-ledger.json's record of every
 * decision (see scripts/build-ledger.ts) in the same pass — one source of
 * truth, not two built separately. This file is the orchestration: read the
 * lexicon, build every verb in order, then write both.
 *
 * Writes:
 *
 *   data/verbs.json            the finished data — the small, shippable file
 *   resources/verb-ledger.json every form's value, source, alternatives, and
 *                              what confirms or disagrees with it — see
 *                              scripts/build-ledger.ts
 *
 * Overrides are applied after validation, so validation cannot remove a form
 * the override file specifies.
 *
 * Run with: node scripts/build.ts
 */
import fs from "node:fs"
import { parseLexicon } from "./parse-lexicon.ts"
import { FARE, IGNORED_ENTRIES } from "../constants/verb-groups.ts"
import { buildVerb } from "./build-verb.ts"
import { newStats, printStats } from "./build-stats.ts"
import { writeLedger, type VerbLedger } from "./build-ledger.ts"
import {
  LEDGER_FILE,
  OUT_DIR,
  STATS_FILE,
  VERBS_FILE,
} from "../constants/build.ts"
import type { Tree } from "../types/build.ts"
import { isReflexive } from "../lib/conjugation/aux.ts"
import { sortKeys } from "../utils/index.ts"

/**
 * Builds every verb, filling both the shipped tree and the dev ledger, then
 * writes data/verbs.json and the ledger.
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
  fs.writeFileSync(VERBS_FILE, JSON.stringify(sorted))
  const { wiktionary, stats: ledgerStats } = await writeLedger(ledger, sorted)

  return { stats, wiktionary, ledgerStats }
}

build().then(({ stats, wiktionary, ledgerStats }) => {
  printStats(stats, [
    { label: "verbs.json", path: VERBS_FILE },
    { label: "verb-ledger.json", path: LEDGER_FILE },
    { label: "verb-ledger-stats.json", path: STATS_FILE },
  ])
  console.log("")
  console.log(
    "checked against Wiktionary:",
    wiktionary.compared.toLocaleString(),
    "verbs,",
    wiktionary.notInWiktionary.toLocaleString(),
    "with no table",
  )
  console.log("")
  console.log("ledger totals:", JSON.stringify(ledgerStats, null, 1))
})
