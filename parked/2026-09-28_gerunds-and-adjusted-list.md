# Parked: Gerund fixes, build refactor and the adjusted-forms list

**Date:** 2026-09-28 23:17 Monday
**Project:** verbi
**Supersedes:** parked/2026-09-28_verb-data-pipeline.md (in part; read it first
for the pipeline's background)

## Where this got to

Verbi is a Next.js app that shows Italian verb conjugations. We are building our
own verb data from the Morph-it lexicon with `scripts/build.ts`, because the npm
package the app uses (`italian-verbs-dict`) has thousands of wrong entries. This
session refactored the build, audited `scripts/validate.ts`, fixed every
missing or wrong gerund, fixed the misfiled present participles, and added a
build output listing every form that differs from Morph-it, for the
development app to highlight.

Changes since the earlier park the same day:

- **A rule now generates forms.** The earlier note said "nothing is generated
  from rules". There is now one: `gerundFromImperfect` in `scripts/derive.ts`.
- **The "NOT IN USE" header in `scripts/validate.ts` is fixed.**
- **Items 3c and 3e in `resources/to-verify.md` are decided.** Item 2a is
  partly decided.
- **`overrides.json` has grown** from 14 verbs (169 forms, 77 nulls) to 26
  verbs (198 forms, 81 nulls).

## Settled

- **`build.ts` is split into small functions.** They are `slotPaths`,
  `decideSlot`, `buildVerb`, `writeOutput` and `printStats`. `decideSlot` holds
  only the rules and returns a `Decision` saying which source answered. The
  split was verified to give byte-identical output before any behaviour
  changed.

- **A missing gerund is made from the imperfect by rule.** The gerund shares
  the imperfect's stem (`facevo → facendo`, `sedevo → sedendo`). The rule is
  `gerundFromImperfect` in `scripts/derive.ts`.
  - **Why the imperfect, not the infinitive:** it handles the `fare` family and
    the other shortened infinitives (`dire`, `bere`, `porre`) without a list.
  - **Test result:** it matches Morph-it's own gerund for 6,058 of 6,061 verbs.
    The 3 misses (`essere`, `riessere`, `empire`) already have a gerund, so the
    rule is never used for them.
  - **Where it runs:** after the slot loop, so an override on the imperfect is
    already applied. It only fills an empty gerund, and skips a gerund whose
    override is `null`.

- **`derive.ts` stays one file for rules that make one form from another.** It
  was briefly renamed `gerund.ts` and then renamed back at Orjon's request.

- **Slots left empty are recorded only after the rules have run.** Two lists in
  `data/temp-unresolved.json` work this way:
  - `emptied`: every form Morph-it gave was rejected;
  - `conflicting`: several forms and none chosen.

  A slot a rule fills drops out of both. This fixed `provenire`, which was
  listed as a conflict even after its gerund was filled.

- **Threshold for rule versus override:** write a rule when it would fix about
  20 or more cases. Below that, use entries in `overrides.json`, unless one
  single rule already fixes them all. This is saved in Claude's memory as a
  standing preference.

- **Mobile diphthongs (*dittongo mobile*), as applied to the imperfect and
  gerund only:**
  - `-ie-` drops when the stress is on the ending: `sedevo`, `sedendo`, not
    `siedevo`.
  - `-uo-` is kept: `scuotevo`, `cuocendo`. Wiktionary marks the `-o-` forms
    (`scotevo`, `cocendo`) "now rare".

  Because the two go opposite ways, these were done as overrides, not a rule.
  See Open: this does not carry over to every tense.

- **Imperfect `io` overrides**, from which the gerund rule makes the gerund:
  sedere `sedevo`, possedere `possedevo`, risedere `risedevo`, soprassedere
  `soprassedevo`, percuotere `percuotevo`, riscuotere `riscuotevo`.

- **Gerund overrides**, each checked on Wiktionary:
  - cuocere `cuocendo`;
  - disfare `disfacendo`;
  - soddisfare `soddisfacendo`.

  `disfando` and `soddisfando` treat the verb as a regular `-are` verb, and
  Wiktionary doesn't list them.

- **Gerund status:** 6,073 of 6,076 verbs have one. The 3 without are
  `consumere` (an override sets it to `null`), `licere` and `recere`. All three
  are archaic verbs already settled in to-verify item 1a.

- **A present participle is kept only where it's in use.** This is the same
  standard as the 83 verbs in `corrections.ts`.
  - **Kept:** sedere `sedente`, disdire `disdicente`, risedere `risedente`,
    scuotere `scuotente`.
  - **possedere:** `possidente` / `possidenti`. Treccani says `possedente` is
    rare and usually replaced by `possidente`.
  - **Set to `null`:** soprassedere, percuotere, riscuotere, ripercuotere. No
    evidence of use was found beyond generated conjugation tables.

  The evidence for each is recorded in `resources/to-verify.md`, in the
  Resolved section "Gerunds and present participles — decided 2026-09-28".

- **`data/temp-adjusted.json` lists every path we changed or checked, per
  verb**, for the development app to colour. Shape:
  `{ "sedere": ["ger.pres", "ind.impf.S1", ...] }`. It includes:
  - every path an override sets, whether a form or `null`, even when the result
    matches Morph-it;
  - every path a class rule removes (`absentSlots`);
  - every slot where `validate.ts` rejected a misfiled form, such as `addicevo`
    in `addire`'s gerund;
  - every slot whose final form differs from what Morph-it gives on its own,
    which covers the derived gerunds.

  Paths are at the level they're set, so `part.pres` or `impr` can sit
  alongside individual slots. It currently holds 424 paths in 110 verbs. It
  records which paths changed, not how (override, rule or derivation).

- **`to-verify.md` is being reworked into a record of decisions.** New entries
  follow the pattern decision, reason, evidence.

## Rejected, and why

- **Generating a missing gerund from the infinitive.** It needs an exception
  for the `fare` family (an `-are` verb that takes `-endo`). The imperfect
  handles that on its own.
- **One rule for the `-ie-`/`-uo-` conflicts.** The two diphthongs resolve in
  opposite directions, and there were only 6 cases, which is under the
  threshold.
- **A present-participle rule (imperfect `-evo` → `-ente`).** It holds for
  5,960 of 5,976 verbs; the misses are `-iente` forms like `obbediente`. But it
  would only be used for 9 verbs, which is under the threshold. It also can't
  be run on every empty participle, because most Italian verbs have none in use.
- **`italian-verbs-dict` as a second opinion.** It is built from Morph-it and
  keeps whichever form Morph-it lists last (44,497 of 46,696 multi-form slots).
  Its gerund for `sedere` is `siedevo`.
- **Counting clipped-variant drops (`parlan` → `parlano`) as adjustments.**
  About 34,000 slots would be flagged, which would make the list useless.
- **The `&&` form Orjon asked about for the override loop in `slotPaths`**
  (`x && for (...)`). It's a syntax error, because `for` is a statement. The
  working equivalent is `if (x) for (...)`. The code keeps `?? {}`.

## Open

- **Two notes in `resources/to-verify.md` state the `-ie-`/`-uo-` rule too
  broadly.** Claude offered to correct them and Orjon has not answered yet.
  - The "Partly decided" note under item 2a says the same reasoning settles the
    rest of each verb's forms.
  - "Decision 2" in the Resolved section doesn't say that the `-ie-` rule is
    the traditional one.

  What Wiktionary shows instead:
  - **Future and conditional of the `sedere` family:** both forms are valid.
    `siederò` is marked "now more common, especially in speech", and `sederò`
    is the traditional form. The same holds for `possiederò`, `risiederò` and
    `soprassiederò`.
  - **`nuocere`'s past participle:** `nociuto` is the main form, and `nuociuto`
    is marked rare. This is the opposite of the `-uo-` pattern.
  - **Syllables ending in a consonant never take the diphthong** (`scossi`,
    `cossi`, `nocqui`). Morph-it doesn't list these as conflicts.

- **The next piece of work: the 566 conflicts** (step 3 of the plan). The first
  step is to count the current 566 against to-verify groups 2a, 2b and 2c,
  whose counts come from an older report, then take 2a first. The first
  question for Orjon in 2a: **for the future and conditional of the `sedere`
  family, traditional (`sederò`) or modern (`siederò`)?** `nuocere` is also
  still undecided.

- **Switching the app to the built data.** `lib/conjugation/conjugate.ts:9` and
  `lib/conjugation/forms.ts:8` still import `italian-verbs-dict`, so the app
  currently shows `siedevo` as the gerund of `sedere`. The plan is to switch
  only once the conflicts are down, because any unresolved slot will show as a
  gap.

- **The development app reading `temp-adjusted.json`** to colour verbs. Not
  started.

## Unverified — check before relying on

- **Wiktionary checks were read through a fetch tool that summarises pages.**
  The `nuocere`, `sedere`-family and `cuocere` results were confirmed from the
  rendered HTML (`curl`). The earlier per-verb checks (gerunds, imperfects,
  singular participles) were not.
- **The plural participles (`sedenti`, `disdicenti`, …)** follow the regular
  `-ente` → `-enti` pattern. They were not checked against a source.
- **The 6,056 gerunds taken straight from Morph-it** were not checked one by
  one. Each ends correctly and agrees with its own imperfect under the rule.
- **`scuotere` has no imperfect** in the built data. Its imperfect is still a
  `scotevo`/`scuotevo` conflict, part of item 2a.
- **Counts in `to-verify.md`** mix two sources: the original report
  (`scripts/report-issues.ts`: 619 conflicts) and the build (566 conflicts).
  They count differently and haven't been reconciled.

## Files touched this session

- `scripts/build.ts` — split into functions. Added:
  - the gerund rule call, run after the slot loop;
  - the `rejected` decision and the `emptied` list;
  - conflicts recorded only after the rules have run;
  - `temp-adjusted.json` output, with the `overridePaths` helper and the
    `REJECTED` marker;
  - new counts and example comments on each function.
- `scripts/derive.ts` — new. `gerundFromImperfect`, plus the grammar notes on
  gerunds and mobile diphthongs.
- `scripts/validate.ts` — header rewritten, removing "NOT IN USE". Type error
  on line 68 fixed (`PERSON_SLOTS as readonly string[]`).
- `resources/overrides.json` — added the entries listed under Settled: 12
  verbs, 29 forms and 4 nulls net. Kept in alphabetical order.
- `resources/to-verify.md` — added the new Resolved section. Marked 3c and 3e
  decided and added a note to 2a. Corrected the override counts to 198 forms
  and 81 nulls; they were already stale at 177/76. Updated "Four forms
  removed".
- `data/temp-verbs.json`, `data/temp-unresolved.json`,
  `data/temp-adjusted.json` — build outputs, regenerated.
- `~/.claude/projects/-Users-orjon-sync-dev-verbi/memory/prefer-rules-over-hardcoding.md`
  — added the threshold of about 20 cases.

Nothing is committed. `scripts/`, `data/` and the new `resources/` files are
all still untracked. The suggested one-line commit message was "Add Morph-it
build pipeline with gerund fixes".

## Sources

- [Wiktionary — sedere](https://en.wiktionary.org/wiki/sedere),
  [possedere](https://en.wiktionary.org/wiki/possedere),
  [risedere](https://en.wiktionary.org/wiki/risedere),
  [soprassedere](https://en.wiktionary.org/wiki/soprassedere),
  [percuotere](https://en.wiktionary.org/wiki/percuotere),
  [riscuotere](https://en.wiktionary.org/wiki/riscuotere),
  [scuotere](https://en.wiktionary.org/wiki/scuotere),
  [ripercuotere](https://en.wiktionary.org/wiki/ripercuotere),
  [disdire](https://en.wiktionary.org/wiki/disdire),
  [provenire](https://en.wiktionary.org/wiki/provenire),
  [cuocere](https://en.wiktionary.org/wiki/cuocere),
  [disfare](https://en.wiktionary.org/wiki/disfare),
  [soddisfare](https://en.wiktionary.org/wiki/soddisfare),
  [nuocere](https://en.wiktionary.org/wiki/nuocere) — conjugation tables used
  for every gerund, imperfect and participle decision, and for the
  future-tense finding.
- [Treccani — possedere](https://www.treccani.it/vocabolario/possedere/) — the
  basis for `possidente`.
- [Wikizionario — possidente](https://it.wiktionary.org/wiki/possidente) —
  confirms it as the present participle of `possedere`.
- [Olivetti — risedente](https://www.dizionario-italiano.it/dizionario-italiano.php?lemma=RISEDENTE100)
  — the evidence for keeping `risedente`.
- [Dizy — scuotente](https://www.dizy.com/it/voce/scuotente) — the De Roberto
  quotation used to keep `scuotente`.
- [Dizy — frasi con percuotente](https://www.dizy.com/it/voce/percuotente/frasi)
  — only unverified examples, so `percuotente` was set to `null`.
- [Morph-it! paper](https://godzilla.sslmit.unibo.it/~eros/downloads/Morph-it.pdf)
  — says the data was built with "corpus-based methods, regular-expression-based
  rules and manual checking". It doesn't mention the misfiled imperfects.

## Resume with

"Read parked/2026-09-28_gerunds-and-adjusted-list.md. First answer whether to
correct the two over-broad diphthong notes in resources/to-verify.md, then start
the 566 conflicts with item 2a: traditional sederò or modern siederò for the
sedere family's future and conditional."
