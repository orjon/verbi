import { CONJUGATION, ENDING, PATH, PERSON, PERSONS } from './vocabulary.ts';

/**
 * The regular Italian paradigms, as documented in resources/regular-verbs.md.
 *
 * Used to fill a slot that Morph-it leaves empty or fills with something that
 * cannot belong there. Generating is preferred to hard-coding a value: the rule
 * states its own reasoning and keeps working if the source changes.
 */
type Person = (typeof PERSONS)[number];
type Row = Partial<Record<Person, string>>;

const { are, ere, ire } = CONJUGATION;

/** The regular endings of each conjugation group, in person order S1 to P3. */
const ENDINGS = {
  [are]: {
    [PATH.indi.pres]: ['o', 'i', 'a', 'iamo', 'ate', 'ano'],
    [PATH.indi.impf]: ['avo', 'avi', 'ava', 'avamo', 'avate', 'avano'],
    [PATH.indi.past]: ['ai', 'asti', 'ò', 'ammo', 'aste', 'arono'],
    [PATH.subj.pres]: ['i', 'i', 'i', 'iamo', 'iate', 'ino'],
    [PATH.subj.impf]: ['assi', 'assi', 'asse', 'assimo', 'aste', 'assero'],
    impr: { [PERSON.s2]: 'a', [PERSON.p1]: 'iamo', [PERSON.p2]: 'ate' },
    ger: ENDING.geru.are, partPres: ENDING.part.pres.are, partPast: ENDING.part.past.are,
  },
  [ere]: {
    [PATH.indi.pres]: ['o', 'i', 'e', 'iamo', 'ete', 'ono'],
    [PATH.indi.impf]: ['evo', 'evi', 'eva', 'evamo', 'evate', 'evano'],
    [PATH.indi.past]: ['ei', 'esti', 'é', 'emmo', 'este', 'erono'],
    [PATH.subj.pres]: ['a', 'a', 'a', 'iamo', 'iate', 'ano'],
    [PATH.subj.impf]: ['essi', 'essi', 'esse', 'essimo', 'este', 'essero'],
    impr: { [PERSON.s2]: 'i', [PERSON.p1]: 'iamo', [PERSON.p2]: 'ete' },
    ger: ENDING.geru.ere, partPres: ENDING.part.pres.ere, partPast: ENDING.part.past.ere,
  },
  [ire]: {
    [PATH.indi.pres]: ['o', 'i', 'e', 'iamo', 'ite', 'ono'],
    [PATH.indi.impf]: ['ivo', 'ivi', 'iva', 'ivamo', 'ivate', 'ivano'],
    [PATH.indi.past]: ['ii', 'isti', 'ì', 'immo', 'iste', 'irono'],
    [PATH.subj.pres]: ['a', 'a', 'a', 'iamo', 'iate', 'ano'],
    [PATH.subj.impf]: ['issi', 'issi', 'isse', 'issimo', 'iste', 'issero'],
    impr: { [PERSON.s2]: 'i', [PERSON.p1]: 'iamo', [PERSON.p2]: 'ite' },
    ger: ENDING.geru.ire, partPres: ENDING.part.pres.ire, partPast: ENDING.part.past.ire,
  },
} as const;

/** An infinitive of one of the three regular groups: its stem and its group. */
const REGULAR_INFINITIVE = new RegExp(`^(.*)(${are}|${ere}|${ire})$`);

/**
 * Italian keeps a consonant's sound constant across a paradigm, which changes
 * the spelling before `e` and `i`.
 */
function spell(stem: string, ending: string, infinitive: string): string {
  const frontVowel = /^[ei]/.test(ending);
  const iare = 'i' + are;
  if (/[cg]$/.test(stem) && infinitive.endsWith(are) && frontVowel) return `${stem}h${ending}`;
  if (/[cg]i$/.test(stem) && infinitive.endsWith(iare) && frontVowel) return stem.slice(0, -1) + ending;
  if (/i$/.test(stem) && infinitive.endsWith(iare) && /^i/.test(ending)) return stem + ending.slice(1);
  return stem + ending;
}

/**
 * The stem the future and conditional are built on: the infinitive without its
 * final `-e`, with `-are` shifting to `-er-` (`parlare` → `parler-`). This also
 * holds for the contracted `-rre` verbs, where `porre` gives `porr-`.
 */
export function futureStem(infinitive: string): string | null {
  const m = infinitive.match(REGULAR_INFINITIVE);
  if (m) return m[2] === are ? spell(m[1], 'er', infinitive) : infinitive.slice(0, -1);
  return infinitive.endsWith(CONJUGATION.rre) ? infinitive.slice(0, -1) : null;
}

/** Every regular form of a verb, or null if its infinitive is not one of the three. */
export function regularForms(infinitive: string, isc = false): Record<string, Row | string> | null {
  const m = infinitive.match(REGULAR_INFINITIVE);
  if (!m) return null;
  const [, stem, group] = m;
  const base = ENDINGS[group as keyof typeof ENDINGS];
  // -ire verbs of the finire type take -isc- in the present tenses
  const e = isc && group === ire
    ? { ...base,
        [PATH.indi.pres]: ['isco', 'isci', 'isce', 'iamo', 'ite', 'iscono'],
        [PATH.subj.pres]: ['isca', 'isca', 'isca', 'iamo', 'iate', 'iscano'],
        impr: { [PERSON.s2]: 'isci', [PERSON.p1]: 'iamo', [PERSON.p2]: 'ite' } }
    : base;
  const fs = futureStem(infinitive)!;

  const row = (endings: readonly string[], base?: string): Row =>
    Object.fromEntries(PERSONS.map((person, i) =>
      [person, base ? base + endings[i] : spell(stem, endings[i], infinitive)],
    )) as Row;

  return {
    [PATH.indi.pres]: row(e[PATH.indi.pres]),
    [PATH.indi.impf]: row(e[PATH.indi.impf]),
    [PATH.indi.past]: row(e[PATH.indi.past]),
    [PATH.indi.futu]: row(ENDING.futu, fs),
    [PATH.cond.pres]: row(ENDING.cond, fs),
    [PATH.subj.pres]: row(e[PATH.subj.pres]),
    [PATH.subj.impf]: row(e[PATH.subj.impf]),
    [PATH.impr.pres]: Object.fromEntries(
      Object.entries(e.impr).map(([person, end]) => [person, spell(stem, end, infinitive)]),
    ) as Row,
    [PATH.geru]: spell(stem, e.ger, infinitive),
    [PATH.infi]: infinitive,
  };
}
