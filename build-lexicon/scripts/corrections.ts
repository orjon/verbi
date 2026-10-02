/**
 * Rules and lists that apply to classes of verbs.
 *
 * Decisions about a single form of a single verb go in
 * data-sources/overrides.json instead. This file is for things that would be
 * tedious or misleading to write out one verb at a time.
 */
import { regularForms } from "../../conjugation/regular.ts"
import type { PastKind, Resolution, AlternativeForms, AlternativeKind } from "../types/build.ts"
import { RULE } from "../constants/rules.ts"
import { type RuleName } from "../types/build.ts"
import {
  ALTERNATIVE,
} from "../constants/alternatives.ts"
import {
  CONJUGATION,
  PERSON,
  PERSONS,
} from "../constants/grammar.ts"
import {
  ENDING,
} from "../constants/endings.ts"
import {
  PATH,
  PATH_TO,
  formPath,
} from "../constants/feature-paths.ts"
import {
  ACCENT_PLAIN_ALSO,
  ACCENTED_COMPOUNDS,
  FARE,
  FARE_COMPOUNDS_AS_ARE,
  FARE_REGULAR_ALSO,
  FARE_REGULAR_TENSES,
  ONE_SYLLABLE_FORMS,
} from "../constants/compounds.ts"
import {
  FULL_FUTURE_STEM,
  MOBILE_DIPHTHONG,
  STEM_KIND,
} from "../constants/stems.ts"
import {
  ISC_AND_PLAIN,
  ISC_VERBS,
  STRESSED_I_VERBS,
} from "../constants/present-tense.ts"
import {
  NO_PAST_PARTICIPLE,
  NO_PRESENT_PARTICIPLE,
  PARTICIPLE_IENTE_VERBS,
} from "../constants/participles.ts"
import {
  THIRD_PERSON_ONLY,
} from "../constants/defective-verbs.ts"
import {
  WEAK_BESIDE_STRONG,
  WEAK_PAST_STANDARD,
} from "../constants/past-historic.ts"
import {
  PARTICIPLE_IENTE_ENDING,
  PAST_KIND,
  STRONG_PAST_ENDING,
  WEAK_PAST_ENDING,
} from "../constants/endings.ts"
import {
  ISC_TENSES,
  STRESSED_I_TENSES,
} from "../constants/present-tense.ts"
import {
  PERSON_TENSES,
} from "../constants/feature-paths.ts"

/**
 * Paths a verb is known not to have, beyond what overrides.json states, each
 * with the name of the rule that removes it.
 *
 * A path is a whole tense (`part.pres`) or a single form (`ind.pres.S1`). Use
 * for absences that affect too many verbs to be worth writing out one at a
 * time.
 *
 * For a THIRD_PERSON_ONLY verb: the io, tu, noi and voi of every tense, and the
 * whole imperative, which has only those persons.
 */
export function absentPaths(verb: string): Map<string, RuleName> {
  const absent = new Map<string, RuleName>()
  if (NO_PRESENT_PARTICIPLE.has(verb))
    absent.set(PATH.part.pres, RULE.NO_PRESENT_PARTICIPLE)
  if (NO_PAST_PARTICIPLE.has(verb))
    absent.set(PATH.part.past, RULE.NO_PAST_PARTICIPLE)
  if (THIRD_PERSON_ONLY.has(verb)) {
    for (const tense of PERSON_TENSES)
      for (const person of [PERSON.s1, PERSON.s2, PERSON.p1, PERSON.p2])
        absent.set(formPath(tense, person), RULE.THIRD_PERSON_ONLY)
    absent.set(PATH.impr.pres, RULE.THIRD_PERSON_ONLY)
  }
  return absent
}

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
  const s1 = verbForms[PATH_TO.indi.futu.S1]
  const s3 = verbForms[PATH_TO.indi.futu.S3] ?? []
  const s1Ending = ENDING.futu[PERSONS.indexOf(PERSON.s1)]
  const s3Ending = ENDING.futu[PERSONS.indexOf(PERSON.s3)]
  const misfiled = (form: string) =>
    form.endsWith(s3Ending) && s3.includes(form)
  if (!s1?.some(misfiled)) return verbForms
  return {
    ...verbForms,
    [PATH_TO.indi.futu.S1]: s1.map((form) =>
      misfiled(form) ? form.slice(0, -s3Ending.length) + s1Ending : form,
    ),
  }
}

