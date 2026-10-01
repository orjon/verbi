/**
 * Entries to ignore: a form of another verb that Morph-it made a headword of
 * its own. Both real verbs are present separately, so nothing is lost.
 */
export const IGNORED_ENTRIES = new Set<string>(["dimmi", "rimontar"])

/**
 * Weather, and the phases of daylight: no person can be their subject —
 * *piove*, *nevica*, *albeggia*. The plural is kept for figurative uses such as
 * *piovono critiche*. `tuonare` and `lampeggiare` have figurative personal uses
 * (a voice thundering, a car's lights flashing), which are left out as a
 * separate or rare sense.
 */
export const WEATHER_VERBS = [
  "albeggiare",
  "annottare",
  "diluviare",
  "grandinare",
  "imbrunire",
  "lampeggiare",
  "nevicare",
  "nevischiare",
  "piovere",
  "piovigginare",
  "ripiovere",
  "spiovere",
  "tuonare",
]

/**
 * A state of affairs rather than an action: *vigono nuove leggi*. accadere
 * added 2026-09-29 (real plural use too: *accadono cose strane*). aggradare
 * is more restrictive still: it is used only in the third person singular of
 * the present (not even the plural this class keeps), so it is handled by
 * override instead, not added here.
 */
export const STATE_VERBS = ["vigere", "accadere"]

/**
 * Sensation, where the person who feels it is an indirect pronoun and the cause
 * is the subject: *mi prude il piede*, *mi prudono i piedi*.
 */
export const SENSATION_VERBS = [
  "incombere",
  "increscere",
  "prudere",
  "rincrescere",
]

export const THIRD_PERSON_ONLY = new Set<string>([
  ...WEATHER_VERBS,
  ...STATE_VERBS,
  ...SENSATION_VERBS,
])
