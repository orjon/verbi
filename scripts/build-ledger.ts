/**
 * The shape of, and the writer for, resources/verb-ledger.json: one flat
 * per-path record per verb, holding where every form came from, its
 * alternatives, and — checked live against Wiktionary every time this runs
 * (see compareAgainstWiktionary below) — what independently confirms it or
 * disagrees with it.
 *
 * No collapsing: every path a verb has gets its own entry, with its own
 * value. data/verbs.json is the small, shippable file; this is the dev-only
 * record everything was decided from.
 */
import fs from "node:fs"
import readline from "node:readline"
import {
  ALTERNATIVE,
  ALTERNATIVES,
  formPath,
  IMPERATIVE_PERSONS,
  PATH,
  PATH_TO,
  type AlternativeKind,
} from "./vocabulary.ts"
import type { Checks, FormCheck, Tree } from "../types/build.ts"
import { REFLEXIVE_SUFFIX } from "../constants/index.ts"
import { sortKeys } from "../utils/index.ts"
import {
  ALTERNATIVE_KIND_BY_LABEL,
  CHECKS_FILE,
  COMPACT_KEYS,
  DISQUALIFYING_LABELS,
  GRAMMAR_TAGS,
  KAIKKI_FILE,
  LEDGER_FILE,
  LILLIAN_SOURCES,
  NO_FORM,
  PERSON_BY_TAGS,
  SOURCE,
  SOFTENING_LABELS,
  STATS_FILE,
  VERDICT,
} from "../constants/build.ts"
import type {
  CompareStatus,
  LedgerAlternative,
  LedgerAlternatives,
  LedgerLeaf,
  VerbLedger,
  VerbLedgerEntry,
  WiktionaryForm,
  WiktionaryVerb,
} from "../types/verb-ledger.ts"
// Re-exported: scripts/build.ts declares its working ledger with this.
export type { VerbLedger } from "../types/verb-ledger.ts"

// ---------------------------------------------------------------------------
// Reading Wiktionary's conjugation tables (kaikki.org's Italian extract).
// ---------------------------------------------------------------------------

/**
 * The kind a Wiktionary form's tags give it: null when a tag disqualifies it,
 * else the first non-common kind a register label maps to, else common. Tags
 * that are neither are notes, and ignored (see ALTERNATIVE_KIND_BY_LABEL).
 */
const labelKind = (labels: string[]): AlternativeKind | null => {
  if (labels.some((l) => DISQUALIFYING_LABELS.has(l))) return null
  if (labels.some((l) => SOFTENING_LABELS.has(l))) return ALTERNATIVE.common
  return (
    labels
      .map((l) => ALTERNATIVE_KIND_BY_LABEL[l])
      .find((k) => k !== undefined && k !== ALTERNATIVE.common) ??
    ALTERNATIVE.common
  )
}

/** True when a form's tags mark it as less than standard, or not valid. */
const isLabelled = (labels: string[]): boolean =>
  labelKind(labels) !== ALTERNATIVE.common

/** How marked a form's tags are: 0 standard, 1 a register, 2 not valid. */
const markedness = (labels: string[]): number => {
  const kind = labelKind(labels)
  return kind === ALTERNATIVE.common ? 0 : kind === null ? 2 : 1
}

/**
 * Removes Wiktionary's stress marks. Wiktionary writes the stress inside the
 * word (spìino, sedéte); Italian spelling only writes an accent on a final
 * vowel (parlò, sedé). Every accent except one on the last letter is removed.
 */
const withoutStressMarks = (form: string): string => {
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

const personOf = (tags: Set<string>): string | undefined => {
  const person = ["first-person", "second-person", "third-person"].find((t) =>
    tags.has(t),
  )
  const number = ["singular", "plural"].find((t) => tags.has(t))
  return person && number ? PERSON_BY_TAGS[`${person} ${number}`] : undefined
}

/**
 * The form path of one Wiktionary table cell, or undefined for a cell we do
 * not compare: the negative and formal imperatives, and the auxiliary.
 *
 * Wiktionary gives each participle in the masculine singular only, so only
 * the masculine singular path is compared.
 */
const pathOf = (tags: Set<string>): string | undefined => {
  if (tags.has("infinitive")) return PATH.infi
  if (tags.has("gerund")) return PATH.geru
  if (tags.has("participle")) {
    if (tags.has("present")) return PATH_TO.part.pres.S
    if (tags.has("past")) return PATH_TO.part.past.S
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
  infinitive.replace(/e$/, REFLEXIVE_SUFFIX)

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
      // The same form in two cells counts as its least marked: standard in
      // one and literary in another is standard.
      else if (markedness(labels) < markedness(existing.labels))
        existing.labels = labels
    }
  }
  return verbs
}

