# Auxiliary selection

**Code:** `ESSERE`, `DUAL`, `getAux`, `isDualAux`, `isReflexive`
**Where:** `lib/conjugation/aux.ts` — separate from the build pipeline; this
runs in the app itself, since the auxiliary depends on how a compound tense
is used, not on the base verb data.

**What it does:** Italian compound tenses ("I have gone", "I am gone") need
either *avere* or *essere*, and getting it wrong is a real grammar error, not
a stylistic one (`ho andato` is simply wrong). `getAux` returns the right
choice for a verb; reflexive verbs (anything ending `si`) always take
*essere* independently of the lists below.

**`ESSERE`** — verbs of motion, arrival, change of state, staying, seeming,
existing, and the `venire` compounds that inherit its choice. Not
exhaustive — Italian has a long tail — but covers the verbs a learner meets.
Anything absent falls back to *avere*, the majority case.

**`DUAL`** — verbs that take either auxiliary depending on sense: *avere*
when used transitively or of the activity itself, *essere* when intransitive
or of a destination reached (*ho corso* vs *sono corso a casa*). `getAux`
returns the more common reading; `isDualAux` lets the UI flag the ambiguity.
Includes the weather verbs and the phases of daylight (*è piovuto* and *ha
piovuto* both standard; *essere* is the traditional choice, so that's the
default returned).

## The 2026-09-29 addition and recheck

98 verbs were added to `ESSERE` from a comparison against Wiktionary's own
auxiliary data — a single source, not individually checked at the time given
the scale. All 98 were then rechecked directly against IT8, one by one,
in a later pass the same day. Results:

- **~90 confirmed exactly as added.**
- **`rampare` removed** — it takes avere, not essere.
- **`arrampicare` removed** (found in a *second* recheck pass) — the plain verb takes avere. (`arrampicarsi`, the reflexive form,
  still takes essere independently, via the reflexive rule.)
- **`dilagare`, `rifluire`, `rimbalzare` moved to `DUAL`** — both auxiliaries are given for each, not essere alone.
- **`pollare`, `licere`**: these have no compound tenses in real use at all (`pollare` is not used in them), so the
  auxiliary question doesn't really apply — left in `ESSERE` since it does
  no harm (never invoked), rather than removed.
- **`permanere`**: added separately — it takes essere, though compound tenses are rarely used since the participle itself is archaic-only.

**Still unconfirmed** (IT8 returned no usable page, even via
web search, across two recheck attempts): `cucciare`, `rabbuiare`,
`smemorare`, `arenare`. Two more are confirmed only by inheritance from
their base verb, not a direct auxiliary check: `addivenire` (from `venire`), `ristare` (from `stare`, which it follows in the other tenses).

**A test exists for this**: `lib/conjugation/aux.test.ts` checks that every
verb named in `ESSERE` and `DUAL` actually exists in the dictionary, so a
typo here fails loudly rather than silently doing nothing.
