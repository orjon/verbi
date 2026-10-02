/**
 * Each verb's English definitions: lexicons/it-definitions.json, loaded once.
 *
 * One string per meaning, in the order Wiktionary gives them. The text is
 * Wiktionary's (CC BY-SA 4.0).
 */
import definitionsJson from '../lexicons/it-definitions.json' with { type: 'json' };

const definitions = definitionsJson as unknown as Record<string, string[]>;

/** The definitions of a verb, or an empty list when Wiktionary has none. */
export function definitionsOf(verb: string): string[] {
  return Object.prototype.hasOwnProperty.call(definitions, verb) ? definitions[verb] : [];
}