/** Flattens a verb's nested data/verbs.json tree into form path → form. */
const flattenVerbTree = (tree: Tree, prefix = ""): Record<string, string> => {
  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === "string") flat[path] = value
    else Object.assign(flat, flattenVerbTree(value, path))
  }
  return flat
}

const compareForms = (
  ours: string | null,
  alternativeValues: string[],
  wiktionary: WiktionaryForm[],
): CompareStatus => {
  const empty = wiktionary.some((f) => f.form === NO_FORM)
  const forms = wiktionary.filter((f) => f.form !== NO_FORM)
  if (ours === null)
    return empty || forms.every((f) => isLabelled(f.labels))
      ? "agree"
      : "ourEmpty"
  const match = forms.find((f) => f.form === ours)
  if (match) {
    const unlabelled = forms.some((f) => !isLabelled(f.labels))
    return isLabelled(match.labels) && unlabelled ? "agreeLabelled" : "agree"
  }
  if (forms.some((f) => withoutAccents(f.form) === withoutAccents(ours)))
    return "accentOnly"
  if (alternativeValues.some((a) => forms.some((f) => f.form === a)))
    return "alternative"
  return empty ? "wiktionaryEmpty" : "differ"
}

/** Every value currently recorded as an alternative at a path, of any kind. */
const alternativeValues = (alts: LedgerAlternatives | undefined): string[] =>
  Object.values(alts ?? {}).flatMap((list) => list.map((a) => a.value))

/**
 * Adds a form to a path's alternatives, tagged with the source that gives it.
 * A value already recorded under that kind just gains the source.
 */
const addAlternative = (
  leaf: LedgerLeaf,
  kind: AlternativeKind,
  value: string,
  source: string,
) => {
  leaf.alternatives ??= {}
  const list = (leaf.alternatives[kind] ??= [])
  const existing = list.find((a) => a.value === value)
  if (!existing) list.push({ value, sources: [source] })
  else if (!existing.sources.includes(source)) existing.sources.push(source)
}

/** Marks a source as agreeing with (or differing from) one leaf's value. */
const markLeaf = (
  leaf: LedgerLeaf,
  source: string,
  status: CompareStatus,
  theirs: string[],
) => {
  if (
    status === "agree" ||
    status === "agreeLabelled" ||
    status === "accentOnly"
  ) {
    leaf.checked ??= []
    if (!leaf.checked.includes(source)) leaf.checked.push(source)
  } else if (status === "alternative" || status === "differ") {
    leaf.differs ??= {}
    leaf.differs[source] = theirs
  }
}

/** Compares one path's Wiktionary cell against the ledger, mutating it. */
const checkPath = (
  leaf: LedgerLeaf,
  ours: string | null,
  forms: WiktionaryForm[],
) => {
  const alts = alternativeValues(leaf.alternatives)
  const status = compareForms(ours, alts, forms)
  markLeaf(
    leaf,
    SOURCE.wiktionary,
    status,
    forms.map((f) => f.form),
  )

  // Any unlabelled-or-mappable form Wiktionary gives that is not our value
  // and not already a recorded alternative is a form we have no record of —
  // add it, with whichever kind its label (if any) maps to.
  for (const f of forms) {
    if (f.form === NO_FORM || f.form === ours || alts.includes(f.form)) continue
    const kind = labelKind(f.labels)
    if (kind) addAlternative(leaf, kind, f.form, SOURCE.wiktionary)
  }
}

/** Compares a verb's auxiliary against Wiktionary's, mutating the ledger. */
const checkAuxiliary = (
  entry: VerbLedgerEntry,
  wiktionaryAux: string[],
  fromReflexiveTable: boolean,
) => {
  // A reflexive table always gives essere, which says nothing about the
  // plain verb's own auxiliary.
  if (fromReflexiveTable || !wiktionaryAux.length) return
  for (const aux of [entry.auxiliary.primary, entry.auxiliary.secondary]) {
    if (!aux) continue
    if (wiktionaryAux.includes(aux.value)) {
      aux.checked ??= []
      if (!aux.checked.includes(SOURCE.wiktionary)) aux.checked.push(SOURCE.wiktionary)
    } else {
      aux.differs ??= {}
      aux.differs[SOURCE.wiktionary] = wiktionaryAux
    }
  }
}

/**
 * Checks every verb's every form, and its auxiliary, against Wiktionary's
 * conjugation tables — the one external, independent source checked at
 * scale (hand checks are separate: see applyChecks). Mutates the ledger in
 * place.
 */
