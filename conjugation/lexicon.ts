/**
 * The lexicon the app conjugates from: lexicons/it-verbs.json, loaded once.
 *
 * Its shape (mood → tense → person) is the one `italian-verbs` reads, so it is
 * handed straight to `getConjugation`. A slot a verb does not have is simply
 * absent, and callers treat that as "no such form".
 */
import type { VerbsInfo } from 'italian-verbs-dict';
import lexiconJson from '../lexicons/it-verbs.json' with { type: 'json' };

// The JSON import resolves to `{}` under some TypeScript module settings, so
// state the shape the package already declares rather than relying on it.
export const verbs = lexiconJson as unknown as VerbsInfo;
