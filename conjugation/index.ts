export { conjugate, conjugateTense, hasVerb, listVerbs, isCompound } from './conjugate.ts';
export { EXCLUDED, isExcluded } from './excluded.ts';
export { getAux, isDualAux, isReflexive, reflexiveBase } from './aux.ts';
export { gerund, nonFiniteForms } from './forms.ts';
export { verbType } from './verb-type.ts';
export type { Participle } from './forms.ts';
export type {
  ItalianAux, Person, Numbers, Gender, Tense, ConjugateOptions, VerbType,
} from './types.ts';
export {
  PERSONS, PRONOUNS, SIMPLE_TENSES, COMPOUND_TENSES, TENSE_GROUPS, TIMES,
  VERB_TYPES, VERB_TYPE_LABEL,
} from './constants.ts';