const compareAgainstWiktionary = async (verbs: Tree, ledger: VerbLedger) => {
  const wiktionary = await readWiktionary(new Set(Object.keys(verbs)))
  let compared = 0
  let notInWiktionary = 0

  for (const [verb, tree] of Object.entries(verbs)) {
    const wikEntry = wiktionary[verb] ?? wiktionary[reflexiveOf(verb)]
    if (!wikEntry) {
      notInWiktionary++
      continue
    }
    compared++
    const entry = (ledger[verb] ??= {
      auxiliary: { primary: { value: "avere", source: "default" } },
    })
    const flat = flattenVerbTree(tree)
    for (const [path, forms] of Object.entries(wikEntry.forms)) {
      if (path === PATH.infi) continue
      const leaf: LedgerLeaf = (entry[path] ??= { source: "none" })
      checkPath(leaf, flat[path] ?? null, forms)
    }
    checkAuxiliary(entry, wikEntry.auxiliaries, wikEntry.reflexive)
  }
  return { compared, notInWiktionary }
}

// ---------------------------------------------------------------------------
// Writing the ledger.
// ---------------------------------------------------------------------------

/**
 * Marks a form (or auxiliary) as confirmed by a source. A Lillian check
 * (LILLIAN_SOURCES) sets `confirmed` and is never also listed in `checked`.
 */
const confirm = (
  target: { checked?: string[]; confirmed?: true },
  source: string,
) => {
  if (LILLIAN_SOURCES.has(source)) target.confirmed = true
  else if (!(target.checked ??= []).includes(source)) target.checked.push(source)
}

/** Records on a leaf that a source gives something other than our value. */
const recordDiffers = (leaf: LedgerLeaf, source: string, forms: string[]) => {
  leaf.differs ??= {}
  leaf.differs[source] = [...new Set([...(leaf.differs[source] ?? []), ...forms])]
}

/** Applies one check to a verb's auxiliary. */
const applyAuxiliaryCheck = (entry: VerbLedgerEntry, check: FormCheck) => {
  const { primary, secondary } = entry.auxiliary
  const aux = [primary, secondary].find((a) => a?.value === check.form)
  const positive = check.verdict === VERDICT.standard || check.verdict === VERDICT.variant
  if (aux && positive) confirm(aux, check.source)
  else if (check.form && check.verdict === VERDICT.standard) {
    primary.differs ??= {}
    primary.differs[check.source] = [check.form]
  }
}

/** Applies one check to one form path's ledger entry. */
const applyFormCheck = (leaf: LedgerLeaf, check: FormCheck) => {
  const { form, source, verdict } = check
  if (verdict === VERDICT.none) {
    if (leaf.value === undefined) confirm(leaf, source)
    else recordDiffers(leaf, source, [])
    return
  }
  if (form === undefined) return
  if (form === leaf.value) {
    if (verdict === VERDICT.absent) recordDiffers(leaf, source, [])
    else confirm(leaf, source)
    return
  }
  for (const [kind, list] of Object.entries(leaf.alternatives ?? {})) {
    const alt = list.find((a) => a.value === form)
    if (!alt) continue
    if (verdict === VERDICT.absent) (alt.differs ??= {})[source] = VERDICT.absent
    else {
      if (LILLIAN_SOURCES.has(source)) confirm(alt, source)
      else if (!alt.sources.includes(source)) alt.sources.push(source)
      if (verdict === VERDICT.standard) recordDiffers(leaf, source, [form])
      else if (check.kind && check.kind !== kind) (alt.differs ??= {})[source] = check.kind
    }
    return
  }
  // A form we have from no other source. A source not listing it says nothing
  // against us; a Lillian check that does list it only records it.
  if (verdict === VERDICT.absent) return
  if (verdict === VERDICT.standard || LILLIAN_SOURCES.has(source))
    recordDiffers(leaf, source, [form])
  else if (verdict === VERDICT.variant)
    addAlternative(leaf, check.kind ?? ALTERNATIVE.common, form, source)
}

/**
 * Applies every manual check in resources/checks.json to the ledger. Each
 * check names the exact form it looked at, so it only ever confirms that
 * word — never whatever a path's value has since become.
 */
const applyChecks = (ledger: VerbLedger, checks: Checks) => {
  for (const [verb, paths] of Object.entries(checks)) {
    const entry = ledger[verb]
    if (!entry) continue
    for (const [path, list] of Object.entries(paths))
      for (const check of list) {
        if (path === "auxiliary") applyAuxiliaryCheck(entry, check)
        else if (entry[path]) applyFormCheck(entry[path] as LedgerLeaf, check)
      }
  }
}

const compact = (value: unknown): string => {
  if (Array.isArray(value)) {
    if (!value.length) return "[]"
    return `[ ${value.map(compact).join(", ")} ]`
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
    if (!entries.length) return "{}"
    return `{ ${entries.map(([k, v]) => `"${k}": ${compact(v)}`).join(", ")} }`
  }
  return JSON.stringify(value)
}

