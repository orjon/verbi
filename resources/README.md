# Notes on the verb data

The app gets its conjugations from the `italian-verbs-dict` package. That
package is built from [Morph-it!](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it),
a list of Italian word forms compiled by researchers at Bologna.

Morph-it! itself is sound. The problems below were introduced when it was
converted into the JSON file we use, and they are all worth knowing about
before trusting a field.

## The numbers

The file holds 6,122 entries. Two are not verbs (`dimmi`, `rimontar`) and 46 are
reflexive, and the app excludes all 48 — see below. That leaves the **6,074**
verbs described here.

"Regular" means every form is exactly what the standard pattern predicts from
the infinitive, so the verb could be generated rather than stored.

| Type | Verbs | Share | Regular | Irregular |
| --- | --- | --- | --- | --- |
| `-are` | 4,816 | 79.3% | 4,792 (99.5%) | 24 (0.5%) |
| `-ere` | 623 | 10.3% | 29 (4.7%) | 594 (95.3%) |
| `-ire` | 578 | 9.5% | 496 (85.8%) | 82 (14.2%) |
| `-rre` | 57 | 0.9% | 0 (0.0%) | 57 (100.0%) |
| **All** | **6,074** | **100%** | **5,317 (87.5%)** | **757 (12.5%)** |

Almost all Italian irregularity sits in the second conjugation: `-ere` verbs are
only 4.7% regular, while `-are` verbs are 99.5% regular and make up four fifths
of the dictionary.

The `-rre` row is not really a measurement. The standard pattern cannot apply to
those verbs at all, so they count as irregular by default rather than by test.

The `-rre` verbs are not a fourth type. They are `-ere` verbs whose infinitive
contracted long ago: *porre* was *ponere*, *condurre* was *conducere*. The older
stem reappears in the forms (*ponevo*, *conducevo*), which is why they cannot be
built from the infinitive and have to be stored in full.

## Problem 1: the infinitive is often wrong

**2,219 of 6,120 (36%) store the wrong infinitive.**

`parlare` has its infinitive stored as `parlarvi`, which means "to speak to
you". Italian attaches pronouns to the end of an infinitive, making one word,
so *parlarvi* is a real word — just not the plain infinitive.

This happened because the converter had one slot for the infinitive and many
candidates to put in it (*parlare*, *parlarmi*, *parlarti*, *parlarvi*), with
no rule for choosing. The last one processed won.

Every one of the 2,219 is the verb plus one or two pronouns. None is a
different word, so nothing is truly lost.

**What to do:** use the dictionary key. The key is always the correct
infinitive, because it was never overwritten.

## Problem 2: the gerund is often wrong

**1,209 of 6,087 (20%) have a pronoun attached**, the same fault as above —
`parlandosi` instead of `parlando`.

**What to do:** cut the word at `-ando` or `-endo` and discard the rest. This
recovers 6,077 of the 6,087 gerunds, irregular ones included (`bevendosi` →
`bevendo`, `facendovi` → `facendo`).

### The 10 that cannot be repaired

For these, a form from a different tense landed in the gerund slot. `sedere`
holds *siedevo* ("I was sitting") where *sedendo* belongs.

| Verb | Stored | Should be |
| --- | --- | --- |
| `addire` | addicevo | addicendo |
| `disdire` | disdicevo | disdicendo |
| `percuotere` | percuotevo | percuotendo |
| `possedere` | possiedevo | possedendo |
| `ripercuotere` | ripercuotevo | ripercuotendo |
| `riscuotere` | riscuotevo | riscuotendo |
| `risedere` | risiedevo | risedendo |
| `scuotere` | scuotevo | scuotendo |
| `sedere` | siedevo | sedendo |
| `soprassedere` | soprassiedevo | soprassedendo |

**What to do:** reject any gerund that does not end `-ando` or `-endo`.

## Problem 3: two entries are not verbs

| Key | Holds | What it really is |
| --- | --- | --- |
| `dimmi` | an imperative, *dimmi* | "tell me" — a form of `dire`, not a verb |
| `rimontar` | an imperative, *rimontati* | a shortened spelling of `rimontare` |

Both real Italian, neither a headword. `dire` and `rimontare` are both present
and correct, so these two can be dropped.

## Problem 4: one stray key

`muovere` carries an extra mood named `null`, holding `{"past": {"S":
"mossoci"}}`. Its real forms are fine. Ignore any mood that is not one of
`ind`, `sub`, `cond`, `impr`, `inf`, `part`, `ger`.

## Problem 5: reflexive verbs are mostly missing

This one is **not a bug**. Reflexives like *lavarsi* are two words in use —
*mi lavo* — so a list of single words has nowhere to put them. Common
reflexives (*chiamarsi*, *alzarsi*, *svegliarsi*) are simply absent.

The 46 that are present are verbs where the pronoun is part of the name, such
as `accorgersi`. Of those, **28 hold an infinitive and nothing else**:

