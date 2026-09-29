/**
 * Rules and lists that apply to classes of verbs.
 *
 * Decisions about a single form of a single verb go in
 * resources/overrides.json instead. This file is for things that would be
 * tedious or misleading to write out one verb at a time.
 */
import { regularForms } from "./regular.ts"
import {
  type AlternativeForms,
  type AlternativeKind,
  ENDING,
  PATH,
  PERSON,
  PERSONS,
  formPath,
} from "./vocabulary.ts"

/**
 * Entries to ignore: a form of another verb that Morph-it made a headword of
 * its own. Both real verbs are present separately, so nothing is lost.
 */
export const IGNORED_ENTRIES = new Set<string>(["dimmi", "rimontar"])

/**
 * Verbs with no present participle.
 *
 * Morph-it records none for these, and none is in use — most Italian verbs
 * have no living present participle, and many of these are the base forms of
 * verbs that are normally reflexive (`abbuffare` behind `abbuffarsi`).
 *
 * Listed here rather than in resources/overrides.json because that file is for
 * decisions about individual forms, and this is one decision about 83 verbs.
 */
const NO_PRESENT_PARTICIPLE = new Set<string>([
  "abboffare",
  "abbuffare",
  "accaldare",
  "accanire",
  "accapigliare",
  "accigliare",
  "accoccolare",
  "accorgere",
  "accosciare",
  "accovacciare",
  "accucciare",
  "adirare",
  "adontare",
  "affare",
  "afflosciare",
  "appigliare",
  "appisolare",
  "appollaiare",
  "arrabattare",
  "assentare",
  "attagliare",
  "attendare",
  "autocandidare",
  "avvalere",
  "avvedere",
  "barcamenare",
  "congratulare",
  "defaticare",
  "imbattere",
  "immusonire",
  "impadronire",
  "impancare",
  "impaperare",
  "impelagare",
  "impipare",
  "impossessare",
  "incaponire",
  "incapricciare",
  "incavolare",
  "incazzare",
  "incrodare",
  "industriare",
  "inerpicare",
  "infischiare",
  "infognare",
  "infortunare",
  "ingegnare",
  "inginocchiare",
  "intestardire",
  "inurbare",
  "lagnare",
  "ostinare",
  "pavoneggiare",
  "pentire",
  "peritare",
  "piccare",
  "riappropriare",
  "rimpossessare",
  "rincagnare",
  "ripentire",
  "rivalere",
  "sbellicare",
  "sbracciare",
  "sbronzare",
  "scalmanare",
  "scamiciare",
  "scapicollare",
  "scervellare",
  "scollacciare",
  "sfegatare",
  "sfratare",
  "sgolare",
  "spaparacchiare",
  "spaparanzare",
  "specchiare",
  "spericolare",
  "spolmonare",
  "spretare",
  "stempiare",
  "stravaccare",
  "suicidare",
  "vanagloriare",
  "vergognare",
])

/**
 * Verbs used only in the third person (monopersonali). Morph-it gives every verb
 * all six persons, but these have no io, tu, noi or voi form in use; their third
 * person singular and plural are kept. The three lists differ only in why.
 */

/**
 * Weather, and the phases of daylight: no person can be their subject —
 * *piove*, *nevica*, *albeggia*. The plural is kept for figurative uses such as
 * *piovono critiche*. `tuonare` and `lampeggiare` have figurative personal uses
 * (a voice thundering, a car's lights flashing), which are left out as a
 * separate or rare sense.
 */
