/**
 * Reports where Morph-it's verb data is missing or conflicting.
 *
 * Morph-it is the source and is assumed correct. Nothing here corrects,
 * generates or chooses — it only says where the source does not give a single
 * clear answer, so a human can decide.
 */
import fs from 'node:fs';
import { parseLexicon } from './parse-lexicon.ts';
import { GENDER_SLOTS, IMPERATIVE_SLOTS, PERSON_SLOTS } from './slots.ts';


/** Every slot a fully attested verb would have. */
function expectedSlots(): string[] {
  const out: string[] = ['inf.pres', 'ger.pres'];
  for (const key of ['ind.pres', 'ind.impf', 'ind.past', 'ind.fut', 'cond.pres', 'sub.pres', 'sub.impf'])
    for (const s of PERSON_SLOTS) out.push(`${key}.${s}`);
  for (const s of IMPERATIVE_SLOTS) out.push(`impr.pres.${s}`);
  for (const key of ['part.pres', 'part.past']) for (const g of GENDER_SLOTS) out.push(`${key}.${g}`);
  return out;
}

/** A clipped form is a proper prefix of another candidate for the same slot. */
function isClipped(form: string, others: string[]): boolean {
  return others.some((o) => o !== form && o.startsWith(form));
}

const { candidates } = parseLexicon();
const EXPECTED = expectedSlots();

const missing: Record<string, string[]> = {};
const conflicting: Record<string, Record<string, string[]>> = {};
let verbs = 0, missingCount = 0, conflictCount = 0, clippedOnly = 0;

for (const [verb, paths] of Object.entries(candidates)) {
  if (verb.endsWith('si')) continue;
  verbs++;

  for (const slot of EXPECTED) {
    const forms = paths[slot];
    if (!forms || forms.length === 0) {
      (missing[verb] ??= []).push(slot);
      missingCount++;
      continue;
    }
    const uniq = [...new Set(forms)];
    if (uniq.length === 1) continue;

    // Several candidates. If they differ only by clipping, that is not a
    // conflict of substance — one form is the other with its ending dropped.
    const full = uniq.filter((f) => !isClipped(f, uniq));
    if (full.length === 1) { clippedOnly++; continue; }

    ((conflicting[verb] ??= {})[slot] = full);
    conflictCount++;
  }
}

fs.writeFileSync('data/morph-it-issues.json', JSON.stringify({ missing, conflicting }, null, 1));

console.log('verbs examined                      :', verbs.toLocaleString());
console.log('slots expected per verb             :', EXPECTED.length);
console.log('');
console.log('slots with NO form in Morph-it      :', missingCount.toLocaleString(), `(${Object.keys(missing).length} verbs)`);
console.log('slots with CONFLICTING forms        :', conflictCount.toLocaleString(), `(${Object.keys(conflicting).length} verbs)`);
console.log('slots differing only by clipping    :', clippedOnly.toLocaleString(), '(not counted as a conflict)');
