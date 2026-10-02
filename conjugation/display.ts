/**
 * How a verb's auxiliaries are shown: the header block that lists them with
 * their reasons, and the compound-tense rows that give both forms for a verb
 * that takes both.
 */
import { auxChoices, type AuxChoice } from './aux.ts';
import { auxRuleText, frequencyText } from './explanations.ts';
import { conjugateTense, isCompound } from './conjugate.ts';
import type { ConjugateOptions, Tense } from './types.ts';

/** Between the forms of two equal auxiliaries; the page splits on it to grey it out. */
export const FORM_SEPARATOR = ' | ';

/** One auxiliary, ready to show in the header. */
export interface AuxInfo {
  aux: 'avere' | 'essere';
  /** The name as shown: "Avere", "Essere". */
  label: string;
  /** Set when it is valid but less usual: its label and what that means. */
  frequency?: { label: string; explanation: string };
  /** The rule that says when it applies: its label and what it means. */
  rule?: { label: string; explanation: string };
  /** When it applies, as sentences: the rule's line for this auxiliary, the `when` and the `note`. */
  detail?: string;
  /** For a verb that is not listed: the line that says it takes avere. */
  hint?: string;
}

/** "in some meanings" → "In some meanings." */
const sentence = (text: string): string => {
  const trimmed = text.trim();
  const capital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capital) ? capital : `${capital}.`;
};

/**
 * The auxiliaries of `verb` for the header, the first one listed first. A verb
 * that is not listed takes avere, with a hint that says so.
 */
export function auxInfo(verb: string): AuxInfo[] {
  const choices = auxChoices(verb);
  if (!choices.length)
    return [{ aux: 'avere', label: 'Avere', hint: auxRuleText('default')?.explanation }];
  return choices.map((choice) => {
    const rule = choice.rule ? auxRuleText(choice.rule) : undefined;
    const frequency = choice.frequency ? frequencyText(choice.frequency) : undefined;
    const detail = [rule?.[choice.aux], choice.when, choice.note]
      .filter((part): part is string => !!part)
      .map(sentence)
      .join(' ');
    return {
      aux: choice.aux,
      label: choice.aux === 'essere' ? 'Essere' : 'Avere',
      ...(frequency && { frequency: { label: frequency.label, explanation: frequency.explanation } }),
      ...(rule && { rule: { label: rule.label, explanation: rule.explanation } }),
      ...(detail && { detail }),
    };
  });
}

/** One part of the auxiliary hover: an auxiliary's name and what to say about it. */
export interface AuxTooltipSection {
  /** The auxiliary's name; null when the verb has only one, so no heading is needed. */
  title: string | null;
  /** Its frequency, its rule and the reason, one per line. */
  lines: string[];
}

/**
 * The hover for the auxiliaries, one section for each auxiliary that has
 * something to say. With two auxiliaries each section is headed by its name.
 * Empty when there is nothing to say at all.
 */
export function auxTooltipSections(infos: AuxInfo[]): AuxTooltipSection[] {
  const sections = infos.flatMap((info) => {
    const lines = [
      info.frequency && `${info.frequency.label}: ${info.frequency.explanation}`,
      info.rule && `${info.rule.label}: ${info.rule.explanation}`,
      info.detail,
      info.hint,
    ].filter((line): line is string => !!line);
    return lines.length ? [{ title: info.label as string | null, lines }] : [];
  });
  return infos.length === 1 ? sections.map((s) => ({ ...s, title: null })) : sections;
}

/** "sono andato" → ["sono", "andato"]: everything before the participle, and the participle. */
const splitParticiple = (form: string): [string, string] => {
  const cut = form.lastIndexOf(' ');
  return [form.slice(0, cut), form.slice(cut + 1)];
};

/**
 * Joins one person's forms, one per auxiliary. With no frequency to tell them
 * apart they are equal, and are joined with a pipe; otherwise the usual one comes
 * first and the others follow in brackets. When every form ends in the same
 * participle it is written once: "sono | ho cominciato", "sono (ho) cominciato".
 * The page greys out the pipe (it splits on {@link FORM_SEPARATOR}).
 */
function joinForms(forms: { text: string; choice: AuxChoice }[]): string | null {
  if (forms.length === 0) return null;
  if (forms.length === 1) return forms[0].text;

  const unusual = forms.filter((f) => f.choice.frequency);
  const equal = unusual.length === 0 || unusual.length === forms.length;
  const usual = equal ? forms : forms.filter((f) => !f.choice.frequency);
  const ordered = equal ? forms : [...usual, ...unusual];

  const parts = ordered.map((f) => splitParticiple(f.text));
  const shared = parts.every(([, participle]) => participle === parts[0][1]);
  const words = shared ? parts.map(([aux]) => aux) : ordered.map((f) => f.text);

  const joined = equal
    ? words.join(FORM_SEPARATOR)
    : `${words.slice(0, usual.length).join(FORM_SEPARATOR)} (${words.slice(usual.length).join(FORM_SEPARATOR)})`;
  return shared ? `${joined} ${parts[0][1]}` : joined;
}

/**
 * A whole tense, in the order of `conjugateTense`, with both forms for a
 * compound tense of a verb that takes both auxiliaries. Anything else comes
 * back exactly as `conjugateTense` gives it.
 */
export function conjugateTenseDisplay(
  verb: string,
  tense: Tense,
  options: ConjugateOptions = {},
): (string | null)[] {
  const choices = isCompound(tense) ? auxChoices(verb) : [];
  if (choices.length < 2) return conjugateTense(verb, tense, options);

  const perAux = choices.map((choice) => ({
    choice,
    forms: conjugateTense(verb, tense, {
      ...options,
      aux: choice.aux === 'essere' ? 'ESSERE' : 'AVERE',
    }),
  }));
  return perAux[0].forms.map((_, i) =>
    joinForms(
      perAux.flatMap(({ choice, forms }) =>
        forms[i] === null ? [] : [{ text: forms[i], choice }],
      ),
    ),
  );
}
