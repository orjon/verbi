# To verify

Morph-it is the source and is assumed correct. This lists where it does not
give a single clear answer, so you can decide, and records every decision made
so far with its reason.

Decisions go in `resources/overrides.json`, which currently holds 149 forms
and 95 nulls and takes precedence over Morph-it. Its entries are of three kinds:

- a form filling a slot Morph-it left empty — most of them
- a form replacing one Morph-it has tagged correctly but which is not the one
  to show — `solere`'s subjunctive, `calere`'s past historic, `consumere`'s
  passato remoto and participle, `possedere`'s present participle
- `null`, removing a form that does not belong — mostly on the defective verbs
  and the present participles no one uses

Rules that apply to a class of verbs live in `scripts/corrections.ts`, and rules
that make one form from another in `scripts/derive.ts`.

An override is kept only if it changes the outcome: a form that Morph-it or a
rule already produces is not written into `overrides.json`. On 2026-09-29, 64
such forms were removed — 10 that a rule produces and 54 that Morph-it already
gives — with no change to the built data. A `null` on a slot that is already
empty is kept: it records the gap as decided and stops a rule filling it later.

Counts as of 2026-09-29, from the output of `node scripts/build.ts`:

| | Slots | Verbs |
| --- | --- | --- |
| Still empty, and not decided | 0 | 0 |
| Deliberately empty (an override or class rule) | 592 | — |
| Two or more forms, nothing chooses | 249 | 87 |

The open conflicts are listed in the `conflicting` section of
`data/unresolved.json`. Every path the build changes or checks is listed
in `data/adjusted.json`, as `selected` (the form shown), `rejected` (forms
Morph-it gives that were judged mistakes) and `alternatives` (valid variants
not chosen); a key is left out when it would be empty.

When a conflict is settled, each form not chosen is either a mistake or a valid
variant — an older or modern spelling, or another accepted form. Valid variants
are recorded in `resources/alternatives.json`, which the build copies to
`data/alternatives.json`. How the app shows them is decided later.

Earlier counts in this file came from `scripts/report-issues.ts`, which counts
raw Morph-it before any decision, so they do not go down as items are settled.

## How this file is organised

The open items below are numbered in the order to work through them. Some
decisions change others — fixing the accent changed the forms item 5 chooses
between — so each item says why it sits where it does. After adding any rule, check `overrides.json`
for entries the rule makes redundant.

Settled items are under **Resolved** at the bottom. This file used an earlier
numbering; older notes and commits may refer to it:

| Earlier | Now |
| --- | --- |
| 1a, 1b, 1c, 3c, 3d, 3e | Resolved |
| 3b | Open 1, now resolved |
| 3a | Open 2, now resolved |
| 2a | Open 3, now resolved |
| 2c | Open 4 |
| 2b | Open 5 |
| 3f | Open 6 |
| — | Open 7, new |
| Part 4 | Open 8 |

---

# Open — in the order to work through

## 1. Passato remoto with a grave accent — **DONE** 2026-09-29

Applied. See *Acute accent in the past historic* under Resolved.

## 2. The future disagrees with its own stem — **DONE** 2026-09-29

Applied. See *Future io form* under Resolved.

## 3. Two stems throughout — **DONE** 2026-09-29

Decided and applied. See *Two stems throughout, and the fare family* under
Resolved.

## 4. Everything else — 87 slots

The conflicts that are neither a past historic (item 5) nor one of the verbs
settled in item 3. `sedere`'s 13 and the imperative of 10 compounds of `fare`
were settled with item 3.

| Tense | Slots | Example |
| --- | --- | --- |
| `part.past` | 20 | `disseppellire` SF: dissepolta / disseppellita |
| `sub.pres` | 18 | `incartapecorire` S1: incartapecora / incartapecorisca |
| `ind.pres` | 13 | `dovere` P3: debbono / devono |
| `ind.fut` | 12 | `premorire` S2: premorirai / premorrai |
| `cond.pres` | 12 | `premorire` S3: premorirebbe / premorrebbe |
| `impr.pres` | 7 | `andare` S2: va' / vai |
| `part.pres` | 4 | `consentire` SF: consentente / consenziente |
| `sub.impf` | 1 | `essere` S3: foss' / fosse |

