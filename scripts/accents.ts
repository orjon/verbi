/**
 * Accent rules for the passato remoto.
 *
 * Italian writes a final stressed `e` with an acute accent when the vowel is
 * closed, as in `perché` and `ventitré`, and with a grave accent when it is
 * open, as in `caffè` and the copula `è`. The third-person singular ending of a
 * weak `-ere` perfect is a closed vowel, so it takes the acute: `batté`,
 * `poté`, `ripeté`.
 *
 * Morph-it is inconsistent about this — it writes 42 of these with a grave and
 * 16 with an acute, and contradicts itself within one verb family (`cuocè` but
 * `ricuocé`). So the spelling is normalised here rather than taken from the
 * source.
 */

/** Persons of the passato remoto, as stored. */
export interface PastTense {
  S1?: string;
  S2?: string;
  S3?: string;
  P1?: string;
  P2?: string;
  P3?: string;
}

/**
 * True when a passato remoto is *weak* — formed with the regular endings on the
 * verb's own stem, as `temere` gives `temei` or `temetti`.
 *
 * A strong perfect (`presi`, `prese`, `presero`) changes the stem instead, and
 * its third singular ends in a plain unstressed `-e` with no accent, so the
 * rule below must not touch it.
 */
export function isWeakPerfect(past: PastTense): boolean {
  return /(?:ei|etti)$/.test(past.S1 ?? '');
}

/**
 * Corrects the accent on a passato remoto third singular.
 *
 * Returns the form unchanged unless it is a weak perfect written with a grave
 * accent, in which case the accent is flipped to acute. Everything else — the
 * `-are` and `-ire` endings (`parlò`, `partì`), strong perfects, and forms that
 * are already acute — is left alone.
 */
export function fixPastAccent(past: PastTense): { form: string | undefined; changed: boolean } {
  const form = past.S3;
  if (!form || !form.endsWith('è') || !isWeakPerfect(past)) {
    return { form, changed: false };
  }
  return { form: `${form.slice(0, -1)}é`, changed: true };
}
