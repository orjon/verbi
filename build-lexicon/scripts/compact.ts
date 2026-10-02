/**
 * Builds lexicons/it-verbs.json, the lexicon the app ships: a verb that
 * conjugates exactly as its regular pattern says is written as a marker
 * ("parlare": "are"), and the app fills its forms in when it is looked up. Every
 * other verb is written in full. See conjugation/compact.ts for the format.
 *
 * A verb is only made a marker if filling the marker back in gives exactly the
 * verb it started as, every slot and no more, so a marker always means the
 * complete regular conjugation. A verb with a missing form, a third-person-only
 * verb or any form off its pattern stays in full. The patterns are tried in turn
 * (are, then are-i; ere-ei, then ere-etti; ire, then ire-isc) and the first that
 * fits is named.
 */
import fs from "node:fs"
import { isDeepStrictEqual } from "node:util"
import { VERBS_FILE } from "../constants/paths.ts"
import {
  expandVerb,
  isMarker,
  regularVerb,
  typesFor,
  type CompactLexicon,
  type CompactVerb,
} from "../../conjugation/compact.ts"
import type { Tree } from "../types/build.ts"

/** One verb in compact form: a marker if it is exactly regular, else as it is. */
export const compactVerb = (infinitive: string, full: Tree): CompactVerb => {
  // The auxiliaries are data about the verb, not forms: they ride beside the marker.
  const { aux, ...forms } = full
  for (const type of typesFor(infinitive)) {
    const regular = regularVerb(infinitive, type)
    if (regular && isDeepStrictEqual(regular, forms))
      return aux ? { regular: type, aux } : type
  }
  return full
}

/** The compact lexicon, from the full one. */
export const compactLexicon = (full: Tree): CompactLexicon =>
  Object.fromEntries(
    Object.entries(full).map(([infinitive, tree]) => [infinitive, compactVerb(infinitive, tree)]),
  )

/** Throws unless every verb fills back in to exactly what it started as. */
export const verifyCompact = (full: Tree, compact: CompactLexicon) => {
  for (const [infinitive, tree] of Object.entries(full)) {
    if (!isDeepStrictEqual(expandVerb(infinitive, compact[infinitive]), tree))
      throw new Error(`${infinitive} does not fill back in to what it started as`)
  }
  const extra = Object.keys(compact).filter((infinitive) => !(infinitive in full))
  if (extra.length) throw new Error(`in the compact lexicon only: ${extra.join(", ")}`)
}

/** How many verbs are markers. */
export const countMarkers = (compact: CompactLexicon): number =>
  Object.values(compact).filter(isMarker).length

/** Writes lexicons/it-verbs.json, one verb to a line, alphabetical. */
export const writeCompact = (compact: CompactLexicon) => {
  const rows = Object.keys(compact)
    .sort()
    .map((infinitive) => `  ${JSON.stringify(infinitive)}: ${JSON.stringify(compact[infinitive])}`)
  fs.writeFileSync(VERBS_FILE, `{\n${rows.join(",\n")}\n}\n`)
}