**Question:** separate decisions, or do some share a pattern that a rule could
settle, as the `fare` family did?

## 5. Passato remoto — strong or weak — 162 slots, 69 verbs

**Why fifth:** it needed the accents corrected first, which is now done (item 1).

Many `-ere` verbs have both a strong perfect and a regular one, and Morph-it
lists both. Some regular `-ere` verbs have the two regular sets instead
(`credei` / `credetti`), which are both correct.

**Question:** is there a rule — always prefer the strong form, or the weak?

| Verb | Slot | Forms |
| --- | --- | --- |
| `inferire` | S1 | inferii / infersi |
| `inferire` | S3 | inferse / inferì |
| `inferire` | P3 | inferirono / infersero |
| `dare` | S1 | detti / diedi |
| `dare` | S3 | dette / diede |
| `dare` | P3 | dettero / diedero |
| `succedere` | S3 | succedette / successe |
| `succedere` | P3 | succedettero / successero |
| `dovere` | S1 | dovei / dovetti |
| `dovere` | S3 | dovette / dové |
| `dovere` | P3 | doverono / dovettero |
| `assistere` | S1 | assistei / assistetti |
| `assistere` | S3 | assistette / assisté |
| `assistere` | P3 | assisterono / assistettero |
| `coesistere` | S1 | coesistei / coesistetti |
| `coesistere` | S3 | coesistette / coesisté |
| `coesistere` | P3 | coesisterono / coesistettero |
| `concedere` | S1 | concedetti / concessi |
| `concedere` | S3 | concedette / concesse |
| `concedere` | P3 | concedettero / concessero |
| `connettere` | S1 | connessi / connettei |
| `connettere` | S3 | connesse / connetté |
| `connettere` | P3 | connessero / connetterono |
| `consistere` | S1 | consistei / consistetti |
| `consistere` | S3 | consistette / consisté |
| `consistere` | P3 | consisterono / consistettero |
| `credere` | S1 | credei / credetti |
| `credere` | S3 | credette / credé |
| `credere` | P3 | crederono / credettero |
| `deflettere` | S1 | deflessi / deflettei |
| `deflettere` | S3 | deflesse / defletté |
| `deflettere` | P3 | deflessero / defletterono |
| `desistere` | S1 | desistei / desistetti |
| `desistere` | S3 | desistette / desisté |
| `desistere` | P3 | desisterono / desistettero |
| `dirimere` | S1 | dirimei / dirimetti |
| `dirimere` | S3 | dirimette / dirimé |
| `dirimere` | P3 | dirimerono / dirimettero |
| `disconnettere` | S1 | disconnessi / disconnettei |
| `disconnettere` | S3 | disconnesse / disconnetté |
| …and 122 more | | |

## 6. Errors in Morph-it found while testing the imperative rule — 3

Independent of the others; can be done at any point.

Testing the imperative rule against Morph-it's own imperatives turned up three
forms that are wrong in Morph-it. The build currently keeps them.

| Verb | Slot | Morph-it has | Should be |
| --- | --- | --- | --- |
| `imbestialire` | ind.pres.S2 | imbestialici | imbestialisci |
| `rammollire` | impr.pres.S2 | rammollisca | rammollisci |
| `rincivilire` | impr.pres.S2 | rincivilisca | rincivilisci |

*imbestialici* is missing the `s`. *rammollisca* and *rincivilisca* are the
polite (*Lei*) imperative, filed under the familiar *tu* slot.

**Question:** confirm, and set by override.

## 7. An earlier override that looks wrong — `ridare` — 1

Independent of the others; can be done at any point.

