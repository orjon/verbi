/**
 * The lexicon the app conjugates from: lexicons/it-verbs.json, loaded once.
 *
 * The file holds an exactly regular verb as a marker, and the verb is written out
 * whenever it is looked up (conjugation/compact.ts). A verb that is not
 * regular is in the file in full. A file with every verb in full works as well.
 *
 * What comes out has the shape (mood → tense → person) that `italian-verbs`
 * reads, so it is handed straight to `getConjugation`. A slot a verb does not
 * have is simply absent, and callers treat that as "no such form".
 */
import lexiconJson from '../lexicons/it-verbs.json' with { type: 'json' };
import type { CompactLexicon } from './compact.ts';
import { expandedLexicon } from './compact-lexicon.ts';

export const verbs = expandedLexicon(lexiconJson as unknown as CompactLexicon);