/** The form at a path in the output of regularForms. */
const regularAt = (
  forms: ReturnType<typeof regularForms>,
  featurePath: string,
): string | undefined => {
  const [mood, tense, person] = featurePath.split(".")
  const tenseForms = forms?.[`${mood}.${tense}`]
  if (typeof tenseForms === "string") return tenseForms
  return person
    ? (tenseForms as Record<string, string> | undefined)?.[person]
    : undefined
}

/**
 * Adds the -isc- form of an ISC_VERBS verb to each path where it differs from
 * the form without -isc-: the present indicative and subjunctive for io, tu,
 * lui/lei and loro, and the imperative for tu. resolveIsc then chooses it.
 * Returns verbForms unchanged for any other verb.
 */
export const withIsc = (
  infinitive: string,
  verbForms: Record<string, string[]>,
): Record<string, string[]> => {
  if (!ISC_VERBS.has(infinitive)) return verbForms
  const isc = regularForms(infinitive, true)
  const plain = regularForms(infinitive)
  const out = { ...verbForms }
  for (const featurePath of Object.keys(verbForms)) {
    const form = regularAt(isc, featurePath)
    if (form && form !== regularAt(plain, featurePath))
      out[featurePath] = [...verbForms[featurePath], form]
  }
  return out
}

/**
 * Settles the conflict withIsc makes: the -isc- form is chosen, and the form
 * without it is a mistake (for ISC_AND_PLAIN, iscAlternatives adds it back as
 * an alternative). Returns null for any other verb or path.
 */
export const resolveIsc = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
): Resolution | null => {
  if (!ISC_VERBS.has(infinitive) || !ISC_TENSES.has(tenseOf(featurePath)))
    return null
  const form = regularAt(regularForms(infinitive, true), featurePath)
  if (!form || !candidates.includes(form)) return null
  return { form, alternatives: {}, rule: RULE.ISC_VERBS }
}

/**
 * The common alternatives of an ISC_AND_PLAIN verb: the form without -isc- at
 * each path where it differs (*aggrinzo* beside *aggrinzisco*). They are made
 * here rather than taken from Morph-it's forms, because validate.ts drops
 * *aggrinzi* as a clipped form of *aggrinzisci*, so no conflict arises there.
 */
export const iscAlternatives = (
  infinitive: string,
): Record<string, AlternativeForms> => {
  if (!ISC_AND_PLAIN.has(infinitive)) return {}
  const isc = regularForms(infinitive, true)
  const plain = regularForms(infinitive)
  const out: Record<string, AlternativeForms> = {}
  for (const tensePath of Object.keys(isc ?? {}))
    for (const person of PERSONS) {
      const featurePath = formPath(tensePath, person)
      const plainForm = regularAt(plain, featurePath)
      const iscForm = regularAt(isc, featurePath)
      if (plainForm && iscForm && plainForm !== iscForm)
        out[featurePath] = { common: [plainForm] }
    }
  return out
}

/**
 * Adds the stressed-i form of a STRESSED_I_VERBS verb to each path where it
 * differs from the unstressed one: tu in the present, the present subjunctive,
 * and, for sciare, the future and conditional (*scierò*). resolveStressedI
 * then chooses it. Returns verbForms unchanged for any other verb.
 */
export const withStressedI = (
  infinitive: string,
  verbForms: Record<string, string[]>,
): Record<string, string[]> => {
  if (!STRESSED_I_VERBS.has(infinitive)) return verbForms
  const stressed = regularForms(infinitive, false, true)
  const plain = regularForms(infinitive)
  const out = { ...verbForms }
  for (const featurePath of Object.keys(verbForms)) {
    const form = regularAt(stressed, featurePath)
    if (form && form !== regularAt(plain, featurePath))
      out[featurePath] = [...verbForms[featurePath], form]
  }
  return out
}

/**
 * Settles the conflict withStressedI makes: the stressed-i form is chosen, and
 * Morph-it's unstressed form is a mistake (*devi* is a form of dovere, *spino*
 * a noun). Returns null for any other verb or path.
 */
