/**
 * Rules that make one form of a verb from another form of the same verb.
 *
 * The build uses these to fill a slot that is still empty once Morph-it and
 * resources/overrides.json have been applied. They never replace a form.
 */

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
 *   - -ie- still follows this: sedendo, possedendo, risedendo, soprassedendo.
 *     `siedevo` and `siedendo` are wrong in modern Italian.
 *   - -uo- mostly no longer does: modern Italian keeps it in unstressed forms
 *     too, giving scuotendo, percuotendo, riscuotendo, cuocendo. Wiktionary
 *     marks `scotendo`, `percotendo` and `cocendo` as rare.
 *
 * So the two diphthongs go in opposite directions, and no single rule picks the
 * right form for both. Those verbs are set in resources/overrides.json: the
 * imperfect `io` form for the sedere and percuotere families (this rule then
 * makes their gerund), and the gerund itself for cuocere.
 */
export const gerundFromImperfect = (imperfect: string): string | null => {
  if (imperfect.endsWith("avo")) return imperfect.slice(0, -3) + "ando"
  if (/[ei]vo$/.test(imperfect)) return imperfect.slice(0, -3) + "endo"
  return null
}
