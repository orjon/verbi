/**
 * Rules that make one form of a verb from another form of the same verb.
 *
 * The build uses these to fill a slot that is still empty once Morph-it and
 * resources/overrides.json have been applied, and to make the clipped forms,
 * which are alternatives. They never replace a form.
 */
import {
  ALTERNATIVE,
  CONJUGATION,
  ENDING,
  PATH,
  PATH_TO,
  PERSON,
} from "./vocabulary.ts"

/** The two kinds a clipped form can be. */
type ClippedKind = typeof ALTERNATIVE.clipped_common | typeof ALTERNATIVE.clipped_poetic

/**
 * Makes the gerund from the imperfect's `io` form. They share a stem:
 *
 *   parlavo → parlando    facevo → facendo    dicevo → dicendo
 *
 * Checked against every verb that has both forms in Morph-it: it gives
 * Morph-it's gerund for 6,058 of 6,061. The three it does not fit already have
 * a gerund from Morph-it, so this is never used for them:
 *
 *   essere, riessere   `ero` has no stem to take, so this returns null
 *   empire             empivo → empiendo, not empendo
 *
 * Grammar notes on the gerund, and the overrides that follow from them:
 *
 * Every gerund ends in -ando or -endo. Verbs in -are take -ando; verbs in -ere
 * and -ire take -endo. Irregular verbs change the stem, never the ending.
 *
 * `fare` and its compounds take -endo, not -ando, because `fare` is a shortened
 * form of Latin `facere`. The same holds for the other shortened infinitives,
 * which take -endo on the longer stem their imperfect shows:
 *
 *   fare → facendo   dire → dicendo   bere → bevendo   porre → ponendo
 *
 * Taking the stem from the imperfect covers all of these without a list.
 *
 * `disfando` and `soddisfando`, which Morph-it gives alongside `disfacendo` and
 * `soddisfacendo`, treat the verb as a regular -are verb. They are errors;
 * Wiktionary lists only the -facendo forms. The -facendo forms are set in
 * resources/overrides.json.
 *
 * The -ie- and -uo- in stems such as `sied-` and `scuot-` are "mobile
 * diphthongs" (dittongo mobile). Traditionally they appear only when the stress
 * falls on the stem, and drop when it moves to the ending:
 *
 *   sìedo, but sedévo and sedèndo
 *
 * How far modern Italian still follows that depends on the diphthong and the
 * tense. Checked against Wiktionary's conjugation tables:
 *
 *   - -ie- in the imperfect, gerund and noi/voi present: still drops.
 *     sedevo, sedendo, sediamo — `siedevo` and `siedendo` are wrong.
 *   - -ie- in the future and conditional: now kept. Both forms are valid, but
 *     Wiktionary marks `siederò` "now more common, especially in speech" and
 *     `sederò` traditional, and Morph-it gives only the -ie- forms for sedere.
 *     So the modern form is used: siederò, siederei.
 *   - -uo-: kept in unstressed forms too — scuotendo, percuotevo, cuocerò.
 *     Wiktionary marks `scotendo`, `percotevo` and `cocerò` as rare.
 *   - -uo- in nuocere's past participle: the exception. `nociuto` leads and
 *     `nuociuto` is marked rare.
 *   - A syllable ending in a consonant never takes the diphthong, even under
 *     stress: scossi, cossi, nocqui.
 *
 * So no single choice fits every verb — the diphthongs go different ways, and
 * even -ie- differs by tense. Each verb's choice is set in `MOBILE_DIPHTHONG`
 * and applied by `resolveDiphthong` in scripts/corrections.ts, which settles
 * Morph-it's conflicts between the two stems. The one remaining override is
 * `siederò` for sedere's future, a slot Morph-it left empty. Each decision is
 * recorded in notes/to-verify.md, under *Gerunds and present participles*
 * and *Two stems throughout, and the fare family*.
 */
export const gerundFromImperfect = (imperfect: string): string | null => {
  for (const group of [CONJUGATION.are, CONJUGATION.ere, CONJUGATION.ire]) {
    const ending = ENDING.impf[group]
    if (imperfect.endsWith(ending))
      return imperfect.slice(0, -ending.length) + ENDING.geru[group]
  }
  return null
}

/**
 * Makes one imperative slot from the present indicative of the same verb:
 *
 *   tu    -are verbs: the present lui/lei form   parlare → parla
 *         other verbs: the present tu form        credere → credi, finire → finisci
 *   noi   the present noi form                    parliamo
 *   voi   the present voi form                    parlate
 *
 * Taking the forms from the present, rather than from the infinitive, carries
 * over irregular stems and the -isc- of finire-type verbs without a list.
 *
 * Checked against every verb that has both tenses in Morph-it: it gives
 * Morph-it's imperative for 17,911 of 17,926 slots. The 15 it does not fit
 * already have an imperative, so this is never used for them:
 *
 *   avere, riavere, essere, riessere, sapere   abbi, sii, sappi — and their voi forms
 *   dare, malfare                              dai, malfa'
 *   imbestialire, rammollire, rincivilire      errors in Morph-it itself, now
 *                                              corrected by override
 *
 * Returns null when the present form it needs is missing.
 */
