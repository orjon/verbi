/**
 * The text that explains the auxiliary rules and frequencies, from
 * explanations.json. The data carries only the codes (`transitive`,
 * `uncommon`); this is where they become words for the page.
 */
import explanationsJson from './explanations.json' with { type: 'json' };

interface RuleText {
  label: string;
  technical: string;
  explanation: string;
  /** When each auxiliary applies under this rule. */
  avere?: string;
  essere?: string;
  examples: string[];
}

interface FrequencyText {
  label: string;
  explanation: string;
}

const explanations = explanationsJson as unknown as {
  auxiliary: Record<string, RuleText>;
  frequency: Record<string, FrequencyText>;
};

/** The text for an auxiliary rule, or undefined for a code it does not know. */
export const auxRuleText = (code: string): RuleText | undefined =>
  explanations.auxiliary[code];

/** The text for a frequency (`uncommon`, `archaic`…), or undefined for an unknown code. */
export const frequencyText = (kind: string): FrequencyText | undefined =>
  explanations.frequency[kind];
