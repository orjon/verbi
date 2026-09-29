/**
 * Compares the built verb data with Wiktionary's conjugation tables.
 *
 * Source: the Italian section of the English Wiktionary, as extracted by
 * wiktextract and published by kaikki.org — one JSON entry per line:
 *   https://kaikki.org/dictionary/Italian/kaikki.org-dictionary-Italian.jsonl
 * Saved as resources/kaikki-italian.jsonl (not committed, 771 MB).
 *
 * For every verb in data/verbs.json, and every form path Wiktionary's table
 * gives, it sorts the path into one status (see STATUS). It also compares the
 * auxiliary with lib/conjugation/aux.ts.
 *
 * Writes:
 *
 *   reports/wiktionary/check.json   every path that does not agree, by status
 *   reports/wiktionary/check.md     the same, as tables
 *
 * Run with: node scripts/check-wiktionary.ts
 */
import fs from "node:fs"
import readline from "node:readline"
import {
  formPath,
  GENDER,
  IMPERATIVE_PERSONS,
  PATH,
  PERSON,
  type AlternativeForms,
} from "./vocabulary.ts"
import { getAux, isDualAux } from "../lib/conjugation/aux.ts"

const KAIKKI_FILE = "resources/kaikki-italian.jsonl"
const VERBS_FILE = "data/verbs.json"
const ALTERNATIVES_FILE = "data/alternatives.json"
const OUT_DIR = "reports/wiktionary"

/**
 * What a form path can be, once compared.
 *
 *   agree         our form is one of Wiktionary's unlabelled forms
 *   agreeLabelled our form is in Wiktionary only with a label such as
 *                 literary or archaic, and Wiktionary has an unlabelled one
 *   accentOnly    our form differs from Wiktionary's only in the final accent
 *   alternative   our form is not in Wiktionary, but one of our alternatives is
 *   differ        neither our form nor any alternative is in Wiktionary
 *   ourEmpty      we have no form, Wiktionary has one
 *   wiktionaryEmpty
 *                 we have a form, Wiktionary marks the cell empty with "-"
 *
 * A cell that is empty in both counts as agree.
 */
const STATUS = {
  agree: "agree",
  agreeLabelled: "agreeLabelled",
  accentOnly: "accentOnly",
  alternative: "alternative",
  differ: "differ",
  ourEmpty: "ourEmpty",
  wiktionaryEmpty: "wiktionaryEmpty",
} as const

/** How Wiktionary writes an empty cell (a form a defective verb lacks). */
const NO_FORM = "-"
type Status = (typeof STATUS)[keyof typeof STATUS]

/**
 * Wiktionary labels that mark a form as less than standard. Other tags on a
 * form (Traditional, common, sometimes, …) are kept in the report but do not
 * count as a label. `Traditional` only marks an older stress spelling (sedètti
 * for sedétti), which disappears once the stress marks are removed.
 */
const LOWER_LABELS = new Set([
  "archaic",
  "colloquial",
  "dated",
  "dialectal",
  "error-unrecognized-form",
  "hypercorrect",
  "Latinate",
  "literary",
  "obsolete",
  "poetic",
  "proscribed",
  "rare",
  "regional",
  "uncommon",
])

/** The tags that say which form a table cell is. None of them is a label. */
const GRAMMAR_TAGS = new Set([
  "first-person",
  "second-person",
  "third-person",
  "singular",
  "plural",
  "indicative",
  "subjunctive",
  "conditional",
  "imperative",
  "infinitive",
  "gerund",
  "participle",
  "present",
  "imperfect",
  "past",
  "historic",
  "future",
])

interface WiktionaryForm {
  form: string
  labels: string[]
}

type Tree = { [key: string]: Tree | string | null }

/**
 * Removes Wiktionary's stress marks. Wiktionary writes the stress inside the
 * word (spìino, sedéte); Italian spelling only writes an accent on a final
 * vowel (parlò, sedé). Every accent except one on the last letter is removed.
 */
