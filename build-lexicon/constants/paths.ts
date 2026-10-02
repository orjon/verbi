/**
 * Every file and folder path the build uses, relative to the project root,
 * where the build is run from. Nothing else in the build writes a path out.
 */

/** Where the build reads its sources: our own decisions, and the downloads. */
export const SOURCES_DIR = 'data-sources';

/** The downloaded files, which are not committed. */
export const EXTERNAL_DIR = `${SOURCES_DIR}/external`;

/** The Morph-it lexicon (ISO-8859-1, read as latin1). Not committed. */
export const LEXICON = `${EXTERNAL_DIR}/morph-it_048.txt`;

/**
 * Wiktionary's Italian entries, extracted by wiktextract and published by
 * kaikki.org — one JSON entry per line. Not committed (771 MB):
 *   https://kaikki.org/dictionary/Italian/kaikki.org-dictionary-Italian.jsonl
 */
export const KAIKKI_FILE = `${EXTERNAL_DIR}/kaikki-italian.jsonl`;

/** Our corrections to Morph-it: forms and valid alternatives, by verb → form path. */
export const OVERRIDES_FILE = `${SOURCES_DIR}/overrides.json`;

/** Which auxiliaries each verb takes, when it is not just avere. */
export const AUXILIARIES_FILE = `${SOURCES_DIR}/auxiliaries.json`;

/** Hand-kept record of every manual check against an outside source. */
export const CHECKS_FILE = `${SOURCES_DIR}/checks.json`;

/** Where the build writes the lexicons. */
export const OUT_DIR = 'lexicons';

/**
 * The finished verb forms, and the only form of them the app reads: every exactly
 * regular verb is a marker ("parlare": "are") filled in by the app, every other
 * verb is written out in full. The build keeps the full lexicon in memory and
 * checks this file against it; see build-lexicon/scripts/compact.ts.
 */
export const VERBS_FILE = `${OUT_DIR}/it-verbs.json`;

/** The dev-only record of every form, its source, and its checks. Not committed. */
export const LEDGER_FILE = `${OUT_DIR}/it-verbs-ledger.json`;

/** Each verb's English definitions, from Wiktionary — read by the app. */
export const DEFINITIONS_FILE = `${OUT_DIR}/it-definitions.json`;

/** Totals for everything in the lexicon, written fresh each build. */
export const STATS_FILE = `${OUT_DIR}/it-verbs-stats.json`;

/** Where the source-checking script reads each source's address. Not committed. */
export const ENV_FILE = '.env.local';

/** Where the source-checking script saves what it fetches, unless told otherwise. */
export const SOURCE_CHECK_FILE = 'notes/source-check.json';
