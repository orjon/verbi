export { conjugate, conjugateTense, hasVerb, listVerbs, isCompound } from './conjugate.ts';
export { EXCLUDED, isExcluded } from './excluded.ts';
export { getAux, isDualAux, isReflexive, reflexiveBase } from './aux.ts';
export { gerund, nonFiniteForms } from './forms.ts';
export type { Participle } from './forms.ts';
export type {
  ItalianAux, Person, Numbers, Gender, Tense, ConjugateOptions,
} from '../../types/index.ts';
export {
  PERSONS, PRONOUNS, SIMPLE_TENSES, COMPOUND_TENSES, TENSE_GROUPS,
} from '../../constants/index.ts';
