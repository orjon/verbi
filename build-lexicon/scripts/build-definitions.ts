/**
 * Builds lexicons/it-definitions.json: each verb's English definitions, as
 * Wiktionary gives them. One string per sense, in Wiktionary's order, so a
 * verb with several meanings has several strings:
 *
 *   { "cominciare": ["to begin, to start, to commence, to set about"] }
 *
 * A sense that has a line of detail under it keeps it in the same string,
 * after a dash. A verb with no definition is left out. The text is Wiktionary's
 * (CC BY-SA 4.0).
 */
import fs from "node:fs"
import readline from "node:readline"
import { DEFINITIONS_FILE, KAIKKI_FILE } from "../constants/paths.ts"
import { sortKeys } from "../utils/index.ts"

/** Sense tags that say the sense only points at another word's form. */
const FORM_TAGS = new Set(["form-of", "alt-of", "inflection-of"])

/** Reads each verb's definitions from the Wiktionary download. */
export const readDefinitions = async (
  verbs: Set<string>,
): Promise<Record<string, string[]>> => {
  const definitions: Record<string, string[]> = {}
  const lines = readline.createInterface({
    input: fs.createReadStream(KAIKKI_FILE),
  })
  for await (const line of lines) {
    if (!line.includes('"pos": "verb"')) continue
    const entry = JSON.parse(line)
    if (entry.pos !== "verb" || !verbs.has(entry.word)) continue
    for (const sense of entry.senses ?? []) {
      const glosses: string[] = sense.glosses ?? []
      const tags: string[] = [...(sense.tags ?? []), ...(sense.raw_tags ?? [])]
      if (!glosses.length || tags.some((tag) => FORM_TAGS.has(tag))) continue
      const definition = glosses.join(" — ")
      const list = (definitions[entry.word] ??= [])
      if (!list.includes(definition)) list.push(definition)
    }
  }
  return definitions
}

/** Writes lexicons/it-definitions.json, one verb per line, alphabetical. */
export const writeDefinitions = (definitions: Record<string, string[]>) => {
  const sorted = sortKeys(definitions)
  const rows = Object.entries(sorted).map(
    ([verb, list]) => `  ${JSON.stringify(verb)}: ${JSON.stringify(list)}`,
  )
  fs.writeFileSync(DEFINITIONS_FILE, `{\n${rows.join(",\n")}\n}\n`)
}
