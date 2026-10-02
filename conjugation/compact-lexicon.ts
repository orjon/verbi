/**
 * A lexicon read from the compact file, writing each verb out whenever it is
 * looked up.
 *
 * It behaves like the full lexicon: `verbs[infinitive]` is the verb's tree,
 * `infinitive in verbs` and `Object.keys(verbs)` list the verbs. `italian-verbs`
 * takes it as its verb list as it is.
 *
 * Nothing is kept: a regular verb is built again on every lookup, which takes a
 * few microseconds, so the lexicon never grows beyond the file itself. The file is
 * never changed.
 */
import type { VerbsInfo } from 'italian-verbs-dict';
import { expandVerb, type CompactLexicon, type VerbTree } from './compact.ts';

export function expandedLexicon(compact: CompactLexicon): VerbsInfo {
  const verbAt = (infinitive: string): VerbTree | undefined =>
    Object.prototype.hasOwnProperty.call(compact, infinitive)
      ? expandVerb(infinitive, compact[infinitive])
      : undefined;

  return new Proxy(compact, {
    get: (_, key) => (typeof key === 'string' ? verbAt(key) : undefined),
    has: (_, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(compact, key),
    ownKeys: () => Reflect.ownKeys(compact),
    // A getter, so that listing the verbs (Object.keys) does not build them all.
    getOwnPropertyDescriptor: (_, key) =>
      typeof key === 'string' && Object.prototype.hasOwnProperty.call(compact, key)
        ? { get: () => verbAt(key), enumerable: true, configurable: true }
        : undefined,
  }) as unknown as VerbsInfo;
}
