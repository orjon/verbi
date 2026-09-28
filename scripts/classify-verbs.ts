/**
 * Sorts every verb into regular/irregular and complete/incomplete, by ending.
 *
 * Writes resources/verb-classes.json — just lists of infinitives, for deciding
 * where attention is needed.
 *
 *   regular     every form Morph-it has matches the regular paradigm
 *   incomplete  at least one slot has no form and no decision
 *
 * A slot set to null in resources/overrides.json is a decision, not a gap, so
 * the defective verbs (`calere`, `licere`, `recere`) count as complete.
 *
 * `-rre` verbs have no regular category: their infinitive is contracted
 * (`porre` was `ponere`), so the paradigm cannot be applied to them at all.
 *
 * Run with: node scripts/classify-verbs.ts
 */
import fs from 'node:fs';
import { parseLexicon } from './parse-lexicon.ts';
import { regularForms } from './regular.ts';
import { GENDER_SLOTS, IMPERATIVE_SLOTS, PERSON_SLOTS } from './slots.ts';

const OUT = 'resources/verb-classes.json';

/** The second-conjugation passato remoto has an -etti variant beside the -ei one. */
const ETTI = ['etti', 'esti', 'ette', 'emmo', 'este', 'ettero'];

type Tree = Record<string, any>;
const overrides: Tree = JSON.parse(fs.readFileSync('resources/overrides.json', 'utf8'));

function endingOf(verb: string): string | null {
  if (verb.endsWith('rre')) return '-rre';
  for (const e of ['are', 'ere', 'ire']) if (verb.endsWith(e)) return `-${e}`;
  return null;
}

/** Every slot a verb could have. */
function everySlot(): string[] {
  const out = ['inf.pres', 'ger.pres'];
  for (const k of ['ind.pres', 'ind.impf', 'ind.past', 'ind.fut', 'cond.pres', 'sub.pres', 'sub.impf'])
    for (const s of PERSON_SLOTS) out.push(`${k}.${s}`);
  for (const s of IMPERATIVE_SLOTS) out.push(`impr.pres.${s}`);
  for (const k of ['part.pres', 'part.past']) for (const g of GENDER_SLOTS) out.push(`${k}.${g}`);
  return out;
}

/** True when a slot has no form and no decision about it. */
function isGap(verb: string, path: string, has: boolean): boolean {
  if (has) return false;
  const [mood, tense, slot] = path.split('.');
  const ov = overrides[verb];
  if (!ov) return true;
  if (ov[mood] === null) return false;                 // whole mood decided absent
  if (ov[mood] === undefined) return true;
  const t = ov[mood][tense];
  if (t === null) return false;                        // whole tense decided absent
  if (t === undefined) return true;
  if (typeof t === 'string') return false;
  return !(slot in t);                                 // a null slot is a decision
}

const { candidates } = parseLexicon();
const ALL = everySlot();
const classes: Record<string, Record<string, string[]>> = {
  '-are': { regular: [], 'regular-incomplete': [], irregular: [], 'irregular-incomplete': [] },
  '-ere': { regular: [], 'regular-incomplete': [], irregular: [], 'irregular-incomplete': [] },
  '-ire': { regular: [], 'regular-incomplete': [], irregular: [], 'irregular-incomplete': [] },
  '-rre': { irregular: [], 'irregular-incomplete': [] },
};

for (const [verb, paths] of Object.entries(candidates)) {
  if (verb.endsWith('si')) continue;
  const ending = endingOf(verb);
  if (!ending) continue;                               // dimmi, rimontar

  const incomplete = ALL.some((p) => isGap(verb, p, Boolean(paths[p]?.length)));

  let regular = false;
  if (ending !== '-rre') {
    for (const isc of [false, true]) {
      const made = regularForms(verb, isc);
      if (!made) break;
      let checked = 0, wrong = 0;
      for (const [key, row] of Object.entries(made)) {
        const slots = typeof row === 'string' ? [[null, row] as const] : Object.entries(row);
        for (const [slot, want] of slots) {
          const found = paths[slot ? `${key}.${slot}` : key];
          if (!found) continue;
          checked++;
          const uniq = [...new Set(found)];
          const full = uniq.filter((f) => !uniq.some((g) => g !== f && g.startsWith(f)));
          if (full.includes(want as string)) continue;
          // the -etti passato remoto is equally regular
          if (key === 'ind.past' && slot) {
            const stem = verb.slice(0, -3);
            if (full.includes(stem + ETTI[PERSON_SLOTS.indexOf(slot)])) continue;
          }
          wrong++;
        }
      }
      if (checked && !wrong) { regular = true; break; }
    }
  }

  const bucket = `${regular ? 'regular' : 'irregular'}${incomplete ? '-incomplete' : ''}`;
  classes[ending][bucket].push(verb);
}

for (const groups of Object.values(classes)) for (const list of Object.values(groups)) list.sort();
fs.writeFileSync(OUT, JSON.stringify(classes, null, 1));

console.log('| ending | ' + Object.keys(classes['-are']).join(' | ') + ' | total |');
console.log('| --- | --- | --- | --- | --- | --- |');
let grand = 0;
for (const [ending, groups] of Object.entries(classes)) {
  const counts = ['regular', 'regular-incomplete', 'irregular', 'irregular-incomplete']
    .map((k) => (groups[k] ? groups[k].length : '—'));
  const total = Object.values(groups).reduce((s, l) => s + l.length, 0);
  grand += total;
  console.log(`| \`${ending}\` | ${counts.join(' | ')} | ${total} |`);
}
console.log(`\n${grand} verbs written to ${OUT}`);
