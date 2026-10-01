import { test } from 'node:test';
import assert from 'node:assert/strict';
import verbs from '../lexicons/it-verbs.json' with { type: 'json' };
import { conjugate, conjugateTense, hasVerb, listVerbs } from './conjugate.ts';
import { EXCLUDED, isExcluded } from './excluded.ts';
import { getAux, isDualAux, isReflexive, _lists } from './aux.ts';
import { gerund, nonFiniteForms } from './forms.ts';
import { verbType } from './verb-type.ts';

test('every verb in the auxiliary lists exists in the lexicon', () => {
  // `essere` is skipped: the library conjugates it internally as an auxiliary.
  const missing = [...(_lists.ESSERE as Set<string>), ...Object.keys(_lists.DUAL)]
    .filter((v) => !hasVerb(v) && v !== 'essere');
  assert.deepEqual(missing, [], `not in lexicon: ${missing.join(', ')}`);
});

test('avere is the default', () => {
  assert.equal(getAux('parlare'), 'AVERE');
  assert.equal(conjugate('parlare', 'PASSATO_PROSSIMO', 1, 'S'), 'ho parlato');
});

test('essere verbs use essere, and the participle agrees', () => {
  assert.equal(getAux('andare'), 'ESSERE');
  assert.equal(conjugate('andare', 'PASSATO_PROSSIMO', 1, 'S'), 'sono andato');
  assert.equal(conjugate('andare', 'PASSATO_PROSSIMO', 1, 'S', { gender: 'F' }), 'sono andata');
  assert.equal(conjugate('andare', 'PASSATO_PROSSIMO', 3, 'P', { gender: 'F' }), 'sono andate');
  assert.equal(conjugate('andare', 'PASSATO_PROSSIMO', 3, 'P'), 'sono andati');
});

test('the participle does not agree with avere', () => {
  assert.equal(conjugate('parlare', 'PASSATO_PROSSIMO', 3, 'P', { gender: 'F' }), 'hanno parlato');
});

test('reflexives take essere', () => {
  assert.equal(getAux('accorgersi'), 'ESSERE');
  assert.equal(getAux('lavarsi'), 'ESSERE');
});

test('dual-auxiliary verbs are flagged', () => {
  assert.ok(isDualAux('correre'));
  assert.ok(!isDualAux('parlare'));
});

test('an unknown verb throws', () => {
  assert.throws(() => conjugate('nonesiste', 'PRESENTE', 1, 'S'), /Unknown verb/);
});

test('a tense comes back in io/tu/lui/noi/voi/loro order', () => {
  assert.deepEqual(conjugateTense('parlare', 'PRESENTE'),
    ['parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano']);
});

test('the imperative has no first-person singular', () => {
  assert.equal(conjugateTense('parlare', 'IMPERATIVO')[0], null);
});

test('the whole lexicon conjugates, bar known gaps', () => {
  const tenses = ['PRESENTE', 'PASSATO_PROSSIMO', 'IMPERFETTO', 'COND_PRESENTE'] as const;
  const reflexive: string[] = [];
  const defective: string[] = [];

  for (const verb of Object.keys(verbs)) {
    const gaps = tenses.filter((t) => conjugateTense(verb, t).every((f) => f === null));
    if (gaps.length === 0) continue;
    (isReflexive(verb) ? reflexive : defective).push(verb);
  }

  // The lexicon has no reflexive entries; callers are pointed at the base verb
  // instead. See `reflexiveBase`.
  assert.equal(reflexive.length, 0, `reflexive entries: ${reflexive.join(', ')}`);

  // Genuinely defective verbs, left without forms on purpose: `vigere`,
  // `dirimere` and `soccombere` have no past participle, so no compound tense,
  // and `aggradare` has only one form of the present.
  assert.equal(defective.length, 40, `unexpected: ${defective.join(', ')}`);
});

test('a reflexive verb points the caller at the base verb', () => {
  assert.throws(
    () => conjugate('abbuffarsi', 'PRESENTE', 1, 'S'),
    /Conjugate abbuffare/,
  );
});

test('a defective verb names the missing tense', () => {
  assert.throws(() => conjugate('vigere', 'PASSATO_PROSSIMO', 3, 'S'), /no PASSATO_PROSSIMO form/);
});

test('excluded entries are left out of the verb list', () => {
  const listed = listVerbs();
  // The build already drops them, so every verb in the lexicon is offered.
  assert.equal(listed.length, Object.keys(verbs).length);
  assert.ok(!listed.includes('dimmi'));
  assert.ok(!listed.includes('abbuffarsi'));
  assert.ok(listed.includes('parlare'));
  assert.ok(listed.includes('sedere'));
});

test('no excluded key is in the lexicon', () => {
  const present = [...EXCLUDED].filter((v) => hasVerb(v));
  assert.deepEqual(present, [], `excluded but present: ${present.join(', ')}`);
});

test('all reflexives are excluded', () => {
  const kept = Object.keys(verbs).filter((v) => isReflexive(v) && !isExcluded(v));
  assert.deepEqual(kept, []);
});

test('a verb with no gerund or participle gives null, not an invented form', () => {
  assert.equal(gerund('aggradare'), null);
  const forms = nonFiniteForms('aggradare');
  assert.equal(forms.participlePast, null);
  assert.equal(forms.participlePresent, null);
});

test('forms are read as the lexicon holds them', () => {
  assert.equal(gerund('sedere'), 'sedendo');
  assert.equal(nonFiniteForms('sedere').participlePresent?.S, 'sedente');
  assert.equal(nonFiniteForms('parlare').participlePast?.SF, 'parlata');
  assert.equal(nonFiniteForms('parlare').infinitive, 'parlare');
});

test('avere and essere conjugate from the lexicon', () => {
  assert.equal(conjugate('avere', 'PRESENTE', 1, 'S'), 'ho');
  assert.equal(conjugate('avere', 'PRESENTE', 3, 'S'), 'ha');
  assert.equal(conjugate('essere', 'PRESENTE', 1, 'S'), 'sono');
  assert.equal(conjugate('essere', 'PRESENTE', 3, 'S'), 'è');
});

test('a verb has one of five types', () => {
  assert.equal(verbType('parlare'), 'are');
  assert.equal(verbType('vedere'), 'ere');
  assert.equal(verbType('dormire'), 'ire');
  assert.equal(verbType('finire'), 'isc');
  assert.equal(verbType('porre'), 'rre');
});

test('-isc- is found even when a verb has only a third-person present', () => {
  assert.equal(verbType('imbrunire'), 'isc');
});

test('every verb in the lexicon has a type', () => {
  const untyped = Object.keys(verbs).filter((v) => verbType(v) === null);
  assert.deepEqual(untyped, []);
});
