/**
 * The name of every rule the build can record against a form in
 * lexicons/it-verbs-ledger.json (its `rule` chain). A const object rather than an
 * enum: Node runs these files by stripping types, and cannot run an enum.
 */
export const RULE = {
  // A class rule says the form does not exist (build-lexicon/scripts/corrections.ts,
  // absentPaths).
  NO_PRESENT_PARTICIPLE: "NO_PRESENT_PARTICIPLE",
  NO_PAST_PARTICIPLE: "NO_PAST_PARTICIPLE",
  THIRD_PERSON_ONLY: "THIRD_PERSON_ONLY",

  // A conflict rule chose between Morph-it's candidates
  // (build-lexicon/scripts/corrections.ts, via resolveConflict).
  FARE_COMPOUND: "FARE_COMPOUND",
  ISC_VERBS: "ISC_VERBS",
  PARTICIPLE_IENTE_VERBS: "PARTICIPLE_IENTE_VERBS",
  STRESSED_I_VERBS: "STRESSED_I_VERBS",
  MOBILE_DIPHTHONG: "MOBILE_DIPHTHONG",
  FULL_FUTURE_STEM: "FULL_FUTURE_STEM",
  STRONG_WEAK_PAST: "STRONG_WEAK_PAST",

  // A form derived from the verb's other finished forms (build-lexicon/scripts/derive.ts).
  GERUND_FROM_IMPERFECT: "GERUND_FROM_IMPERFECT",
  IMPERATIVE_FROM_PRESENT: "IMPERATIVE_FROM_PRESENT",

  // A later adjustment to a form already decided.
  ACCENTED_COMPOUNDS: "ACCENTED_COMPOUNDS",

  // A form with override alternatives but no value of its own.
  NO_VALUE: "NO_VALUE",
} as const
