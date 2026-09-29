# Past historic rules

## Strong vs weak past historic

**Code:** `resolveStrongWeakPast`, `WEAK_PAST_ENDING`, `STRONG_PAST_ENDING`,
`WEAK_BESIDE_STRONG`, `WEAK_PAST_STANDARD`
**Where:** `scripts/corrections.ts`

**What it does:** many *-ere* verbs' passato remoto has a "strong" irregular
form (*crebbi*) alongside one or two "weak" regular sets (*-ei*: *credei*;
*-etti*: *credetti*). The rule classifies each of a verb's *io*, *lui/lei*
and *loro* candidates and picks the standard one:

- **Strong beats weak** — the strong form is standard (*crebbi* over
  *crescei*), with the weak form kept as an alternative (`literary` by
  default, or `common`/`sense` for a short list of verbs where the weak form
  is equally common or means something different — `WEAK_BESIDE_STRONG`:
  concedere, sparire → `common`; succedere → `sense`, "to follow" vs "to
  happen").
- **Between the two weak sets, *-etti* beats *-ei***, unless the verb's
  other persons already use the *-ei* set on their own, in which case *-ei*
  is chosen so the tense stays internally consistent.
- **Exception — the *-nettere* family** (`WEAK_PAST_STANDARD`): for
  annettere, connettere, disconnettere, riannettere, riconnettere,
  sconnettere, the **weak** form is standard (*annettei*, not *annessi*),
  with the strong form kept as a `common` alternative. This replaced an
  earlier decision, sourced only from ChatGPT, that had it backwards — Treccani
  says "annettéi, meno com. annèssi" directly, and confirms connettere
  "coniuga come annettere". `flettere`/`deflettere`/`genuflettere` are left
  as strong-standard, unresolved — Treccani gives both forms as equal for
  that family, so there's no clear standard to switch to.

**Source:** the general strong/weak decisions and the exceptions list were
made earlier in the project (see `notes/to-verify.md`, item 5); the
*-nettere* correction and the flettere-family note are from this session's
Treccani check.

---

## The future *io* accent

**Code:** `withFutureS1`
**Where:** `scripts/corrections.ts`

**What it does:** Morph-it sometimes misfiles the *lui/lei* future form
under *io* (both ending in an accented vowel, easy to confuse when the
source data was compiled). The rule detects when a verb's *io* future
candidate actually matches the *-à* ending expected for *lui/lei*, and
corrects the accent to *-ò* instead.
