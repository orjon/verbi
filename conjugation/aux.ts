/**
 * Auxiliary selection for Italian compound tenses.
 *
 * `italian-verbs` will build any compound tense, but it does not know whether a
 * verb takes `essere` or `avere`. Ask it for `andare` with `AVERE` and it
 * returns "ho andato" — wrong Italian, no warning. This module makes that call
 * so the rest of the app never has to.
 *
 * The auxiliaries are in the lexicon, under each verb's `aux` key (built from
 * data-sources/auxiliaries.json). A verb with no `aux` takes `avere`.
 */
import type { AuxKind, ItalianAux } from './types.ts';
import { verbs } from './lexicon.ts';
import { isReflexive } from './reflexive.ts';

/** One auxiliary a verb takes, with whatever the data says about it. */
export interface AuxChoice {
  aux: 'avere' | 'essere';
  /** A rule in explanations.json that says when it applies. */
  rule?: string;
  /** For the compound rule: the verb whose auxiliary this one follows. */
  derivedFrom?: string;
  /** The meaning or use it goes with. */
  when?: string;
  /** Detail the rule or `when` does not give. */
  note?: string;
  /** Set when it is valid but less usual: an alternative kind such as `uncommon`. */
  frequency?: string;
}

/**
 * The auxiliaries a verb takes, the first one listed first. Empty for a verb
 * that is not listed, which takes `avere`.
 */
export function auxChoices(verb: string): AuxChoice[] {
  const aux = (verbs[verb] as { aux?: Record<string, true | Omit<AuxChoice, 'aux'>> } | undefined)?.aux;
  if (!aux) return [];
  return Object.entries(aux).map(([name, detail]) => ({
    aux: name as AuxChoice['aux'],
    ...(detail === true ? {} : detail),
  }));
}

/** True when both auxiliaries are correct Italian, with a difference in sense. */
export function isDualAux(verb: string): boolean {
  return auxChoices(verb).length > 1;
}

/**
 * The auxiliary to use when building a compound tense of `verb`.
 *
 * Reflexives always take `essere`; otherwise it is the first auxiliary listed
 * for the verb, defaulting to `avere`. Note that modals (`potere`, `dovere`,
 * `volere`) properly inherit the auxiliary of the verb they govern — "sono
 * dovuto andare" — which needs the governed verb to resolve and so is out of
 * scope here.
 */
export function getAux(verb: string): ItalianAux {
  if (isReflexive(verb)) return 'ESSERE';
  return auxChoices(verb)[0]?.aux === 'essere' ? 'ESSERE' : 'AVERE';
}

/** Which auxiliaries `verb` takes: only avere (the default), only essere, or both. */
export function auxKind(verb: string): AuxKind {
  const choices = auxChoices(verb);
  if (choices.length > 1) return 'both';
  return choices[0]?.aux === 'essere' ? 'essere' : 'avere';
}