export const resolveStressedI = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
): Resolution | null => {
  if (
    !STRESSED_I_VERBS.has(infinitive) ||
    !STRESSED_I_TENSES.has(tenseOf(featurePath))
  )
    return null
  const form = regularAt(regularForms(infinitive, false, true), featurePath)
  if (!form || !candidates.includes(form)) return null
  return { form, alternatives: {}, rule: RULE.STRESSED_I_VERBS }
}

/**
 * The accented form of an ACCENTED_COMPOUNDS form that is the prefix plus a
 * one-syllable form of its base verb at the same path, with its alternatives:
 * *rifa* → *rifà*; *disfa* → *disfà*, with *disfa* common. Returns null for any
 * other form, path or verb.
 */
export const accentedCompound = (
  infinitive: string,
  featurePath: string,
  form: string,
): Resolution | null => {
  const base = ACCENTED_COMPOUNDS[infinitive]
  const pair = base && ONE_SYLLABLE_FORMS[base][featurePath]
  if (!pair) return null
  const prefix = infinitive.slice(0, -base.length)
  const [plain, accented] = pair
  if (form !== prefix + plain) return null
  return {
    form: prefix + accented,
    alternatives: ACCENT_PLAIN_ALSO.has(infinitive) ? { common: [form] } : {},
    rule: RULE.ACCENTED_COMPOUNDS,
  }
}

/**
 * Adds the -iente present participle of a PARTICIPLE_IENTE_VERBS verb to each
 * gender path, beside Morph-it's -ente form: *conveniente* beside
 * *convenente*. resolveParticipleIente then chooses it. Returns verbForms
 * unchanged for any other verb.
 */
export const withParticipleIente = (
  infinitive: string,
  verbForms: Record<string, string[]>,
): Record<string, string[]> => {
  if (!PARTICIPLE_IENTE_VERBS.has(infinitive)) return verbForms
  const stem = infinitive.slice(0, -CONJUGATION.ire.length)
  const out = { ...verbForms }
  for (const [gender, ending] of Object.entries(PARTICIPLE_IENTE_ENDING)) {
    const featurePath = formPath(PATH.part.pres, gender)
    const form = stem + ending
    if (verbForms[featurePath] && !verbForms[featurePath].includes(form))
      out[featurePath] = [...verbForms[featurePath], form]
  }
  return out
}

/**
 * Settles the conflict withParticipleIente makes: the -iente form is chosen,
 * and Morph-it's -ente form is a mistake. Returns null for any other verb or
 * path.
 */
export const resolveParticipleIente = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
): Resolution | null => {
  if (
    !PARTICIPLE_IENTE_VERBS.has(infinitive) ||
    tenseOf(featurePath) !== PATH.part.pres
  )
    return null
  const stem = infinitive.slice(0, -CONJUGATION.ire.length)
  const endings = Object.values(PARTICIPLE_IENTE_ENDING)
  const form = candidates.find((f) => endings.some((e) => f === stem + e))
  if (!form) return null
  return { form, alternatives: {}, rule: RULE.PARTICIPLE_IENTE_VERBS }
}

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

/**
 * Adds prefix + fare's form to each path of a FARE_COMPOUNDS_AS_ARE verb:
 * *contraffaccio* beside Morph-it's *contraffo*. resolveFareCompound then
 * chooses it. fareAt gives fare's finished form at a path. Returns verbForms
 * unchanged for any other verb.
 */
export const withFareForms = (
  infinitive: string,
  verbForms: Record<string, string[]>,
  fareAt: (featurePath: string) => string | undefined,
): Record<string, string[]> => {
  if (!FARE_COMPOUNDS_AS_ARE.has(infinitive)) return verbForms
  const prefix = infinitive.slice(0, -FARE.length)
  const out = { ...verbForms }
  for (const featurePath of Object.keys(verbForms)) {
    const fareForm = fareAt(featurePath)
    if (fareForm && !verbForms[featurePath].includes(prefix + fareForm))
      out[featurePath] = [...verbForms[featurePath], prefix + fareForm]
  }
  return out
}

