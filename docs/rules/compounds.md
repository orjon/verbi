# Compound-verb rules

Several rules exist because a prefixed compound of an irregular verb
(*disfare* from *fare*, *sottostare* from *stare*) should inherit some or all
of the base verb's irregularity, but Morph-it often treats the compound as
if it were a fresh, regular verb.

## `fare` compounds

**Code:** `resolveFareCompound`, `FARE_REGULAR_TENSES`, `withFareForms`,
`FARE_COMPOUNDS_AS_ARE`, `FARE_REGULAR_ALSO`
**Where:** `scripts/corrections.ts`

**What it does:** a compound of *fare* conjugates like *fare* itself — the
chosen form is always the prefix plus *fare*'s own form (*disfaccio* =
*dis-* + *faccio*). This covers every `-fare` compound where Morph-it and
the rule disagree, resolving a real conflict.

**A second list, `FARE_COMPOUNDS_AS_ARE`,** covers compounds Morph-it built
as fully regular *-are* verbs, giving *no* conflict at all to resolve
(*contraffo*, *contraffò* — not even offering the *fare*-pattern form as a
candidate). `withFareForms` adds the *fare*-pattern candidate for these
before the rule can choose it: contraffare, mansuefare, sfare, torrefare,
tumefare, affare (this last one on Wiktionary's word alone — no Treccani
entry exists for it, an extremely obscure verb).

**Alternatives:** a compound's own alternatives are inherited from *fare*'s,
keeping their kind. The regular *-are* form is also a valid alternative for
**only** `disfare` and `soddisfare` (`FARE_REGULAR_ALSO`) — Treccani and the
Accademia della Crusca both confirm both forms are correct for these two
specifically ("soddisfaccio, soddisfo… le prime due vanno bene"); no source
supports it for any other compound, so it isn't generalised. The regular
form is `common` everywhere except the imperative, where it's `colloquial`
(Treccani: "disfà o disfài o disfa'" — no *disfa* — but "disfacciamo o
disfiamo" for *noi*).

**Source:** Treccani for the five confirmed compounds and the disfare/
soddisfare alternative; Accademia della Crusca corroborating the latter.

---

## Accent on compounds of one-syllable forms

**Code:** `ACCENTED_COMPOUNDS`, `ONE_SYLLABLE_FORMS`, `accentedCompound`
**Where:** `scripts/corrections.ts`

**What it does:** when a base verb's one-syllable form (*fa, sto, sta, va,
so, sa, fu*) appears inside a compound, the compound needs a written accent
on it (*rifa* → *rifà*). This runs *after* the whole slot loop, on whatever
form ended up in the finished tree — so it composes correctly with the
`fare`-compound rule above (a fixed *contraffaccio*-pattern form gets
accented only where it genuinely ends in the base verb's own bare form).

**Verbs and bases:** the 17 `fare`-family verbs (assuefare, confare,
contraffare, disfare, liquefare, malfare, mansuefare, putrefare, rarefare,
rifare, sfare, soddisfare, sopraffare, strafare, stupefare, torrefare,
tumefare); `stare` → ristare, sottostare; `andare` → riandare; `sapere` →
risapere; `essere` → riessere.

**`disfare` and `soddisfare` keep their plain form as a `common`
alternative** (`ACCENT_PLAIN_ALSO`) — Treccani: "disfà o disfa", "soddisfà o
soddisfa".

**A real bug in the first version of this rule**: it accented *any* form
ending in the base's bare syllable, which wrongly turned *risti* into
*ristì*. Fixed to only accent a form that is the prefix plus the base verb's
*real* one-syllable form *at that same path* (`ONE_SYLLABLE_FORMS` lists
each base's actual forms by path, not just their spelling).

**Source:** Treccani's own grammar entry on accents ("parole tronche…
formate da più parole, l'ultima delle quali, da sola, andrebbe scritta senza
accento" — the same reasoning as *tre* → *ventitré*); Treccani verb entries
for `rifare` ("egli rifà") and `sottostare` ("io sottostò… egli sottostà").
`riavere` is deliberately **not** in this list — it needs a different fix
(dropping the *h*: *riò*, not *riho'*), covered in
[notable-overrides.md](notable-overrides.md).

---

## Full future stem

**Code:** `FULL_FUTURE_STEM`, `resolveFullFutureStem`
**Where:** `scripts/corrections.ts`

**What it does:** two verbs — premorire, riudire — keep the full infinitive
in their future/conditional stem (*premorirò*, not *premorrò*), where the
usual *-ire* contraction would otherwise apply.
