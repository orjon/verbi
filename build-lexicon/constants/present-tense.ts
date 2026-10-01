import { PATH } from "./feature-paths.ts"

/**
 * -ire verbs that take -isc- (*abbrutisco*), which Morph-it gives only without
 * it (*abbruto*). Each takes -isc- throughout the present, and English
 * Wiktionary agrees. Checked 2026-09-29.
 */
export const ISC_VERBS = new Set([
  "abbrutire",
  "aggrinzire",
  "ammollire",
  "asservire",
  "bramire",
  "brunire",
  "censire",
  "graffire",
  "grugnire",
  "gualcire",
  "incretinire",
  "inferocire",
  "plaudire",
  "poltrire",
  "rabbonire",
  "rattrappire",
  "tripartire",
])

/**
 * ISC_VERBS whose form without -isc- is also in use, as a common alternative.
 * Both *aggrinzisco* and *aggrinzo* are in use.
 */
export const ISC_AND_PLAIN = new Set(["aggrinzire"])

/**
 * -iare verbs whose i is stressed in the present (*devìo*), so an ending i
 * keeps it: *devii*, *deviino*, not *devi*, *devino*. Morph-it gives the forms
 * of an unstressed-i verb (*studi*, *studino*). The stress is marked on each
 * (*devìo*), and English Wiktionary gives the stressed-i forms for all.
 * riavviare, sciare and sviare are confirmed by conjugation tables instead.
 * Checked 2026-09-29.
 */
export const STRESSED_I_VERBS = new Set([
  "desiare",
  "deviare",
  "espiare",
  "forviare",
  "fuorviare",
  "obliare",
  "piare",
  "ravviare",
  "razziare",
  "riavviare",
  "sciare",
  "spiare",
  "striare",
  "sviare",
])

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