```
abbuffarsi, accapigliarsi, adontarsi, appollaiarsi
arrabattarsi, assentarsi, attagliarsi, attendarsi
avvedersi, condolersi, formalizzarsi, genuflettersi
imbattersi, impancarsi, impelagarsi, incazzarsi
inerpicarsi, intestardirsi, lagnarsi, pavoneggiarsi
pentirsi, ravvedersi, rivalersi, sbellicarsi
sbracciarsi, sbronzarsi, scapicollarsi, sgolarsi
```

All 46 have their base verb in the dictionary, so a reflexive can always be
resolved: strip `-si`, add `-e`, conjugate that, and add the pronoun yourself.

## Problem 6: 14 verbs have missing tenses

These are **correct**, not errors. Verbs like *vigere* and *dirimere* genuinely
have no past participle in Italian, so no compound tense can be built from them.

| Verb | Missing |
| --- | --- |
| `concernere` | PASSATO_PROSSIMO |
| `consumere` | COND_PRESENTE |
| `delinquere` | PASSATO_PROSSIMO |
| `dirimere` | PASSATO_PROSSIMO |
| `incombere` | PASSATO_PROSSIMO |
| `licere` | COND_PRESENTE |
| `molcere` | PASSATO_PROSSIMO |
| `plaudere` | PASSATO_PROSSIMO |
| `procombere` | PASSATO_PROSSIMO |
| `recere` | IMPERFETTO, COND_PRESENTE |
| `soccombere` | PASSATO_PROSSIMO |
| `sonare` | PASSATO_PROSSIMO, IMPERFETTO |
| `spengere` | PASSATO_PROSSIMO |
| `vigere` | PASSATO_PROSSIMO |

## What the app excludes

48 of the 6,122 entries are skipped, leaving **6,074** verbs. The list lives
in `lib/conjugation/excluded.ts`. Nothing is repaired — these are simply not
offered.

### Not verbs (2)

| Key | Why |
| --- | --- |
| `dimmi` | "tell me" — an imperative of `dire` |
| `rimontar` | a shortened spelling of `rimontare` |

### Reflexive (46)

Each maps to a base verb that **is** in the dictionary, so any of these could
be supported later by conjugating the base and adding the pronoun. "Stub"
means the entry holds an infinitive and nothing else.

| Reflexive | Base verb | Contents |
| --- | --- | --- |
| `abbuffarsi` | `abbuffare` | stub |
| `accanirsi` | `accanire` | has forms |
| `accapigliarsi` | `accapigliare` | stub |
| `accorgersi` | `accorgere` | has forms |
| `adontarsi` | `adontare` | stub |
| `appigliarsi` | `appigliare` | has forms |
| `appollaiarsi` | `appollaiare` | stub |
| `arrabattarsi` | `arrabattare` | stub |
| `assentarsi` | `assentare` | stub |
| `attagliarsi` | `attagliare` | stub |
| `attendarsi` | `attendare` | stub |
| `avvalersi` | `avvalere` | has forms |
| `avvedersi` | `avvedere` | stub |
| `barcamenarsi` | `barcamenare` | has forms |
| `condolersi` | `condolere` | stub |
| `congratularsi` | `congratulare` | has forms |
| `formalizzarsi` | `formalizzare` | stub |
| `genuflettersi` | `genuflettere` | stub |
| `imbattersi` | `imbattere` | stub |
| `impadronirsi` | `impadronire` | has forms |
| `impancarsi` | `impancare` | stub |
| `impelagarsi` | `impelagare` | stub |
| `impossessarsi` | `impossessare` | has forms |
| `incazzarsi` | `incazzare` | stub |
| `inerpicarsi` | `inerpicare` | stub |
| `infiltrarsi` | `infiltrare` | has forms |
| `infischiarsi` | `infischiare` | has forms |
| `ingegnarsi` | `ingegnare` | has forms |
| `inginocchiarsi` | `inginocchiare` | has forms |
| `intestardirsi` | `intestardire` | stub |
| `lagnarsi` | `lagnare` | stub |
| `ostinarsi` | `ostinare` | has forms |
| `pavoneggiarsi` | `pavoneggiare` | stub |
| `pentirsi` | `pentire` | stub |
| `ravvedersi` | `ravvedere` | stub |
| `riappropriarsi` | `riappropriare` | has forms |
| `rifugiarsi` | `rifugiare` | has forms |
| `rivalersi` | `rivalere` | stub |
| `sbellicarsi` | `sbellicare` | stub |
| `sbracciarsi` | `sbracciare` | stub |
| `sbronzarsi` | `sbronzare` | stub |
| `scapicollarsi` | `scapicollare` | stub |
| `sgolarsi` | `sgolare` | stub |
| `specchiarsi` | `specchiare` | has forms |
| `suicidarsi` | `suicidare` | has forms |
| `vergognarsi` | `vergognare` | has forms |

## Summary

| Field | Trust it? |
| --- | --- |
| The key (infinitive) | Always |
| `ind`, `sub`, `cond`, `impr` | Yes |
| `part` | Yes |
| `inf.pres` | **No** — use the key |
| `ger.pres` | **Only after trimming** at `-ando`/`-endo` |

Counts were measured against `italian-verbs-dict` 3.4.0.
