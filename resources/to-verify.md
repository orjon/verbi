# To verify

Morph-it is the source and is assumed correct. This lists where it does not
give a single clear answer, so you can decide.

Decisions go in `resources/overrides.json`, which currently holds 177 forms
and 76 nulls and takes precedence over Morph-it. Its entries are of three kinds:

- a form filling a slot Morph-it left empty — most of them
- a form replacing one Morph-it has tagged correctly but which is not the one
  to show — `solere`'s subjunctive, `calere`'s past historic, `consumere`'s
  passato remoto and participle
- `null`, removing a form that does not belong — 44 slots, almost all of them
  on the defective verbs

| | Slots | Verbs |
| --- | --- | --- |
| Still empty | 294 | 97 |
| Two or more forms, nothing chooses | 619 | 112 |

Settled items are listed under **Resolved** at the bottom.

Regenerate the underlying report with `node scripts/report-issues.ts`.

---

# Part 1 — missing forms

## 1a. Largely absent — **ANSWERED**

All five archaic verbs are settled: `recere`, `licere`, `calere`, `consumere`
and `solere`. See Resolved.

## 1b. Missing imperatives — 83 verbs, 249 slots

The present participles for these verbs are **resolved** — see below. What
remains is the imperative: Morph-it has none for any of the 83.

Most are base forms of verbs normally used reflexively — `abbuffare` behind
`abbuffarsi`, `accigliare` behind `accigliarsi` — which may be why no plain
imperative was recorded. But Italian would ordinarily form *abbuffa,
abbuffiamo, abbuffate*, so this may be a gap rather than an absence.

**Question:** do these verbs have an imperative?

| Verb | Missing slots |
| --- | --- |
| `abboffare` | S2, P1, P2 |
| `abbuffare` | S2, P1, P2 |
| `accaldare` | S2, P1, P2 |
| `accanire` | S2, P1, P2 |
| `accapigliare` | S2, P1, P2 |
| `accigliare` | S2, P1, P2 |
| `accoccolare` | S2, P1, P2 |
| `accorgere` | S2, P1, P2 |
| `accosciare` | S2, P1, P2 |
| `accovacciare` | S2, P1, P2 |
| `accucciare` | S2, P1, P2 |
| `adirare` | S2, P1, P2 |
| `adontare` | S2, P1, P2 |
| `affare` | S2, P1, P2 |
| `afflosciare` | S2, P1, P2 |
| `appigliare` | S2, P1, P2 |
| `appisolare` | S2, P1, P2 |
| `appollaiare` | S2, P1, P2 |
| `arrabattare` | S2, P1, P2 |
| `assentare` | S2, P1, P2 |
| `attagliare` | S2, P1, P2 |
| `attendare` | S2, P1, P2 |
| `autocandidare` | S2, P1, P2 |
| `avvalere` | S2, P1, P2 |
| `avvedere` | S2, P1, P2 |
| `barcamenare` | S2, P1, P2 |
| `congratulare` | S2, P1, P2 |
| `defaticare` | S2, P1, P2 |
| `imbattere` | S2, P1, P2 |
| `immusonire` | S2, P1, P2 |
| `impadronire` | S2, P1, P2 |
| `impancare` | S2, P1, P2 |
| `impaperare` | S2, P1, P2 |
| `impelagare` | S2, P1, P2 |
| `impipare` | S2, P1, P2 |
| `impossessare` | S2, P1, P2 |
| `incaponire` | S2, P1, P2 |
| `incapricciare` | S2, P1, P2 |
| `incavolare` | S2, P1, P2 |
| `incazzare` | S2, P1, P2 |
| `incrodare` | S2, P1, P2 |
| `industriare` | S2, P1, P2 |
| `inerpicare` | S2, P1, P2 |
| `infischiare` | S2, P1, P2 |
| `infognare` | S2, P1, P2 |
| `infortunare` | S2, P1, P2 |
| `ingegnare` | S2, P1, P2 |
| `inginocchiare` | S2, P1, P2 |
| `intestardire` | S2, P1, P2 |
| `inurbare` | S2, P1, P2 |
| `lagnare` | S2, P1, P2 |
| `ostinare` | S2, P1, P2 |
| `pavoneggiare` | S2, P1, P2 |
| `pentire` | S2, P1, P2 |
| `peritare` | S2, P1, P2 |
| `piccare` | S2, P1, P2 |
| `riappropriare` | S2, P1, P2 |
| `rimpossessare` | S2, P1, P2 |
| `rincagnare` | S2, P1, P2 |
| `ripentire` | S2, P1, P2 |
| `rivalere` | S2, P1, P2 |
| `sbellicare` | S2, P1, P2 |
| `sbracciare` | S2, P1, P2 |
| `sbronzare` | S2, P1, P2 |
| `scalmanare` | S2, P1, P2 |
| `scamiciare` | S2, P1, P2 |
| `scapicollare` | S2, P1, P2 |
| `scervellare` | S2, P1, P2 |
| `scollacciare` | S2, P1, P2 |
| `sfegatare` | S2, P1, P2 |
| `sfratare` | S2, P1, P2 |
| `sgolare` | S2, P1, P2 |
| `spaparacchiare` | S2, P1, P2 |
| `spaparanzare` | S2, P1, P2 |
| `specchiare` | S2, P1, P2 |
| `spericolare` | S2, P1, P2 |
| `spolmonare` | S2, P1, P2 |
| `spretare` | S2, P1, P2 |
| `stempiare` | S2, P1, P2 |
| `stravaccare` | S2, P1, P2 |
| `suicidare` | S2, P1, P2 |
| `vanagloriare` | S2, P1, P2 |
| `vergognare` | S2, P1, P2 |

