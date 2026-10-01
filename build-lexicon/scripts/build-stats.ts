/** Counts kept while build-lexicon/scripts/build.ts runs, and their end-of-run report. */
import fs from "node:fs"

export const newStats = () => ({
  verbs: 0,
  forms: 0,
  reflexive: 0,
  dropped: 0,
  fromMorphIt: 0,
  fromOverride: 0,
  fromDerivation: 0,
  accentCorrected: 0,
  futureCorrected: 0,
  iscCorrected: 0,
  stressedICorrected: 0,
  ienteAdded: 0,
  diphthongAdded: 0,
  fareFormsAdded: 0,
  accentAdded: 0,
  fromConflictRule: 0,
  clipped_common: 0,
  clipped_poetic: 0,
  removedByOverride: 0,
  removedByCorrection: 0,
  conflicts: 0,
  emptied: 0,
  futureFlags: 0,
})
export type Stats = ReturnType<typeof newStats>

/**
 * Prints the counts, for example:
 *
 *   verbs written         : 6,076
 *     forms               : 332,732
 *       from Morph-it     : 332,563
 *       from an override  : 169
 *   ...
 *   it-verbs.json         : 7.14 MB
 */
export const printStats = (
  s: Stats,
  outputFiles: { label: string; path: string }[],
) => {
  console.log("verbs written         :", s.verbs.toLocaleString())
  console.log("  forms               :", s.forms.toLocaleString())
  console.log("    from Morph-it     :", s.fromMorphIt.toLocaleString())
  console.log("    from an override  :", s.fromOverride.toLocaleString())
  console.log("    from a derivation :", s.fromDerivation.toLocaleString())
  console.log(
    "  accent corrected in :",
    s.accentCorrected.toLocaleString(),
    "verbs",
  )
  console.log(
    "  future io corrected:",
    s.futureCorrected.toLocaleString(),
    "verbs",
  )
  console.log(
    "  -isc- added in      :",
    s.iscCorrected.toLocaleString(),
    "verbs",
  )
  console.log(
    "  stressed i added in :",
    s.stressedICorrected.toLocaleString(),
    "verbs",
  )
  console.log(
    "  -iente added in     :",
    s.ienteAdded.toLocaleString(),
    "verbs",
  )
  console.log(
    "  diphthong added in  :",
    s.diphthongAdded.toLocaleString(),
    "verbs",
  )
  console.log(
    "  fare forms added in :",
    s.fareFormsAdded.toLocaleString(),
    "verbs",
  )
  console.log("  compound accents    :", s.accentAdded.toLocaleString())
  console.log("    from a conflict rule:", s.fromConflictRule.toLocaleString())
  console.log("  removed by override :", s.removedByOverride.toLocaleString())
  console.log("  removed by rule     :", s.removedByCorrection.toLocaleString())
  console.log("skipped reflexive     :", s.reflexive.toLocaleString())
  console.log("skipped non-verbs     :", s.dropped.toLocaleString())
  console.log("")
  console.log("unresolved:")
  console.log(
    "  Morph-it gives two forms, nothing chooses :",
    s.conflicts.toLocaleString(),
  )
  console.log(
    "  every form rejected, slot left empty      :",
    s.emptied.toLocaleString(),
  )
  console.log(
    "  future disagrees with its own stem        :",
    s.futureFlags.toLocaleString(),
    "(reported only)",
  )
  console.log("")
  console.log(
    "clipped forms made   :",
    s.clipped_common.toLocaleString(),
    "common,",
    s.clipped_poetic.toLocaleString(),
    "poetic",
  )
  console.log("")
  for (const { label, path: filePath } of outputFiles) {
    console.log(
      `${label.padEnd(22)}: ${(fs.statSync(filePath).size / 1e6).toFixed(2)} MB`,
    )
  }
}
