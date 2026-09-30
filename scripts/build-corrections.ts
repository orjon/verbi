/**
 * Runs the correction rules in the order the build applies them: first the
 * fixes to Morph-it's raw input, before any form is decided; then, for a form
 * Morph-it gives several plausible candidates for, the conflict rules in
 * turn until one settles it. What each rule does lives in
 * scripts/corrections.ts (and scripts/accents.ts); this file only decides
 * their order. Called from buildVerb (scripts/build-verb.ts).
 */
import { withAcutePast } from "./accents.ts"
import {
  resolveDiphthong,
  resolveFareCompound,
  resolveFullFutureStem,
  resolveIsc,
  resolveParticipleIente,
  resolveStressedI,
  resolveStrongWeakPast,
  withFareForms,
  withFutureS1,
  withIsc,
  withMobileDiphthongForms,
  withParticipleIente,
  withStressedI,
} from "./corrections.ts"
import { fixedAlternatives } from "./build-alternatives.ts"
import { FARE } from "../constants/verb-groups.ts"
import { getFormAt } from "./verb-utils.ts"
import type { Resolution, Tree } from "../types/build.ts"
import type { Stats } from "./build-stats.ts"

/**
 * Morph-it's forms with its errors corrected: the accent on the past
 * historic (scripts/accents.ts), the future io form, the missing -isc-
 * forms, the stressed-i forms and the fare forms of some compounds
 * (scripts/corrections.ts). The build chooses from these; morphItPaths keeps
 * the originals, to compare against.
 */
export const applyCorrections = (
  infinitive: string,
  morphItPaths: Record<string, string[]>,
  built: Tree,
  stats: Stats,
): Record<string, string[]> => {
  const accented = withAcutePast(morphItPaths)
  if (accented !== morphItPaths) stats.accentCorrected++
  const futureFixed = withFutureS1(accented)
  if (futureFixed !== accented) stats.futureCorrected++
  const iscFixed = withIsc(infinitive, futureFixed)
  if (iscFixed !== futureFixed) stats.iscCorrected++
  const stressedFixed = withStressedI(infinitive, iscFixed)
  if (stressedFixed !== iscFixed) stats.stressedICorrected++
  const ienteFixed = withParticipleIente(infinitive, stressedFixed)
  if (ienteFixed !== stressedFixed) stats.ienteAdded++
  const diphthongFixed = withMobileDiphthongForms(infinitive, ienteFixed)
  if (diphthongFixed !== ienteFixed) stats.diphthongAdded++
  const featurePaths = withFareForms(infinitive, diphthongFixed, (featurePath) =>
    getFormAt(built[FARE] ?? {}, featurePath),
  )
  if (featurePaths !== ienteFixed) stats.fareFormsAdded++
  return featurePaths
}

/**
 * Settles a form Morph-it gives several plausible candidates for, by trying
 * each conflict rule in turn and taking the first that answers. Null when
 * none does — the form is then left as a conflict.
 */
export const resolveConflict = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
  forms: string[],
  featurePaths: Record<string, string[]>,
  built: Tree,
): Resolution | null =>
  resolveFareCompound(
    infinitive,
    featurePath,
    candidates,
    forms,
    getFormAt(built[FARE] ?? {}, featurePath),
    fixedAlternatives(FARE)[featurePath] ?? {},
  ) ??
  resolveIsc(infinitive, featurePath, candidates) ??
  resolveParticipleIente(infinitive, featurePath, candidates) ??
  resolveStressedI(infinitive, featurePath, candidates) ??
  resolveDiphthong(infinitive, featurePath, candidates) ??
  resolveFullFutureStem(infinitive, featurePath, candidates) ??
  resolveStrongWeakPast(infinitive, featurePath, candidates, featurePaths)
