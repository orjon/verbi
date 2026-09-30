/**
 * Groups of tenses (as paths, `ind.pres`) that the correction rules in
 * scripts/corrections.ts work across.
 */
import { PATH } from "../scripts/vocabulary.ts"

/** The tenses that have six persons. */
export const PERSON_TENSES = [
  PATH.indi.pres,
  PATH.indi.impf,
  PATH.indi.past,
  PATH.indi.futu,
  PATH.cond.pres,
  PATH.subj.pres,
  PATH.subj.impf,
]

/** The tenses where an ISC_VERBS verb takes -isc-: *abbrutisco*, *abbrutisca*. */
export const ISC_TENSES = new Set<string>([
  PATH.indi.pres,
  PATH.subj.pres,
  PATH.impr.pres,
])

/**
 * The tenses where a STRESSED_I_VERBS verb's stressed i shows: the presents,
 * and the future and conditional built on the same stem.
 */
export const STRESSED_I_TENSES = new Set<string>([
  PATH.indi.pres,
  PATH.subj.pres,
  PATH.indi.futu,
  PATH.cond.pres,
])
