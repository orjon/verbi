/** Shapes shared across the verb build's files (build-lexicon/scripts/build*.ts). */
import type { Features } from '../scripts/parse-lexicon.ts';
import type { ALTERNATIVE } from '../constants/alternatives.ts';
import type { RULE } from '../constants/rules.ts';
import type { PAST_KIND } from '../constants/endings.ts';
import type { VERDICT } from '../constants/checks.ts';

/** The name of a rule, as recorded in the ledger. */
export type RuleName = (typeof RULE)[keyof typeof RULE];

/** The kind of a valid alternative: "common", "archaic", "clipped_poetic" and so on. */
export type AlternativeKind = (typeof ALTERNATIVE)[keyof typeof ALTERNATIVE];

/** Valid alternatives to one form, by kind: { common: ["fai"] }. */
export type AlternativeForms = Partial<Record<AlternativeKind, string[]>>;

/**
 * A value whose type is deliberately left open: the keys are arbitrary form
 * paths such as "ind.pres.S1". Named so the places that use it are easy to find
 * and replace with real types later (see notes/to-do.md).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Loose = any;

export type Slots = Record<string, string>;
export type Tree = Record<string, Loose>;

/** One form path's entry in data-sources/overrides.json. See build-lexicon/scripts/overrides.ts. */
export type OverrideEntry = {
  /** The form; null says there is none. Absent when the entry only has alternatives. */
  value?: string | null;
  alternatives?: AlternativeForms;
};

/** data-sources/overrides.json: verb → form path → entry. */
export type Overrides = Record<string, Record<string, OverrideEntry>>;

/**
 * A form the main decision loop could not settle on its own: its features,
 * its path, and Morph-it's candidates there. Later steps may still fill it.
 */
export type UnresolvedForm = [Features, string, string[]];

/**
 * A MOBILE_DIPHTHONG verb's two stems (plus a literary one, if any), and
 * where the diphthong is kept. See build-lexicon/constants/stems.ts.
 */
export type MobileDiphthong = {
  plain: string;
  diphthong: string;
  literary?: string;
  keep: 'always' | 'stressed' | 'stressedOnly';
  plainAlso?: AlternativeKind;
};

/** A past historic form's kind: weak -ei, weak -etti, or strong. */
export type PastKind = (typeof PAST_KIND)[keyof typeof PAST_KIND];

/**
 * How a conflict rule (build-lexicon/scripts/corrections.ts) settles a form Morph-it gives
 * several candidates for: the form chosen, and the other forms that are valid
 * variants, by kind. Any candidate listed in neither is a mistake, and the
 * ledger records it as `rejected`.
 */
export type Resolution = {
  form: string;
  alternatives: AlternativeForms;
  /** The rule that made this decision, recorded in the ledger. */
  rule: RuleName;
};

/** A source's verdict on one form (see VERDICT in build-lexicon/constants/checks.ts). */
export type CheckVerdict = (typeof VERDICT)[keyof typeof VERDICT];

/** One manual check of one form against one source (data-sources/checks.json). */
export type FormCheck = {
  /** The exact word checked. Omitted for a `none` verdict. */
  form?: string;
  source: string;
  verdict: CheckVerdict;
  /** For a `variant`: which of our alternative kinds it is. */
  kind?: AlternativeKind;
  date: string;
};

/** Every manual check, by verb and form path (or `auxiliary`). */
export type Checks = Record<string, Record<string, FormCheck[]>>;