`overrides.json` sets `ridare` ind.pres.S1 to *rido*, replacing Morph-it's
single form *ridò*. No reason was recorded. *ridò* appears to be correct:
`ridare` is stressed on the final syllable (*ri-DÒ*), and Italian writes an
accent on a word of more than one syllable stressed on its final vowel. Without
the accent, *rido* is "I laugh", from `ridere` — Italian Wiktionary lists *rido*
only as a form of `ridere`, and lists *ridà*, with its accent, as a form of
`ridare`.

**Question:** remove the override, so the build uses Morph-it's *ridò*?

## 8. Clipped forms — about 46,100 slots

Independent of the others.

About 46,100 slots hold two forms where one is the other with its ending
dropped — `abbacchiavan` beside `abbacchiavano`. These are literary elisions,
so the longer form is used and the shorter ignored. The shorter form is not
listed in `data/adjusted.json`, since dropping it is how `validate.ts`
reads Morph-it rather than a change to it.

**Question:** is that right, or should they be kept as alternatives?

## 9. Impersonal verbs — to be measured

Raised 2026-09-29 while fixing the future. Some verbs are used only, or almost
only, in the third person: weather verbs such as `piovere`, `ripiovere` and
`spiovere`, and verbs such as `vigere`, which is used of laws and rules.
Morph-it gives some of them forms in every person — `vigerò` is correctly
spelt, but no one says it.

The question is not about spelling, so it was kept out of the future fix. It
applies to every tense, not one slot: should the forms outside the third person
be `null` for these verbs?

**First step:** list the verbs that are impersonal or nearly so, and which
persons Morph-it gives each of them. Likely also `incombere`, `prudere`,
`rincrescere` and `increscere`; to be checked, not assumed.

---

# Resolved

Decisions already recorded, each with its reason. Against the original report
on raw Morph-it (866 empty slots, 619 conflicts), **572 empty slots and 6
conflicts were closed** by the first three entries below. The later decisions
are counted by `scripts/build.ts`; the current open totals are at the top of
this file.

| What | Slots closed | Where it lives |
| --- | --- | --- |
| Five verbs completed from scratch | 92 | `overrides.json` |
| Five defective verbs locked down | 148 | `overrides.json` |
| Present participles for 83 verbs | 332 | `corrections.ts` |
| **Total** | **572** | |

## Five verbs completed from scratch — 92 slots

Morph-it had nothing for these; the forms were supplied by hand. The override
for each now holds only the forms Morph-it and the rules do not already give;
the rest come from Morph-it or `scripts/derive.ts`.

| Verb | Slots closed | Notes |
| --- | --- | --- |
| `sonare` | 33 | almost the whole paradigm |
| `plaudere` | 23 | whole paradigm, with the `-etti` passato remoto chosen over the `-é` forms — which also settled 2 conflicts |
| `spengere` | 13 | `ind.pres`, `ind.past`, `sub.pres`, `part.past` |
| `cerchiare` | 12 | `ind.pres`, `sub.pres`, `impr.pres`, `part.past` |
| `presentire` | 11 | including *presentono*, which replaced Morph-it's clipped *presenton* — see *Forms that did not end in a vowel* |

## Five defective verbs locked down — 148 slots

The table lists what each verb keeps. The override holds the `null`s that
remove the rest, and only those kept forms Morph-it does not already give.

| Verb | Slots closed | What survives |
| --- | --- | --- |
| `recere` | 49 | *recere*, *rece*, and the four participles *reciuto / reciuta / reciuti / reciute* |
| `licere` | 45 | *licere*, *lice*, *liceva / licevano*, *licesse / licessero*, and *lecito / lecita / leciti / lecite* |
| `consumere` | 23 | the passato remoto and participle; the present tense was dropped as contamination from `consumare` |
| `calere` | 19 | monopersonale — *cale, caleva, calse, calga, calesse, caluto* |
| `solere` | 12 | everything but the conditional, future and past historic |

`calere`'s *calse* and *calga* override Morph-it, which has *calè* and no
present subjunctive at all. `licere`'s participle survives because *lecito* has
become an everyday adjective, which is why it alone expands across all four
gender and number slots.

Treccani was the source for these rulings. The citations came through
conversation, not from a page that was fetched.

## Present participles for 83 verbs — 332 slots