export const withoutStressMarks = (form: string): string => {
  const letters = [...form.normalize("NFD")]
  let last = letters.length - 1
  while (last > 0 && /\p{M}/u.test(letters[last])) last--
  return letters
    .filter((letter, index) => index >= last || !/\p{M}/u.test(letter))
    .join("")
    .normalize("NFC")
}

/** The form with every accent removed, to spot accent-only differences. */
const withoutAccents = (form: string): string =>
  form.normalize("NFD").replace(/\p{M}/gu, "")

const PERSON_BY_TAGS: Record<string, string> = {
  "first-person singular": PERSON.s1,
  "second-person singular": PERSON.s2,
  "third-person singular": PERSON.s3,
  "first-person plural": PERSON.p1,
  "second-person plural": PERSON.p2,
  "third-person plural": PERSON.p3,
}

const personOf = (tags: Set<string>): string | undefined => {
  const person = ["first-person", "second-person", "third-person"].find((t) =>
    tags.has(t),
  )
  const number = ["singular", "plural"].find((t) => tags.has(t))
  return person && number ? PERSON_BY_TAGS[`${person} ${number}`] : undefined
}

/**
 * The form path of one Wiktionary table cell, or undefined for a cell we do not
 * compare: the negative and formal imperatives, and the auxiliary.
 *
 * Wiktionary gives each participle in the masculine singular only, so only the
 * masculine singular path is compared.
 */
const pathOf = (tags: Set<string>): string | undefined => {
  if (tags.has("infinitive")) return PATH.infi
  if (tags.has("gerund")) return PATH.geru
  if (tags.has("participle")) {
    if (tags.has("present")) return formPath(PATH.part.pres, GENDER.m)
    if (tags.has("past")) return formPath(PATH.part.past, GENDER.m)
    return undefined
  }
  const person = personOf(tags)
  if (!person) return undefined
  if (tags.has("imperative")) {
    if (tags.has("negative") || tags.has("formal")) return undefined
    if (!(IMPERATIVE_PERSONS as readonly string[]).includes(person))
      return undefined
    return formPath(PATH.impr.pres, person)
  }
  if (tags.has("conditional")) return formPath(PATH.cond.pres, person)
  if (tags.has("subjunctive")) {
    if (tags.has("present")) return formPath(PATH.subj.pres, person)
    if (tags.has("imperfect")) return formPath(PATH.subj.impf, person)
    return undefined
  }
  if (tags.has("indicative")) {
    if (tags.has("historic")) return formPath(PATH.indi.past, person)
    if (tags.has("present")) return formPath(PATH.indi.pres, person)
    if (tags.has("imperfect")) return formPath(PATH.indi.impf, person)
    if (tags.has("future")) return formPath(PATH.indi.futu, person)
  }
  return undefined
}

/**
 * The reflexive infinitive: accorgere → accorgersi. English Wiktionary lists
 * some verbs only in their reflexive form.
 */
const reflexiveOf = (infinitive: string): string =>
  infinitive.replace(/e$/, "si")

/**
 * A reflexive table cell without its pronoun: "mi accorgo" → accorgo,
 * accorgendosi → accorgendo, accorgiti → accorgi.
 */
const withoutPronoun = (form: string, tags: Set<string>): string => {
  const stripped = form.replace(/^(mi|ti|si|ci|vi) /, "")
  if (stripped !== form) return stripped
  if (tags.has("gerund") || tags.has("participle"))
    return form.replace(/si$/, "")
  if (tags.has("imperative")) return form.replace(/(ti|ci|vi)$/, "")
  return form
}

interface WiktionaryVerb {
  forms: Record<string, WiktionaryForm[]>
  auxiliaries: string[]
  /** True when the table is the reflexive verb's (accorgersi). */
  reflexive: boolean
}

