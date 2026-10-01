/**
 * Auxiliary selection for Italian compound tenses.
 *
 * `italian-verbs` will build any compound tense, but it does not know whether a
 * verb takes `essere` or `avere`. Ask it for `andare` with `AVERE` and it
 * returns "ho andato" — wrong Italian, no warning. This module makes that call
 * so the rest of the app never has to.
 */
import type { ItalianAux } from '../../types/index.ts';
import { REFLEXIVE_SUFFIX } from '../../constants/index.ts';

/**
 * Verbs taking `essere`: intransitives of motion, state, and change of state,
 * plus the prefixed compounds that inherit the choice (venire → provenire).
 *
 * Not exhaustive — Italian has a long tail — but it covers the verbs a learner
 * meets. Anything absent falls back to `avere`, which is the majority case.
 *
 * `vigere`, `incombere`, `prudere` and 23 others are on neither list: they
 * have no past participle, so no compound tenses. Checked 2026-09-29 — see
 * *Auxiliary verbs* in notes/to-verify.md.
 *
 * The block below the original list (`abbiosciare` on) was added 2026-09-29
 * from Wiktionary's auxiliary data, then rechecked against a second reference
 * the same day (see *Auxiliary recheck* in notes/to-verify.md): `rampare`
 * removed (it takes avere, not essere); `dilagare`, `rifluire`, `rimbalzare`
 * moved to DUAL (they take both auxiliaries, not essere alone). A handful of
 * verbs the second reference had no page for are listed as unconfirmed in the
 * same note, not silently assumed correct.
 */
const ESSERE = new Set<string>([
  // motion
  'accorrere', 'andare', 'arrivare', 'cadere', 'entrare', 'giungere', 'partire',
  'fuggire', 'ricadere', 'rientrare', 'ripartire', 'ritornare', 'scappare',
  'sopraggiungere', 'subentrare', 'tornare', 'uscire', 'venire',
  // arrival / origin compounds of venire
  'avvenire', 'convenire', 'divenire', 'intervenire', 'pervenire', 'provenire',
  'sopravvenire', 'svenire',
  // change of state
  'decadere', 'diventare', 'guarire', 'impazzire', 'ingrassare', 'invecchiare',
  'morire', 'nascere', 'perire', 'ridiventare', 'rinascere', 'sbocciare',
  'sparire', 'svanire', 'scomparire', 'comparire', 'apparire', 'sorgere',
  // remaining / staying
  'restare', 'rimanere', 'stare',
  // occurring / happening
  'accadere', 'capitare', 'intercorrere', 'occorrere', 'succedere', 'scadere',
  // seeming / pleasing / mattering
  'dispiacere', 'increscere', 'parere', 'piacere', 'rincrescere', 'sembrare',
  'spettare',
  // existing / being
  'esistere', 'essere', 'coesistere',
  // misc intransitives
  'bastare', 'costare', 'dipendere', 'importare', 'risultare', 'riuscire',
  'sopravvivere', 'valere',
  // added 2026-09-29 from Wiktionary's auxiliary data, single source
  'abbiosciare', 'addivenire', 'affluire', 'aggettare', 'allibire',
  'ammuffire', 'arenare', 'arrabbiare', 'arrossire',
  'assurgere', 'baluginare', 'balzare', 'basire', 'bisognare',
  'capitombolare', 'cascare', 'conflagrare', 'consistere', 'constare',
  'convolare', 'crepare', 'cucciare', 'culminare', 'decedere', 'decorrere',
  'decrescere', 'defluire', 'deperire', 'dimagrire', 'disparire',
  'divampare', 'emergere', 'fioccare', 'fluire', 'franare', 'fuoriuscire',
  'imbolsire', 'imbronciare', 'immigrare', 'incartapecorire', 'incorrere',
  'infreddolire', 'insorgere', 'invalere', 'inviperire', 'irrancidire',
  // licere, pollare: these have no compound tenses in real use (pollare is
  // not used in them at all), so the auxiliary is moot; kept here rather than
  // removed since it does no harm either way.
  'licere', 'muffire', 'pollare', 'preesistere', 'premorire', 'prenascere',
  'rabbuiare', 'rampollare', 'rassegare', 'regredire', 'residuare',
  'riammalare', 'riapparire', 'riboccare', 'ricascare', 'ricomparire',
  'riemergere', 'riessere', 'rincasare', 'risedere',
  'risorgere', 'ristare', 'sbottare', 'scaturire', 'schiattare', 'sconvenire',
  'sedere', 'sfebbrare', 'sfiorire', 'sfrecciare', 'sgattaiolare', 'smemorare',
  'soggiacere', 'sottentrare', 'sottostare', 'spiacere', 'susseguire',
  'sussistere', 'svaporare', 'svignare', 'talentare', 'tombolare',
  'tracollare', 'tramontare', 'transitare', 'trasparire', 'trasumanare',
  // permanere: takes essere, though compound tenses are rarely used in
  // practice (its past participle is archaic-only)
  'permanere',
]);

