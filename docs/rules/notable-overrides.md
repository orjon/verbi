# Notable individual overrides

These aren't rules — each applies to one verb, or a small handful — but
they're large enough, or interesting enough, to document here rather than
leave as a line in `resources/overrides.json` with no context. Smaller,
truly one-off facts stay in `notes/to-verify.md` and `resources/
confirmed.json`.

## `dolere` and `condolere`

`dolere` had drifted to a fully regular (and wrong) conjugation — *dolo,
dolono, dolerò* isn't real Italian. Rebuilt from Treccani's own quote:

> pres. indic. *dòlgo, duòli, duòle, doliamo, doléte, dòlgono*; pres. cong.
> *dòlga,… doliamo, doliate, dòlgano*; imperat. *duòli, doléte*
> fut. *dorrò*, ecc.; condiz. *dorrèi*, ecc.

Past historic (*dolsi*) and past participle (*doluto*) are standard Italian
grammar, not individually re-sourced. `condolere` "conjugates like dolere"
(Treccani, at *condolersi*) — the same paradigm with the *con-* prefix.

## `stare`, `sottostare`, `ristare`

`stare` itself had P1/P2/P3 of the passato remoto wrong (*stammo, staste,
starono* — regular, when the *io/lui* forms were already correctly strong:
*stetti, stette*). Fixed to *stemmo, steste, stettero*.

`sottostare` needed the same P1/P2/P3 fix, inheriting the corrected `stare`
pattern (Treccani: "negli altri tempi, coniug. come stare" — "in the other
tenses" specifically excludes the present, which stays its own regular
pattern with an accent, see [compounds.md](compounds.md)).

`ristare` had been built as if fully regular throughout — fixed across past
historic, future/conditional (the regular *ristar-* stem, not the wrong
*rister-*), subjunctive imperfect, and the remaining present-tense/
imperative forms, all inheriting `stare`.

## `provvedere`, `sprovvedere`

Conjugate like `vedere` **except** the future/conditional, which stay
regular (Treccani: "coniug. come vedere, tranne il fut. e il condiz. che
sono regolari: provvederò, provvederèi"). This directly contradicted an
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
  Treccani citation, applied to the future first and only later noticed to
  apply equally to the conditional — the sibling tenses share a stem).
- present participles: `offrire`→*offerente*, `soffrire`→*sofferente* (old
  forms kept as `rare`).

## `riavere`

Spelled without the *h* throughout — *riò, riai, rià, rianno* — Treccani:
"senza l'h nelle forme riò, riài, rià, rianno". Deliberately excluded from
the [accented-compounds rule](compounds.md), since it needs a different fix
(dropping a letter, not adding an accent).

## The `-acere` family: `giacere`, `soggiacere`, `sottacere`, `tacere`

*-iamo*/*-iate* keep the palatalized *cc* that these verbs already correctly
have in *io*/*loro* (*giaccio, giacciono*) — Morph-it had *giaciamo*
(missing the second *c*). Confirmed directly on Treccani for `giacere`
("giacciamo") and `tacere` ("tacciamo"); the other two follow as compounds.

## The `volere` family: `volere`, `rivolere`, `disvolere`, `malvolere`, `benvolere`

Imperative *tu* is *vogli*, not *vuoi* (Treccani: "imperat. vògli") — this
was wrong even for `volere` itself, the base verb every compound was built
from.

## `benvolere`, `malvolere`, `divedere`

All three are used only in fixed phrases, per Treccani:
- `benvolere`: "usato solo nelle locuz. seguenti: farsi b., … essere
  benvoluto" — kept: infinitive (in the phrase) and the past participle
  (*benvoluto*). Everything else nulled.
- `malvolere`: the same treatment by analogy, not individually re-checked.
- `divedere`: "difettivo… si usa solo nella locuz. dare a diveder" — kept:
  the infinitive only, in that one phrase. Even the participle is nulled.

## The `empiere`/`riempiere`/`adempiere`/`compiere` family

The most involved single investigation of the whole project — see the full
account in `notes/to-verify.md` (search "empiere/riempiere/adempiere/
compiere"). In short: Treccani's own entry for `empire` settles it —

> part. pass. *empito* o *empiuto*; ger. *empiendo*; le altre forme da
> empire: imperf. *empivo*, fut. *empirò*, condiz. *empirei*, imperf. cong.
> *empissi*

The gerund and past participle **always** keep the *-ie-* spelling
regardless of which infinitive spelling is used; every other tense follows
the plain regular pattern. `compiere` confirms the identical shape
("tranne il gerundio compiendo e il part. pass. compiuto"). `riempiere`/
`rempiere` are explicitly non-common/archaic alternate spellings that
"coniug. come empire" — genuinely identical forms, not a separate paradigm.

This explained an earlier finding that Wiktionary's data looked "internally
backwards" for this family: it wasn't random inconsistency — Wiktionary
specifically invents a wrong, distinct plain-form paradigm for the *-iere*
spelling entries, while getting the *-ire* spelling entries broadly right.

**One real exception**: `compiere`/`adempiere` keep their *own* non-*-isc-*
present tense as main (*compio, adempio* — Treccani states this explicitly
for each headword), distinct from `compire`/`adempire`, which correctly use
*-isc-* (*compisco, adempisco*). Both forms are kept as valid alternatives
on each other.

`compire`'s participle stays *compiuto*, not Wiktionary's suggested
*compito* — Treccani explicitly names *compiuto* as the one form that does
**not** come from `compire`'s regular pattern, overriding Wiktionary here.

## `disparire`

Treccani gives the full paradigm directly:

> pres. *dispàio, dispari, dispare, dispariamo, disparite, dispàiono*;
> pass. rem. *disparìi* o *disparvi* e ant. *disparsi*, …; part. pass.
> *disparito*, raro *disparso*; aus. *essere*

This confirmed the present tense (already set), the participle (already
correct), the auxiliary (already correct), and revealed that *disparii* and
*disparvi* are equally standard — not "rare" as first recorded from a web
search of conjugator sites. Upgraded to `common`.

## `restringere` — a caught regression

`restringere`'s participle had been correctly set to *ristretto* (Treccani:
"coniug. come stringere, ma il part. pass. è ristrétto, da ristringere"),
then later silently overwritten to *restretto* by a different, Wiktionary-only
batch that didn't cross-check the earlier finding. Caught and reverted during
the full recheck pass — the exact kind of mistake `resources/confirmed.json`
now exists to make harder to repeat.

## `tinnire`, `calere` — where Wiktionary was simply wrong

Two confirmed cases, out of everything checked this project, where
Wiktionary's table disagreed with Treccani and Treccani was right:
- `tinnire`: Treccani confirms "io tinnisco, tu tinnisci" — Wiktionary's
  suggested *tinno* was not followed.
- `calere`: Treccani itself calls *caglia* "rare altre forme" — so it's kept
  as a `rare` alternative, not switched to main as Wiktionary implied.
