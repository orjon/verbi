# Notable individual overrides

These aren't rules — each applies to one verb, or a small handful — but
they're large enough, or interesting enough, to document here rather than
leave as a line in `resources/overrides.json` with no context. Smaller,
truly one-off facts stay in `notes/to-verify.md` and `resources/checks.json`.

## `dolere` and `condolere`

`dolere` had drifted to a fully regular (and wrong) conjugation — *dolo,
dolono, dolerò* isn't real Italian. Rebuilt from IT8's paradigm:

- present indicative: *dolgo, duoli, duole, doliamo, dolete, dolgono*
- present subjunctive: *dolga*, … *doliamo, doliate, dolgano*
- imperative: *duoli, dolete*
- future *dorrò* and so on; conditional *dorrei* and so on

Past historic (*dolsi*) and past participle (*doluto*) are standard Italian
grammar, not individually re-sourced. `condolere` conjugates like dolere
(IT8, at *condolersi*) — the same paradigm with the *con-* prefix.

## `stare`, `sottostare`, `ristare`

`stare` itself had P1/P2/P3 of the passato remoto wrong (*stammo, staste,
starono* — regular, when the *io/lui* forms were already correctly strong:
*stetti, stette*). Fixed to *stemmo, steste, stettero*.

`sottostare` needed the same P1/P2/P3 fix, inheriting the corrected `stare`
pattern: it conjugates like stare in every tense except the present, which
stays its own regular pattern with an accent, see [compounds.md](compounds.md).

`ristare` had been built as if fully regular throughout — fixed across past
historic, future/conditional (the regular *ristar-* stem, not the wrong
*rister-*), subjunctive imperfect, and the remaining present-tense/
imperative forms, all inheriting `stare`.

## `provvedere`, `sprovvedere`

Conjugate like `vedere` **except** the future/conditional, which stay
regular (*provvederò*, *provvederei*). This directly contradicted an
initial assumption that a compound should inherit a base verb's
irregularity wholesale — worth remembering before generalising that pattern
to a new verb.

## The *visto* family, `godere`, the *concesso* family

Identified in the very first research pass of the whole Wiktionary-check
project, but not actually applied until a much later sweep the same day:

- `vedere`→*visto*, `rivedere`→*rivisto*, `prevedere`→*previsto*,
  `intravedere`→*intravisto*, `intravvedere`→*intravvisto* (the old *-uto*
  forms kept as `literary`).
- `concedere`→*concesso*, `retrocedere`→*retrocesso*, `infiggere`→*infisso*.
- `godere` future→*godrò*, conditional→*godrei* (both extended from the same
  source, applied to the future first and only later noticed to apply
  equally to the conditional — the sibling tenses share a stem).
- present participles: `offrire`→*offerente*, `soffrire`→*sofferente* (old
  forms kept as `uncommon`).

## `riavere`

Spelled without the *h* throughout — *riò, riai, rià, rianno*. Deliberately
excluded from the [accented-compounds rule](compounds.md), since it needs a
different fix (dropping a letter, not adding an accent).

## The `-acere` family: `giacere`, `soggiacere`, `sottacere`, `tacere`

*-iamo*/*-iate* keep the palatalized *cc* that these verbs already correctly
have in *io*/*loro* (*giaccio, giacciono*) — Morph-it had *giaciamo*
(missing the second *c*). Confirmed directly in IT8 for `giacere`
(*giacciamo*) and `tacere` (*tacciamo*); the other two follow as compounds.

## The `volere` family: `volere`, `rivolere`, `disvolere`, `malvolere`, `benvolere`

Imperative *tu* is *vogli*, not *vuoi* — this was wrong even for `volere`
itself, the base verb every compound was built from.

## `benvolere`, `malvolere`, `divedere`

All three are used only in fixed phrases:
- `benvolere`: used only in a few set phrases (*farsi benvolere*, *essere
  benvoluto*) — kept: infinitive (in the phrase) and the past participle
  (*benvoluto*). Everything else nulled.
- `malvolere`: the same treatment by analogy, not individually re-checked.
- `divedere`: defective, used only in one set phrase (*dare a diveder*) —
  kept: the infinitive only, in that one phrase. Even the participle is
  nulled.

## The `empiere`/`riempiere`/`adempiere`/`compiere` family

The most involved single investigation of the whole project — see the full
account in `notes/to-verify.md` (search "empiere/riempiere/adempiere/
compiere"). In short: IT8's entry for `empire` settles it. The past
participle is *empito* or *empiuto* and the gerund is *empiendo*; every other
form follows `empire` (imperfect *empivo*, future *empirò*, conditional
*empirei*, imperfect subjunctive *empissi*).

The gerund and past participle **always** keep the *-ie-* spelling
regardless of which infinitive spelling is used; every other tense follows
the plain regular pattern. `compiere` has the identical shape: the gerund
*compiendo* and the participle *compiuto* are its only exceptions to the
regular pattern. `riempiere`/`rempiere` are non-common/archaic alternate
spellings that conjugate like `empire` — genuinely identical forms, not a
separate paradigm.

This explained an earlier finding that Wiktionary's data looked "internally
backwards" for this family: it wasn't random inconsistency — Wiktionary
specifically invents a wrong, distinct plain-form paradigm for the *-iere*
spelling entries, while getting the *-ire* spelling entries broadly right.

**One real exception**: `compiere`/`adempiere` keep their *own* non-*-isc-*
present tense as main (*compio, adempio* — IT8 states this explicitly for
each headword), distinct from `compire`/`adempire`, which correctly use
*-isc-* (*compisco, adempisco*). Both forms are kept as valid alternatives
on each other.

`compire`'s participle stays *compiuto*, not Wiktionary's suggested
*compito* — IT8 explicitly names *compiuto* as the one form that does
**not** come from `compire`'s regular pattern, overriding Wiktionary here.

## `disparire`

IT8 gives the full paradigm directly:

- present: *dispaio, dispari, dispare, dispariamo, disparite, dispaiono*
- past historic: *disparii* or *disparvi*, and the archaic *disparsi*, …
- past participle: *disparito*, rarely *disparso*
- auxiliary: *essere*

This confirmed the present tense (already set), the participle (already
correct), the auxiliary (already correct), and revealed that *disparii* and
*disparvi* are equally standard — not "rare" as first recorded from a web
search of conjugator sites. Upgraded to `common`.

## `restringere` — a caught regression

`restringere`'s participle had been correctly set to *ristretto* (it
conjugates like stringere, but the past participle is *ristretto*, from
ristringere), then later silently overwritten to *restretto* by a different,
Wiktionary-only batch that didn't cross-check the earlier finding. Caught and
reverted during the full recheck pass — the exact kind of mistake
`resources/checks.json` now exists to make harder to repeat.

## `tinnire` — where Wiktionary was simply wrong

One confirmed case, out of everything checked this project, where
Wiktionary's table disagreed with IT8 and IT8 was right: IT8 confirms
*tinnisco, tinnisci* — Wiktionary's suggested *tinno* was not followed.

## `calere`

The present subjunctive is *caglia*, the one form the dictionary gives for it;
Wiktionary agrees. An earlier *calga* was an unsourced guess and was removed.
