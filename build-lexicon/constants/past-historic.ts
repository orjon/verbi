import { ALTERNATIVE } from "./alternatives.ts"
import type { AlternativeKind } from "../types/build.ts"

/**
 * The kind of alternative a weak past historic form is, beside the strong form
 * chosen, where it is not literary: both in common use (*concedetti*,
 * *sparii*), or another sense of the verb (*succedetti*, "followed").
 */
export const WEAK_BESIDE_STRONG: Record<string, AlternativeKind> = {
  concedere: ALTERNATIVE.common,
  sparire: ALTERNATIVE.common,
  succedere: ALTERNATIVE.sense,
}

/**
 * Verbs whose weak past historic is the standard, with the strong form a common
 * alternative: the -nettere family, *annettei* over *annessi*, which is the
 * less common form (English Wiktionary labels it uncommon too). connettere
 * conjugates like annettere.
 */
export const WEAK_PAST_STANDARD = /nettere$/
