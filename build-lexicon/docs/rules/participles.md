# Participle rules

## No present participle

**Code:** `NO_PRESENT_PARTICIPLE`
**Where:** `build-lexicon/scripts/corrections.ts`

**What it does:** Morph-it records no present participle for these verbs, and
none is in use — most Italian verbs don't have a living present participle.
The rule removes the whole `part.pres` slot rather than let a
regularly-generated but unused form through.

**In plain terms:** the present participle (*-ante*, *-ente*) is a bookish
form in Italian; most verbs simply don't have one in real use.

**Verbs:** 83 verbs, many of them the base forms of verbs that are normally
reflexive (*abbuffare* behind *abbuffarsi*) — see the constant for the full
list. Extended 2026-09-29 with 13 more, checked against Wiktionary's tables:
ambire, compatire, deperire, gioire, perire, riessere, risapere, risentire
(no alternate at all), plus `sapere` (see below) and five kept with a
labelled alternative instead of nothing: esperire→*esperiente* (archaic),
percepire→*percipiente* (rare), presentire→*presenziente* (literary),
punire→*puniente* (rare), tornire→*torniente* (rare).

**`sapere` is the one deliberate exception worth calling out**: its
"participle" *sapiente* has fully detached from the verb in modern Italian —
you cannot say "la persona sapiente la verità", only "la persona che sa la
verità". Added 2026-09-29 on Orjon's decision (source: ChatGPT, not a dictionary).

---

## No past participle

**Code:** `NO_PAST_PARTICIPLE`
**Where:** `build-lexicon/scripts/corrections.ts`

**What it does:** 20 verbs where Morph-it invents a regular *-uto* ending on
a Latinate stem that never took one (*vertuto*, *urto*) — wrong, not a rare
alternative. The rule removes the whole `part.past` slot, and with it every
compound tense (which needs a participle to build).

**In plain terms:** a handful of literary or legal verbs never developed a
past participle at all, so Italian has no way to say things like "I have
[verb]ed" with them.

**Verbs:** competere, discernere, equidistare, erompere, esimere, fervere,
fulgere, irrompere, mingere, risplendere, strapiombare, vertere,
controvertere, divergere, serpere, urgere, lucere, rilucere, tralucere,
suggere. `controvertere` and `urgere` also lack the passato remoto (a
compound consequence, since it's a different tense — confirmed separately in IT8 for each).

**Two exceptions found while building this list, not simply included:**
`eccellere` has a real, standard participle (*eccelso* — with no rarity note at all) and `convergere` has one that's rare but real (*converso*
— marked rare). Both are set directly as
overrides rather than nulled. `permanere`'s participle is archaic-only
(*permaso*/*permanso* — archaic only) — nulled as the main form and kept as an
`archaic` alternative, its first real use.

**Source:** each checked against IT8, which marks each as defective or lacking a past participle; `lucere`, `rilucere`, `tralucere` and `suggere` are
Wiktionary-only (extremely rare literary words where the pattern was already
well established across the family).

**A genuine bug, not just a missing rule, was found in this area**: `serpere`
had been wrongly given the same "no passato remoto" treatment as
`urgere`/`divergere` by analogy. Rechecked directly: IT8 actually says it is used only in the *simple* tenses of the indicative — and passato remoto is a simple tense, not a compound one.
Restored to Morph-it's own natural form.

---

## Present participles in `-iente`

**Code:** `PARTICIPLE_IENTE_VERBS`, `withParticipleIente`, `resolveParticipleIente`
**Where:** `build-lexicon/scripts/corrections.ts`

**What it does:** 31 *-ire* verbs whose present participle keeps the Latin
*-iente* ending instead of the regular *-ente* (*veniente*, not *venente*).
Morph-it gives only the regular form, so no conflict ever reached a rule —
the fix adds the *-iente* form (stem + *iente*/*ienti*) and chooses it.

**In plain terms:** a handful of *-ire* verbs kept an older participle
ending that most *-ire* verbs lost.

**Verbs:** the *venire* family — addivenire, avvenire, circonvenire,
contravvenire, convenire, divenire, intervenire, pervenire, riconvenire,
rinvenire, sopravvenire, sovvenire, svenire, venire (already correct via
Morph-it, needed no change) — plus ammollire, blandire, empire (already
correct), esaudire, esaurire, impedire, lenire, munire, nutrire, partorire,
premunire, progredire, regredire, trasgredire, ubbidire, and (added later the
same session) adempire, compire, inorgoglire.

**Four further verbs have an irregular present participle that is its own
word, not "stem + iente"**, handled by override instead: `assentire` →
*assenziente*, `dissentire` → *dissenziente* (the ending is "-nziente", not a simple insertion), `concepire` → *concipiente* (the Latinism replaces the regular form, which isn't used at all), `concupire` →
*concupiscente* (from the archaic *concupiscere*, a different stem).

**Source:** checked against IT8 for the *venire* family, `nutrire`,
`impedire`, `progredire`, `ubbidire`; English Wiktionary agreed for the rest.