/**
 * Reads the conjugation tables of the verbs we have. A verb can have several
 * entries (one per etymology); their tables are joined. Only table cells are
 * read (`source: "conjugation"`): the headword line repeats a few of them.
 *
 * The reflexive verb's table is read too, and used only for a verb with no
 * table of its own.
 */
const readWiktionary = async (
  plain: Set<string>,
): Promise<Record<string, WiktionaryVerb>> => {
  const wanted = new Set([...plain, ...[...plain].map(reflexiveOf)])
  const verbs: Record<string, WiktionaryVerb> = {}
  const lines = readline.createInterface({
    input: fs.createReadStream(KAIKKI_FILE),
  })
  for await (const line of lines) {
    if (!line.includes('"pos": "verb"')) continue
    const entry = JSON.parse(line)
    if (entry.pos !== "verb" || !wanted.has(entry.word)) continue
    const reflexive = !plain.has(entry.word)
    const tableForms = (entry.forms ?? []).filter(
      (f: { source?: string }) => f.source === "conjugation",
    )
    if (tableForms.length === 0) continue
    const verb = (verbs[entry.word] ??= {
      forms: {},
      auxiliaries: [],
      reflexive,
    })
    for (const cell of tableForms) {
      const tags = new Set<string>(cell.tags ?? [])
      const form = withoutStressMarks(
        reflexive ? withoutPronoun(cell.form, tags) : cell.form,
      )
      if (tags.has("auxiliary")) {
        if (!verb.auxiliaries.includes(form)) verb.auxiliaries.push(form)
        continue
      }
      const path = pathOf(tags)
      if (!path) continue
      const labels = [...tags, ...(cell.raw_tags ?? [])].filter(
        (t) => !GRAMMAR_TAGS.has(t),
      )
      const list = (verb.forms[path] ??= [])
      const existing = list.find((f) => f.form === form)
      if (!existing) list.push({ form, labels })
      // The same form unlabelled in one cell and labelled in another counts
      // as unlabelled.
      else if (!isLabelled(labels)) existing.labels = labels
    }
  }
  return verbs
}

const isLabelled = (labels: string[]): boolean =>
  labels.some((l) => LOWER_LABELS.has(l))

/** Flattens a verb's nested forms into form path → form. */
const flatten = (tree: Tree, prefix = ""): Record<string, string | null> => {
  const flat: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value === null || typeof value === "string") flat[path] = value
    else Object.assign(flat, flatten(value, path))
  }
  return flat
}

/** Our form at a path, joined from nested verbs.json paths like inf.pres. */
const ourForm = (flat: Record<string, string | null>, path: string) =>
  flat[path] ?? null

interface Finding {
  ours: string | null
  alternatives?: string[]
  wiktionary: string[]
}

const describe = (f: WiktionaryForm): string =>
  f.labels.length ? `${f.form} (${f.labels.join(", ")})` : f.form

const compare = (
  ours: string | null,
  alternatives: string[],
  wiktionary: WiktionaryForm[],
): Status => {
  const empty = wiktionary.some((f) => f.form === NO_FORM)
  const forms = wiktionary.filter((f) => f.form !== NO_FORM)
  if (ours === null)
    return empty || forms.every((f) => isLabelled(f.labels))
      ? STATUS.agree
      : STATUS.ourEmpty
  const match = forms.find((f) => f.form === ours)
  if (match) {
    const unlabelled = forms.some((f) => !isLabelled(f.labels))
    return isLabelled(match.labels) && unlabelled
      ? STATUS.agreeLabelled
      : STATUS.agree
  }
  if (forms.some((f) => withoutAccents(f.form) === withoutAccents(ours)))
    return STATUS.accentOnly
  if (alternatives.some((a) => forms.some((f) => f.form === a)))
    return STATUS.alternative
  return empty ? STATUS.wiktionaryEmpty : STATUS.differ
}