const WEATHER_VERBS = [
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

/** A state of affairs rather than an action: *vigono nuove leggi*. */
const STATE_VERBS = ["vigere"]

/**
 * Sensation, where the person who feels it is an indirect pronoun and the cause
 * is the subject: *mi prude il piede*, *mi prudono i piedi*.
 */
const SENSATION_VERBS = ["incombere", "increscere", "prudere", "rincrescere"]

const THIRD_PERSON_ONLY = new Set<string>([
  ...WEATHER_VERBS,
  ...STATE_VERBS,
  ...SENSATION_VERBS,
])

/** The tenses that have six persons. */
const PERSON_TENSES = [
  PATH.indi.pres,
  PATH.indi.impf,
  PATH.indi.past,
  PATH.indi.futu,
  PATH.cond.pres,
  PATH.subj.pres,
  PATH.subj.impf,
]

/**
 * Slots a verb is known not to have, beyond what overrides.json states.
 *
 * Returns paths to leave empty: a whole tense (`part.pres`) or a single slot
 * (`ind.pres.S1`). Use for absences that affect too many verbs to be worth
 * writing out one at a time.
 *
 * For a THIRD_PERSON_ONLY verb: the io, tu, noi and voi of every tense, and the
 * whole imperative, which has only those persons.
 */
export function absentSlots(verb: string): string[] {
  const absent: string[] = []
  if (NO_PRESENT_PARTICIPLE.has(verb)) absent.push(PATH.part.pres)
  if (THIRD_PERSON_ONLY.has(verb)) {
    for (const tense of PERSON_TENSES)
      for (const person of [PERSON.s1, PERSON.s2, PERSON.p1, PERSON.p2])
        absent.push(formPath(tense, person))
    absent.push(PATH.impr.pres)
  }
  return absent
}

const FUTURE_S1 = formPath(PATH.indi.futu, PERSON.s1)
const FUTURE_S3 = formPath(PATH.indi.futu, PERSON.s3)

/**
 * Returns a verb's Morph-it forms with the future `io` form corrected where
 * Morph-it filed the `lui/lei` form in its place. The input is not modified.
 *
 * Morph-it does this for 304 forms in 301 verbs: the S1 slot holds exactly the
 * verb's own S3 form, ending in -à where S1 ends in -ò. The future uses one stem
 * for all six persons, so only the ending is swapped, and the stem is kept
 * whatever its shape:
 *
 *   accenderà → accenderò    scucirà → scucirò    sprovvedrà → sprovvedrò
 *   riotterrà → riotterrò    trasdurrà → trasdurrò
 *
 * A form is changed only when it is identical to one of the verb's S3 forms,
 * so nothing else can be caught. No correct S1 form ends in -à.
 */
export const withFutureS1 = (
  verbForms: Record<string, string[]>,
): Record<string, string[]> => {
  const s1 = verbForms[FUTURE_S1]
  const s3 = verbForms[FUTURE_S3] ?? []
  const s1Ending = ENDING.futu[PERSONS.indexOf(PERSON.s1)]
  const s3Ending = ENDING.futu[PERSONS.indexOf(PERSON.s3)]
  const misfiled = (form: string) =>
    form.endsWith(s3Ending) && s3.includes(form)
  if (!s1?.some(misfiled)) return verbForms
  return {
    ...verbForms,
    [FUTURE_S1]: s1.map((form) =>
      misfiled(form) ? form.slice(0, -s3Ending.length) + s1Ending : form,
    ),
  }
}

/**
 * How a conflict is settled by one of the rules below: the form chosen, and
 * the other forms that are valid variants, by kind. Any form not listed in
 * either is a mistake, and data/adjusted.json lists it as rejected.
 */
export type Resolution = { form: string; alternatives: AlternativeForms }

/** Groups [kind, form] pairs into AlternativeForms, dropping duplicates. */
const byKind = (pairs: [AlternativeKind, string][]): AlternativeForms => {
  const out: AlternativeForms = {}
  for (const [kind, form] of pairs) {
    const forms = (out[kind] ??= [])
    if (!forms.includes(form)) forms.push(form)
  }
  return out
}

/** The tense a form path belongs to: "ind.pres.S1" → "ind.pres". */
const tenseOf = (featurePath: string): string =>
  featurePath.split(".").slice(0, 2).join(".")

const FARE = "fare"

/**
 * Tenses where a compound of fare also has regular -are forms in use:
 * *dìsfo*, *dìsfi*, *disferò*. Wiktionary gives these beside the fare forms,
 * marked "sometimes proscribed, now more common". The imperative is included
 * for the same reason: *disfa* beside *disfa'*, as in "Disfa le valigie!".
 */
const FARE_REGULAR_TENSES: string[] = [
  PATH.indi.pres,
  PATH.indi.futu,
  PATH.cond.pres,
  PATH.subj.pres,
  PATH.impr.pres,
]

/**
 * Settles a conflict in a compound of fare (disfare, soddisfare, rifare…): the
 * compound conjugates like fare, so the form chosen is the prefix plus fare's
 * own form — *disfaccio* = dis- + *faccio*, *disfeci* = dis- + *feci*.
 *
 * Valid alternatives are the prefix plus fare's own alternatives (*disfai*
 * beside *disfa'*), and, in FARE_REGULAR_TENSES, the regular -are form
 * (*disfo*). The other forms Morph-it gives — *disfavo*, *disfato*,
 * *disfante* — are mistakes.
 *
 * candidates are the forms validate.ts could not choose between; allForms is
 * everything Morph-it gives for the slot. Alternatives are taken from allForms,
 * because validate.ts drops a form that is the start of another as clipped —
 * *disfa* beside *disfa'* — although here it is a separate, valid form.
 *
 * Returns null when the verb is not a compound of fare, or when none of
 * Morph-it's forms is the prefix plus fare's form.
 */
export const resolveFareCompound = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
  allForms: string[],
  fareForm: string | undefined,
  fareAlternatives: AlternativeForms,
): Resolution | null => {
  if (infinitive === FARE || !infinitive.endsWith(FARE) || !fareForm)
    return null
  const prefix = infinitive.slice(0, -FARE.length)
  const form = prefix + fareForm
  if (!candidates.includes(form)) return null

  const [mood, tense, person] = featurePath.split(".")
  const regularTense = regularForms(infinitive)?.[`${mood}.${tense}`]
  const regular =
    typeof regularTense === "string"
      ? regularTense
      : person
        ? (regularTense as Record<string, string> | undefined)?.[person]
        : undefined
  // Each valid form, with its kind: fare's own alternatives keep their kind
  // (*disfai*, common); the regular -are form is colloquial (*disfo*).
  const valid = new Map<string, AlternativeKind>()
  for (const [kind, forms] of Object.entries(fareAlternatives))
    for (const f of forms ?? []) valid.set(prefix + f, kind as AlternativeKind)
  if (FARE_REGULAR_TENSES.includes(tenseOf(featurePath)) && regular)
    valid.set(regular, "colloquial")
  const alternatives = byKind(
    [...new Set(allForms)]
      .filter((f) => f !== form && valid.has(f))
      .map((f) => [valid.get(f)!, f]),
  )
  return { form, alternatives }
}

