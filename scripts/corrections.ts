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
  CONJUGATION,
  ENDING,
  GENDER,
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
  // added 2026-09-29, checked against English Wiktionary's tables ("-" given
  // for the slot, and no valid alternate): ambire, compatire, deperire,
  // gioire, perire, riessere, risapere, risentire. Five more have a genuine
  // rare/archaic/literary alternate kept in resources/fixed-alternatives.json
  // instead of being lost: esperire, percepire, presentire, punire, tornire.
  // sapere added 2026-09-29, decided by Orjon (source: ChatGPT): "sapiente"
  // has fully detached from the verb — it can no longer be used verbally
  // ("la persona sapiente la verità" is not valid; only "la persona che sa
  // la verità"), so keeping it would be historical clutter, not a living
  // present participle.
  "ambire",
  "compatire",
  "deperire",
  "esperire",
  "gioire",
  "percepire",
  "perire",
  "presentire",
  "punire",
  "riessere",
  "risapere",
  "risentire",
  "sapere",
  "tornire",
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

/**
 * A state of affairs rather than an action: *vigono nuove leggi*. accadere
 * added 2026-09-29 (real plural use too: *accadono cose strane*). aggradare
 * is more restrictive still — Treccani: "è usato solo nella 3a pers. sing.
 * dell'indic. pres." (singular only, not even the plural this class keeps)
 * — so it is handled by override instead, not added here.
 */
const STATE_VERBS = ["vigere", "accadere"]

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
 * Verbs with no past participle, so no compound tenses. Morph-it gives one
 * anyway (a regular -uto ending on a Latinate stem that never took it:
 * *vertuto*, *urto*), which is simply wrong — not a valid rare alternative.
 * Checked on Treccani, each explicitly "difettivo" or "manca(no) il part.
 * pass.", 2026-09-29; see notes/reports/wiktionary/summary.md. Four of these
 * (controvertere, divergere, serpere, urgere) also lack the passato remoto,
 * handled separately in resources/overrides.json. eccellere and convergere
 * were flagged by the same Wiktionary comparison but turned out to have a
 * real participle on checking (eccelso; converso, rare) — set directly
 * instead of being added here.
 */