const allAlternatives = (kinds: AlternativeForms | undefined): string[] =>
  Object.values(kinds ?? {}).flat() as string[]

const check = async () => {
  const verbs: Record<string, Tree> = JSON.parse(
    fs.readFileSync(VERBS_FILE, "utf8"),
  )
  const alternatives: Record<
    string,
    Record<string, AlternativeForms>
  > = JSON.parse(fs.readFileSync(ALTERNATIVES_FILE, "utf8"))

  const wiktionary = await readWiktionary(new Set(Object.keys(verbs)))

  const counts: Record<Status, number> = {
    agree: 0,
    agreeLabelled: 0,
    accentOnly: 0,
    alternative: 0,
    differ: 0,
    ourEmpty: 0,
    wiktionaryEmpty: 0,
  }
  const findings: Record<
    Exclude<Status, "agree">,
    Record<string, Record<string, Finding>>
  > = {
    differ: {},
    ourEmpty: {},
    wiktionaryEmpty: {},
    accentOnly: {},
    agreeLabelled: {},
    alternative: {},
  }
  // Unlabelled Wiktionary forms we have neither as the form nor an alternative.
  const unrecorded: Record<string, Record<string, string[]>> = {}
  const notInWiktionary: string[] = []
  const fromReflexive: string[] = []
  const auxiliary: Record<
    string,
    { ours: string; dual: boolean; wiktionary: string[] }
  > = {}
  let verbsCompared = 0

  for (const [verb, tree] of Object.entries(verbs)) {
    const entry = wiktionary[verb] ?? wiktionary[reflexiveOf(verb)]
    if (!entry) {
      notInWiktionary.push(verb)
      continue
    }
    verbsCompared++
    if (entry.reflexive) fromReflexive.push(verb)
    const flat = flatten(tree)
    for (const [path, forms] of Object.entries(entry.forms)) {
      if (path === PATH.infi) continue
      const ours = ourForm(flat, path)
      const alts = allAlternatives(alternatives[verb]?.[path])
      const status = compare(ours, alts, forms)
      counts[status]++
      if (status !== STATUS.agree) {
        const finding: Finding = { ours, wiktionary: forms.map(describe) }
        if (alts.length) finding.alternatives = alts
        ;(findings[status][verb] ??= {})[path] = finding
      }
      const missing = forms
        .filter((f) => f.form !== NO_FORM && !isLabelled(f.labels))
        .map((f) => f.form)
        .filter((f) => f !== ours && !alts.includes(f))
      if (missing.length && status !== STATUS.ourEmpty)
        (unrecorded[verb] ??= {})[path] = missing
    }
    const ourAux = getAux(verb) === "ESSERE" ? "essere" : "avere"
    // A reflexive table always gives essere, which says nothing about the
    // plain verb.
    if (
      !entry.reflexive &&
      entry.auxiliaries.length &&
      !entry.auxiliaries.includes(ourAux)
    )
      auxiliary[verb] = {
        ours: ourAux,
        dual: isDualAux(verb),
        wiktionary: entry.auxiliaries,
      }
  }

  const report = {
    source: KAIKKI_FILE,
    generated: new Date().toISOString(),
    verbs: Object.keys(verbs).length,
    verbsCompared,
    counts,
    notInWiktionary,
    fromReflexive,
    findings,
    auxiliary,
    unrecorded,
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(`${OUT_DIR}/check.json`, JSON.stringify(report, null, 1))
  fs.writeFileSync(`${OUT_DIR}/check.md`, toMarkdown(report))

  console.log(`Verbs: ${report.verbs}, compared: ${verbsCompared}`)
  console.log(`Compared with the reflexive table: ${fromReflexive.length}`)
  console.log(`Not in Wiktionary: ${notInWiktionary.length}`)
  for (const [status, n] of Object.entries(counts))
    console.log(`  ${status}: ${n}`)
  console.log(`Auxiliary disagreements: ${Object.keys(auxiliary).length}`)
  console.log(`Wrote ${OUT_DIR}/check.json and ${OUT_DIR}/check.md`)
}

const SECTION_TITLES: Record<Exclude<Status, "agree">, string> = {
  differ: "Differ — neither our form nor an alternative is in Wiktionary",
  ourEmpty: "Our form is empty — Wiktionary has one",
  wiktionaryEmpty: "We have a form — Wiktionary marks the cell empty",
  accentOnly: "Accent only — same letters, different final accent",
  agreeLabelled:
    "Our form is one Wiktionary labels (literary, archaic, …), and it has an unlabelled one",
  alternative: "Our form is not in Wiktionary, but one of our alternatives is",
}

const toMarkdown = (report: {
  verbs: number
  verbsCompared: number
  generated: string
  counts: Record<Status, number>
  notInWiktionary: string[]
  fromReflexive: string[]
  findings: Record<string, Record<string, Record<string, Finding>>>
  auxiliary: Record<string, { ours: string; dual: boolean; wiktionary: string[] }>
  unrecorded: Record<string, Record<string, string[]>>
}): string => {
  const out: string[] = []
  out.push("# Wiktionary check", "")
  out.push(
    `Generated ${report.generated} by \`scripts/check-wiktionary.ts\`. ` +
      `${report.verbsCompared} of ${report.verbs} verbs have a Wiktionary table.`,
    "",
  )
  out.push("| Status | Form paths |", "|---|---|")
  for (const [status, n] of Object.entries(report.counts))
    out.push(`| ${status} | ${n} |`)
  out.push(`| auxiliary disagreements | ${Object.keys(report.auxiliary).length} |`)
  out.push("")
  for (const [status, byVerb] of Object.entries(report.findings)) {
    const title = SECTION_TITLES[status as Exclude<Status, "agree">]
    const rows = Object.entries(byVerb).flatMap(([verb, paths]) =>
      Object.entries(paths).map(
        ([path, f]) =>
          `| ${verb} | ${path} | ${f.ours ?? "—"} | ${f.alternatives?.join(", ") ?? ""} | ${f.wiktionary.join(", ")} |`,
      ),
    )
    out.push(`## ${title} (${rows.length})`, "")
    out.push("| Verb | Path | Ours | Our alternatives | Wiktionary |")
    out.push("|---|---|---|---|---|", ...rows, "")
  }
  out.push(`## Auxiliary (${Object.keys(report.auxiliary).length})`, "")
  out.push("| Verb | Ours | Dual in aux.ts | Wiktionary |", "|---|---|---|---|")
  for (const [verb, a] of Object.entries(report.auxiliary))
    out.push(`| ${verb} | ${a.ours} | ${a.dual ? "yes" : ""} | ${a.wiktionary.join(", ")} |`)
  out.push("")
  const unrecordedRows = Object.entries(report.unrecorded).flatMap(
    ([verb, paths]) =>
      Object.entries(paths).map(
        ([path, forms]) => `| ${verb} | ${path} | ${forms.join(", ")} |`,
      ),
  )
  out.push(
    `## Unlabelled Wiktionary forms we do not record (${unrecordedRows.length})`,
    "",
    "Forms Wiktionary gives without a label that are neither our form nor one of our alternatives. Candidates for new alternatives.",
    "",
    "| Verb | Path | Wiktionary forms |",
    "|---|---|---|",
    ...unrecordedRows,
    "",
  )
  out.push(
    `## Verbs compared with the reflexive table (${report.fromReflexive.length})`,
    "",
    "These have no table of their own; the reflexive verb's table was used, without its pronouns.",
    "",
    report.fromReflexive.join(", "),
    "",
  )
  out.push(
    `## Verbs with no Wiktionary table (${report.notInWiktionary.length})`,
    "",
    report.notInWiktionary.join(", "),
    "",
  )
  return out.join("\n")
}

check()