None of the 83 has a present participle in Morph-it or in use. Recorded as
`absentSlots()` in `scripts/corrections.ts` rather than 83 entries in the
override file, because it is one decision about a class of verbs. Their
imperatives were a separate question, now decided — see *Imperatives for 82
verbs*.

## `solere` — subjunctive corrected — 6 conflicts

Morph-it files the standard subjunctive (*soglia, sogliamo, sogliate,
sogliano*) under the conditional, while the subjunctive slot holds a
regularised variant (*sola, soliamo, solano*). The standard forms are now in
the right place and the conditional is nulled.

This is the pattern to watch: overriding a form Morph-it has tagged correctly,
rather than filling a gap or removing junk.

## `dare` and `essere` — accented variants — 4 slots

These overrides predate this file's decision log; the reasons below are
reconstructed from what Morph-it gives, on 2026-09-29.

| Verb | Slot | Morph-it gives | Override | Reason |
| --- | --- | --- | --- | --- |
| `dare` | ind.pres.S1 | do / dò | do | the standard spelling has no accent; Wiktionary marks only *dà* as written with one |
| `dare` | ind.pres.S2 | dai / dài | dai | as above |
| `dare` | impr.pres.S2 | da' / dai / dài | dai | confirmed 2026-09-29: *dai* is the modern standard and *da'* the traditional form, kept as a valid alternative. The opposite of `fare`, where *fa'* leads |
| `essere` | ind.pres.S3 | è / é | è | *è* is the standard spelling |

The `ridare` override from the same period looks wrong — see open item 7.

## Gerunds and present participles — decided 2026-09-28

Morph-it files imperfect forms (`sedevo`, `disdicevo`) under the gerund and
present participle of nine verbs. `scripts/validate.ts` rejects them, since a
gerund must end in `-ando`/`-endo` and a present participle in `-ente`/`-ante`.
The decisions below fill or close those slots, and settle the gerund conflicts.
Every form was checked against Wiktionary, Treccani or the Olivetti dictionary.

**Decision 1 — a missing gerund is made from the imperfect by rule.** The
gerund shares the imperfect's stem: `facevo → facendo`, `sedevo → sedendo`.
This matches Morph-it's own gerund for 6,058 of 6,061 verbs; the three
exceptions (`essere`, `riessere`, `empire`) already have a gerund. The rule is
`gerundFromImperfect` in `scripts/derive.ts`, which also holds the grammar
notes. It only fills an empty gerund and respects a `null` override.

**Decision 2 — in the imperfect and gerund, `-ie-` drops and `-uo-` is kept.**
Both are mobile diphthongs (*dittongo mobile*). The traditional rule is that the
diphthong appears only under stress (`sìedo`, but `sedévo`).

- `-ie-` follows it in the imperfect and gerund: Wiktionary gives only
  `possedevo`.
- Modern Italian keeps `-uo-` in unstressed forms too (`scuotévo`); Wiktionary
  marks the `-o-` forms rare.

This decision covers the imperfect and gerund only. It does not extend to
every tense: in the future and conditional of the `-ie-` verbs both forms are
valid and the modern one keeps the diphthong (`siederò`), and `nuocere`'s past
participle prefers `nociuto` — see *Two stems throughout, and the fare family*.
The imperfect `io` form was first set by override, and Decision 1 makes the
gerund from it. Since 2026-09-29 the imperfect comes from `resolveDiphthong` in
`scripts/corrections.ts` instead, and the overrides were removed:

| Verb | Imperfect (now by rule) | Gerund (rule) |
| --- | --- | --- |
| `sedere` | sedevo | sedendo |
| `possedere` | possedevo | possedendo |
| `risedere` | risedevo | risedendo |
| `soprassedere` | soprassedevo | soprassedendo |
| `percuotere` | percuotevo | percuotendo |
| `riscuotere` | riscuotevo | riscuotendo |

`disdire` (`disdicevo → disdicendo`) and `provenire` (`provenendo` over
`proveniendo`) were made by the rule with no override needed.