## 1c. Small, specific gaps — 14 verbs, 45 slots

| Verb | Empty slots |
| --- | --- |
| `concernere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `delinquere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `dicare` | ind.pres.S1, ind.pres.S3, ind.pres.P3, impr.pres.S2 |
| `dirimere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `incombere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `molcere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `procombere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `soccombere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `venare` | ind.pres.P1, sub.pres.P1, sub.pres.P2, impr.pres.P1 |
| `vigere` | part.past.S, part.past.SF, part.past.P, part.past.PF |
| `divedere` | ind.past.S1, ind.past.S3 |
| `addivenire` | ind.fut.S1 |
| `dannare` | ind.pres.S1 |
| `sedere` | ind.fut.S1 |

Eight of these miss only `part.past`. They are the defective verbs — no past
participle means no compound tenses, which may be exactly right.

---

# Part 2 — two forms, nothing chooses

## 2a. Two stems throughout — 10 verbs, 331 slots

Each has two competing stems running through the whole paradigm, so this is
one decision per verb rather than one per slot.

| Verb | Slots | The two stems | Example |
| --- | --- | --- | --- |
| `disfare` | 51 | disfa- / disfacc- | ger.pres: disfacendo / disfando |
| `soddisfare` | 51 | soddisfa- / soddisfacc- | ger.pres: soddisfacendo / soddisfando |
| `cuocere` | 35 | coc- / cuoc- | ger.pres: cocendo / cuocendo |
| `possedere` | 33 | possed- / possied- | ger.pres: possedevo / possiedevo |
| `risedere` | 32 | rised- / risied- | ger.pres: risedevo / risiedevo |
| `soprassedere` | 32 | soprassed- / soprassied- | ger.pres: soprassedevo / soprassiedevo |
| `percuotere` | 26 | percot- / percuot- | ger.pres: percotevo / percuotevo |
| `riscuotere` | 26 | riscot- / riscuot- | ger.pres: riscotevo / riscuotevo |
| `scuotere` | 26 | scot- / scuot- | ger.pres: scotevo / scuotendo / scuotevo |
| `nuocere` | 19 | noc- / nuoc- | ind.pres.S1: noccio / nuoccio |

**Question:** one answer per verb — which stem leads?

## 2b. Passato remoto — strong or weak — 164 slots

Many `-ere` verbs have both a strong perfect and a regular one, and Morph-it
lists both.

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
| `assistere` | S3 | assistette / assistè |
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
| `consistere` | S3 | consistette / consistè |
| `consistere` | P3 | consisterono / consistettero |
| `credere` | S1 | credei / credetti |
| `credere` | S3 | credette / credè |
| `credere` | P3 | crederono / credettero |
| `deflettere` | S1 | deflessi / deflettei |
| `deflettere` | S3 | deflesse / defletté |
| `deflettere` | P3 | deflessero / defletterono |
| `desistere` | S1 | desistei / desistetti |
| `desistere` | S3 | desistette / desistè |
| `desistere` | P3 | desisterono / desistettero |
| `dirimere` | S1 | dirimei / dirimetti |
| `dirimere` | S3 | dirimette / dirimé |
| `dirimere` | P3 | dirimerono / dirimettero |
| `disconnettere` | S1 | disconnessi / disconnettei |
| `disconnettere` | S3 | disconnesse / disconnetté |
| …and 124 more | | |

## 2c. Everything else — 124 slots

| Tense | Slots | Example |
| --- | --- | --- |
| `ind.pres` | 20 | `sedere` S1: seggo / siedo |
| `sub.pres` | 20 | `sedere` P1: sediamo / siediamo |
| `impr.pres` | 20 | `sedere` P1: sediamo / siediamo |
| `part.past` | 20 | `inferire` S: inferito / inferto |
| `ind.fut` | 13 | `premorire` S1: premorirò / premorrò |
| `cond.pres` | 12 | `premorire` S1: premorirei / premorrei |
| `part.pres` | 8 | `sedere` S: sedevo / siedevo |
| `ind.impf` | 6 | `sedere` S1: sedevo / siedevo |
| `ger.pres` | 4 | `sedere` pres: sedevo / siedevo |
| `sub.impf` | 1 | `essere` S3: foss' / fosse |

**Question:** separate decisions, or does 2a cover most of them?

---

# Part 3 — present but inconsistent

A single form, no conflict, but it does not match the pattern the rest of the
data follows.

## 3a. The future disagrees with its own stem — 298

The Italian future uses one stem across all six persons. Here five persons
imply one stem and one does not match. Almost always `S1` holds what looks
like the third-person form.

**Question:** is that stem genuinely invariant, so the odd one out is always
the error?

| Verb | Slot | Morph-it has | Others imply |
| --- | --- | --- | --- |
| `accendere` | S1 | accenderà | accenderò |
| `accondiscendere` | S1 | accondiscenderà | accondiscenderò |
| `adempiere` | S1 | adempierà | adempierò |
| `adergere` | S1 | adergerà | adergerò |
| `affiggere` | S1 | affiggerà | affiggerò |
| `affliggere` | S1 | affliggerà | affliggerò |
| `annettere` | S1 | annetterà | annetterò |
| `appendere` | S1 | appenderà | appenderò |
| `apprendere` | S1 | apprenderà | apprenderò |
| `ardere` | S1 | arderà | arderò |
| `arrendere` | S1 | arrenderà | arrenderò |
| `arridere` | S1 | arriderà | arriderò |
| `ascendere` | S1 | ascenderà | ascenderò |
| `ascondere` | S1 | asconderà | asconderò |
| `aspergere` | S1 | aspergerà | aspergerò |
| `assidere` | S1 | assiderà | assiderò |
| `astringere` | S1 | astringerà | astringerò |
| `attendere` | S1 | attenderà | attenderò |
| `attingere` | S1 | attingerà | attingerò |
| `attorcere` | S1 | attorcerà | attorcerò |
| …and 278 more | | | |

## 3b. Passato remoto with a grave accent — 41 — **DECIDED, NOT YET APPLIED**

Morph-it writes this ending both ways. The acute is correct — a final
stressed closed `e`, as in `perché`. Nothing in the override file reflects
this yet.

| Verb | Morph-it has | Should be |
| --- | --- | --- |
| `abbattere` | abbattè | abbatté |
| `battere` | battè | batté |
| `calere` | calè | calé |
| `capere` | capè | capé |
| `cernere` | cernè | cerné |
| `combattere` | combattè | combatté |
| `competere` | competè | competé |
| `compiere` | compiè | compié |
| `concernere` | concernè | concerné |
| `congenere` | congenè | congené |
| `consumere` | consumè | consumé |
| `contessere` | contessè | contessé |
| …and 29 more | | |

Three of them are strong perfects, whose third singular takes no final accent
at all: `figgere` → *fisse*, `suggere` → *susse*, `urgere` → *urse*.

**Question:** confirm those three.

## 3c. A participle that is not a participle — 8

All four gender slots hold the same word, and it is an imperfect indicative.

| Verb | Morph-it has |
| --- | --- |
| `disdire` | disdicevo |
| `ripercuotere` | ripercuotevo |

**Question:** what are the correct forms, or do these verbs have none?

## 3d. Forms that do not end in a vowel — 2 open

Of 332,695 forms, three end in a consonant — each an elided form with no full
spelling anywhere in Morph-it. `presentire` is answered.

| Verb | Slot | Morph-it has | Probably |
| --- | --- | --- | --- |
| `calere` | cond.pres.P3 | calerebber | calerebbero |
| `consumere` | ind.past.P3 | consumeron | consumerono |

## 3e. A gerund that is not a gerund — 1

| Verb | Morph-it has | Probably |
| --- | --- | --- |
| `disdire` | disdicevo | disdicendo — it follows `dire` |

`disdire` also appears in 3c, so one answer settles both.

---

# Part 4 — clipped forms, not counted above

46,088 slots hold two forms where one is the other with its ending dropped —
`abbacchiavan` beside `abbacchiavano`. These are literary elisions, so the
longer form is used and the shorter ignored.

**Question:** is that right, or should they be kept as alternatives?

---

# Resolved

Decisions already recorded. **572 of the original 866 empty slots are closed**,
plus 6 of the 619 conflicts.

| What | Slots closed | Where it lives |
| --- | --- | --- |
| Five verbs completed from scratch | 92 | `overrides.json` |
| Five defective verbs locked down | 148 | `overrides.json` |
| Present participles for 83 verbs | 332 | `corrections.ts` |
| **Total** | **572** | |

## Five verbs completed from scratch — 92 slots

Morph-it had nothing for these; the forms were supplied by hand.

| Verb | Slots closed | Notes |
| --- | --- | --- |
| `sonare` | 33 | almost the whole paradigm |
| `plaudere` | 23 | whole paradigm, with the `-etti` passato remoto chosen over the `-é` forms — which also settled 2 conflicts |
| `spengere` | 13 | `ind.pres`, `ind.past`, `sub.pres`, `part.past` |
| `cerchiare` | 12 | `ind.pres`, `sub.pres`, `impr.pres`, `part.past` |
| `presentire` | 11 | including *presentono*, which settled one of the three forms in item 3d |

## Five defective verbs locked down — 148 slots

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

## Present participles for 83 verbs — 332 slots

None of the 83 has a present participle in Morph-it or in use. Recorded as
`absentSlots()` in `scripts/corrections.ts` rather than 83 entries in the
override file, because it is one decision about a class of verbs.

Their imperatives are a separate question and remain open — see item 1b.

## `solere` — subjunctive corrected — 6 conflicts

Morph-it files the standard subjunctive (*soglia, sogliamo, sogliate,
sogliano*) under the conditional, while the subjunctive slot holds a
regularised variant (*sola, soliamo, solano*). The standard forms are now in
the right place and the conditional is nulled.

This is the pattern to watch: overriding a form Morph-it has tagged correctly,
rather than filling a gap or removing junk.

## Four forms removed from `corrections.ts`

`disdire`'s gerund and the strong perfects `fisse`, `susse`, `urse` were
written there from recall and are not confirmed. They have been taken out of
the data and remain open as items 3b and 3e.