export const imperativeFromPresent = (
  infinitive: string,
  present: Record<string, string>,
  person: string,
): string | null => {
  if (person === PERSON.s2)
    return (
      (infinitive.endsWith(CONJUGATION.are)
        ? present[PERSON.s3]
        : present[PERSON.s2]) ?? null
    )
  if (person === PERSON.p1) return present[PERSON.p1] ?? null
  if (person === PERSON.p2) return present[PERSON.p2] ?? null
  return null
}

/**
 * The slots where every verb has a clipped form (apocope, troncamento): the
 * infinitive, and the loro form of seven tenses. Each ends in a vowel that can
 * be dropped — *parlare → parlar*, *parlano → parlan*.
 */
const CLIPPED_SLOTS: string[] = [
  PATH.infi,
  PATH_TO.indi.pres.P3,
  PATH_TO.indi.impf.P3,
  PATH_TO.indi.past.P3,
  PATH_TO.indi.futu.P3,
  PATH_TO.cond.pres.P3,
  PATH_TO.subj.pres.P3,
  PATH_TO.subj.impf.P3,
]

/**
 * Clipped forms in everyday use, by verb and path. Every other clipped form is
 * clipped_poetic. The present loro in -nno (*hanno → han*) is always common, so
 * it is not listed; see clippedKind. `volere`'s present lui/lei (*vuol*) is the
 * one clipped form outside CLIPPED_SLOTS, so listing it here also makes
 * clippedForms clip that slot. Decided in notes/to-verify.md, item 8.
 */
const CLIPPED_COMMON: Record<string, string[]> = {
  avere: [PATH.infi],
  dire: [PATH.infi],
  essere: [PATH.infi, PATH_TO.indi.pres.P3],
  fare: [PATH.infi],
  sapere: [PATH.infi],
  volere: [
    PATH_TO.indi.pres.S3,
    PATH_TO.indi.pres.P3,
  ],
}

/**
 * Clips a form: drops its final vowel, or -no from -nno, or -re from an
 * infinitive in -rre.
 *
 *   parlano → parlan     avere → aver       vuole → vuol
 *   parleranno → parleran   hanno → han     porre → por
 *
 * The -rre infinitives keep a single r (*por fine*, *trar vantaggio*); Morph-it
 * gives *porr*, *trarr*, which are not Italian. Returns null for a form that
 * does not end in -e or -o.
 */
export const clipForm = (form: string): string | null => {
  if (form.endsWith("rre")) return form.slice(0, -2)
  if (form.endsWith("nno")) return form.slice(0, -2)
  if (/[eo]$/.test(form)) return form.slice(0, -1)
  return null
}

/**
 * The kind of a verb's clipped form at a path. It is common when:
 *
 *   - the verb and path are in CLIPPED_COMMON (*aver*, *son*, *vuol*)
 *   - it is a present loro in -nno (*han*, *fan*)
 *   - it is the infinitive of a -rre verb (*por*, *trar*, *condur* — every -rre
 *     verb is a compound of porre, trarre or -durre, and these are in everyday
 *     use: *por fine*, *trar vantaggio*)
 *
 * and poetic otherwise.
 */
export const clippedKind = (
  infinitive: string,
  featurePath: string,
  standard: string,
): ClippedKind =>
  CLIPPED_COMMON[infinitive]?.includes(featurePath) ||
  (featurePath === PATH_TO.indi.pres.P3 &&
    standard.endsWith("nno")) ||
  (featurePath === PATH.infi && standard.endsWith("rre"))
    ? ALTERNATIVE.clipped_common
    : ALTERNATIVE.clipped_poetic

/**
 * Makes every clipped form of a verb from its finished standard forms, with its
 * kind. A slot with no standard form — a defective verb, a third-person-only
 * verb — has none.
 *
 * formAt returns the verb's standard form at a path, or undefined.
 *
 * Returns, for avere:
 *   { "inf.pres": ["clipped_common", "aver"],
 *     "ind.pres.P3": ["clipped_common", "han"],
 *     "ind.impf.P3": ["clipped_poetic", "avevan"], ... }
 */
export const clippedForms = (
  infinitive: string,
  formAt: (featurePath: string) => string | undefined,
): Record<string, [ClippedKind, string]> => {
  const out: Record<string, [ClippedKind, string]> = {}
  const paths = new Set([...CLIPPED_SLOTS, ...(CLIPPED_COMMON[infinitive] ?? [])])
  for (const featurePath of paths) {
    const standard = formAt(featurePath)
    if (!standard) continue
    const clipped = clipForm(standard)
    if (clipped)
      out[featurePath] = [
        clippedKind(infinitive, featurePath, standard),
        clipped,
      ]
  }
  return out
}
