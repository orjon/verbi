/** Shapes shared across the verb build's files (scripts/build*.ts). */
import type { Features } from '../scripts/parse-lexicon.ts';
import type { AlternativeForms, AlternativeKind } from '../scripts/vocabulary.ts';
import type { RuleName } from '../constants/rules.ts';
import type { PAST_KIND } from '../constants/verb-endings.ts';
import type { VERDICT } from '../constants/build.ts';

export type Slots = Record<string, string>;
export type Tree = Record<string, any>;

/**
 * A form the main decision loop could not settle on its own: its features,
 * its path, and Morph-it's candidates there. Later steps may still fill it.
 */
export type UnresolvedForm = [Features, string, string[]];

/**
 * A MOBILE_DIPHTHONG verb's two stems (plus a literary one, if any), and
 * where the diphthong is kept. See constants/verb-groups.ts.
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
 * How a conflict rule (scripts/corrections.ts) settles a form Morph-it gives
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

/** A source's verdict on one form (see VERDICT in constants/build.ts). */
export type CheckVerdict = (typeof VERDICT)[keyof typeof VERDICT];

/** One manual check of one form against one source (resources/checks.json). */
export type FormCheck = {
  /** The exact word checked. Omitted for a `none` verdict. */
  form?: string;
  source: string;
  verdict: CheckVerdict;
  /** For a `variant`: which of our alternative kinds it is. */
  kind?: AlternativeKind;
  quote?: string;
  /** Anything unusual about the lookup, such as a form inferred from "coniug. come". */
  note?: string;
  url?: string;
  date: string;
};

/** Every manual check, by verb and form path (or `auxiliary`). */
export type Checks = Record<string, Record<string, FormCheck[]>>;
