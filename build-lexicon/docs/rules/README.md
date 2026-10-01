# Rules reference

This is the reference document for how `lexicons/it-verbs.json` is built: every rule
that changes a form away from what Morph-it gives, why it exists, and where
the decision came from. It replaces having the reasoning scattered across code
comments and `notes/to-verify.md` — those still exist, but this is the place
to read a rule's whole story in one go.

## The pipeline

1. **Morph-it** (`data-sources/external/morph-it_048.txt`) is the base source — assumed
   correct until we find a reason to doubt it.
2. **Rules run first** (`build-lexicon/scripts/corrections.ts`, `build-lexicon/scripts/derive.ts`), in
   three ways:
   - some **add a candidate form** before anything is chosen, where Morph-it
     only offered a wrong or incomplete one (e.g. the *-isc-* forms);
   - some **remove a whole slot** for a class of verb (e.g. no present
     participle);
   - some **resolve a conflict** when Morph-it itself offers two competing
     forms for the same slot.
3. **Overrides win over all of that**, per individual form
   (`data-sources/overrides.json`). They're for one-off cases that don't fit a
   pattern worth writing a rule for.
4. Where something looked wrong or uncertain, we checked it against
   **a standard reference dictionary** (code name IT8) — treated as the single
   source of truth for modern Italian — and, more cautiously, against English
   Wiktionary's conjugation tables as a
   bulk comparison tool for spotting candidates worth checking (never trusted
   on its own; see `build-lexicon/docs/rules/present-tense.md` and others for cases where
   it was wrong). What we found gets written back in as a rule or an
   override, with the source recorded.
5. **`data-sources/checks.json`** records which sources confirmed which
   individual forms (by code name, such as IT8 and IT6) — the running list of
   what's actually been checked, separate from this prose reference.
   Wiktionary is compared automatically on every build and shows in
   `lexicons/it-verbs-ledger.json`.

## Files in this reference

| File | Covers |
|---|---|
| [present-tense.md](present-tense.md) | *-isc-* verbs, stressed-*i* verbs |
| [participles.md](participles.md) | No present participle, no past participle, *-iente* participles |
| [defective-verbs.md](defective-verbs.md) | Weather/state/sensation verbs (third-person-only), ignored entries |
| [diphthongs.md](diphthongs.md) | The mobile diphthong, all three modes |
| [compounds.md](compounds.md) | *fare* compounds, accented monosyllable compounds, full-future-stem verbs |
| [past-historic.md](past-historic.md) | Strong vs weak past historic, the future *io* accent fix |
| [auxiliaries.md](auxiliaries.md) | The essere/avere/dual lists in `conjugation/aux.ts` |
| [notable-overrides.md](notable-overrides.md) | Large one-off paradigms that aren't a rule, but are too significant to leave undocumented |

## How to read a rule entry

Each rule below has:
- **Code** — the actual constant or function name in the source, so it's
  traceable.
- **Where** — the file it lives in.
- **What it does** — the technical mechanism.
- **In plain terms** — what an app user would be told, if this ever surfaces
  in the UI.
- **Verbs / scope** — what it applies to.
- **Source** — what confirmed it, and any caveats.