/**
 * Verbs with a mobile diphthong (dittongo mobile) whose stem varies:
 *
 *   plain      the stem without the diphthong: sed-, coc-
 *   diphthong  the stem with it: sied-, cuoc-
 *   literary   a third stem, used in literary Italian: segg- (seggo)
 *   keep       "always" — the diphthong is kept in every form (-uo- verbs);
 *              "stressed" — kept where the stem is stressed, and in the future
 *              and conditional (-ie- verbs)
 *
 * The grammar and the decisions behind these are in scripts/derive.ts, above
 * gerundFromImperfect, and in resources/to-verify.md.
 */
type MobileDiphthong = {
  plain: string
  diphthong: string
  literary?: string
  keep: "always" | "stressed"
}

const MOBILE_DIPHTHONG: Record<string, MobileDiphthong> = {
  cuocere: { plain: "coc", diphthong: "cuoc", keep: "always" },
  nuocere: { plain: "noc", diphthong: "nuoc", keep: "always" },
  percuotere: { plain: "percot", diphthong: "percuot", keep: "always" },
  ripercuotere: { plain: "ripercot", diphthong: "ripercuot", keep: "always" },
  riscuotere: { plain: "riscot", diphthong: "riscuot", keep: "always" },
  scuotere: { plain: "scot", diphthong: "scuot", keep: "always" },
  possedere: {
    plain: "possed",
    diphthong: "possied",
    literary: "possegg",
    keep: "stressed",
  },
  risedere: {
    plain: "rised",
    diphthong: "risied",
    literary: "risegg",
    keep: "stressed",
  },
  sedere: { plain: "sed", diphthong: "sied", literary: "segg", keep: "stressed" },
  soprassedere: {
    plain: "soprassed",
    diphthong: "soprassied",
    literary: "soprassegg",
    keep: "stressed",
  },
}

/**
 * The forms where an -ie- verb's stem is stressed, so the diphthong appears:
 * the present io, tu, lui/lei and loro (*sìedo*, *sìedono*), the same persons of
 * the present subjunctive, and the imperative tu (*sìedi*).
 */
const STRESSED_STEM = new Set<string>([
  ...[PERSON.s1, PERSON.s2, PERSON.s3, PERSON.p3].map((p) =>
    formPath(PATH.indi.pres, p),
  ),
  ...[PERSON.s1, PERSON.s2, PERSON.s3, PERSON.p3].map((p) =>
    formPath(PATH.subj.pres, p),
  ),
  formPath(PATH.impr.pres, PERSON.s2),
])

/**
 * Tenses where an -ie- verb keeps the diphthong although the stem is not
 * stressed. Both forms are valid; the modern one is chosen (*siederò*, not the
 * traditional *sederò*), to match Morph-it's own forms for sedere.
 */