/**
 * Settles a conflict in a compound of fare (disfare, soddisfare, rifare…): the
 * compound conjugates like fare, so the form chosen is the prefix plus fare's
 * own form — *disfaccio* = dis- + *faccio*, *disfeci* = dis- + *feci*.
 *
 * Valid alternatives are the prefix plus fare's own alternatives (*disfai*
 * beside *disfa'*), and, for FARE_REGULAR_ALSO in FARE_REGULAR_TENSES, the
 * regular -are form (*disfo*). The other forms Morph-it gives — *disfavo*, *disfato*,
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
  // (*disfai*, common). The regular -are form is common (*disfo*, *disfiamo*,
  // *disferò*), except in the imperative, where it is colloquial (*disfa*).
  // The present has *disfaccio*, *disfò* and *disfo* side by side, and
  // *disfacciamo* beside *disfiamo*, but the imperative only has *disfà*,
  // *disfài* and *disfa'*. *soddisfaccio* and *soddisfo* are both correct.
  const valid = new Map<string, AlternativeKind>()
  for (const [kind, forms] of Object.entries(fareAlternatives))
    for (const f of forms ?? []) valid.set(prefix + f, kind as AlternativeKind)
  const tensePath = tenseOf(featurePath)
  if (
    FARE_REGULAR_ALSO.has(infinitive) &&
    FARE_REGULAR_TENSES.includes(tensePath) &&
    regular
  )
    valid.set(regular, tensePath === PATH.impr.pres ? ALTERNATIVE.colloquial : ALTERNATIVE.common)
  const alternatives = byKind(
    [...new Set(allForms)]
      .filter((f) => f !== form && valid.has(f))
      .map((f) => [valid.get(f)!, f]),
  )
  return { form, alternatives, rule: RULE.FARE_COMPOUND }
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
  PATH_TO.impr.pres.S2,
])

/**
 * Tenses where an -ie- verb keeps the diphthong although the stem is not
 * stressed. Both forms are valid; the modern one is chosen (*siederò*, not the
 * traditional *sederò*), to match Morph-it's own forms for sedere.
 */
const DIPHTHONG_KEPT_TENSES: string[] = [PATH.indi.futu, PATH.cond.pres]

/**
 * Adds a MOBILE_DIPHTHONG verb's diphthong-stem candidate at each stressed
 * path, beside Morph-it's plain form: *ruota* beside Morph-it's *rota*.
 * resolveDiphthong then chooses between them. Needed for the "stressedOnly"
 * -are verbs, where Morph-it gives only the plain form, so no conflict would
 * otherwise reach the rule; a no-op for the -ere verbs, whose diphthong form
 * Morph-it already gives. Returns verbForms unchanged for any other verb.
 *
 * Matches every plain-prefixed candidate at the path, not just the first: a
 * path can hold both the full form and a clipped one (*rotino* and *rotin*),
 * and matching only one would leave the other short of its own diphthong
 * counterpart for validate.ts's clip detection to compare against.
 */
