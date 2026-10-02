import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verbs } from './lexicon.ts';
import { conjugate, conjugateTense, hasVerb, listVerbs } from './conjugate.ts';
import { EXCLUDED, isExcluded } from './excluded.ts';
import { getAux, isDualAux } from './aux.ts';
import { isReflexive } from './reflexive.ts';
import { gerund, nonFiniteForms } from './forms.ts';
import { auxChoices, auxKind } from './aux.ts';
import { definitionsOf } from './definitions.ts';
import { progressiveTense } from './progressive.ts';
import { auxInfo, auxTooltipSections, conjugateTenseDisplay } from './display.ts';
import { auxRuleText, frequencyText } from './explanations.ts';
import { verbType } from './verb-type.ts';

test('an auxiliary entry names only avere and essere', () => {
  const bad = Object.entries(verbs as unknown as Record<string, { aux?: Record<string, unknown> }>)
    .filter(([, v]) => v.aux && Object.keys(v.aux).some((a) => a !== 'avere' && a !== 'essere'))
    .map(([verb]) => verb);
  assert.deepEqual(bad, [], `unknown auxiliary: ${bad.join(', ')}`);
});

test('the first auxiliary listed is the one used', () => {
  assert.equal(getAux('cominciare'), 'ESSERE');
  assert.equal(getAux('correre'), 'AVERE');
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

test('every rule and frequency in the auxiliary data has explanation text', () => {
  const missing: string[] = [];
  for (const verb of Object.keys(verbs)) {
    for (const choice of auxChoices(verb)) {
      if (choice.rule && !auxRuleText(choice.rule)) missing.push(`${verb}: rule ${choice.rule}`);
      if (choice.frequency && !frequencyText(choice.frequency))
        missing.push(`${verb}: frequency ${choice.frequency}`);
    }
  }
  assert.deepEqual(missing, []);
});

test('a verb that takes both auxiliaries equally shows both forms with a pipe', () => {
  const rows = conjugateTenseDisplay('approdare', 'PASSATO_PROSSIMO');
  // the participle is written once when it is the same
  assert.equal(rows[0], 'ho | sono approdato');
  // in the plural essere agrees and avere does not, so both forms are written out
  assert.equal(rows[3], 'abbiamo approdato | siamo approdati');
});

test('an unusual auxiliary follows the usual one in brackets', () => {
  const rows = conjugateTenseDisplay('decollare', 'PASSATO_PROSSIMO');
  assert.equal(rows[0], 'ho (sono) decollato');
  assert.equal(rows[3], 'abbiamo decollato (siamo decollati)');
  assert.equal(conjugateTenseDisplay('perire', 'PASSATO_PROSSIMO')[0], 'sono (ho) perito');
});

test('other tenses and single-auxiliary verbs are unchanged', () => {
  assert.deepEqual(conjugateTenseDisplay('parlare', 'PASSATO_PROSSIMO'), conjugateTense('parlare', 'PASSATO_PROSSIMO'));
  assert.deepEqual(conjugateTenseDisplay('andare', 'PASSATO_PROSSIMO'), conjugateTense('andare', 'PASSATO_PROSSIMO'));
  assert.deepEqual(conjugateTenseDisplay('decollare', 'PRESENTE'), conjugateTense('decollare', 'PRESENTE'));
});

test('the header lists each auxiliary with its frequency, rule and reason', () => {
  const decollare = auxInfo('decollare');
  assert.deepEqual(decollare.map((a) => a.label), ['Avere', 'Essere']);
  assert.equal(decollare[1].frequency?.label, 'Uncommon');
  const cominciare = auxInfo('cominciare');
  assert.equal(cominciare[0].rule?.label, 'With or without an object');
  assert.match(cominciare[1].detail ?? '', /^Used with a direct object\./);
  assert.equal(auxInfo('parlare')[0].hint, 'Most verbs take avere.');
});

test('the hover covers every auxiliary, headed by name when there are two, and is empty when there is nothing to say', () => {
  assert.deepEqual(auxTooltipSections(auxInfo('decollare')), [
    { title: 'Essere', lines: ['Uncommon: Correct, but seldom used.'] },
  ]);
  const cominciare = auxTooltipSections(auxInfo('cominciare'));
  assert.deepEqual(cominciare.map((s) => s.title), ['Essere', 'Avere']);
  assert.match(cominciare[0].lines[0], /^With or without an object: /);
  assert.equal(cominciare[0].lines[1], 'Used without a direct object.');
  assert.deepEqual(auxTooltipSections(auxInfo('andare')), []);
  assert.deepEqual(auxTooltipSections(auxInfo('parlare')), [
    { title: null, lines: ['Most verbs take avere.'] },
  ]);
});

test('a verb has its definitions, one string per meaning', () => {
  assert.deepEqual(definitionsOf('cominciare'), ['to begin, to start, to commence, to set about']);
  assert.deepEqual(definitionsOf('parlare').slice(0, 2), ['to talk, to speak', 'to cant']);
});

test('a verb with no definition, or no such verb, gives an empty list', () => {
  assert.deepEqual(definitionsOf('nonesiste'), []);
  assert.deepEqual(definitionsOf('toString'), []);
});

test('a verb is avere only, essere only or both', () => {
  assert.equal(auxKind('parlare'), 'avere');
  assert.equal(auxKind('andare'), 'essere');
  assert.equal(auxKind('cominciare'), 'both');
  const counts = { avere: 0, essere: 0, both: 0 };
  for (const verb of listVerbs()) counts[auxKind(verb)]++;
  assert.equal(counts.avere + counts.essere + counts.both, listVerbs().length);
  assert.ok(counts.both > 0 && counts.essere > 0);
});

test('a progressive tense is stare and the gerund', () => {
  assert.deepEqual(progressiveTense('cominciare', 'PRESENTE'),
    ['sto cominciando', 'stai cominciando', 'sta cominciando', 'stiamo cominciando', 'state cominciando', 'stanno cominciando']);
  assert.equal(progressiveTense('cominciare', 'IMPERFETTO')[3], 'stavamo cominciando');
  assert.equal(progressiveTense('cominciare', 'FUTURO_SEMPLICE')[0], 'starò cominciando');
});

test('a verb with no gerund has no progressive tense', () => {
  assert.ok(progressiveTense('licere', 'PRESENTE').every((form) => form === null));
});
