/**
 * Accent rules for the passato remoto.
 *
 * Italian writes a final stressed `e` with an acute accent when the vowel is
 * closed, as in `perché` and `ventitré`, and with a grave accent when it is
 * open, as in `caffè` and the copula `è`. The third-person singular ending of a
 * weak `-ere` perfect is a closed vowel, so it takes the acute: `batté`,
 * `poté`, `ripeté`.
 *
 * Morph-it is inconsistent about this: it writes 48 of these with a grave, and
 * contradicts itself within one verb family (`cuocè` but `ricuocé`). So the
 * spelling is corrected here rather than taken from the source. The decision is
 * recorded as *Acute accent in the past historic* in notes/to-verify.md.
 */
import { ACCENTS } from "../constants/grammar.ts"
import { PATH_TO } from "../constants/feature-paths.ts"

const PAST_S1 = PATH_TO.indi.past.S1
const PAST_S3 = PATH_TO.indi.past.S3

/**
 * True when a past historic `io` form is weak — the regular endings on the
 * verb's own stem, as `temere` gives `temei` or `temetti`.
 *
 * A strong perfect (`presi`, `prese`, `presero`) changes the stem instead, and
 * its third singular ends in a plain unstressed `-e` with no accent, so the
 * accent rule must not touch it.
 */
export const isWeakPast = (s1: string): boolean => /(?:ei|etti)$/.test(s1)

/**
 * Returns a verb's Morph-it forms with the past historic third singular
 * corrected from a grave to an acute accent, where the verb's past historic is
 * weak. The forms are otherwise unchanged; the input is not modified.
 *
 * A verb counts as weak when any of Morph-it's `io` forms is weak, so a verb
 * with both a strong and a weak past historic (`cossi` / `cuocei`) has its
 * weak third singular corrected (`cuocè` → `cuocé`) and its strong one left as
 * it is (`cosse`).
 *
 *   { "ind.past.S1": ["battei"], "ind.past.S3": ["battè"] }
 *   → { "ind.past.S1": ["battei"], "ind.past.S3": ["batté"] }
 */
export const withAcutePast = (
  verbForms: Record<string, string[]>,
): Record<string, string[]> => {
  const s3 = verbForms[PAST_S3]
  const { eGrave, eAcute } = ACCENTS
  if (!s3?.some((f) => f.endsWith(eGrave))) return verbForms
  if (!(verbForms[PAST_S1] ?? []).some(isWeakPast)) return verbForms
  return {
    ...verbForms,
    [PAST_S3]: s3.map((f) => (f.endsWith(eGrave) ? f.slice(0, -1) + eAcute : f)),
  }
}
