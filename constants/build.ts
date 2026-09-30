/**
 * Fixed values for the verb build (scripts/build.ts): where its input and
 * output files live, the vocabulary for reading Wiktionary's conjugation
 * tables, and how resources/verb-ledger.json is formatted.
 */
import { ALTERNATIVE, type AlternativeKind, PERSON } from '../scripts/vocabulary.ts';

/** Where the build writes the app's own data. */
export const OUT_DIR = 'data';

/** The finished verb forms — the small, shippable file the app reads. */
export const VERBS_FILE = `${OUT_DIR}/verbs.json`;

/** The dev-only record of every form, its source, and its checks. */
export const LEDGER_FILE = 'resources/verb-ledger.json';

/** Totals for everything in the ledger, written fresh each build. */
export const STATS_FILE = 'resources/verb-ledger-stats.json';

/** Hand-curated valid alternatives, by verb → form path → kind. */
export const FIXED_ALTERNATIVES = 'resources/fixed-alternatives.json';

/**
 * Wiktionary's Italian entries, extracted by wiktextract and published by
 * kaikki.org — one JSON entry per line. Not committed (771 MB):
 *   https://kaikki.org/dictionary/Italian/kaikki.org-dictionary-Italian.jsonl
 */
export const KAIKKI_FILE = 'resources/external/kaikki-italian.jsonl';

/** How Wiktionary writes an empty cell (a form a defective verb lacks). */
export const NO_FORM = '-';

/**
 * Ledger keys whose values print on one line rather than one array/object
 * entry per line — short, and read as a unit.
 */
export const COMPACT_KEYS = new Set([
  'checked',
  'rule',
  'candidates',
  'differs',
  'alternatives',
  'sources',
  'auxiliary',
]);

/**
 * Where a Wiktionary label on a conjugation form lands in our own
 * `alternatives` kinds. A form's tags fall into three groups:
 *
 *   - a label listed here gives the form that kind;
 *   - a label in DISQUALIFYING_LABELS means the form is not valid at all;
 *   - anything else is a note that says nothing about register —
 *     `Traditional` (an older stress spelling, gone once stress marks are
 *     removed), `transitive`, `sometimes`, … — and is ignored, so the form
 *     counts as standard. A tag Wiktionary adds tomorrow falls here too.
 *
 * `proscribed` (used by speakers, disapproved of by grammarians) is kept, as
 * colloquial; so is `Modern` (short everyday forms such as avere's *avo*,
 * *amo*). `figuratively` marks a form of another meaning of the verb: sense.
 */
export const ALTERNATIVE_KIND_BY_LABEL: Record<string, AlternativeKind> = {
  common: ALTERNATIVE.common,
  archaic: ALTERNATIVE.archaic,
  colloquial: ALTERNATIVE.colloquial,
  proscribed: ALTERNATIVE.colloquial,
  Modern: ALTERNATIVE.colloquial,
  figuratively: ALTERNATIVE.sense,
  literary: ALTERNATIVE.literary,
  rare: ALTERNATIVE.uncommon,
  uncommon: ALTERNATIVE.uncommon,
  regional: ALTERNATIVE.regional,
  dialectal: ALTERNATIVE.regional,
  dated: ALTERNATIVE.dated,
  obsolete: ALTERNATIVE.obsolete,
  poetic: ALTERNATIVE.literary,
  Latinate: ALTERNATIVE.formal,
};

/**
 * Wiktionary labels that mark a form as not valid Italian: `hypercorrect` (a
 * mistake made by over-applying a rule) and `error-unrecognized-form` (a
 * parsing artifact, not a real word). Such a form is never an alternative.
 */
export const DISQUALIFYING_LABELS = new Set(['hypercorrect', 'error-unrecognized-form']);

/**
 * Wiktionary tags that weaken the label beside them, so the form still counts
 * as standard: "common, sometimes proscribed" (soddisfo, disfi) is common.
 * Matches the fare-compound rule's own choice for these forms
 * (scripts/corrections.ts).
 */
export const SOFTENING_LABELS = new Set(['sometimes']);

/** The tags that say which form a table cell is. None of them is a label. */
export const GRAMMAR_TAGS = new Set([
  'first-person',
  'second-person',
  'third-person',
  'singular',
  'plural',
  'indicative',
  'subjunctive',
  'conditional',
  'imperative',
  'infinitive',
  'gerund',
  'participle',
  'present',
  'imperfect',
  'past',
  'historic',
  'future',
]);

/** A Wiktionary person + number tag pair, as our own person code. */
export const PERSON_BY_TAGS: Record<string, string> = {
  'first-person singular': PERSON.s1,
  'second-person singular': PERSON.s2,
  'third-person singular': PERSON.s3,
  'first-person plural': PERSON.p1,
  'second-person plural': PERSON.p2,
  'third-person plural': PERSON.p3,
};

/** Hand-kept record of every manual check against an outside source. */
export const CHECKS_FILE = 'resources/checks.json';

/** The outside sources a form can be checked against. */
export const SOURCE = { treccani: 'Treccani', wiktionary: 'Wiktionary' } as const;

/**
 * What a source says about one form, in resources/checks.json:
 *
 *   standard  the source gives this as the normal form
 *   variant   a valid alternative, of the check's `kind`
 *   absent    the source does not list this form
 *   none      the source confirms the slot has no form at all
 */
export const VERDICT = {
  standard: 'standard',
  variant: 'variant',
  absent: 'absent',
  none: 'none',
} as const;