/**
 * Pretty-prints the ledger with normal 2-space indentation for its verb and
 * path structure, but keeps COMPACT_KEYS's values on one line, however deep
 * they sit — a `checked` array or an `alternatives` object reads better as a
 * single line than spread one element per line.
 */
const stringifyLedger = (value: unknown, indent = 0): string => {
  if (Array.isArray(value) || typeof value !== "object" || value === null)
    return compact(value)
  const pad = "  ".repeat(indent)
  const inner = "  ".repeat(indent + 1)
  const entries = Object.entries(value).map(
    ([key, v]) =>
      `${inner}"${key}": ${COMPACT_KEYS.has(key) ? compact(v) : stringifyLedger(v, indent + 1)}`,
  )
  return entries.length ? `{\n${entries.join(",\n")}\n${pad}}` : "{}"
}

/**
 * Totals for every category the ledger tracks, computed fresh from it — not
 * hand-maintained prose, so it can never drift from what the ledger actually
 * says.
 */
// Every category below is pre-seeded with its full set of known keys at 0:
// unlike the ledger's own entries (where a field is simply left out when it
// does not apply), a summary should show a clean zero rather than leave you
// unsure whether something is being tracked at all.
const zeroed = <T extends string>(keys: readonly T[]): Record<T, number> =>
  Object.fromEntries(keys.map((k) => [k, 0])) as Record<T, number>

const summarizeLedger = (ledger: VerbLedger) => {
  const bySource = zeroed(["morph-it", "override", "rule", "none"] as const)
  const byStatus = zeroed(["conflict", "rejected", "futureStemDisagrees"] as const)
  const byRegular = zeroed(["ARE", "ERE", "IRE", "ISC", "irregular"] as const)
  const byAuxiliarySource = zeroed(["rule", "list", "default"] as const)
  const byAlternativeKind = zeroed(ALTERNATIVES)
  let leaves = 0
  let checked = 0
  let confirmed = 0
  let differs = 0
  let unconfirmed = 0
  let withAlternatives = 0
  let alternativeValues = 0
  let dualAuxiliary = 0

  for (const entry of Object.values(ledger)) {
    byRegular[entry.regular ?? "irregular"]++
    if (entry.auxiliary.secondary) dualAuxiliary++
    for (const aux of [entry.auxiliary.primary, entry.auxiliary.secondary])
      if (aux) byAuxiliarySource[aux.source]++

    for (const [path, leaf] of Object.entries(entry)) {
      if (path === "regular" || path === "auxiliary") continue
      const l = leaf as LedgerLeaf
      leaves++
      bySource[l.source]++
      if (l.status) byStatus[l.status]++
      const isChecked = !!l.checked?.length || !!l.confirmed
      if (isChecked) checked++
      else unconfirmed++
      if (l.confirmed) confirmed++
      if (l.differs) differs++
      if (l.alternatives) {
        withAlternatives++
        for (const [kind, values] of Object.entries(l.alternatives) as [
          AlternativeKind,
          LedgerAlternative[],
        ][]) {
          byAlternativeKind[kind] += values.length
          alternativeValues += values.length
        }
      }
    }
  }

  return {
    verbs: Object.keys(ledger).length,
    forms: { total: leaves, bySource, byStatus },
    checks: { checked, confirmed, differs, unconfirmed },
    alternatives: { forms: withAlternatives, values: alternativeValues, byKind: byAlternativeKind },
    type: byRegular,
    auxiliary: { bySource: byAuxiliarySource, dual: dualAuxiliary },
  }
}

/**
 * Writes resources/verb-ledger.json: every form the build decided (and every
 * one it could not), where it came from, its alternatives, and what
 * Wiktionary's own tables say about each one — checked fresh every run —
 * plus every manual check kept in resources/checks.json. Nothing is read
 * back from a previous ledger, so it can always be rebuilt from scratch.
 * Also writes resources/verb-ledger-stats.json, its totals.
 */
export const writeLedger = async (ledger: VerbLedger, verbs: Tree) => {
  const wiktionary = await compareAgainstWiktionary(verbs, ledger)
  const checks: Checks = JSON.parse(fs.readFileSync(CHECKS_FILE, "utf8"))
  applyChecks(ledger, checks)

  const sorted = sortKeys(
    Object.fromEntries(
      Object.entries(ledger).map(([verb, entry]) => [verb, sortKeys(entry)]),
    ),
  )
  fs.writeFileSync(LEDGER_FILE, stringifyLedger(sorted) + "\n")

  const stats = {
    generated: new Date().toISOString(),
    // When the Wiktionary file was downloaded (its last-modified time), since
    // a newer download can give a different ledger.
    wiktionaryDownloaded: fs.statSync(KAIKKI_FILE).mtime.toISOString(),
    ...summarizeLedger(ledger),
  }
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2) + "\n")

  return { wiktionary, stats }
}