export const withMobileDiphthongForms = (
  infinitive: string,
  verbForms: Record<string, string[]>,
): Record<string, string[]> => {
  const stems = MOBILE_DIPHTHONG[infinitive]
  if (!stems) return verbForms
  const out = { ...verbForms }
  for (const featurePath of STRESSED_STEM) {
    const forms = verbForms[featurePath]
    if (!forms?.length) continue
    const added = forms
      .filter((f) => f.startsWith(stems.plain))
      .map((f) => stems.diphthong + f.slice(stems.plain.length))
      .filter((f) => !forms.includes(f))
    if (added.length) out[featurePath] = [...forms, ...added]
  }
  return out
}

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

  const kinds = Object.values(STEM_KIND)
  const kindOf = (f: string) =>
    kinds.find((k) => stems[k] !== undefined && f.startsWith(stems[k]!))
  const classified = candidates.map((f) => ({ f, kind: kindOf(f) }))
  if (classified.some((c) => c.kind === undefined)) return null
  const endings = new Set(
    classified.map((c) => c.f.slice(stems[c.kind!]!.length)),
  )
  if (endings.size !== 1) return null

  // The future/conditional extension is only for "stressed" (the -ie- verbs,
  // *siederò*): "stressedOnly" (the -are -uo- verbs) never keeps the diphthong
  // there — Wiktionary gives *roterò*, not *ruoterò*, with no alternate.
  const keptTense =
    stems.keep === "stressed" &&
    DIPHTHONG_KEPT_TENSES.includes(tenseOf(featurePath))
  const keep =
    stems.keep === "always" || STRESSED_STEM.has(featurePath) || keptTense
  const want = keep ? STEM_KIND.diphthong : STEM_KIND.plain
  const chosen = classified.find((c) => c.kind === want)
  if (!chosen) return null

  // The plain form is valid where the diphthong is chosen but the plain form
  // is also in use: rare for the -uo- verbs, formal (traditional) in the future
  // and conditional of the -ie- verbs. "stressedOnly" has no such alternate —
  // Wiktionary shows no plain form beside the stressed diphthong forms either.
  const plainKind: AlternativeKind | undefined = !keep
    ? undefined
    : stems.keep === "always"
      ? ALTERNATIVE.uncommon
      : keptTense
        ? ALTERNATIVE.formal
        : stems.plainAlso
  const alternatives = byKind(
    classified
      .filter((c) => c.f !== chosen.f)
      .flatMap((c): [AlternativeKind, string][] =>
        c.kind === STEM_KIND.literary
          ? [[ALTERNATIVE.literary, c.f]]
          : c.kind === STEM_KIND.plain && plainKind
            ? [[plainKind, c.f]]
            : [],
      ),
  )
  return { form: chosen.f, alternatives, rule: RULE.MOBILE_DIPHTHONG }
}

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
      candidates.filter((f) => f !== form).map((f) => [ALTERNATIVE.common, f]),
    ),
    rule: RULE.FULL_FUTURE_STEM,
  }
}

/**
 * Settles a past historic conflict in the io, lui/lei or loro form, where
 * Morph-it gives a verb's weak and strong forms, or its two weak sets.
 *
 * A form is weak only if it is exactly the stem plus a weak ending; otherwise it
 * is strong if it ends as a strong form does for that person. So:
 *
 * - **Strong against weak: the strong form is chosen.** *crebbi* over
 *   *crescei*, *concessi* over *concedetti*, *diedi* over *detti*, *sparvi*
 *   over *sparii*. The weak form is kept as a valid alternative.
 * - **Except the -nettere family (WEAK_PAST_STANDARD): the weak form is
 *   chosen**, *annettei* over *annessi*, and the strong one is a common
 *   alternative.
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
      ? PAST_KIND.weakEi
      : ending.etti && f === stem + ending.etti
        ? PAST_KIND.weakEtti
        : f.endsWith(STRONG_PAST_ENDING[person])
          ? PAST_KIND.strong
          : undefined
  const classified = candidates.map((f) => ({ f, kind: kindOf(f) }))
  if (classified.some((c) => c.kind === undefined)) return null
  const has = (k: PastKind) => classified.find((c) => c.kind === k)

  let chosen = WEAK_PAST_STANDARD.test(infinitive)
    ? (has(PAST_KIND.weakEi) ?? has(PAST_KIND.weakEtti) ?? has(PAST_KIND.strong))
    : has(PAST_KIND.strong)
  if (
    chosen?.kind === PAST_KIND.strong &&
    classified.filter((c) => c.kind === PAST_KIND.strong).length > 1
  )
    return null
  if (!chosen) {
    if (!has(PAST_KIND.weakEi) || !has(PAST_KIND.weakEtti)) return null
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
    chosen = has(eiElsewhere ? PAST_KIND.weakEi : PAST_KIND.weakEtti)
  }
  // The weak form beside a strong one is literary, except for the verbs where
  // both are in common use, and succedere, where the weak form is another
  // sense ("to follow"). Between the two weak sets, the other set is common.
  const kind: AlternativeKind =
    chosen!.kind === PAST_KIND.strong
      ? (WEAK_BESIDE_STRONG[infinitive] ?? ALTERNATIVE.literary)
      : ALTERNATIVE.common
  return {
    form: chosen!.f,
    alternatives: byKind(
      candidates.filter((f) => f !== chosen!.f).map((f) => [kind, f]),
    ),
    rule: RULE.STRONG_WEAK_PAST,
  }
}

