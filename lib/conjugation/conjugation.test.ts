import { test } from 'node:test';
import assert from 'node:assert/strict';
import verbs from 'italian-verbs-dict/dist/verbs.json' with { type: 'json' };
import { conjugate, conjugateTense, hasVerb, listVerbs } from './conjugate.ts';
import { EXCLUDED, isExcluded } from './excluded.ts';
import { getAux, isDualAux, _lists } from './aux.ts';

test('every verb in the auxiliary lists exists in the dictionary', () => {
  // `essere` is the one exception: the library conjugates it internally as an
  // auxiliary, so it is not a dictionary entry of its own.
  const missing = [...(_lists.ESSERE as Set<string>), ...Object.keys(_lists.DUAL)]
    .filter((v) => !hasVerb(v) && v !== 'essere');
  assert.deepEqual(missing, [], `not in dictionary: ${missing.join(', ')}`);
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

test('the whole dictionary conjugates, bar known gaps', () => {
  const tenses = ['PRESENTE', 'PASSATO_PROSSIMO', 'IMPERFETTO', 'COND_PRESENTE'] as const;
  const reflexive: string[] = [];
  const defective: string[] = [];

  for (const verb of Object.keys(verbs)) {
    const gaps = tenses.filter((t) => conjugateTense(verb, t).every((f) => f === null));
    if (gaps.length === 0) continue;
    (verb.endsWith('si') ? reflexive : defective).push(verb);
  }

  // The dictionary stores reflexives as infinitives only; callers are pointed
  // at the base verb instead. See `reflexiveBase`.
  assert.equal(reflexive.length, 46, `reflexive entries without forms: ${reflexive.length}`);

  // Genuinely defective verbs (`vigere`, `dirimere`, `soccombere` have no past
  // participle, so no compound tense), plus a little noise in the source data:
  // `dimmi` is an imperative stored as a lemma, `rimontar` a truncation.
  assert.equal(defective.length, 16, `unexpected: ${defective.join(', ')}`);
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
  assert.equal(listed.length, Object.keys(verbs).length - EXCLUDED.size);
  assert.ok(!listed.includes('dimmi'));
  assert.ok(!listed.includes('abbuffarsi'));
  assert.ok(listed.includes('parlare'));
  // sedere has a broken gerund but is a common verb, so it stays
  assert.ok(listed.includes('sedere'));
});

test('every excluded key is really in the dictionary', () => {
  const missing = [...EXCLUDED].filter((v) => !hasVerb(v));
  assert.deepEqual(missing, [], `excluded but not present: ${missing.join(', ')}`);
});

test('all reflexives are excluded', () => {
  const kept = Object.keys(verbs).filter((v) => v.endsWith('si') && !isExcluded(v));
  assert.deepEqual(kept, []);
});
