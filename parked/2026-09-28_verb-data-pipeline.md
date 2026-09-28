# Parked: Building our own Italian verb data from Morph-it

**Date:** 2026-09-28 19:31 Monday
**Project:** verbi

## Where this got to

Verbi is a Next.js app that shows the full conjugation of any Italian verb. It
started by using the npm packages `italian-verbs` (conjugation functions) and
`italian-verbs-dict` (the data). The data in that package turned out to have
thousands of wrong entries, so this session was spent building our own pipeline:
read the original source lexicon, apply our own corrections, and write a clean
`verbs.json` that the app will use instead.

The pipeline runs end to end and produces output. Nothing in the app reads that
output yet — the pages still import the npm package — and a large list of
open linguistic questions remains unanswered in `resources/to-verify.md`.

## Settled

- **Morph-it is the source of truth, assumed correct.** `italian-verbs-dict` is
  itself a conversion of Morph-it, and the conversion introduced the single
  largest category of error, so we go back to the original rather than patching
  theirs.

- **Morph-it is downloaded, not committed.** 18 MB, in `.gitignore`. It is
  fetched from the package author's GitHub repo because the official site
  (docs.sslmit.unibo.it) now serves a bot-check page. The file is **ISO-8859-1,
  not UTF-8** — reading it as UTF-8 silently breaks every accented form. This
  cost several hours before it was spotted.

- **Four layers, applied in this order**, each able to overrule the one before:
  1. Morph-it
  2. `scripts/validate.ts` — chooses between competing forms
  3. `resources/overrides.json` — our corrections, per form
  4. `scripts/corrections.ts` — rules that apply to classes of verbs

  Overrides come after validation so that a rule of ours cannot discard a
  decision made by hand.

- **`resources/overrides.json` holds per-form decisions; `scripts/corrections.ts`
  holds rules about classes of verbs.** A decision about one form of one verb
  goes in the JSON. Something that applies to 83 verbs goes in the TypeScript
  file as a list plus an accessor. Currently 14 verbs and 169 forms in the
  override file, and one rule (`absentSlots`) covering 83 verbs.

- **In `overrides.json`, `null` means "this form does not exist".** A key that
  is absent means "no opinion, Morph-it decides". That distinction matters: an
  earlier version treated an empty slot as a gap and generated a replacement
  form, inventing words like *solerei* that do not exist in Italian. `null` can
  be set on a whole mood (`"impr": null`), a whole tense
  (`"ind": { "fut": null }`) or a single slot.

- **Nothing is generated from rules at present.** An earlier build did generate
  missing forms from the regular paradigm and produced fabricated words
  (*esseva*, *essevi* for `essere`; *sola*, *soliamo* for `solere`). That build
  was abandoned. Generation is deferred, not ruled out.

- **Clitic-bearing forms are rejected at parse time.** Morph-it tags them
  explicitly (`VER:inf+pres+li`), and 11,150 of 391,285 verb lines carry one.
  The published package ignored that tag, which is why its infinitive for
  `parlare` is *parlarvi* rather than *parlare*.

- **Reflexive verbs are excluded**, along with two entries that are not verbs
  (`dimmi`, `rimontar`). 6,076 verbs remain.

- **The passato remoto third singular takes an acute accent** — *batté*, not
  *battè* — for weak `-ere` perfects. Morph-it writes it both ways (42 grave,
  16 acute) and contradicts itself within one verb family (*cuocè* but
  *ricuocé*). **This decision has not been applied to any data yet.**

## Rejected, and why

- **Patching `italian-verbs-dict`'s JSON instead of rebuilding.** The clitic
  errors can only be fixed by reading Morph-it's tags, and those tags are gone
  once the package has flattened them into strings.

- **Trimming archaic verbs to a handful of forms on editorial grounds.** An
  earlier pass cut `calere` and `consumere` down to a few forms as "modern
  usage". This was reversed as an editorial judgement rather than an error —
  then reinstated later with a Treccani-based justification. Both verbs are now
  trimmed, but for a sourced reason rather than a stylistic one.

- **Optional chaining (`?.`) for reading the override file.** `null?.x` returns
  `undefined`, which collapses "this form does not exist" into "no opinion" —
  the exact distinction the file depends on. `getOverride` uses explicit early
  returns instead.