**Decision 3 — the `fare` compounds take `-facendo`; `cuocere` keeps `-uo-`.**
First set as overrides on the gerund. Since 2026-09-29 all three come from the
conflict rules in `scripts/corrections.ts` — the `fare` rule and
`resolveDiphthong` — and the overrides were removed:

| Verb | Gerund | Reason |
| --- | --- | --- |
| `disfare` | disfacendo | `disfando` treats it as a regular `-are` verb; Wiktionary lists only `disfacendo` |
| `soddisfare` | soddisfacendo | as `disfare` |
| `cuocere` | cuocendo | `cocendo` is marked rare, as in Decision 2 |

**Decision 4 — a present participle is kept only where it is in use.** This is
the standard applied to the 83 verbs in `corrections.ts`. The forms follow the
rule (`sedevo → sedente`); the question was whether each one exists in use.

| Verb | Decision | Evidence |
| --- | --- | --- |
| `sedere` | sedente | own entry on Italian Wiktionary |
| `disdire` | disdicente | own entry on Italian Wiktionary |
| `risedere` | risedente | own entry in the Olivetti dictionary |
| `scuotere` | scuotente | literary use: De Roberto, *La morta* (1888) |
| `possedere` | **possidente** | Treccani: *"possedènte, raro, spesso sostituito da possidènte"* |
| `soprassedere` | `null` | only in generated conjugation tables |
| `percuotere` | `null` | only two unverified example sentences |
| `riscuotere` | `null` | only in generated conjugation tables |
| `ripercuotere` | `null` | only in generated conjugation tables |

**Not used as a source:** `italian-verbs-dict`. It is built from Morph-it and
keeps whichever form Morph-it lists last, so it repeats these errors — its
gerund for `sedere` is `siedevo`.

