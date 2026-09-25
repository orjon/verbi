/**
 * The forms that have no person: infinitive, gerund and participles.
 *
 * These need care because the dictionary stores two of them badly. See
 * resources/README.md for the full account.
 */
import type { VerbsInfo } from 'italian-verbs-dict';
import verbsJson from 'italian-verbs-dict/dist/verbs.json' with { type: 'json' };

const verbs = verbsJson as unknown as VerbsInfo;

/**
 * Ten verbs whose stored gerund is not a gerund at all — a form from another
 * tense overwrote it, so `sedere` holds "siedevo" where "sedendo" belongs.
 */
const GERUND_FIXES: Record<string, string> = {
  addire: 'addicendo',
  disdire: 'disdicendo',
  percuotere: 'percuotendo',
  possedere: 'possedendo',
  ripercuotere: 'ripercuotendo',
  riscuotere: 'riscuotendo',
  risedere: 'risedendo',
  scuotere: 'scuotendo',
  sedere: 'sedendo',
  soprassedere: 'soprassedendo',
};

/**
 * The gerund, corrected.
 *
 * A stored gerund often carries a pronoun — "parlandosi" for "parlando" — so
 * it is cut at `-ando`/`-endo`. Where nothing usable is stored, the form is
 * built from the infinitive, which is correct for regular verbs.
 */
export function gerund(verb: string): string | null {
  if (GERUND_FIXES[verb]) return GERUND_FIXES[verb];

  const stored = verbs[verb]?.ger?.pres;
  if (typeof stored === 'string') {
    const trimmed = stored.match(/^.*(ando|endo)/);
    if (trimmed) return trimmed[0];
  }

  const m = verb.match(/^(.*)(are|ere|ire)$/);
  return m ? m[1] + (m[2] === 'are' ? 'ando' : 'endo') : null;
}

/**
 * Present participles for the verbs whose stored value is corrupt and whose
 * correct form the rule below cannot produce. `disdire` follows `dire`.
 */
const PRESENT_PARTICIPLE_FIXES: Record<string, string> = {
  disdire: 'disdicente',
};

/** Whether a stored present participle looks like one at all. */
function looksLikePresentParticiple(value: string): boolean {
  return /(ante|ente|anti|enti)$/.test(value);
}

/**
 * A present participle built from the infinitive: stem + `-ante`/`-ente`.
 *
 * Only used to repair a corrupt entry. The rule agrees with the dictionary for
 * 5,883 verbs and disagrees for 38 — and where it disagrees the dictionary is
 * right, because those verbs form the participle from an older stem (`bere` →
 * *bevente*). So a stored value is always preferred when it is usable.
 */
function derivePresentParticiple(verb: string): Participle | null {
  const m = verb.match(/^(.*)(are|ere|ire)$/);
  if (!m) return null;
  const single = m[1] + (m[2] === 'are' ? 'ante' : 'ente');
  const plural = `${single.slice(0, -1)}i`;
  return { S: single, SF: single, P: plural, PF: plural };
}

/** Participle forms, keyed by gender and number rather than person. */
export interface Participle {
  S: string;
  SF: string;
  P: string;
  PF: string;
}

function participle(verb: string, which: 'pres' | 'past'): Participle | null {
  const p = verbs[verb]?.part?.[which];
  if (!p || typeof p === 'string') return null;
  const { S, SF, P, PF } = p as Record<string, string>;
  if (!S || !SF || !P || !PF) return null;

  // Nine verbs hold an imperfect indicative here instead of a participle —
  // `sedere` gives "siedevo". Past participles are unaffected.
  if (which === 'pres' && !looksLikePresentParticiple(S)) {
    const fixed = PRESENT_PARTICIPLE_FIXES[verb];
    if (fixed) {
      const plural = `${fixed.slice(0, -1)}i`;
      return { S: fixed, SF: fixed, P: plural, PF: plural };
    }
    return derivePresentParticiple(verb);
  }

  return { S, SF, P, PF };
}

/**
 * Every form that has no person.
 *
 * The infinitive comes from the key, never from `inf.pres`, which holds a
 * pronoun-bearing form for 36% of verbs.
 */
export function nonFiniteForms(verb: string) {
  return {
    infinitive: verb,
    gerund: gerund(verb),
    participlePresent: participle(verb, 'pres'),
    participlePast: participle(verb, 'past'),
  };
}