const DIPHTHONG_KEPT_TENSES: string[] = [PATH.indi.futu, PATH.cond.pres]

/**
 * Settles a conflict between forms of a MOBILE_DIPHTHONG verb that differ only
 * in the stem — *coceva / cuoceva*, *sediamo / siediamo*, *seggo / siedo*.
 *
 * Chooses the diphthong form where it is kept, and the plain form elsewhere.
 * Valid alternatives: the literary -gg- form; and the plain form where the
 * diphthong is chosen but the plain form is also in use — every -uo- form
 * (marked rare), and the future and conditional of the -ie- verbs (marked
 * traditional). The other forms are mistakes: *siediamo*, *possedano*.
 *
 * Returns null when the verb is not listed, or when the forms differ in more
 * than the stem — *scotete / scuotiamo* is a misfiled form, not a variant, and
 * is set by override instead.
 */
export const resolveDiphthong = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
): Resolution | null => {
  const stems = MOBILE_DIPHTHONG[infinitive]
  if (!stems) return null

  const kinds = ["diphthong", "literary", "plain"] as const
  const kindOf = (f: string) =>
    kinds.find((k) => stems[k] !== undefined && f.startsWith(stems[k]!))
  const classified = candidates.map((f) => ({ f, kind: kindOf(f) }))
  if (classified.some((c) => c.kind === undefined)) return null
  const endings = new Set(
    classified.map((c) => c.f.slice(stems[c.kind!]!.length)),
  )
  if (endings.size !== 1) return null

  const keptTense = DIPHTHONG_KEPT_TENSES.includes(tenseOf(featurePath))
  const keep =
    stems.keep === "always" || STRESSED_STEM.has(featurePath) || keptTense
  const want = keep ? "diphthong" : "plain"
  const chosen = classified.find((c) => c.kind === want)
  if (!chosen) return null

  // The plain form is valid where the diphthong is chosen but the plain form
  // is also in use: rare for the -uo- verbs, formal (traditional) in the future
  // and conditional of the -ie- verbs.
  const plainKind: AlternativeKind | undefined = !keep
    ? undefined
    : stems.keep === "always"
      ? "rare"
      : keptTense
        ? "formal"
        : undefined
  const alternatives = byKind(
    classified
      .filter((c) => c.f !== chosen.f)
      .flatMap((c): [AlternativeKind, string][] =>
        c.kind === "literary"
          ? [["literary", c.f]]
          : c.kind === "plain" && plainKind
            ? [[plainKind, c.f]]
            : [],
      ),
  )
  return { form: chosen.f, alternatives }
}

/**
 * Verbs whose future and conditional are built on the full infinitive stem
 * (*premorirò*, *riudirò*), with Morph-it also giving a shortened stem
 * (*premorrò*, *riudrò*). Both are in use; the full stem is chosen and the
 * shortened one kept as a valid variant.
 *
 * Not a general rule: for many verbs the shortened stem is the standard one —
 * *vedrò*, *verrò*, *vivrò*. So the verbs are listed.
 */
const FULL_FUTURE_STEM = new Set(["premorire", "riudire"])

/**
 * Settles a future or conditional conflict in a FULL_FUTURE_STEM verb: chooses
 * the form built on the infinitive without its final -e (*premorir-*), and
 * keeps the others as valid alternatives.
 *
 * Returns null for any other verb or tense, or when no form has the full stem.
 */
export const resolveFullFutureStem = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
): Resolution | null => {
  if (!FULL_FUTURE_STEM.has(infinitive)) return null
  const tense = tenseOf(featurePath)
  if (tense !== PATH.indi.futu && tense !== PATH.cond.pres) return null
  const stem = infinitive.slice(0, -1)
  const form = candidates.find((f) => f.startsWith(stem))
  if (!form) return null
  return {
    form,
    alternatives: byKind(
      candidates.filter((f) => f !== form).map((f) => ["common", f]),
    ),
  }
}

/**
 * The weak past historic endings, by person, for the three persons where a
 * verb can also have a strong form. -ere verbs have two weak sets, -ei and
 * -etti; -are and -ire verbs have one. `ei` holds the ending in the -ei set
 * and `etti` the ending in the -etti set: for lui/lei, *é* and *ette*.
 */
