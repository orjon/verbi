import type { AlternativeKind } from "../types/build.ts"

/**
 * The kinds of valid alternative to a standard form. `common` and
 * `clipped_common` are equal to the standard and shown beside it; the others are
 * a secondary tier.
 *
 *   common          an equal modern variant: fai beside fa'
 *   colloquial      everyday speech, avoided in writing: disfo
 *   formal          careful or official writing, closer to the Latin root
 *   literary        found mainly in literature: seggo, crescei
 *   uncommon        correct but seldom used: coceva, possedente
 *   regional        used in one area or dialect, not standard elsewhere
 *   dated           sounds old-fashioned to a modern speaker, but still used
 *   archaic         rarely used except deliberately, for effect
 *   obsolete        no longer in real use; found only in historical texts
 *   sense           a different meaning of the verb: ripartisco ("I divide")
 *   clipped_common  a clipped form in everyday use: han, vuol, aver
 *   clipped_poetic  a clipped form found in poetry and song: parlan, furon
 */
export const ALTERNATIVE = {
  common: "common",
  colloquial: "colloquial",
  formal: "formal",
  literary: "literary",
  uncommon: "uncommon",
  regional: "regional",
  dated: "dated",
  archaic: "archaic",
  obsolete: "obsolete",
  sense: "sense",
  clipped_common: "clipped_common",
  clipped_poetic: "clipped_poetic",
} as const

/** Every alternative kind, in the order they are listed and shown. */
export const ALTERNATIVES = Object.values(ALTERNATIVE)

/**
 * Where a Wiktionary label on a conjugation form lands in our own
 * `alternatives` kinds. A form's tags fall into three groups:
 *
 *   - a label listed here gives the form that kind;
 *   - a label in DISQUALIFYING_LABELS means the form is not valid at all;
 *   - anything else is a note that says nothing about register —
 *     `Traditional` (an older stress spelling, gone once stress marks are
 *     removed), `transitive`, `sometimes`, … — and is ignored, so the form
 *     counts as standard. A tag Wiktionary adds tomorrow falls here too.
 *
 * `proscribed` (used by speakers, disapproved of by grammarians) is kept, as
 * colloquial; so is `Modern` (short everyday forms such as avere's *avo*,
 * *amo*). `figuratively` marks a form of another meaning of the verb: sense.
 */
export const ALTERNATIVE_KIND_BY_LABEL: Record<string, AlternativeKind> = {
  common: ALTERNATIVE.common,
  archaic: ALTERNATIVE.archaic,
  colloquial: ALTERNATIVE.colloquial,
  proscribed: ALTERNATIVE.colloquial,
  Modern: ALTERNATIVE.colloquial,
  figuratively: ALTERNATIVE.sense,
  literary: ALTERNATIVE.literary,
  rare: ALTERNATIVE.uncommon,
  uncommon: ALTERNATIVE.uncommon,
  regional: ALTERNATIVE.regional,
  dialectal: ALTERNATIVE.regional,
  dated: ALTERNATIVE.dated,
  obsolete: ALTERNATIVE.obsolete,
  poetic: ALTERNATIVE.literary,
  Latinate: ALTERNATIVE.formal,
}
