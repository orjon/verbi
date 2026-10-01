# Defective-verb rules

## Third person only

**Code:** `THIRD_PERSON_ONLY` (built from `WEATHER_VERBS`, `STATE_VERBS`,
`SENSATION_VERBS`)
**Where:** `scripts/corrections.ts`

**What it does:** removes the *io*, *tu*, *noi* and *voi* forms of every
tense, and the whole imperative (which only has those persons), keeping just
*lui/lei* and *loro*.

**In plain terms:** some verbs describe something happening, not something a
person does — weather (*piove*, "it's raining"), a state of affairs
(*vigono nuove leggi*, "new laws are in force"), or a sensation felt by
someone else (*mi prude il piede*, "my foot itches" — literally "the foot
itches to me"). None of these can have "I" or "you" as their subject.

**Weather verbs** (`WEATHER_VERBS`): albeggiare, annottare, diluviare,
grandinare, imbrunire, lampeggiare, nevicare, nevischiare, piovere,
piovigginare, ripiovere, spiovere, tuonare. The plural is kept for
figurative uses (*piovono critiche*, "criticism rains down") — this is why
Wiktionary's blank plural for the rarer diminutive verbs (`nevischiare`,
`piovigginare`) was not followed; it's consistent with this rule's own
reasoning, not a disagreement worth chasing.

**State verbs** (`STATE_VERBS`): vigere, accadere. `accadere` genuinely has
plural use (*accadono cose strane*).

**Sensation verbs** (`SENSATION_VERBS`): incombere, increscere, prudere,
rincrescere.

**`aggradare` is deliberately NOT in this rule**, despite fitting the same
shape — it is stricter: it is used only in the third person singular of the
present (singular only, not even the plural this class keeps).
Handled by its own override, nulling everything except the third singular
present.

**Source:** `aggradare` and `accadere` confirmed against IT8; the rest
carried forward from earlier project decisions (see `notes/to-verify.md`).

---

## Ignored entries

**Code:** `IGNORED_ENTRIES`
**Where:** `scripts/corrections.ts`

**What it does:** a short list of Morph-it headwords that are actually a
form of a different verb, entered as if they were their own infinitive
(`dimmi`, `rimontar`). Both real verbs are present separately, so dropping
these loses nothing.