- **Splitting `slots.ts` into `consts.ts` and `utils.ts`.** Grouping by kind
  separates a constant from the only function that uses it. A topic split
  (Morph-it's tag vocabulary versus our own structure) was proposed instead but
  not carried out.

- **A class for the slot helpers.** They are pure functions with no state; a
  class of static methods is a module with worse ergonomics. `import * as` gives
  the same grouping if it is wanted.

## Open

- **Item 3a in `resources/to-verify.md`: are the Italian future endings
  (`-ò -ai -à -emo -ete -anno`) invariant across all six persons for every
  verb?** 298 verbs have one person that disagrees with the stem the other five
  imply — almost always the first person singular holding what looks like the
  third. If the endings are invariant, all 298 are errors and can be rebuilt by
  rule. The build currently only reports them. `scripts/validate.ts` has the
  rule written but disabled for this reason.

- **Item 1b: do 83 verbs have an imperative?** Morph-it has none for any of
  them. Most are base forms of verbs normally used reflexively (`abbuffare`
  behind `abbuffarsi`), which may explain the absence. 249 slots.

- **Item 2b: strong or weak passato remoto.** 164 slots where Morph-it offers
  both (*accrebbi* / *accrescei*). Is there a rule, or is it verb by verb?

- **Item 2a: ten verbs with two competing stems throughout** — `cuocere`
  (*coc-* / *cuoc-*), `sedere` (*sed-* / *sied-*), `disfare`, `soddisfare` and
  others. 331 slots, but one decision per verb.

- **Applying the acute accent decision.** Decided, not implemented. 41 forms.

- **Whether to point the app at the new data.** `lib/conjugation/conjugate.ts`
  still imports `italian-verbs-dict`. Switching it to `data/temp-verbs.json`
  would make the corrections visible in `/verbs`.

## Unverified — check before relying on

- **The 86 auxiliary entries in `lib/conjugation/aux.ts`** (65 verbs listed as
  taking *essere*, 21 as taking either) were written from memory with no source.
  They silently determine every compound tense the app shows. This is the
  largest block of unverified material in the project. Check against a reference
  grammar.

- **`resources/regular-verbs.md`** was written from a mix of attested forms and
  recall. Its claim that 89.4% of verbs are regular was measured, but by a
  script that had to be corrected twice during the session.

- **`data/verbs.json` and `data/alternatives.json` are stale** — output of the
  abandoned build that contained generated forms. Do not use them. The current
  output is `data/temp-verbs.json`.

- **`scripts/build-verbs.ts` was deleted, but `scripts/accents.ts` remains
  orphaned** — nothing imports it. It holds the acute-accent rule, kept for when
  that decision is applied.

- **`scripts/validate.ts` is marked NOT IN USE at the top but is in fact
  imported by `scripts/build.ts`.** The comment is out of date and should be
  corrected.

## Files touched this session

- `scripts/parse-lexicon.ts` — reads Morph-it into candidate forms. Rejects
  clitic-tagged forms. Keeps every candidate; chooses nothing.
- `scripts/build.ts` — the pipeline. Writes `data/temp-verbs.json` and
  `data/temp-unresolved.json`.
- `scripts/validate.ts` — chooses between competing forms. Its `ind.fut` rule is
  deliberately absent pending item 3a.
- `scripts/corrections.ts` — `IGNORED_ENTRIES` (2 non-verbs) and
  `absentSlots()` (83 verbs with no present participle).
- `scripts/slots.ts` — slot names, mood constants, and the small helpers that
  translate Morph-it's notation.
- `scripts/regular.ts` — generates regular paradigms. Used only by
  `classify-verbs.ts`; not part of the build.
- `scripts/report-issues.ts` — writes `data/morph-it-issues.json`.
- `scripts/classify-verbs.ts` — writes `resources/verb-classes.json`.
- `resources/overrides.json` — 14 verbs, 169 forms, 77 nulls.
- `resources/to-verify.md` — the open questions, with counts.
- `resources/regular-verbs.md` — the regular conjugation rules.
- `resources/verb-classes.json` — every verb sorted by ending and by
  regular/irregular, complete/incomplete.
- `resources/README.md` — what is wrong with the published dictionary.
- `.gitignore` — excludes `resources/morph-it_048.txt`.

Nothing in `scripts/`, `data/` or the new `resources/` files is committed. The
app pages and `lib/conjugation` were committed earlier in the session
(`5c6cf8d`, `bb4421a`).

## Sources

- [Morph-it! at Unibo](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it)
  — the lexicon's home page. Now behind a bot check.
- [The lexicon file](https://raw.githubusercontent.com/RosaeNLG/rosaenlg/master/packages/italian-verbs-dict/resources/morph-it_048.txt)
  — where `resources/morph-it_048.txt` is fetched from. CC BY-SA 2.0.
- Treccani was cited by Orjon for the defective-verb rulings (`recere`,
  `licere`, `calere`, `consumere`, `solere`) and for the acute accent. The
  citations came through conversation, not from a page that was fetched.

## Resume with

"Read parked/2026-09-28_verb-data-pipeline.md and pick up at item 3a in
resources/to-verify.md — whether the Italian future endings are invariant across
all six persons."
