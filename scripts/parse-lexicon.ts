/**
 * Parses Morph-it! into the shape the app uses.
 *
 * Morph-it is a flat list of `form <tab> verb <tab> tag`. This turns the verb
 * lines into `infinitive -> mood -> tense -> slot`, rejecting any form whose tag
 * says it carries a clitic pronoun — which is the single largest source of
 * error in the published dictionary.
 */
import fs from "node:fs"
import {
  isInfinitiveOrGerund,
  isParticiple,
  participleSlot,
  personSlot,
} from "./slots.ts"

export const LEXICON = "resources/external/morph-it_048.txt"

/**
 * The shape of the verb forms parsed from the lexicon.
 *
 *  { [infinitive: string]: { [featurePath: string]: string[] } }
 *
 *  eg. {
 *    "parlare": {
 *      "impr.pres.S2": ["parla"],
 *      "ind.pres.P3":  ["parlan", "parlano"], ... },
 *    "sedere": {
 *      "ind.pres.P2":  ["sedete", "siedete"],
 *      "ind.impf.S3":  ["sedeva", "siedeva"], ... },
 *    }
 */
export interface VerbForms {
  [infinitive: string]: { [featurePath: string]: string[] }
}

/**
 * True when a Morph-it tag describes a verb form.
 *
 * Morph-it covers the whole language, so most of its 505,075 lines are nouns,
 * adjectives, articles and punctuation. Verb tags all begin `VER:`, as in
 * `VER:ind+pres+1+s`; everything else is skipped.
 *
 * The colon matters: it is the separator `removeType` splits on, so requiring
 * it here means anything reaching that function has one.
 */
const isVerb = (tag: string | undefined): boolean => {
  return tag !== undefined && tag.startsWith("VER:")
}

/**
 * Strips the word type from a Morph-it tag, leaving the description of the form.
 *
 * Every tag begins with its part of speech and a colon — `VER:`, `NOUN:`,
 * `ADJ:` — and the rest describes the form itself.
 *
 *   "VER:ind+pres+1+s"  ->  "ind+pres+1+s"
 *   "VER:inf+pres"      ->  "inf+pres"
 *
 * Returns an empty string for a tag with no colon, so a malformed tag falls
 * through whatever the caller does next rather than being sliced blindly.
 */
const removeType = (tag: string): string => {
  const colon = tag.indexOf(":")
  return colon === -1 ? "" : tag.slice(colon + 1)
}

/**
 * What a tag says about a form: its mood, its tense, and which slot it sits in.
 *
 * `slot` is null for the infinitive and gerund, which have a single form and no
 * person. Elsewhere it is a person and number (`S1`) or, for participles, a
 * number and gender (`SF`).
 */
export interface Features {
  mood: string
  tense: string
  slot: string | null
}

/**
 * The features of a form with no person: `inf+pres`, `ger+pres`.
 *
 * Returns null for any other two-part tag, since every other mood has a person.
 * Not exported: it trusts that `parts` has two entries, which `featuresOf` checks.
 */
const singleFormFeatures = (parts: string[]): Features | null => {
  const [mood, tense] = parts
  return isInfinitiveOrGerund(mood) ? { mood, tense, slot: null } : null
}

/**
 * The features of a form that varies: `part+past+s+m`, `ind+pres+1+s`.
 *
 * The last two parts mean different things depending on the mood — a participle
 * gives number then gender, everything else gives person then number — which is
 * why each has its own slot builder.
 *
 * Not exported: it trusts that `parts` has four entries, which `featuresOf` checks.
 */
const inflectedFormFeatures = (parts: string[]): Features | null => {
  const [mood, tense, third, fourth] = parts
  const slot = isParticiple(mood)
    ? participleSlot(third, fourth)
    : personSlot(third, fourth)
  return slot ? { mood, tense, slot } : null
}