/**
 * Verbs that take either auxiliary depending on sense — `avere` when used
 * transitively or of the activity itself, `essere` when intransitive or of a
 * destination reached: "ho corso" (I ran) vs "sono corso a casa" (I ran home).
 *
 * `getAux` returns the more common reading; `isDualAux` lets the UI flag it.
 */
const DUAL: Record<string, ItalianAux> = {
  aumentare: 'ESSERE', cambiare: 'ESSERE', cominciare: 'ESSERE',
  correre: 'AVERE', crescere: 'ESSERE', diminuire: 'ESSERE',
  durare: 'ESSERE', finire: 'ESSERE', iniziare: 'ESSERE',
  mancare: 'ESSERE', migliorare: 'ESSERE', passare: 'ESSERE',
  peggiorare: 'ESSERE', procedere: 'AVERE', salire: 'ESSERE',
  salpare: 'ESSERE', saltare: 'AVERE', scendere: 'ESSERE', servire: 'ESSERE',
  suonare: 'AVERE', trascorrere: 'ESSERE', volare: 'AVERE', vivere: 'AVERE',
  // added 2026-09-29, confirmed as taking either auxiliary (not pure essere,
  // as first placed): dilagare, rifluire and rimbalzare take avere or essere
  dilagare: 'ESSERE', rifluire: 'ESSERE', rimbalzare: 'ESSERE',
  // weather, and the phases of daylight: both are standard (è piovuto, ha
  // piovuto); essere is the traditional choice
  albeggiare: 'ESSERE', annottare: 'ESSERE', diluviare: 'ESSERE',
  grandinare: 'ESSERE', imbrunire: 'ESSERE', lampeggiare: 'ESSERE',
  nevicare: 'ESSERE', nevischiare: 'ESSERE', piovere: 'ESSERE',
  piovigginare: 'ESSERE', ripiovere: 'ESSERE', spiovere: 'ESSERE',
  tuonare: 'ESSERE',
};

/** True when the verb is reflexive or pronominal (`lavarsi`, `accorgersi`). */
export function isReflexive(verb: string): boolean {
  return verb.endsWith(REFLEXIVE_SUFFIX);
}

/**
 * The plain infinitive behind a reflexive one: `abbuffarsi` → `abbuffare`.
 *
 * The dictionary does not conjugate reflexives — most of its 46 reflexive
 * entries hold an infinitive and nothing else — so to show `mi lavo` you
 * conjugate the base verb and prepend the pronoun yourself.
 */
export function reflexiveBase(verb: string): string {
  return verb.replace(/rsi$/, 're').replace(/si$/, 'e');
}

/** True when both auxiliaries are correct Italian, with a difference in sense. */
export function isDualAux(verb: string): boolean {
  return verb in DUAL;
}

/**
 * The auxiliary to use when building a compound tense of `verb`.
 *
 * Reflexives always take `essere`; otherwise the lists above decide, defaulting
 * to `avere`. Note that modals (`potere`, `dovere`, `volere`) properly inherit
 * the auxiliary of the verb they govern — "sono dovuto andare" — which needs
 * the governed verb to resolve and so is out of scope here.
 */
export function getAux(verb: string): ItalianAux {
  if (isReflexive(verb)) return 'ESSERE';
  if (verb in DUAL) return DUAL[verb];
  return ESSERE.has(verb) ? 'ESSERE' : 'AVERE';
}

/** Exposed for the test that checks every listed verb exists in the dictionary. */
export const _lists = { ESSERE, DUAL };
