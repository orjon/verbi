export { conjugate, conjugateTense, hasVerb, listVerbs, isCompound } from './conjugate.ts';
export { EXCLUDED, isExcluded } from './excluded.ts';
export { getAux, isDualAux, isReflexive, reflexiveBase } from './aux.ts';
export type {
  ItalianAux, Person, Numbers, Gender, Tense, ConjugateOptions,
} from '../../types/index.ts';
export {
  PERSONS, PRONOUNS, SIMPLE_TENSES, COMPOUND_TENSES,
} from '../../constants/index.ts';
