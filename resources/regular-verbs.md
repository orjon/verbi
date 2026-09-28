# Regular conjugation rules

Every form of a regular Italian verb can be built from its infinitive. This is
the complete set of rules, with the endings attached to the **stem** — the
infinitive minus its final three letters (`parlare` → `parl`).

Model verbs, whose forms below are all attested in Morph-it!:

| Conjugation | Model | Stem |
| --- | --- | --- |
| First, `-are` | parlare | `parl` |
| Second, `-ere` | temere | `tem` |
| Third, `-ire` | partire | `part` |
| Third, `-isc-` type | finire | `fin` |

## Endings

Columns are io, tu, lui/lei, noi, voi, loro.

### Indicativo presente

| | io | tu | lui/lei | noi | voi | loro |
| --- | --- | --- | --- | --- | --- | --- |
| `-are` | -o | -i | -a | -iamo | -ate | -ano |
| `-ere` | -o | -i | -e | -iamo | -ete | -ono |
| `-ire` | -o | -i | -e | -iamo | -ite | -ono |
| `-isc-` | -isco | -isci | -isce | -iamo | -ite | -iscono |

### Indicativo imperfetto

| | io | tu | lui/lei | noi | voi | loro |
| --- | --- | --- | --- | --- | --- | --- |
| `-are` | -avo | -avi | -ava | -avamo | -avate | -avano |
| `-ere` | -evo | -evi | -eva | -evamo | -evate | -evano |
| `-ire` | -ivo | -ivi | -iva | -ivamo | -ivate | -ivano |

### Indicativo passato remoto

| | io | tu | lui/lei | noi | voi | loro |
| --- | --- | --- | --- | --- | --- | --- |
| `-are` | -ai | -asti | -ò | -ammo | -aste | -arono |
| `-ere` | -ei | -esti | -é | -emmo | -este | -erono |
| `-ere` *(variant)* | -etti | -esti | -ette | -emmo | -este | -ettero |
| `-ire` | -ii | -isti | -ì | -immo | -iste | -irono |

Second-conjugation verbs have **both** sets, and both are correct. They differ
only in io, lui/lei and loro; the other three persons are shared.

### Indicativo futuro semplice

Built on the infinitive minus its final `-e`, with one change: `-are` verbs
shift `a` to `e`, so `parlare` → `parler-`.

| Stem | io | tu | lui/lei | noi | voi | loro |
| --- | --- | --- | --- | --- | --- | --- |
| `parler-`, `temer-`, `partir-` | -ò | -ai | -à | -emo | -ete | -anno |

*parlerò, temerai, partirà, parleremo, temerete, partiranno.*

These endings hold for **every** Italian verb without exception, regular or
not — only the stem varies. That is what makes a broken future repairable.

### Condizionale presente

Same stem as the future.

| Stem | io | tu | lui/lei | noi | voi | loro |
| --- | --- | --- | --- | --- | --- | --- |
| `parler-`, `temer-`, `partir-` | -ei | -esti | -ebbe | -emmo | -este | -ebbero |

### Congiuntivo presente

| | io | tu | lui/lei | noi | voi | loro |
| --- | --- | --- | --- | --- | --- | --- |
| `-are` | -i | -i | -i | -iamo | -iate | -ino |
| `-ere` | -a | -a | -a | -iamo | -iate | -ano |
| `-ire` | -a | -a | -a | -iamo | -iate | -ano |
| `-isc-` | -isca | -isca | -isca | -iamo | -iate | -iscano |

The three singular persons are always identical. This holds for every Italian
verb and is a useful check.

### Congiuntivo imperfetto

| | io | tu | lui/lei | noi | voi | loro |
| --- | --- | --- | --- | --- | --- | --- |
| `-are` | -assi | -assi | -asse | -assimo | -aste | -assero |
| `-ere` | -essi | -essi | -esse | -essimo | -este | -essero |
| `-ire` | -issi | -issi | -isse | -issimo | -iste | -issero |

### Imperativo

Only three forms exist — you cannot command yourself or a third party.

| | tu | noi | voi |
| --- | --- | --- | --- |
| `-are` | -a | -iamo | -ate |
| `-ere` | -i | -iamo | -ete |
| `-ire` | -i | -iamo | -ite |
| `-isc-` | -isci | -iamo | -ite |

### Forms without a person

| | `-are` | `-ere` | `-ire` |
| --- | --- | --- | --- |
| Infinito | -are | -ere | -ire |
| Gerundio | -ando | -endo | -endo |
| Participio presente | -ante | -ente | -ente |
| Participio passato | -ato | -uto | -ito |

The participles inflect for gender and number: `-o` masculine singular, `-a`
feminine singular, `-i` masculine plural, `-e` feminine plural — so *parlato,
parlata, parlati, parlate*. The present participle distinguishes only number:
*parlante*, *parlanti*.

The `-isc-` verbs are **not** affected here. `finire` gives *finendo*,
*finente*, *finito* — the infix appears only in the present tenses and the
imperative.

## Spelling rules

Italian keeps a consonant's sound constant across a paradigm, which changes the
spelling before `e` and `i`.

| Infinitive ends | Before `e` or `i` | Example |
| --- | --- | --- |
| `-care`, `-gare` | insert `h` | cercare → cerchi, cercherò |
| `-ciare`, `-giare` | drop the `i` | cominciare → cominci, comincerò |
| `-iare` (unstressed `i`) | do not double the `i` | studiare → studi, not studii |

Without these, a generator produces *cercerò* and *cominciero*, which are wrong.

## Compound tenses

Seven tenses are built from a conjugated auxiliary plus the past participle.
None of them is stored in the data.

| Tense | Auxiliary in | Example |
| --- | --- | --- |
| Passato prossimo | presente | ho parlato |
| Trapassato prossimo | imperfetto | avevo parlato |
| Trapassato remoto | passato remoto | ebbi parlato |
| Futuro anteriore | futuro | avrò parlato |
| Congiuntivo passato | cong. presente | abbia parlato |
| Congiuntivo trapassato | cong. imperfetto | avessi parlato |
| Condizionale passato | condizionale | avrei parlato |

The auxiliary is *avere* or *essere*, and the dictionary does not record which.
With *essere* the participle agrees with the subject — *sono andato*, *sono
andata*, *siamo andati* — while with *avere* it stays masculine singular.

## What this does not cover

These rules generate every form of a regular verb, which is 5,317 of the 6,074
verbs the app offers, or 87%. The remaining 757 deviate somewhere and must be
stored.

Irregularity in Italian sits almost entirely in the stem rather than the
endings, and concentrates in the second conjugation: `-are` verbs are 99.5%
regular, `-ire` 85.8%, but `-ere` only 4.7%.

The 57 `-rre` verbs (*porre*, *condurre*, *trarre*) are contracted second
conjugation. Their older stem resurfaces throughout — *ponevo*, *conducevo* —
so their forms cannot be built from the modern infinitive, though their future
and conditional follow the rule above exactly.