/**
 * The grammatical features a Morph-it tag describes.
 *
 *   ind+pres+1+s   ->  { mood: 'ind',  tense: 'pres', slot: 'S1' }
 *   part+past+s+f  ->  { mood: 'part', tense: 'past', slot: 'SF' }
 *   inf+pres       ->  { mood: 'inf',  tense: 'pres', slot: null }
 *   inf+pres+li    ->  null
 *
 * Takes the tag with its word type already removed, so `VER:` is gone by the
 * time it arrives. The last case returns null because the form carries a clitic
 * pronoun — `parlarvi` rather than `parlare` — and those are not kept.
 */
/**
 * The key a form is stored under, from its features:
 *
 *   { mood: 'ind', tense: 'pres', slot: 'S1' }   ->  "ind.pres.S1"
 *   { mood: 'inf', tense: 'pres', slot: null }   ->  "inf.pres"
 *
 * The infinitive and gerund have no slot, so their key has two parts.
 */
const pathOf = ({ mood, tense, slot }: Features): string =>
  slot ? `${mood}.${tense}.${slot}` : `${mood}.${tense}`

/**
 * Appends a form to the list of candidates for a slot, creating the verb's map
 * and the slot's list on first use.
 *
 * Morph-it can give several forms for one slot. All are kept; build.ts chooses.
 */
const addVerbForm = (
  verbForms: VerbForms,
  infinitive: string,
  featurePath: string,
  verbForm: string,
) => {
  const verb = (verbForms[infinitive] ??= {})
  const formOptions = (verb[featurePath] ??= [])
  formOptions.push(verbForm)
}

const featuresOf = (verbTags: string): Features | null => {
  const parts = verbTags.split("+")

  if (parts.length === 2) return singleFormFeatures(parts)
  if (parts.length === 4) return inflectedFormFeatures(parts)

  // Only two and four parts are valid. A clitic pronoun adds one part to
  // whichever shape it attaches to, so three and five mean the form carries
  // one — `ger+pres+ci`, `impr+pres+2+p+vi` — and those are not kept.
  return null
}

export const parseLexicon = (
  file = LEXICON,
): { verbForms: VerbForms; stats: Record<string, number> } => {
  const verbForms: VerbForms = {}
  const stats = { lines: 0, verbLines: 0, rejected: 0, stored: 0 }

  // Read the file line by line, skipping non-verb lines and parsing verb lines.
  for (const line of fs.readFileSync(file, "latin1").split("\n")) {
    stats.lines++
    const [verbForm, infinitive, tag] = line.split("\t")
    if (!isVerb(tag)) continue
    const verbTags = removeType(tag)
    stats.verbLines++

    const features = featuresOf(verbTags)
    if (!features) {
      // Every rejected tag in this file carries a clitic pronoun —
      // `ger+pres+ci`, `impr+pres+2+p+vi`. See featuresOf for the valid shapes.
      stats.rejected++
      continue
    }

    addVerbForm(verbForms, infinitive, pathOf(features), verbForm)
    stats.stored++
  }
  return { verbForms, stats }
}

if (process.argv[1]?.endsWith("parse-lexicon.ts")) {
  const { verbForms, stats } = parseLexicon()
  const verbs = Object.keys(verbForms)
  console.log("lines read        :", stats.lines.toLocaleString())
  console.log("verb lines        :", stats.verbLines.toLocaleString())
  console.log("  stored          :", stats.stored.toLocaleString())
  console.log("  rejected        :", stats.rejected.toLocaleString())
  console.log("distinct verbs   :", verbs.length.toLocaleString())

  let single = 0,
    multi = 0
  const examples: string[] = []
  for (const [infinitive, paths] of Object.entries(verbForms))
    for (const [path, forms] of Object.entries(paths)) {
      const uniq = [...new Set(forms)]
      if (uniq.length === 1) single++
      else {
        multi++
        if (examples.length < 10)
          examples.push(`${infinitive} ${path}: ${uniq.join(" / ")}`)
      }
    }
  console.log("\nslots with one candidate :", single.toLocaleString())
  console.log("slots with several       :", multi.toLocaleString())
  console.log("\nexamples of collision:")
  examples.forEach((e) => console.log("   " + e))
}
