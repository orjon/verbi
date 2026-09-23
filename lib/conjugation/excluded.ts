/**
 * Dictionary entries the app does not offer.
 *
 * Nothing here is repaired — these entries are simply skipped. See
 * resources/README.md for the full account of what is wrong with the data.
 */

/** Not verbs. `dimmi` is an imperative of `dire`; `rimontar` a shortened
 * spelling of `rimontare`. Both proper verbs are present separately. */
const NOT_VERBS = ['dimmi', 'rimontar'];

/**
 * Reflexives. The dictionary does not conjugate these — 28 of the 46 hold an
 * infinitive and nothing else — and the ones a learner wants (`chiamarsi`,
 * `alzarsi`, `lavarsi`) are absent anyway, because `mi lavo` is two words.
 */
const REFLEXIVE = [
  'abbuffarsi', 'accanirsi', 'accapigliarsi', 'accorgersi',
  'adontarsi', 'appigliarsi', 'appollaiarsi', 'arrabattarsi',
  'assentarsi', 'attagliarsi', 'attendarsi', 'avvalersi',
  'avvedersi', 'barcamenarsi', 'condolersi', 'congratularsi',
  'formalizzarsi', 'genuflettersi', 'imbattersi', 'impadronirsi',
  'impancarsi', 'impelagarsi', 'impossessarsi', 'incazzarsi',
  'inerpicarsi', 'infiltrarsi', 'infischiarsi', 'ingegnarsi',
  'inginocchiarsi', 'intestardirsi', 'lagnarsi', 'ostinarsi',
  'pavoneggiarsi', 'pentirsi', 'ravvedersi', 'riappropriarsi',
  'rifugiarsi', 'rivalersi', 'sbellicarsi', 'sbracciarsi',
  'sbronzarsi', 'scapicollarsi', 'sgolarsi', 'specchiarsi',
  'suicidarsi', 'vergognarsi',
];

/** Every excluded key. */
export const EXCLUDED = new Set<string>([...NOT_VERBS, ...REFLEXIVE]);

/** True when the app should not offer this verb. */
export function isExcluded(verb: string): boolean {
  return EXCLUDED.has(verb);
}