Sources: [Treccani — possedere](https://www.treccani.it/vocabolario/possedere/),
[Wikizionario — possidente](https://it.wiktionary.org/wiki/possidente),
[Olivetti — risedente](https://www.dizionario-italiano.it/dizionario-italiano.php?lemma=RISEDENTE100),
[Dizy — scuotente](https://www.dizy.com/it/voce/scuotente),
and the Wiktionary conjugation tables for each verb.

## Two stems throughout, and the fare family — applied 2026-09-29 — 316 slots

Settled 316 conflicts in 21 verbs: all of open item 3, `sedere`'s 13 from item 4,
and the imperative of 10 more compounds of `fare`. Conflicts went from 565 to
249.

**Decision 1 — compounds of `fare` conjugate like `fare`.** For `disfare` and
`soddisfare`, 98 of their 100 conflicting slots have one form that is exactly
the prefix plus `fare`'s own form (*disfaccio* = dis- + *faccio*, *disfeci*,
*disfarò*, *disfatto*). The other two were the imperative *tu*, where `fare`
itself has two forms.

- `fare`'s imperative *tu*: **fa'** (override), with *fai* a valid alternative.
  It carries to every compound: *disfa'*, *rifa'*, *stupefa'*.
- Rule: `resolveFareCompound` in `scripts/corrections.ts`. `fare` is built first so
  the rule can read its finished forms.
- Valid alternatives: the regular -are forms in the present, future,
  conditional, present subjunctive and imperative (*disfo*, *disferò*, *disfi*,
  *disfa*), which Wiktionary marks "sometimes proscribed, now more common" —
  the imperative added on 2026-09-29, for *Disfa le valigie!*; and the prefix plus
  `fare`'s own alternatives (*disfai*).
- Rejected as mistakes: *disfavo*, *disfato*, *disfante*, and *disfai* / *disfò*
  in the past historic. Wiktionary gives only the `fare` forms in those tenses.
- Wiktionary labels the `fare` forms "now less common" in the four tenses where
  the regular forms are in use. They were chosen as the formal standard, and
  for consistency across the family.

**Decision 2 — mobile diphthongs.** Rule: `resolveDiphthong` in
`scripts/corrections.ts`, with the stems of each verb in `MOBILE_DIPHTHONG`. It
settles a conflict only when the forms differ in the stem alone.

| Verbs | Chosen | Valid alternative | Rejected |
| --- | --- | --- | --- |
| `cuocere`, `scuotere`, `percuotere`, `riscuotere` | `-uo-` in every form (*cuoceva*, *scuoterò*) | the `-o-` form, marked rare (*coceva*) | — |
| `nuocere` | `-uo-` in every form, including where the syllable ends in a consonant (*nuoccio*, *nuoccia*) | *noccio*, *nociamo* | — |
| `sedere`, `possedere`, `risedere`, `soprassedere` | `-ie-` where the stem is stressed (*siedo*, *possiedano*) and in the future and conditional (*possiederò*); none elsewhere (*sediamo*, *possedeva*) | the `-gg-` form (*seggo*, *posseggo*); the plain future and conditional (*possederò*, traditional) | `-ie-` where unstressed (*siediamo*), plain where stressed (*possedano*) |

`nuocere` goes against the consonant rule (a syllable ending in a consonant
takes no diphthong): *nuoccio* was chosen over *noccio* as the form in modern
use, on Orjon's decision. Wiktionary lists *nòccio* first, without a label.

**Overrides**, where the forms differ in more than the stem:

| Verb | Slots | Set to | Why |
| --- | --- | --- | --- |
| `cuocere` | past historic io, lui/lei, loro | *cossi*, *cosse*, *cossero* | strong past historic; Morph-it's weak *cuocei*, *cuocé*, *cuocerono* are not in Wiktionary |
| `nuocere` | past participle | *nociuto*, *nociuta*, *nociuti*, *nociute* | *nuociuto* is marked rare (kept as alternative); Morph-it repeated *nociuto* in the feminine and plural slots |
| `scuotere`, `percuotere`, `riscuotere` | present and imperative voi | *scuotete*, *percuotete*, *riscuotete* | Morph-it offered *scotete / scuotiamo*: the `noi` form filed in the `voi` slot. *scotete* is kept as the rare alternative |

**Overrides removed** because the rules now produce the same form: the
imperfect `io` form of `sedere`, `possedere`, `risedere`, `soprassedere`,
`percuotere` and `riscuotere`, and the gerund of `cuocere`, `disfare` and
`soddisfare`. Also removed from `resources/alternatives.json`: *cocendo*,
*percotevo*, *riscotevo*, which the rules now produce. The built data was
checked to be unchanged by each removal.

**Not settled here:** `sedere`'s future *io* form *siederò* stays an override —
that slot was empty in Morph-it, and the rules only settle conflicts.

## Future io form — applied 2026-09-29 — 304 forms in 301 verbs

**Decision:** the future uses one stem for all six persons, so its `io` form
always ends in -ò. Morph-it filed the `lui/lei` form, ending in -à, in the `io`
slot of 301 verbs — *accenderà* where *accenderò* belongs.

**Checked first:** every one of the 304 `io` forms ending in -à in Morph-it is
identical to that verb's own `lui/lei` form, and no correct `io` form ends in
-à. So the fix cannot catch anything else.

**How:** `withFutureS1` in `scripts/corrections.ts` swaps the final -à for -ò
where the `io` slot holds the verb's own `lui/lei` form. Only the ending
changes, so every kind of stem is kept: *scucirà → scucirò*, *sprovvedrà →
sprovvedrò*, *riotterrà → riotterrò*, *trasdurrà → trasdurrò*. It runs on
Morph-it's forms before `validate.ts` chooses, as the accent fix does, and
the original is listed as `rejected` in `data/adjusted.json`. Both endings
come from `ENDING.futu` in `scripts/vocabulary.ts`.

**Result:** 298 forms corrected in the built data, which were all the
disagreements the build reported; it now reports none. The other 6 forms were
inside conflicts in `possedere`, `risedere` and `soprassedere`, which now
read *possederò / possiederò* and so on — see open item 3.

**Overrides:** none became redundant. The three that a broader future rule
might have replaced — `sedere` *siederò*, `addivenire` *addiverrò* and
*addiverremo* — fill slots that were empty or in conflict, which a swap does not
touch.

**Not part of this:** whether impersonal verbs such as `vigere` should have an
`io` form at all. That is a separate question — open item 9.

## Acute accent in the past historic — applied 2026-09-29 — 48 forms

**Decision:** the third person singular of a weak `-ere` past historic takes
an acute accent — *batté*, not *battè* — because it is a closed `e`, as in
*perché*. A strong past historic takes no accent at all (*prese*, *mise*).
Morph-it wrote 48 of these with a grave, and contradicted itself within one
family (*cuocè* but *ricuocé*).

**How:** `withAcutePast` in `scripts/accents.ts` corrects Morph-it's forms
before `validate.ts` chooses, so forms inside conflicts are corrected too. It
changes `è` to `é` in `ind.past.S3` when any of the verb's past historic `io`
forms ends in `-ei` or `-etti`, which marks a weak past historic. The original
spelling is listed as `rejected` in `data/adjusted.json`.

| Group | Count | Result |
| --- | --- | --- |
| Weak, a single form | 36 | corrected by the rule — *abbattè* → *abbatté*, *potè* → *poté* |
| Weak, inside a conflict | 7 | corrected by the rule; the conflicts are left for item 5, except `cuocere`'s, settled as *cosse* with item 3 |
| Strong | 3 | overrides: `figgere` *fisse*, `suggere` *susse*, `urgere` *urse* — Morph-it had *fissè*, *sussè*, *ursè* |
| Already settled | 2 | `calere` (*calse*) and `consumere` (*consunse*), by their earlier overrides |

The 36: `abbattere`, `battere`, `capere`, `cernere`, `combattere`, `competere`,
`compiere`, `concernere`, `congenere`, `contessere`, `controbattere`,
`controvertere`, `delinquere`, `dibattere`, `escrescere`, `escutere`,
`esimere`, `fervere`, `fottere`, `imbattere`, `interconnettere`, `intessere`,
`lucere`, `mescere`, `mietere`, `potere`, `prepotere`, `riabbattere`,
`ribattere`, `riflettere`, `sbattere`, `serpere`, `sfottere`, `strafottere`,
`tessere`, `vertere`.

The 7 conflicts now read *assistette / assisté*, *consistette / consisté*,
*credette / credé*, *cosse / cuocé*, *desistette / desisté*, *esistette /
esisté*, *ricredette / ricredé*.

Not in scope: `essere` *è* and `riessere` *riè* end in a grave `è` too, but in
the present tense, where the vowel is open and the grave is correct.

## Imperatives for 82 verbs — decided 2026-09-29 — 246 slots

**Decision:** these verbs have a regular plain imperative, and Morph-it's
omission is a gap rather than an absence. Most are base forms of verbs normally
used reflexively, and Orjon's view is that Morph-it lost the plain imperative
when the reflexive forms were separated out.

**How:** a rule, since it covers well over 20 slots. `imperativeFromPresent` in
`scripts/derive.ts` takes each imperative from the verb's own present tense:

| Imperative | Taken from | Example |
| --- | --- | --- |
| tu, `-are` verbs | present lui/lei | *vergogna* |
| tu, other verbs | present tu | *accorgi*, *impadronisci* |
| noi | present noi | *vergogniamo* |
| voi | present voi | *vergognate* |

Checked against every verb that has both tenses in Morph-it: the rule gives
Morph-it's imperative for 17,911 of 17,926 slots. The 15 misses are irregular
imperatives that already exist (*abbi*, *sii*, *sappi*, *dai*) and the three
errors in open item 6.

The rule fills a slot only when Morph-it has nothing for it. A slot with
conflicting forms, an override or a class rule is left alone — `affare`, whose
override sets the imperative to `null`, stays without one.

The 82 verbs: `abboffare`, `abbuffare`, `accaldare`, `accanire`, `accapigliare`,
`accigliare`, `accoccolare`, `accorgere`, `accosciare`, `accovacciare`,
`accucciare`, `adirare`, `adontare`, `afflosciare`, `appigliare`,
`appisolare`, `appollaiare`, `arrabattare`, `assentare`, `attagliare`,
`attendare`, `autocandidare`, `avvalere`, `avvedere`, `barcamenare`,
`congratulare`, `defaticare`, `imbattere`, `immusonire`, `impadronire`,
`impancare`, `impaperare`, `impelagare`, `impipare`, `impossessare`,
`incaponire`, `incapricciare`, `incavolare`, `incazzare`, `incrodare`,
`industriare`, `inerpicare`, `infischiare`, `infognare`, `infortunare`,
`ingegnare`, `inginocchiare`, `intestardire`, `inurbare`, `lagnare`,
`ostinare`, `pavoneggiare`, `pentire`, `peritare`, `piccare`,
`riappropriare`, `rimpossessare`, `rincagnare`, `ripentire`, `rivalere`,
`sbellicare`, `sbracciare`, `sbronzare`, `scalmanare`, `scamiciare`,
`scapicollare`, `scervellare`, `scollacciare`, `sfegatare`, `sfratare`,
`sgolare`, `spaparacchiare`, `spaparanzare`, `specchiare`, `spericolare`,
`spolmonare`, `spretare`, `stempiare`, `stravaccare`, `suicidare`,
`vanagloriare`, `vergognare`.

## Small gaps — decided 2026-09-29 — 45 slots

The last empty slots that were not yet decided.

| Verb | Slots | Decision | Reason |
| --- | --- | --- | --- |
| `concernere`, `delinquere`, `dirimere`, `incombere`, `molcere`, `procombere`, `soccombere`, `vigere` | part.past, all four | `null` | defective verbs with no past participle, so no compound tenses |
| `dicare` | ind.pres S1, S3, P3; impr.pres S2 | `null` | |
| `divedere` | ind.past S1, S3 | `null` | |
| `venare` | ind.pres P1; sub.pres P1, P2 | *veniamo*, *veniamo*, *veniate* | Morph-it files these spellings under `venire` |
| `venare` | impr.pres P1 | *veniamo* | made by the imperative rule from the present, so no override |
| `dannare` | ind.pres S1 | *danno* | |
| `addivenire` | ind.fut S1 | *addiverrò* | Morph-it files it under P1 instead — see below |
| `sedere` | ind.fut S1 | *siederò* | see below |

**`sedere` ind.fut S1 — *siederò*.** Every other future form in Morph-it has
`-ie-` (*siederai … siederanno*), and so does the whole conditional (*siederei
…*), so *sederò* would have been the only one without it. *siederò* matches the
rest, and Wiktionary marks it "now more common, especially in speech". This
also set the direction for the future and conditional of the other `-ie-` verbs
— see open item 3.

**`addivenire` ind.fut P1 — *addiverremo*.** Morph-it gave *addiverremo* and
*addiverrò* there, so it was a conflict. *addiverrò* is the S1 form filed in the
wrong slot: like `venire` (*verrò … verremo*), the future is built on the stem
*addiverr-*, and Morph-it repeated the `io` ending in the `noi` slot — the same
pattern as open item 2. With both overrides the future reads *addiverrò …
addiverranno*.

## Forms that did not end in a vowel — 3

Morph-it had three forms ending in a consonant, each a clipped form with no
full spelling anywhere in Morph-it. All three are gone: `presentire` has
*presentono*, and the overrides for `calere` (no conditional) and `consumere`
(*consunsero*) removed *calerebber* and *consumeron*.

Of the 333,023 forms in the build (2026-09-29), one ends in something other than a
vowel: `malfare` imperative S2, *malfa'*. The apostrophe marks the shortened
imperative, as in `fare` → *fa'*, so it is probably correct.

## Four forms removed from `corrections.ts`

`disdire`'s gerund and the strong perfects `fisse`, `susse`, `urse` were
written there from recall and are not confirmed. They have been taken out of
the data. The strong perfects are now decided — see *Acute accent in the past
historic* — and `disdire`'s gerund is
decided — see *Gerunds and present participles*.
