import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getConjugation } from 'italian-verbs';
import { compactLexicon, countMarkers, verifyCompact } from '../build-lexicon/scripts/compact.ts';
import type { Tree } from '../build-lexicon/types/build.ts';
import { expandVerb, isMarker, type CompactVerb } from './compact.ts';
import { expandedLexicon } from './compact-lexicon.ts';
import { verbs } from './lexicon.ts';

// The full lexicon, whether the file ships with markers or with every verb in full.
const lexicon: Tree = Object.fromEntries(
  Object.keys(verbs).map((verb) => [verb, (verbs as unknown as Tree)[verb]]),
);
const compact = compactLexicon(lexicon);

test('every verb fills back in to exactly what it started as', () => {
  verifyCompact(lexicon, compact);
});

test('most verbs are shipped as markers, and the file is much smaller', () => {
  assert.ok(countMarkers(compact) > 5000, `only ${countMarkers(compact)} markers`);
  assert.ok(JSON.stringify(compact).length < JSON.stringify(lexicon).length / 4);
});

/** The pattern a marker names, with or without auxiliaries beside it. */
const patternOf = (entry: CompactVerb) =>
  isMarker(entry) ? (typeof entry === 'string' ? entry : entry.regular) : null;

test('a marker names the pattern the verb follows', () => {
  assert.equal(patternOf(compact.parlare), 'are');
  assert.equal(patternOf(compact.dormire), 'ire');
  assert.equal(patternOf(compact.finire), 'ire-isc');
  assert.equal(patternOf(compact.avviare), 'are-i');
  assert.equal(patternOf(compact.andare), null);
});

test('a verb with auxiliaries keeps them beside its marker', () => {
  const entry = compact.cominciare as { regular: string; aux: unknown };
  assert.equal(entry.regular, 'are');
  assert.deepEqual(entry.aux, lexicon.cominciare.aux);
  assert.deepEqual(expandVerb('cominciare', compact.cominciare), lexicon.cominciare);
});

test('an irregular verb is kept in full', () => {
  assert.deepEqual(compact.andare, lexicon.andare);
  assert.deepEqual(compact.essere, lexicon.essere);
});

test('a marker that does not fit its verb is refused', () => {
  assert.throws(() => expandVerb('vendere', 'are'), /not a are verb/);
});

test('the lexicon fills verbs in on the fly and reads like the full one', () => {
  const expanded = expandedLexicon(compact);
  assert.deepEqual(Object.keys(expanded), Object.keys(lexicon));
  assert.ok('parlare' in expanded);
  assert.ok(!('nonesiste' in expanded));
  assert.equal(expanded['nonesiste' as keyof typeof expanded], undefined);
  assert.deepEqual(expanded.parlare, lexicon.parlare);
  assert.deepEqual(expanded.andare, lexicon.andare);
  // nothing is kept: the same verb comes out the same each time, built afresh
  assert.deepEqual(expanded.parlare, expanded.parlare);
  assert.notEqual(expanded.parlare, expanded.parlare);
});

test('italian-verbs conjugates from the lexicon that fills in on the fly', () => {
  const expanded = expandedLexicon(compact);
  assert.equal(getConjugation(expanded, 'parlare', 'PRESENTE', 1, 'S', undefined), 'parlo');
  assert.equal(
    getConjugation(expanded, 'parlare', 'PASSATO_PROSSIMO', 1, 'S', { aux: 'AVERE', agreeGender: 'M', agreeNumber: 'S' }),
    'ho parlato',
  );
  assert.equal(
    getConjugation(expanded, 'cominciare', 'PASSATO_PROSSIMO', 1, 'S', { aux: 'ESSERE', agreeGender: 'M', agreeNumber: 'S' }),
    'sono cominciato',
  );
});

test('a lexicon with every verb in full works as it is', () => {
  const expanded = expandedLexicon(lexicon);
  assert.deepEqual(Object.keys(expanded), Object.keys(lexicon));
  assert.deepEqual(expanded.parlare, lexicon.parlare);
});

test('listing the verbs does not build them', () => {
  let filled = 0;
  const counting = new Proxy(compact, {
    get: (target, key) => {
      filled++;
      return Reflect.get(target, key);
    },
  });
  const expanded = expandedLexicon(counting as typeof compact);
  Object.keys(expanded);
  assert.equal(filled, 0);
});
