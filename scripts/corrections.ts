/**
 * Rules and lists that apply to classes of verbs.
 *
 * Decisions about a single form of a single verb go in
 * resources/overrides.json instead. This file is for things that would be
 * tedious or misleading to write out one verb at a time.
 */
import { regularForms } from "./regular.ts"
import { ENDING, PATH, PERSON, PERSONS, formPath } from "./vocabulary.ts"

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
 * Slots a verb is known not to have, beyond what overrides.json states.
 *
 * Returns paths to leave empty. Use for absences that affect too many verbs to
 * be worth writing out one at a time.
 */
export function absentSlots(verb: string): string[] {
  return NO_PRESENT_PARTICIPLE.has(verb) ? [PATH.part.pres] : []
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
 * the other forms that are valid variants. Any form not listed in either is a
 * mistake, and data/adjusted.json lists it as rejected.
 */
export type Resolution = { form: string; alternatives: string[] }

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
  fareAlternatives: string[],
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
  const valid = new Set(fareAlternatives.map((a) => prefix + a))
  if (FARE_REGULAR_TENSES.includes(tenseOf(featurePath)) && regular)
    valid.add(regular)
  const alternatives = [...new Set(allForms)].filter(
    (f) => f !== form && valid.has(f),
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

  const plainValid = keep && (stems.keep === "always" || keptTense)
  const alternatives = classified
    .filter((c) => c.f !== chosen.f)
    .filter((c) => c.kind === "literary" || (c.kind === "plain" && plainValid))
    .map((c) => c.f)
  return { form: chosen.f, alternatives }
}
