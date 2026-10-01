/**
 * The forms that have no person: infinitive, gerund and participles.
 *
 * They are read as the lexicon holds them. A verb that has no such form, such
 * as a verb with no past participle, gives `null`: nothing is made up.
 */
import { verbs } from './lexicon.ts';

/** The gerund, or null where the verb has none. */
export function gerund(verb: string): string | null {
  const stored = verbs[verb]?.ger?.pres;
  return typeof stored === 'string' ? stored : null;
}

/** Participle forms, keyed by gender and number rather than person. */
export interface Participle {
  S: string;
  SF: string;
  P: string;
  PF: string;
}

/** A participle, or null where the verb lacks it or any of its four forms. */
function participle(verb: string, which: 'pres' | 'past'): Participle | null {
  const p = verbs[verb]?.part?.[which];
  if (!p || typeof p === 'string') return null;
  const { S, SF, P, PF } = p as Record<string, string>;
  if (!S || !SF || !P || !PF) return null;
  return { S, SF, P, PF };
}

/**
 * Every form that has no person.
 *
 * The infinitive is the key the verb is stored under.
 */
export function nonFiniteForms(verb: string) {
  return {
    infinitive: verb,
    gerund: gerund(verb),
    participlePresent: participle(verb, 'pres'),
    participlePast: participle(verb, 'past'),
  };
}
