/**
 * data-sources/overrides.json: our corrections to Morph-it, read once. One entry
 * per form path, under its verb:
 *
 *   {
 *     "empire": {
 *       "part.past.S": { "value": "empito", "alternatives": { "common": ["empiuto"] } },
 *       "ind.fut": { "value": null }
 *     }
 *   }
 *
 *   value         the form to use. null says there is no form: at a slot, that
 *                 slot is empty; at a shorter path (a mood such as `impr`, or a
 *                 tense such as `ind.fut`), every slot below it is.
 *   alternatives  valid variants of the form, by kind. They are kept beside the
 *                 form, and may be given without a `value`.
 */
import fs from "node:fs"
import { OVERRIDES_FILE } from "../constants/paths.ts"
import type { OverrideEntry, Overrides, AlternativeForms } from "../types/build.ts"

const overrides: Overrides = JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf8"))

/** A verb's entries, by form path. */
export const overridesOf = (verb: string): Record<string, OverrideEntry> =>
  overrides[verb] ?? {}

/** A verb's alternatives, by form path. */
export const alternativesOf = (verb: string): Record<string, AlternativeForms> =>
  Object.fromEntries(
    Object.entries(overridesOf(verb)).flatMap(([path, entry]) =>
      entry.alternatives ? [[path, entry.alternatives]] : [],
    ),
  )
