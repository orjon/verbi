import { ALTERNATIVE } from "./alternatives.ts"
import type { MobileDiphthong } from "../types/build.ts"

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
 * The grammar and the decisions behind these are in build-lexicon/scripts/derive.ts, above
 * gerundFromImperfect, and in notes/to-verify.md. The -are group was checked
 * against English Wiktionary's tables 2026-09-29: unlike the -ere group, they
 * give no diphthong at all for noi/voi or the future, not even as an
 * alternate.
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
  sedere: {
    plain: "sed",
    diphthong: "sied",
    literary: "segg",
    keep: "stressed",
  },
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

/** The stems a MOBILE_DIPHTHONG entry can give, by the name of its field. */
export const STEM_KIND = {
  diphthong: "diphthong",
  literary: "literary",
  plain: "plain",
} as const

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
