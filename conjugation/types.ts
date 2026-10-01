/**
 * Types used across the app.
 *
 * Some of these mirror types the `italian-verbs` package also exports. They are
 * restated here so our own code has one vocabulary, and so a change of
 * conjugation library does not ripple through every file.
 */

/** The helper verb a compound tense is built with. */
export type ItalianAux = 'ESSERE' | 'AVERE';

/** Grammatical person: 1 speaking, 2 spoken to, 3 spoken about. */
export type Person = 1 | 2 | 3;

/** Grammatical number: singular or plural. */
export type Numbers = 'S' | 'P';

/** Gender, for participle agreement. */
export type Gender = 'M' | 'F';

/** Every tense the app can produce, simple and compound. */
export type Tense =
  | 'PRESENTE' | 'IMPERFETTO' | 'PASSATO_REMOTO' | 'FUTURO_SEMPLICE'
  | 'PASSATO_PROSSIMO' | 'TRAPASSATO_PROSSIMO' | 'TRAPASSATO_REMOTO'
  | 'FUTURO_ANTERIORE' | 'CONG_PRESENTE' | 'CONG_PASSATO' | 'CONG_IMPERFETTO'
  | 'CONG_TRAPASSATO' | 'COND_PRESENTE' | 'COND_PASSATO' | 'IMPERATIVO';

export interface ConjugateOptions {
  /**
   * Gender of the subject, for participle agreement in compound tenses formed
   * with `essere`: "sono andato" / "sono andata". Ignored with `avere`, where
   * the participle does not agree with the subject. Defaults to masculine.
   */
  gender?: Gender;
}
