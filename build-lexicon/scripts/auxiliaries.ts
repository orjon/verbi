/**
 * data-sources/auxiliaries.json: the verbs that do not simply take avere, read
 * once. One entry per verb, naming the auxiliaries it takes:
 *
 *   {
 *     "andare": { "essere": true },
 *     "cominciare": {
 *       "essere": { "rule": "transitive" },
 *       "avere": { "rule": "transitive" }
 *     },
 *     "decollare": { "avere": true, "essere": { "frequency": "uncommon" } }
 *   }
 *
 *   true         the auxiliary is valid, with nothing more to say.
 *   rule         a rule in explanations.json that says when it applies.
 *   derivedFrom  for the compound rule, the verb whose auxiliary it follows.
 *   when         the meaning or use it goes with.
 *   note         detail the rule or `when` does not give.
 *   frequency    an alternative kind (uncommon, rare...) for an auxiliary that is
 *                valid but used less than the other. Left off means usual.
 *
 * A verb with no entry takes avere. The first auxiliary listed is the one the
 * app uses.
 */
import fs from "node:fs"
import { AUXILIARIES_FILE } from "../constants/paths.ts"
import type { Auxiliaries, AuxiliaryChoices } from "../types/build.ts"

const auxiliaries: Auxiliaries = JSON.parse(fs.readFileSync(AUXILIARIES_FILE, "utf8"))

/** A verb's auxiliaries, or undefined when it takes avere and nothing else. */
export const auxiliariesOf = (verb: string): AuxiliaryChoices | undefined =>
  auxiliaries[verb]
