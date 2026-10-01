import { PATH, PATH_TO } from "./feature-paths.ts"

/**
 * Compounds of a verb with one-syllable forms, and the verb each is built on.
 * The compound form of a one-syllable form takes a written accent: *fa* →
 * *rifà*, *sto* → *sottostò*, *fu* → *rifù*. The accent is required when a
 * word is built from several words and its last part would be written without
 * an accent on its own (like tre → ventitré). English Wiktionary agrees for
 * all. A list, because the ending alone would catch costare (*costa*) or
 * mandare (*mando*). riavere is not here: it is spelled without h (*riò, rià*).
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
 * alternative: *disfà* and *disfa*, *soddisfà* and *soddisfa* are both in use.
 */
export const ACCENT_PLAIN_ALSO = new Set(["disfare", "soddisfare"])

/**
 * The one-syllable forms without an accent of each base verb, by path, with
 * the accented form a compound takes.
 */
export const ONE_SYLLABLE_FORMS: Record<
  string,
  Record<string, [string, string]>
> = {
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
 * *contraffò*), so no conflict reaches resolveFareCompound. These
 * (contraffare, mansuefare, torrefare, tumefare, and sfare apart from its
 * alternative present *sfò*) conjugate like fare, and English Wiktionary
 * agrees. A list, because the ending cannot tell a compound from tuffare or
 * fotografare.
 *
 * affare added later the same day on Wiktionary's forms alone (affacendo,
 * affece, affarà — all matching the fare pattern); no second source was checked.
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
 * *soddisfo*): both forms are in use. For other compounds the regular form is
 * a mistake.
 */
export const FARE_REGULAR_ALSO = new Set(["disfare", "soddisfare"])
