# The mobile diphthong

**Code:** `MOBILE_DIPHTHONG`, `withMobileDiphthongForms`, `resolveDiphthong`
**Where:** `build-lexicon/scripts/corrections.ts`

**What it does:** Italian verbs like *sedere* (*siedo*) and *cuocere*
(*cuocio*) have a stem that alternates between a plain form and one with a
diphthong (*ie* or *uo*), depending on the verb and, for some, on which
person is stressed. The rule holds each verb's plain stem, diphthong stem,
and (for one small family) a third literary stem, plus which pattern it
follows, then chooses the right one per form and keeps the other as a
labelled alternative where genuinely valid.

**In plain terms:** a few dozen Italian verbs change their middle vowel
depending on the form — *io siedo* but *noi sediamo*; *io cuocio* and *noi
cuociamo* (this one doesn't change). This rule knows which pattern each verb
follows.

## The three patterns (`keep`)

- **`"always"`** — the diphthong is kept in every form. The *-ere* *-uo-*
  verbs: cuocere, nuocere, percuotere, ripercuotere, riscuotere, scuotere.
  The plain form is kept as a `rare` alternative wherever the diphthong is
  chosen.
- **`"stressed"`** — kept where the stem is stressed, and *also* in the
  future and conditional. The *-ie-* verbs: possedere, risedere, sedere,
  soprassedere, each with a third, literary stem (*seggo*, kept as a
  `literary` alternative). The plain form in the future/conditional is kept
  as a `formal` alternative (*sederò* beside *siederò*).
- **`"stressedOnly"`** — kept only where the stem is stressed, **not** in
  the future or conditional. The *-are* *-uo-* verbs: affocare, infocare,
  risolare, risonare, rotare, scorare, sonare. Confirmed directly against
  Wiktionary's own tables: unlike the *-ere* group, these show no diphthong
  at all — not even as an alternate — in *noi/voi* or the future
  (*rotiamo*, *roterò*, never *ruotiamo*, *ruoterò*). `affocare` is the one
  exception here — Wiktionary keeps *affoco* as a labelled "poetic"
  alternate (recorded as `literary`, the closest existing kind; "poetic"
  itself isn't one of ours).

**A generic conjugator site was tried as a second source for `cuocere` and
found unreliable** — it prints both the diphthong and plain stem on every
single line regardless of which is actually standard, the same fault found
independently for `piare` (see `build-lexicon/docs/rules/present-tense.md`). Not used as a
source anywhere in this rule.

**Two bugs were found and fixed while building the `stressedOnly` mode:**
1. The candidate-injection step (`withMobileDiphthongForms`) originally
   matched only the *first* Morph-it candidate starting with the plain
   stem at a path. Where Morph-it lists both a clipped form and the full
   form (*rotin*, *rotino*), it built the diphthong candidate off the
   clipped one, producing a malformed *ruotin*. Fixed to map over every
   matching candidate.
2. A pre-existing override for `sonare` — written before this pattern was
   known, when Morph-it had almost nothing for that headword — hard-coded
   the wrong plain forms (*sono, sona, sonano*) directly, silently
   overriding the new rule at exactly those three paths. Corrected to
   *suono, suona, suonano*; its imperative is derived from the indicative,
   so the fix cascaded automatically.

**Source:** the `-ere` groups carried forward from earlier project decisions;
the `stressedOnly` group confirmed against Wiktionary's tables directly, with
`affocare`'s labelled alternate also from Wiktionary.