const NO_PAST_PARTICIPLE = new Set<string>([
  "competere",
  "controvertere",
  "discernere",
  "divergere",
  "equidistare",
  "erompere",
  "esimere",
  "fervere",
  "fulgere",
  "irrompere",
  "lucere",
  "mingere",
  "rilucere",
  "risplendere",
  "serpere",
  "strapiombare",
  "suggere",
  "tralucere",
  "urgere",
  "vertere",
])

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
  if (NO_PAST_PARTICIPLE.has(verb)) absent.push(PATH.part.past)
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
 * -ire verbs that take -isc- (*abbrutisco*), which Morph-it gives only without
 * it (*abbruto*). Treccani gives -isc- for each ("io abbrutisco, tu
 * abbrutisci, ecc."), and so does English Wiktionary. Checked 2026-09-29; see
 * notes/reports/wiktionary/summary.md.
 */
const ISC_VERBS = new Set([
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
 * Treccani: "io aggrinzisco o aggrinzo".
 */
const ISC_AND_PLAIN = new Set(["aggrinzire"])

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
const ISC_TENSES = new Set<string>([
  PATH.indi.pres,
  PATH.subj.pres,
  PATH.impr.pres,
])

export const resolveIsc = (
  infinitive: string,
  featurePath: string,
  candidates: string[],
): Resolution | null => {
  if (!ISC_VERBS.has(infinitive) || !ISC_TENSES.has(tenseOf(featurePath)))
    return null
  const form = regularAt(regularForms(infinitive, true), featurePath)
  if (!form || !candidates.includes(form)) return null
  return { form, alternatives: {} }
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
 * -iare verbs whose i is stressed in the present (*devìo*), so an ending i
 * keeps it: *devii*, *deviino*, not *devi*, *devino*. Morph-it gives the forms
 * of an unstressed-i verb (*studi*, *studino*). Treccani marks the stress
 * ("io devìo", "io strio, tu strii"), Hoepli for piare ("pìo, -pìi"), and
 * English Wiktionary gives the stressed-i forms for all. riavviare, sciare and
 * sviare are confirmed by conjugation tables instead of Treccani. Checked
 * 2026-09-29; see notes/reports/wiktionary/summary.md.
 */
const STRESSED_I_VERBS = new Set([
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
const STRESSED_I_TENSES = new Set<string>([
  PATH.indi.pres,
  PATH.subj.pres,
  PATH.indi.futu,
  PATH.cond.pres,
])

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
  return { form, alternatives: {} }
}

/**
 * Compounds of a verb with one-syllable forms, and the verb each is built on.
 * The compound form of a one-syllable form takes a written accent: *fa* →
 * *rifà*, *sto* → *sottostò*, *fu* → *rifù*. Treccani grammar ("accento"):
 * the accent is required on words "formate da più parole, l'ultima delle
 * quali, da sola, andrebbe scritta senza accento" (tre → ventitré). Treccani
 * entries: "egli rifà"; "io sottostò … egli sottostà". English Wiktionary
 * agrees for all. A list, because the ending alone would catch costare
 * (*costa*) or mandare (*mando*). riavere is not here: Treccani spells it
 * without h (*riò, rià*).
 */
const ACCENTED_COMPOUNDS: Record<string, string> = {
  assuefare: "fare",
  confare: "fare",
  contraffare: "fare",
  disfare: "fare",
  liquefare: "fare",
  malfare: "fare",
  mansuefare: "fare",
  putrefare: "fare",
  rarefare: "fare",
  rifare: "fare",
  sfare: "fare",
  soddisfare: "fare",
  sopraffare: "fare",
  strafare: "fare",
  stupefare: "fare",
  torrefare: "fare",
  tumefare: "fare",
  ristare: "stare",
  sottostare: "stare",
  riandare: "andare",
  risapere: "sapere",
  riessere: "essere",
}

/**
 * ACCENTED_COMPOUNDS whose form without the accent is also in use, as a common
 * alternative. Treccani: "disfà o disfa", "soddisfà o soddisfa".
 */
const ACCENT_PLAIN_ALSO = new Set(["disfare", "soddisfare"])

/**
 * The one-syllable forms without an accent of each base verb, by path, with
 * the accented form a compound takes.
 */
const ONE_SYLLABLE_FORMS: Record<string, Record<string, [string, string]>> = {
  fare: { [formPath(PATH.indi.pres, PERSON.s3)]: ["fa", "fà"] },
  stare: {
    [formPath(PATH.indi.pres, PERSON.s1)]: ["sto", "stò"],
    [formPath(PATH.indi.pres, PERSON.s3)]: ["sta", "stà"],
  },
  andare: { [formPath(PATH.indi.pres, PERSON.s3)]: ["va", "và"] },
  sapere: {
    [formPath(PATH.indi.pres, PERSON.s1)]: ["so", "sò"],
    [formPath(PATH.indi.pres, PERSON.s3)]: ["sa", "sà"],
  },
  essere: { [formPath(PATH.indi.past, PERSON.s3)]: ["fu", "fù"] },
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
  }
}

/**
 * -ire verbs whose present participle keeps the Latin -iente ending instead of
 * the regular -ente (venire's own "veniente", not "venente"). Morph-it gives
 * only the -ente form, so no conflict ever reaches a rule. Checked on
 * Treccani, 2026-09-29 (e.g. "conveniènte", "nutrïènte", "progrediènte",
 * "ubbidiènte"); adempire, compire and inorgoglire added later the same day,
 * matching the same stem+iente pattern (riempire already had it correctly
 * from Morph-it). See notes/reports/wiktionary/summary.md. Four further verbs
 * with an irregular present participle (assentire, dissentire, concepire,
 * concupire) are handled by resources/overrides.json instead, since each is
 * its own word, not "stem + iente".
 */
const PARTICIPLE_IENTE_VERBS = new Set([
  // venire and its compounds
  "addivenire",
  "avvenire",
  "circonvenire",
  "contravvenire",
  "convenire",
  "divenire",
  "intervenire",
  "pervenire",
  "riconvenire",
  "rinvenire",
  "sopravvenire",
  "sovvenire",
  "svenire",
  "venire",
  // other -ire verbs
  "adempire",
  "ammollire",
  "compire",
  "inorgoglire",
  "blandire",
  "empire",
  "esaudire",
  "esaurire",
  "impedire",
  "lenire",
  "munire",
  "nutrire",
  "partorire",
  "premunire",
  "progredire",
  "regredire",
  "trasgredire",
  "ubbidire",
])

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
  for (const [gender, ending] of Object.entries({
    [GENDER.m]: "iente",
    [GENDER.f]: "iente",
    [GENDER.mp]: "ienti",
    [GENDER.fp]: "ienti",
  })) {
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
  const form = candidates.find((f) => f === stem + "iente" || f === stem + "ienti")
  if (!form) return null
  return { form, alternatives: {} }
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
 * Compounds of fare that Morph-it gives only regular -are forms (*contraffo*,
 * *contraffò*), so no conflict reaches resolveFareCompound. Treccani: "coniug.
 * come fare" (contraffare, mansuefare, torrefare, tumefare); sfare "il resto
 * della coniug. segue fare". English Wiktionary agrees. A list, because the
 * ending cannot tell a compound from tuffare or fotografare.
 *
 * affare added later the same day on Wiktionary's forms alone (affacendo,
 * affece, affarà — all matching the fare pattern); Treccani has no entry for
 * it to cross-check against.
 */
const FARE_COMPOUNDS_AS_ARE = new Set([
  "affare",
  "contraffare",
  "mansuefare",
  "sfare",
  "torrefare",
  "tumefare",
])

/**
 * Compounds of fare whose regular -are forms are also in use (*disfo*,
 * *soddisfo*): Accademia della Crusca and Treccani. For other compounds the
 * regular form is a mistake.
 */
const FARE_REGULAR_ALSO = new Set(["disfare", "soddisfare"])

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
  // Treccani lists "disfàccio o disfò o disfo … disfacciamo o disfiamo", but
  // for the imperative only "disfà o disfài o disfa'". Accademia della Crusca:
  // *soddisfaccio* and *soddisfo* are both correct.
  const valid = new Map<string, AlternativeKind>()
  for (const [kind, forms] of Object.entries(fareAlternatives))
    for (const f of forms ?? []) valid.set(prefix + f, kind as AlternativeKind)
  const tensePath = tenseOf(featurePath)
  if (
    FARE_REGULAR_ALSO.has(infinitive) &&
    FARE_REGULAR_TENSES.includes(tensePath) &&
    regular
  )
    valid.set(regular, tensePath === PATH.impr.pres ? "colloquial" : "common")
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
 *   plain      the stem without the diphthong: sed-, coc-, rot-
 *   diphthong  the stem with it: sied-, cuoc-, ruot-
 *   literary   a third stem, used in literary Italian: segg- (seggo)
 *   keep       "always" — the diphthong is kept in every form (the -ere -uo-
 *              verbs); "stressed" — kept where the stem is stressed, and also
 *              in the future and conditional (the -ie- verbs); "stressedOnly"
 *              — kept only where the stem is stressed, not in the future or
 *              conditional (the -are -uo- verbs: *rotare* → *ruoto*, but
 *              *roterò*, not *ruoterò*)
 *   plainAlso  the kind of alternative the plain form is where the diphthong
 *              is chosen for "stressedOnly", when it is also in use: English
 *              Wiktionary labels *affoco* poetic beside *affuoco*. Left unset
 *              for the rest of the group, which Wiktionary gives no plain
 *              alternate for at all.
 *
 * The grammar and the decisions behind these are in scripts/derive.ts, above
 * gerundFromImperfect, and in notes/to-verify.md. The -are group was checked
 * against English Wiktionary's tables 2026-09-29: unlike the -ere group, they
 * give no diphthong at all for noi/voi or the future, not even as an
 * alternate — see notes/reports/wiktionary/summary.md.
 */
type MobileDiphthong = {
  plain: string
  diphthong: string
  literary?: string
  keep: "always" | "stressed" | "stressedOnly"
  plainAlso?: AlternativeKind
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
  // English Wiktionary labels the plain form "poetic"; no such kind exists in
  // ALTERNATIVES, so it is recorded as literary, the closest existing kind.
  affocare: {
    plain: "affoc",
    diphthong: "affuoc",
    keep: "stressedOnly",
    plainAlso: "literary",
  },
  infocare: { plain: "infoc", diphthong: "infuoc", keep: "stressedOnly" },
  risolare: { plain: "risol", diphthong: "risuol", keep: "stressedOnly" },
  risonare: { plain: "rison", diphthong: "risuon", keep: "stressedOnly" },
  rotare: { plain: "rot", diphthong: "ruot", keep: "stressedOnly" },
  scorare: { plain: "scor", diphthong: "scuor", keep: "stressedOnly" },
  sonare: { plain: "son", diphthong: "suon", keep: "stressedOnly" },
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

  const kinds = ["diphthong", "literary", "plain"] as const
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
  const want = keep ? "diphthong" : "plain"
  const chosen = classified.find((c) => c.kind === want)
  if (!chosen) return null

  // The plain form is valid where the diphthong is chosen but the plain form
  // is also in use: rare for the -uo- verbs, formal (traditional) in the future
  // and conditional of the -ie- verbs. "stressedOnly" has no such alternate —
  // Wiktionary shows no plain form beside the stressed diphthong forms either.
  const plainKind: AlternativeKind | undefined = !keep
    ? undefined
    : stems.keep === "always"
      ? "rare"
      : keptTense
        ? "formal"
        : stems.plainAlso
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
 * Verbs whose weak past historic is the standard, with the strong form a common
 * alternative: the -nettere family, *annettei* over *annessi*. Treccani:
 * "annettéi, meno com. annèssi", and connettere "conjugates like annettere";
 * English Wiktionary labels *annessi* uncommon.
 */
const WEAK_PAST_STANDARD = /nettere$/

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
      ? "weakEi"
      : ending.etti && f === stem + ending.etti
        ? "weakEtti"
        : f.endsWith(STRONG_PAST_ENDING[person])
          ? "strong"
          : undefined
  const classified = candidates.map((f) => ({ f, kind: kindOf(f) }))
  if (classified.some((c) => c.kind === undefined)) return null
  const has = (k: PastKind) => classified.find((c) => c.kind === k)

  let chosen = WEAK_PAST_STANDARD.test(infinitive)
    ? (has("weakEi") ?? has("weakEtti") ?? has("strong"))
    : has("strong")
  if (
    chosen?.kind === "strong" &&
    classified.filter((c) => c.kind === "strong").length > 1
  )
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

