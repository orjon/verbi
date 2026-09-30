/**
 * Groups of verbs that the correction rules in scripts/corrections.ts apply
 * to — which verbs, and the evidence for each list. What each rule then does
 * with its group lives in scripts/corrections.ts.
 */
import {
  ALTERNATIVE,
  type AlternativeKind,
  PATH,
  PATH_TO,
} from "../scripts/vocabulary.ts"
import type { MobileDiphthong } from "../types/build.ts"

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
export const NO_PRESENT_PARTICIPLE = new Set<string>([
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
 * is more restrictive still — Treccani: "è usato solo nella 3a pers. sing.
 * dell'indic. pres." (singular only, not even the plural this class keeps)
 * — so it is handled by override instead, not added here.
 */
export const STATE_VERBS = ["vigere", "accadere"]

/**
 * Sensation, where the person who feels it is an indirect pronoun and the cause
 * is the subject: *mi prude il piede*, *mi prudono i piedi*.
 */
export const SENSATION_VERBS = ["incombere", "increscere", "prudere", "rincrescere"]

export const THIRD_PERSON_ONLY = new Set<string>([
  ...WEATHER_VERBS,
  ...STATE_VERBS,
  ...SENSATION_VERBS,
])

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
export const NO_PAST_PARTICIPLE = new Set<string>([
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
 * -ire verbs that take -isc- (*abbrutisco*), which Morph-it gives only without
 * it (*abbruto*). Treccani gives -isc- for each ("io abbrutisco, tu
 * abbrutisci, ecc."), and so does English Wiktionary. Checked 2026-09-29; see
 * notes/reports/wiktionary/summary.md.
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
 * Treccani: "io aggrinzisco o aggrinzo".
 */
export const ISC_AND_PLAIN = new Set(["aggrinzire"])

/**
 * -iare verbs whose i is stressed in the present (*devìo*), so an ending i
 * keeps it: *devii*, *deviino*, not *devi*, *devino*. Morph-it gives the forms
 * of an unstressed-i verb (*studi*, *studino*). Treccani marks the stress
 * ("io devìo", "io strio, tu strii"), Hoepli for piare ("pìo, -pìi"), and
 * English Wiktionary gives the stressed-i forms for all. riavviare, sciare and
 * sviare are confirmed by conjugation tables instead of Treccani. Checked
 * 2026-09-29; see notes/reports/wiktionary/summary.md.
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
export const ACCENTED_COMPOUNDS: Record<string, string> = {
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
export const ACCENT_PLAIN_ALSO = new Set(["disfare", "soddisfare"])

/**
 * The one-syllable forms without an accent of each base verb, by path, with
 * the accented form a compound takes.
 */
export const ONE_SYLLABLE_FORMS: Record<string, Record<string, [string, string]>> = {
  fare: { [PATH_TO.indi.pres.S3]: ["fa", "fà"] },
  stare: {
    [PATH_TO.indi.pres.S1]: ["sto", "stò"],
    [PATH_TO.indi.pres.S3]: ["sta", "stà"],
  },
  andare: { [PATH_TO.indi.pres.S3]: ["va", "và"] },
  sapere: {
    [PATH_TO.indi.pres.S1]: ["so", "sò"],
    [PATH_TO.indi.pres.S3]: ["sa", "sà"],
  },
  essere: { [PATH_TO.indi.past.S3]: ["fu", "fù"] },
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
export const PARTICIPLE_IENTE_VERBS = new Set([
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

export const FARE = "fare"

/**
 * Tenses where a compound of fare also has regular -are forms in use:
 * *dìsfo*, *dìsfi*, *disferò*. Wiktionary gives these beside the fare forms,
 * marked "sometimes proscribed, now more common". The imperative is included
 * for the same reason: *disfa* beside *disfa'*, as in "Disfa le valigie!".
 */
export const FARE_REGULAR_TENSES: string[] = [
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
export const FARE_COMPOUNDS_AS_ARE = new Set([
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
export const FARE_REGULAR_ALSO = new Set(["disfare", "soddisfare"])

/** The stems a MOBILE_DIPHTHONG entry can give, by the name of its field. */
export const STEM_KIND = { diphthong: "diphthong", literary: "literary", plain: "plain" } as const

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
export const MOBILE_DIPHTHONG: Record<string, MobileDiphthong> = {
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
    plainAlso: ALTERNATIVE.literary,
  },
  infocare: { plain: "infoc", diphthong: "infuoc", keep: "stressedOnly" },
  risolare: { plain: "risol", diphthong: "risuol", keep: "stressedOnly" },
  risonare: { plain: "rison", diphthong: "risuon", keep: "stressedOnly" },
  rotare: { plain: "rot", diphthong: "ruot", keep: "stressedOnly" },
  scorare: { plain: "scor", diphthong: "scuor", keep: "stressedOnly" },
  sonare: { plain: "son", diphthong: "suon", keep: "stressedOnly" },
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
export const FULL_FUTURE_STEM = new Set(["premorire", "riudire"])

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
 * alternative: the -nettere family, *annettei* over *annessi*. Treccani:
 * "annettéi, meno com. annèssi", and connettere "conjugates like annettere";
 * English Wiktionary labels *annessi* uncommon.
 */
export const WEAK_PAST_STANDARD = /nettere$/
