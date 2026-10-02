/**
 * The shape of lexicons/it-verbs-ledger.json — the dev-only record of where
 * every form came from, its alternatives, and what confirms or disagrees
 * with it. See build-lexicon/scripts/build-ledger.ts for how it is written.
 */
import type { AlternativeKind, Loose, RuleName } from './build.ts';

/** One alternative form, and every source that attests it. */
export type LedgerAlternative = {
  value: string;
  sources: string[];
  /** Per source, where it disagrees: the kind it gives instead, or "absent". */
  differs?: Record<string, string>;
  /** A Lillian check (LILLIAN_SOURCES) lists this form too. Such a source is
   *  never one of its `sources`. */
  confirmed?: true;
};

/** A verb's valid alternatives to one form, by kind. */
export type LedgerAlternatives = Partial<
  Record<AlternativeKind, LedgerAlternative[]>
>;

/**
 * One form's full record: its value, where that value came from, its
 * alternatives, and what has checked it.
 *
 *   value    the form itself. Absent when nothing was decided (`status` says
 *            why) or when an override/rule says the slot does not exist
 *            (`absent`).
 *   source   "morph-it" (Morph-it's own unambiguous form), "override"
 *            (data-sources/overrides.json), "rule" (a class rule, or one of the
 *            named conflict/derivation rules — see `rule`), or "none" when
 *            nothing decided it at all (`status` says why).
 *   rule     every rule that touched this value, in the order applied. The
 *            last entry is whichever rule most recently adjusted it — a
 *            conflict rule can settle a value and a later pass (such as
 *            ACCENTED_COMPOUNDS) can still adjust it further.
 *   absent   an override or class rule actively says this slot does not
 *            exist — not merely that nothing filled it.
 *   status   set only when something is questionable: "conflict" (Morph-it
 *            gave several plausible forms, nothing chose), "rejected"
 *            (Morph-it's candidates were all implausible for this slot), or
 *            "futureStemDisagrees" (a decided value whose stem does not
 *            match what the other five persons of the future imply).
 *   candidates  Morph-it's own candidates, for a "conflict"/"rejected" status.
 *   expected    what the majority stem implies, for "futureStemDisagrees".
 *   rejected    Morph-it's own candidates for this slot that were judged
 *               mistakes — distinct from `alternatives` (valid variants) and
 *               `differs` (an external source's own value).
 *   checked     every source that looked at this value and agreed with it.
 *   differs     per source, what it gives instead, where it disagrees.
 *   confirmed   a Lillian check (LILLIAN_SOURCES) — the standard of truth —
 *               has confirmed this by hand. That source is never also
 *               listed in `checked` once this is true; it would be redundant.
 */
export type LedgerLeaf = {
  value?: string;
  source: 'morph-it' | 'override' | 'rule' | 'none';
  rule?: RuleName[];
  absent?: true;
  status?: 'conflict' | 'rejected' | 'futureStemDisagrees';
  candidates?: string[];
  expected?: string;
  rejected?: string[];
  alternatives?: LedgerAlternatives;
  checked?: string[];
  differs?: Record<string, string[]>;
  confirmed?: true;
};

/**
 * One of the verb's auxiliaries: the first one listed in
 * data-sources/auxiliaries.json is `primary`, a second one is `secondary`.
 *
 *   value        avere or essere.
 *   origin       "file" (listed in data-sources/auxiliaries.json) or "default"
 *                (the verb is not listed, so it takes avere).
 *   sources      every outside source that gives this auxiliary. Our own file is
 *                the origin, never one of the sources.
 *   rule, derivedFrom, when, note, frequency
 *                as in data-sources/auxiliaries.json.
 *   differs      per source, the auxiliaries it gives where none of them is one
 *                of ours. A source that only lacks one of ours, or adds one, is
 *                not a disagreement.
 */
export type AuxiliaryEntry = {
  value: string;
  origin: 'file' | 'default';
  sources: string[];
  rule?: string;
  derivedFrom?: string;
  when?: string;
  note?: string;
  frequency?: AlternativeKind;
  differs?: Record<string, string[]>;
};

export interface VerbLedgerEntry {
  regular?: 'ARE' | 'ERE' | 'IRE' | 'ISC';
  aux: { primary: AuxiliaryEntry; secondary?: AuxiliaryEntry };
  [path: string]: Loose;
}

export type VerbLedger = Record<string, VerbLedgerEntry>;

/** One cell of a Wiktionary conjugation table: a form, and its labels. */
export interface WiktionaryForm {
  form: string;
  labels: string[];
}

/** One verb's conjugation table, read from Wiktionary. */
export interface WiktionaryVerb {
  forms: Record<string, WiktionaryForm[]>;
  auxiliaries: string[];
  /** True when the table is the reflexive verb's (accorgersi). */
  reflexive: boolean;
}

/** What a form path can be, once compared against Wiktionary's table. */
export type CompareStatus =
  | 'agree'
  | 'agreeLabelled'
  | 'accentOnly'
  | 'alternative'
  | 'differ'
  | 'ourEmpty'
  | 'wiktionaryEmpty';
