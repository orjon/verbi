export { conjugate, conjugateTense, hasVerb, listVerbs, isCompound } from './conjugate.ts';
export { EXCLUDED, isExcluded } from './excluded.ts';
export { getAux, isDualAux, auxChoices, auxKind } from './aux.ts';
export { auxInfo, auxTooltipSections, conjugateTenseDisplay, FORM_SEPARATOR } from './display.ts';
export { progressiveTense } from './progressive.ts';
export type { AuxInfo, AuxTooltipSection } from './display.ts';
export { isReflexive, reflexiveBase } from './reflexive.ts';
export { gerund, nonFiniteForms } from './forms.ts';
export { definitionsOf } from './definitions.ts';
export { verbType } from './verb-type.ts';
export type { Participle } from './forms.ts';
export type { AuxChoice } from './aux.ts';
export type {
  AuxKind, ItalianAux, Person, Numbers, Gender, Tense, ConjugateOptions, VerbType,
} from './types.ts';
export {
  PERSONS, PRONOUNS, SIMPLE_TENSES, COMPOUND_TENSES, TENSE_GROUPS, TIMES,
  VERB_TYPES, VERB_TYPE_LABEL, AUX_KINDS, AUX_KIND_LABEL, PROGRESSIVE_TENSES,
} from './constants.ts';
