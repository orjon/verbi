import { PERSON_SLOTS } from './slots.ts';

/**
 * The regular Italian paradigms, as documented in resources/regular-verbs.md.
 *
 * Used to fill a slot that Morph-it leaves empty or fills with something that
 * cannot belong there. Generating is preferred to hard-coding a value: the rule
 * states its own reasoning and keeps working if the source changes.
 */
type Slot = (typeof PERSON_SLOTS)[number];
type Row = Partial<Record<Slot, string>>;

const ENDINGS = {
  are: {
    'ind.pres': ['o', 'i', 'a', 'iamo', 'ate', 'ano'],
    'ind.impf': ['avo', 'avi', 'ava', 'avamo', 'avate', 'avano'],
    'ind.past': ['ai', 'asti', 'ò', 'ammo', 'aste', 'arono'],
    'sub.pres': ['i', 'i', 'i', 'iamo', 'iate', 'ino'],
    'sub.impf': ['assi', 'assi', 'asse', 'assimo', 'aste', 'assero'],
    impr: { S2: 'a', P1: 'iamo', P2: 'ate' },
    ger: 'ando', partPres: 'ante', partPast: 'ato',
  },
  ere: {
    'ind.pres': ['o', 'i', 'e', 'iamo', 'ete', 'ono'],
    'ind.impf': ['evo', 'evi', 'eva', 'evamo', 'evate', 'evano'],
    'ind.past': ['ei', 'esti', 'é', 'emmo', 'este', 'erono'],
    'sub.pres': ['a', 'a', 'a', 'iamo', 'iate', 'ano'],
    'sub.impf': ['essi', 'essi', 'esse', 'essimo', 'este', 'essero'],
    impr: { S2: 'i', P1: 'iamo', P2: 'ete' },
    ger: 'endo', partPres: 'ente', partPast: 'uto',
  },
  ire: {
    'ind.pres': ['o', 'i', 'e', 'iamo', 'ite', 'ono'],
    'ind.impf': ['ivo', 'ivi', 'iva', 'ivamo', 'ivate', 'ivano'],
    'ind.past': ['ii', 'isti', 'ì', 'immo', 'iste', 'irono'],
    'sub.pres': ['a', 'a', 'a', 'iamo', 'iate', 'ano'],
    'sub.impf': ['issi', 'issi', 'isse', 'issimo', 'iste', 'issero'],
    impr: { S2: 'i', P1: 'iamo', P2: 'ite' },
    ger: 'endo', partPres: 'ente', partPast: 'ito',
  },
} as const;

/** Future and conditional endings, invariant for every Italian verb. */
const FUTURE = ['ò', 'ai', 'à', 'emo', 'ete', 'anno'];
const CONDITIONAL = ['ei', 'esti', 'ebbe', 'emmo', 'este', 'ebbero'];

/**
 * Italian keeps a consonant's sound constant across a paradigm, which changes
 * the spelling before `e` and `i`.
 */
function spell(stem: string, ending: string, infinitive: string): string {
  const frontVowel = /^[ei]/.test(ending);
  if (/[cg]$/.test(stem) && /are$/.test(infinitive) && frontVowel) return `${stem}h${ending}`;
  if (/[cg]i$/.test(stem) && /iare$/.test(infinitive) && frontVowel) return stem.slice(0, -1) + ending;
  if (/i$/.test(stem) && /iare$/.test(infinitive) && /^i/.test(ending)) return stem + ending.slice(1);
  return stem + ending;
}

/**
 * The stem the future and conditional are built on: the infinitive without its
 * final `-e`, with `-are` shifting to `-er-` (`parlare` → `parler-`). This also
 * holds for the contracted `-rre` verbs, where `porre` gives `porr-`.
 */
export function futureStem(infinitive: string): string | null {
  const m = infinitive.match(/^(.*)(are|ere|ire)$/);
  if (m) return m[2] === 'are' ? spell(m[1], 'er', infinitive) : infinitive.slice(0, -1);
  return /rre$/.test(infinitive) ? infinitive.slice(0, -1) : null;
}

/** Every regular form of a verb, or null if its infinitive is not one of the three. */
export function regularForms(infinitive: string, isc = false): Record<string, Row | string> | null {
  const m = infinitive.match(/^(.*)(are|ere|ire)$/);
  if (!m) return null;
  const [, stem, group] = m;
  const base = ENDINGS[group as keyof typeof ENDINGS];
  // -ire verbs of the finire type take -isc- in the present tenses
  const e = isc && group === 'ire'
    ? { ...base,
        'ind.pres': ['isco', 'isci', 'isce', 'iamo', 'ite', 'iscono'],
        'sub.pres': ['isca', 'isca', 'isca', 'iamo', 'iate', 'iscano'],
        impr: { S2: 'isci', P1: 'iamo', P2: 'ite' } }
    : base;
  const fs = futureStem(infinitive)!;

  const row = (endings: readonly string[], base?: string): Row =>
    Object.fromEntries(PERSON_SLOTS.map((slot, i) =>
      [slot, base ? base + endings[i] : spell(stem, endings[i], infinitive)],
    )) as Row;

  return {
    'ind.pres': row(e['ind.pres']),
    'ind.impf': row(e['ind.impf']),
    'ind.past': row(e['ind.past']),
    'ind.fut': row(FUTURE, fs),
    'cond.pres': row(CONDITIONAL, fs),
    'sub.pres': row(e['sub.pres']),
    'sub.impf': row(e['sub.impf']),
    'impr.pres': Object.fromEntries(
      Object.entries(e.impr).map(([slot, end]) => [slot, spell(stem, end, infinitive)]),
    ) as Row,
    'ger.pres': spell(stem, e.ger, infinitive),
    'inf.pres': infinitive,
  };
}