const WEAK_PAST_ENDING: Record<string, Record<string, { ei: string; etti?: string }>> =
  {
    are: {
      [PERSON.s1]: { ei: "ai" },
      [PERSON.s3]: { ei: "ò" },
      [PERSON.p3]: { ei: "arono" },
    },
    ere: {
      [PERSON.s1]: { ei: "ei", etti: "etti" },
      [PERSON.s3]: { ei: "é", etti: "ette" },
      [PERSON.p3]: { ei: "erono", etti: "ettero" },
    },
    ire: {
      [PERSON.s1]: { ei: "ii" },
      [PERSON.s3]: { ei: "ì" },
      [PERSON.p3]: { ei: "irono" },
    },
  }

/** The endings of a strong past historic, by person: *crebbi, crebbe, crebbero*. */
const STRONG_PAST_ENDING: Record<string, string> = {
  [PERSON.s1]: "i",
  [PERSON.s3]: "e",
  [PERSON.p3]: "ero",
}

/**
 * The kind of alternative a weak past historic form is, beside the strong form
 * chosen, where it is not literary: both in common use (*concedetti*,
 * *sparii*), or another sense of the verb (*succedetti*, "followed").
 */
const WEAK_BESIDE_STRONG: Record<string, AlternativeKind> = {
  concedere: "common",
  sparire: "common",
  succedere: "sense",
}

/**
 * The kind of a past historic form: in the weak -ei set, in the weak -etti
 * set, or strong.
 */
type PastKind = "weakEi" | "weakEtti" | "strong"

/**
 * Settles a past historic conflict in the io, lui/lei or loro form, where
 * Morph-it gives a verb's weak and strong forms, or its two weak sets.
 *
 * A form is weak only if it is exactly the stem plus a weak ending; otherwise it
 * is strong if it ends as a strong form does for that person. So:
 *
 * - **Strong against weak: the strong form is chosen.** *crebbi* over
 *   *crescei*, *connessi* over *connettei*, *concessi* over *concedetti*,
 *   *diedi* over *detti*, *sparvi* over *sparii*. The weak form is kept as a
 *   valid alternative.
 * - **-ei against -etti: -etti is chosen** (*credetti* over *credei*), unless
 *   the verb's other past historic forms already use the -ei set, in which case
 *   -ei is chosen so the tense stays consistent (*godei, godé, goderono*). The
 *   other is kept as a valid alternative.
 *
 * verbForms is the verb's forms from Morph-it, used to see which weak set its
 * other persons use. Returns null for any other tense or person, or when the
 * forms cannot all be classified.
 */
export const resolveStrongWeakPast = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
  verbForms: Record<string, string[]>,
): Resolution | null => {
  const [mood, tense, person] = featurePath.split(".")
  if (`${mood}.${tense}` !== PATH.indi.past || !(person in STRONG_PAST_ENDING))
    return null
  const group = infinitive.slice(-3)
  const ending = WEAK_PAST_ENDING[group]?.[person]
  if (!ending) return null
  const stem = infinitive.slice(0, -3)

  const kindOf = (f: string): PastKind | undefined =>
    f === stem + ending.ei
      ? "weakEi"
      : ending.etti && f === stem + ending.etti
        ? "weakEtti"
        : f.endsWith(STRONG_PAST_ENDING[person])
          ? "strong"
          : undefined
  const classified = candidates.map((f) => ({ f, kind: kindOf(f) }))
  if (classified.some((c) => c.kind === undefined)) return null
  const has = (k: PastKind) => classified.find((c) => c.kind === k)

  let chosen = has("strong")
  if (chosen && classified.filter((c) => c.kind === "strong").length > 1)
    return null
  if (!chosen) {
    if (!has("weakEi") || !has("weakEtti")) return null
    // Does the verb already use the -ei set in another person, on its own?
    const eiElsewhere = Object.keys(STRONG_PAST_ENDING)
      .filter((p) => p !== person)
      .some((p) => {
        const forms = [
          ...new Set(verbForms[formPath(PATH.indi.past, p)] ?? []),
        ]
        const otherEnding = WEAK_PAST_ENDING[group][p]
        return forms.length === 1 && forms[0] === stem + otherEnding.ei
      })
    chosen = has(eiElsewhere ? "weakEi" : "weakEtti")
  }
  // The weak form beside a strong one is literary, except for the verbs where
  // both are in common use, and succedere, where the weak form is another
  // sense ("to follow"). Between the two weak sets, the other set is common.
  const kind: AlternativeKind =
    chosen!.kind === "strong"
      ? (WEAK_BESIDE_STRONG[infinitive] ?? "literary")
      : "common"
  return {
    form: chosen!.f,
    alternatives: byKind(
      candidates.filter((f) => f !== chosen!.f).map((f) => [kind, f]),
    ),
  }
}

