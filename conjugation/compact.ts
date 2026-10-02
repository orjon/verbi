/**
 * The compact form of the lexicon, and how a verb is filled back in from it.
 *
 * A verb that conjugates exactly as its pattern says is shipped as a marker
 * naming the pattern, and the app writes out its forms whenever it is looked up.
 * Every other verb is shipped in full.
 *
 *   "parlare": "are"
 *   "abbagliare": { "regular": "are", "aux": { "avere": {...}, "essere": {...} } }
 *   "andare": { "ind": {...}, "cond": {...}, ... }
 *
 * A verb's auxiliaries are not forms, so they are kept beside the marker. A
 * marker always means the complete regular conjugation: a verb with a missing
 * slot, or any form off its pattern, is shipped in full.
 *
 * The build makes the compact file (build-lexicon/scripts/compact.ts) and checks
 * that every verb fills back in to exactly what it started as.
 */
import { regularForms } from './regular.ts';

/**
 * The patterns a marker can name:
 *
 *   are        parlare, and the -iare verbs with an unstressed i (cominciare)
 *   are-i      -iare verbs whose i is stressed (avviare: avvii)
 *   ere-ei     -ere verbs with the past in -ei, -é, -erono (temei, temé)
 *   ere-etti   -ere verbs with the past in -etti, -ette, -ettero (temetti)
 *   ire        -ire verbs without -isc- (dormire: dormo)
 *   ire-isc    -ire verbs with -isc- (finire: finisco)
 */
export const REGULAR_TYPES = ['are', 'are-i', 'ere-ei', 'ere-etti', 'ire', 'ire-isc'] as const;
export type RegularType = (typeof REGULAR_TYPES)[number];

/** A verb's tree of forms: mood → tense → person. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VerbTree = Record<string, any>;

/** One verb in the compact lexicon. */
export type CompactVerb =
  | RegularType
  | { regular: RegularType; aux?: Record<string, unknown> }
  | VerbTree;

/** The compact lexicon: every verb, by infinitive. */
export type CompactLexicon = Record<string, CompactVerb>;

/** The patterns to try for a verb, from the ending of its infinitive. */
export function typesFor(infinitive: string): RegularType[] {
  if (infinitive.endsWith('are')) return ['are', 'are-i'];
  if (infinitive.endsWith('ere')) return ['ere-ei', 'ere-etti'];
  if (infinitive.endsWith('ire')) return ['ire', 'ire-isc'];
  return [];
}

/** The past historic of an -ere verb in -etti: the three persons that differ from -ei. */
const ETTI_PAST: Record<string, string> = { S1: 'etti', S3: 'ette', P3: 'ettero' };

/**
 * The complete regular conjugation of a verb in a pattern, in the shape of the
 * lexicon, or null when the infinitive does not fit the pattern.
 */
export function regularVerb(infinitive: string, type: RegularType): VerbTree | null {
  if (!typesFor(infinitive).includes(type)) return null;
  const forms = regularForms(infinitive, type === 'ire-isc', type === 'are-i');
  if (!forms) return null;

  const tree: VerbTree = {};
  for (const [path, value] of Object.entries(forms)) {
    const [mood, tense] = path.split('.');
    (tree[mood] ??= {})[tense] = value;
  }
  if (type === 'ere-etti') {
    const stem = infinitive.slice(0, -3);
    for (const [person, ending] of Object.entries(ETTI_PAST)) tree.ind.past[person] = stem + ending;
  }
  return tree;
}

/** True for an entry that is a marker, with or without its auxiliaries. */
export function isMarker(
  entry: CompactVerb,
): entry is RegularType | { regular: RegularType; aux?: Record<string, unknown> } {
  return typeof entry === 'string' || typeof (entry as { regular?: unknown }).regular === 'string';
}

/** A verb in full, from its entry in the compact lexicon. */
export function expandVerb(infinitive: string, entry: CompactVerb): VerbTree {
  if (!isMarker(entry)) return entry as VerbTree;
  const type = typeof entry === 'string' ? entry : entry.regular;
  const tree = regularVerb(infinitive, type);
  if (!tree) throw new Error(`${infinitive} is not a ${type} verb`);
  const aux = typeof entry === 'string' ? undefined : entry.aux;
  return aux ? { ...tree, aux } : tree;
}
