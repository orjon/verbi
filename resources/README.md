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

## Every error, listed

Generated from `italian-verbs-dict` 3.4.0. Each table gives the key, what the
field holds, and what it should hold.

### Wrong infinitives (2,219)

`inf.pres` holds the verb with a pronoun attached. The correct form is always
the key, so the third column is shown once here rather than repeated.

| Key (correct) | Stored in `inf.pres` |
| --- | --- |
| `abbagliare` | abbagliarli |
| `abbaiare` | abbaiarmi |
| `abbandonare` | abbandonarsi |
| `abbassare` | abbassarsi |
| `abbattere` | abbattersi |
| `abbellire` | abbellirsi |
| `abbeverare` | abbeverarsi |
| `abbigliare` | abbigliarsi |
| `abbinare` | abbinarsi |
| `abbonare` | abbonarvi |
| `abbozzare` | abbozzarne |
| `abbracciare` | abbracciarti |
| `abbreviare` | abbreviarne |
| `abbronzare` | abbronzarsi |
| `abilitare` | abilitarli |
| `abitare` | abitarlo |
| `abituare` | abituarvi |
| `abolire` | abolirlo |
| `abrogare` | abrogarsi |
| `abusare` | abusarne |
| `accadere` | accadermi |
| `accalcare` | accalcarsi |
| `accampare` | accamparsi |
| `accantonare` | accantonarli |
| `accaparrare` | accaparrarsi |
| `accapigliarsi` | accapigliarci |
| `accarezzare` | accarezzarti |
| `accartocciare` | accartocciarsi |
| `accasare` | accasarsi |
| `accasciare` | accasciarsi |
| `accattivare` | accattivarsi |
| `accavallare` | accavallarsi |
| `accecare` | accecarsi |
| `accedere` | accedervi |
| `accelerare` | accelerarsi |
| `accennare` | accennarvi |
| `accentrare` | accentrarsi |
| `accentuare` | accentuarsi |
| `accertare` | accertarsi |
| `accettare` | accettarti |
| `acchiappare` | acchiapparli |
| `accingere` | accingersi |
| `acciuffare` | acciuffarlo |
| `acclamare` | acclamarla |
| `accodare` | accodarsi |
| `accogliere` | accogliervi |
| `accollare` | accollarsi |
| `accomiatare` | accomiatarsi |
| `accomodare` | accomodarsi |
| `accompagnare` | accompagnarvi |
| `accomunare` | accomunarsi |
| `acconciare` | acconciarsi |
| `accontentare` | accontentarti |
| `accoppiare` | accoppiarsi |
| `accorciare` | accorciarle |
| `accordare` | accordarvi |
| `accorgersi` | accorgervi |
| `accostare` | accostarvi |
| `accrescere` | accrescersi |
| `accreditare` | accreditarsi |
| `accucciare` | accucciarsi |
| `accudire` | accudirli |
| `accumulare` | accumularsi |
| `accusare` | accusarvi |
| `acquietare` | acquietarsi |
| `acquisire` | acquisirne |
| `acquistare` | acquistarsi |
| `acuire` | acuirsi |
| `acutizzare` | acutizzarsi |
| `adagiare` | adagiarti |
| `adattare` | adattarvi |
| `addebitare` | addebitarsi |
| `addensare` | addensarsi |
| `addentrare` | addentrarsi |
| `addestrare` | addestrarsi |
| `additare` | additarli |
| `addobbare` | addobbarsi |
| `addolcire` | addolcirsi |
| `addomesticare` | addomesticarli |
| `addormentare` | addormentarti |
| `addossare` | addossarsi |
| `adeguare` | adeguarsi |
| `aderire` | aderirvi |
| `adoperare` | adoperarsi |
| `adornare` | adornarsi |
| `adottare` | adottarsi |
| `adunare` | adunarsi |
| `affaccendare` | affaccendarsi |
| `affacciare` | affacciarsi |
| `affamare` | affamarli |
| `affannare` | affannarsi |
| `affascinare` | affascinarmi |
| `affermare` | affermarsi |
| `afferrare` | afferrarsi |
| `affezionare` | affezionarsi |
| `affiancare` | affiancarsi |
| `affiatare` | affiatarsi |
| `affidare` | affidarvi |
| `affievolire` | affievolirsi |
| `affiliare` | affiliarti |
| `affinare` | affinarne |
| `affittare` | affittarsi |
| `afflosciare` | afflosciarsi |
| `affollare` | affollarsi |
| `affondare` | affondarvi |
| `affossare` | affossarlo |
| `affrancare` | affrancarsi |
| `affrettare` | affrettarsi |
| `affrontare` | affrontarsi |
| `agevolare` | agevolarne |
| `agganciare` | agganciarsi |
| `aggiornare` | aggiornarvi |
| `aggirare` | aggirarsi |
| `aggiudicare` | aggiudicarsi |
| `aggiungere` | aggiungervi |
| `aggiustare` | aggiustarsi |
| `aggrappare` | aggrapparvi |
| `aggravare` | aggravarsi |
| `aggredire` | aggredirne |
| `aggregare` | aggregarsi |
| `agguantare` | agguantarlo |
| `agitare` | agitarsi |
| `aiutare` | aiutarvi |
| `alimentare` | alimentarsi |
| `allacciare` | allacciarsi |
| `allargare` | allargarsi |
| `allarmare` | allarmarti |
| `allattare` | allattarla |
| `alleare` | allearvi |
| `allegare` | allegarla |
| `alleggerire` | alleggerirne |
| `allenare` | allenarti |
| `allentare` | allentarsi |
| `allestire` | allestirne |
| `allevare` | allevarsi |
| `alleviare` | alleviarsi |
| `allineare` | allinearsi |
| `alloggiare` | alloggiarla |
| `allontanare` | allontanarti |
| `allungare` | allungarsi |
| `altalenare` | altalenarsi |
| `alterare` | alterarsi |
| `alternare` | alternarsi |
| `alzare` | alzarvi |
| `amare` | amarti |
| `amalgamare` | amalgamarne |
| `ambientare` | ambientarsi |
| `ammaestrare` | ammaestrarla |
| `ammalare` | ammalarsi |
| `ammanettare` | ammanettarlo |
| `ammansire` | ammansirli |
| `ammassare` | ammassarsi |
| `ammazzare` | ammazzarti |
| `ammettere` | ammettersi |
| `amministrare` | amministrarsi |
| `ammirare` | ammirarti |
| `ammollare` | ammollarle |
| `ammonire` | ammonirlo |
| `ammorbidire` | ammorbidirsi |
| `ammortizzare` | ammortizzarne |
| `ammucchiare` | ammucchiarsi |
| `ammutolire` | ammutolirsi |
| `ampliare` | ampliarsi |
| `amplificare` | amplificarlo |
| `amputare` | amputarsi |
| `analizzare` | analizzarne |
| `ancorare` | ancorarvi |
| `andare` | andarvi |
| `angosciare` | angosciarsi |
| `animare` | animarsi |
| `annegare` | annegarsi |
| `annichilare` | annichilarsi |
| `annichilire` | annichilirsi |
| `annidare` | annidarsi |
| `annientare` | annientarsi |
| `annoiare` | annoiarvi |
| `annotare` | annotarvi |
| `annoverare` | annoverarne |
| `annullare` | annullarsi |
| `annunciare` | annunciarvi |
| `annusare` | annusarne |
| `anticipare` | anticiparvi |
| `aprire` | aprirvi |
| `appagare` | appagarsi |
| `apparire` | apparirgli |
| `appannare` | appannarsi |
| `appartare` | appartarsi |
| `appartenere` | appartenervi |
| `appassionare` | appassionarvi |
| `appellare` | appellarsi |
| `appesantire` | appesantirsi |
| `appiccicare` | appiccicarsi |
| `appioppare` | appiopparvi |
| `applaudire` | applaudirmi |
| `applicare` | applicarsi |
| `appoggiare` | appoggiarvi |
| `apporre` | apporsi |
| `apportare` | apportarvi |
| `appostare` | appostarsi |
| `apprestare` | apprestarsi |
| `apprezzare` | apprezzarsi |
| `approfittare` | approfittarsi |
| `approfondire` | approfondirsi |
| `approntare` | approntarne |
| `appropriare` | appropriarti |
| `approssimare` | approssimarsi |
| `approvare` | approvarsi |
| `approvvigionare` | approvvigionarsi |
| `appurare` | appurarlo |
| `arare` | ararlo |
| `archiviare` | archiviarla |
| `arenare` | arenarsi |
| `arginare` | arginarne |
| `argomentare` | argomentarlo |
| `armare` | armarsi |
| `armonizzare` | armonizzarsi |
| `arrabattarsi` | arrabattarvi |
| `arrabbiare` | arrabbiarvi |
| `arrampicare` | arrampicarvi |
| `arrangiare` | arrangiarsi |
| `arrecare` | arrecarsi |
| `arredare` | arredarsi |
| `arrestare` | arrestarti |
| `arretrare` | arretrarlo |
| `arricchire` | arricchirsi |
| `arrischiare` | arrischiarsi |
| `arrivare` | arrivarvi |
| `arroccare` | arroccarsi |
| `arrochire` | arrochirsi |
| `arrogare` | arrogarsi |
| `arrostire` | arrostirsi |
| `arrovellare` | arrovellarsi |
| `arruolare` | arruolarti |
| `articolare` | articolarsi |
| `asciugare` | asciugarsi |
| `ascoltare` | ascoltarti |
| `ascrivere` | ascriversi |
| `aspettare` | aspettarti |
| `assaggiare` | assaggiarli |
| `assalire` | assalirmi |
| `assaporare` | assaporarlo |
| `assassinare` | assassinarlo |
| `assecondare` | assecondarne |
| `assediare` | assediarli |
| `assegnare` | assegnarvi |
| `asserragliare` | asserragliarsi |
| `asservire` | asservirsi |
| `assestare` | assestarsi |
| `assicurare` | assicurarvi |
| `assimilare` | assimilarsi |
| `assistere` | assistervi |
| `associare` | associarvi |
| `assoggettare` | assoggettarsi |
| `assolvere` | assolversene |
| `assomigliare` | assomigliarsi |
| `assommare` | assommarsi |
| `assorbire` | assorbirne |
| `assottigliare` | assottigliarsi |
| `assuefare` | assuefarsi |
| `assumere` | assumerti |
| `astenere` | astenervi |
| `astrarre` | astrarsi |
| `attaccare` | attaccarvi |
| `attardare` | attardarsi |
| `atteggiare` | atteggiarsi |
| `attenere` | attenervi |
| `attenuare` | attenuarsi |
| `atterrare` | atterrarvi |
| `attestare` | attestarsi |
| `attirare` | attirarsi |
| `attivare` | attivarti |
| `attorcigliare` | attorcigliarsi |
| `attrarre` | attrarsi |
| `attraversare` | attraversarne |
| `attrezzare` | attrezzarsi |
| `attribuire` | attribuirsi |
| `attuare` | attuarsi |
| `attutire` | attutirsi |
| `augurare` | augurarvi |
| `aumentare` | aumentarne |
| `auscultare` | auscultarlo |
| `auspicare` | auspicarlo |
| `autenticare` | autenticarti |
| `automatizzare` | automatizzarlo |
| `autorizzare` | autorizzarti |
| `avanzare` | avanzarvi |
| `avvalersi` | avvalerti |
| `avvantaggiare` | avvantaggiarsi |
| `avvelenare` | avvelenarsi |
| `avventare` | avventarsi |
| `avventurare` | avventurarvi |
| `avverare` | avverarsi |
| `avversare` | avversarsi |
| `avvertire` | avvertirsi |
| `avviare` | avviarsi |
| `avvicendare` | avvicendarsi |
| `avvicinare` | avvicinarti |
| `avvilire` | avvilirne |
| `avvisare` | avvisarvi |
| `avvistare` | avvistarne |
| `avvitare` | avvitarsi |
| `avvolgere` | avvolgersi |
| `azzardare` | azzardarti |
| `azzeccare` | azzeccarla |
| `azzerare` | azzerarsi |
| `azzoppare` | azzopparsi |
| `bacchettare` | bacchettarli |
| `baciare` | baciarsi |
| `badare` | badarvi |
| `bagnare` | bagnarsi |
| `banalizzare` | banalizzarle |
| `barattare` | barattarne |
| `barricare` | barricarsi |
| `basare` | basarvi |
| `bastare` | bastarne |
| `bastonare` | bastonarsi |
| `battere` | battervi |
| `battezzare` | battezzarsi |
| `beare` | bearsi |
| `beccare` | beccarsi |
| `beffare` | beffarsi |
| `bendare` | bendarsi |
| `beneficiare` | beneficiarne |
| `bere` | berti |
| `biasimare` | biasimarmi |
| `bilanciare` | bilanciarsi |
| `bloccare` | bloccarsi |
| `bocciare` | bocciarne |
| `boicottare` | boicottarlo |
| `bollare` | bollarla |
| `bollire` | bollirla |
| `bombardare` | bombardarli |
| `braccare` | braccarlo |
| `bruciare` | bruciarsi |
| `bucare` | bucarsi |
| `buscare` | buscarsi |
| `buttare` | buttarti |
| `cacciare` | cacciarsi |
| `cadenzare` | cadenzarne |
| `cagare` | cagarsi |
| `cagionare` | cagionarlo |
| `calare` | calarti |
| `calamitare` | calamitarvi |
| `calcinare` | calcinarla |
| `calcolare` | calcolarsi |
| `calibrare` | calibrarne |
| `calmare` | calmarsi |
| `calmierare` | calmierarsi |
| `calzare` | calzargli |
| `cambiare` | cambiarveli |
| `camminare` | camminarsi |
| `campeggiare` | campeggiarvi |
| `camuffare` | camuffarsi |
| `canalizzare` | canalizzarle |
| `cancellare` | cancellarvi |
| `candidare` | candidarsi |
| `cantare` | cantarti |
| `capacitare` | capacitarsi |
| `capeggiare` | capeggiarla |
| `capire` | capirvi |
| `capitare` | capitarmi |
| `capovolgere` | capovolgersi |
| `captare` | captarla |
| `caratterizzare` | caratterizzarsi |
| `carezzare` | carezzarsi |
| `caricare` | caricarti |
| `carpire` | carpirne |
| `castigare` | castigarli |
| `catalogare` | catalogarlo |
| `catapultare` | catapultarsi |
| `catturare` | catturarmi |
| `causare` | causarti |
| `cautelare` | cautelarsi |
| `cavare` | cavartela |
| `cavalcare` | cavalcarmi |
| `cedere` | cederne |
| `celare` | celarsi |
| `celebrare` | celebrarsi |
| `cementare` | cementarvi |
| `censurare` | censurarle |
| `centrare` | centrarlo |
| `cercare` | cercarvi |
| `certificare` | certificarti |
| `chetare` | chetarla |
| `chiacchierare` | chiacchierarne |
| `chiamare` | chiamarvi |
| `chiarire` | chiarirsi |
| `chiedere` | chiedervi |
| `chinare` | chinarsi |
| `chiosare` | chiosarli |
| `chiudere` | chiudersi |
| `cibare` | cibarsi |
| `cicatrizzare` | cicatrizzarmi |
| `cimentare` | cimentarvi |
| `ciondolare` | ciondolarsi |
| `circondare` | circondarsi |
| `circoscrivere` | circoscriverne |
| `circuire` | circuirla |
| `citare` | citarvi |
| `classificare` | classificarsi |
| `coagulare` | coagularsi |
| `coalizzare` | coalizzarsi |
| `cuocere` | cuocerlo |
| `codificare` | codificarle |
| `cogliere` | cogliervi |
| `coinvolgere` | coinvolgervi |
| `colare` | colarlo |
| `collaborare` | collaborarvi |
| `collaudare` | collaudarne |
| `collegare` | collegarvi |
| `collocare` | collocarsi |
| `colmare` | colmarvi |
| `colorare` | colorarsi |
| `colorire` | colorirlo |
| `colpire` | colpirvi |
| `colpevolizzare` | colpevolizzarsi |
| `coltivare` | coltivarsi |
| `comandare` | comandarle |
| `combattere` | combattersi |
| `combinare` | combinarsi |
| `cominciare` | cominciarsi |
| `commemorare` | commemorarlo |
| `commentare` | commentarsi |
| `commerciare` | commerciarlo |
| `commercializzare` | commercializzarli |
| `commettere` | commetterne |
| `comminare` | comminargli |
| `commisurare` | commisurarla |
| `commuovere` | commuoversi |
| `comparare` | compararne |
| `compatire` | compatirsi |
| `compendiare` | compendiarsi |
| `compenetrare` | compenetrarsi |
| `compensare` | compensarsi |
| `comperare` | comperarsi |
| `compiere` | compiervi |
| `compiacere` | compiacersi |
| `compilare` | compilarsi |
| `completare` | completarsi |
| `complicare` | complicarsi |
| `complimentare` | complimentarti |
| `comporre` | comporti |
| `comportare` | comportarti |
| `comprare` | comprarvi |
| `comprimere` | comprimersi |
| `compromettere` | compromettervi |
| `comprovare` | comprovarla |
| `computare` | computarsi |
| `computerizzare` | computerizzarla |
| `comunicare` | comunicarvi |
| `concatenare` | concatenarsi |
| `concedere` | concederti |
| `concentrare` | concentrarvi |
| `concepire` | concepirmi |
| `concertare` | concertarsi |
| `conciliare` | conciliarsi |
| `concludere` | concludersi |
| `concordare` | concordarsi |
| `concorrere` | concorrervi |
| `concretare` | concretarsi |
| `concretizzare` | concretizzarsi |
| `condannare` | condannarvi |
| `condensare` | condensarsi |
| `condividere` | condividerne |
| `condizionare` | condizionarvi |
| `condonare` | condonargli |
| `condurre` | condurveli |
| `conferire` | conferirti |
| `confermare` | confermarvi |
| `confessare` | confessarvi |
| `confezionare` | confezionarsi |
| `conficcare` | conficcarsi |
| `confidare` | confidarsi |
| `configurare` | configurarsi |
| `confinare` | confinarsi |
| `confluire` | confluirvi |
| `confondere` | confonderti |
| `conformare` | conformarsi |
| `confortare` | confortarlo |
| `confrontare` | confrontarvi |
| `confutare` | confutarle |
| `congedare` | congedarsi |
| `congelare` | congelarne |
| `congiungere` | congiungersi |
| `conoscere` | conoscervi |
| `conquistare` | conquistarti |
| `consacrare` | consacrarne |
| `consegnare` | consegnarsi |
| `conseguire` | conseguirsi |
| `consentire` | consentirvi |
| `conservare` | conservarsi |
| `considerare` | considerarti |
| `consigliare` | consigliarvi |
| `consolare` | consolarti |
| `consolidare` | consolidarsi |
| `constatare` | constatarne |
| `consultare` | consultarsi |
| `consumare` | consumarsi |
| `contare` | contarsi |
| `contaminare` | contaminarvi |
| `contattare` | contattarvi |
| `conteggiare` | conteggiarsi |
| `contemplare` | contemplarsi |
| `contenere` | contenersi |
| `contentare` | contentarsi |
| `contestare` | contestarne |
| `continuare` | continuarne |
| `contornare` | contornarsi |
| `contraddire` | contraddirsi |
| `contrarre` | contrarti |
| `contrapporre` | contrapporvi |
| `contrassegnare` | contrassegnarla |
| `contrastare` | contrastarsi |
| `contrattare` | contrattarla |
| `contribuire` | contribuirvi |
| `controindicare` | controindicarne |
| `controllare` | controllarsi |
| `convalidare` | convalidarvi |
| `convenire` | convenirlo |
| `convenzionare` | convenzionarsi |
| `convertire` | convertirti |
| `convincere` | convincervi |
| `convocare` | convocarsi |
| `convogliare` | convogliarli |
| `coordinare` | coordinarti |
| `coprire` | coprirti |
| `copiare` | copiarvi |
| `coricare` | coricarsi |
| `coronare` | coronarmi |
| `correre` | corrervi |
| `correggere` | correggerti |
| `correlare` | correlarla |
| `corrodere` | corroderla |
| `corrompere` | corrompersi |
| `corrugare` | corrugarsi |
| `corteggiare` | corteggiarla |
| `cospargere` | cospargersi |
| `costare` | costarti |
| `costituire` | costituirsi |
| `costringere` | costringervi |
| `costruire` | costruirvi |
| `cotonare` | cotonarle |
| `covare` | covarsi |
| `creare` | crearvi |
| `crescere` | crescerne |
| `credere` | credervi |
| `crepare` | creparsi |
| `cristallizzare` | cristallizzarsi |
| `criticare` | criticarne |
| `crivellare` | crivellarla |
| `crogiolare` | crogiolarsi |
| `cucire` | cucirsi |
| `cucinare` | cucinarsi |
| `cullare` | cullarsi |
| `cumulare` | cumularsi |
| `curare` | curarvi |
| `curvare` | curvarsi |
| `custodire` | custodirlo |
| `dare` | darvi |
| `dannare` | dannarsi |
| `danneggiare` | danneggiarne |
| `danzare` | danzarsi |
| `datare` | datarsi |
| `dovere` | dovervi |
| `decantare` | decantarsi |
| `decidere` | decidersi |
| `decifrare` | decifrarsi |
| `declamare` | declamarle |
| `declinare` | declinarne |
| `decodificare` | decodificarli |
| `decongestionare` | decongestionarla |
| `decorrere` | decorrerne |
| `decretare` | decretarne |
| `decurtare` | decurtarsi |
| `dedicare` | dedicarvi |
| `dedurre` | dedursi |
| `deferire` | deferirlo |
| `defilare` | defilarsi |
| `definire` | definirsi |
| `deformare` | deformarsi |
| `degnare` | degnarsi |
| `degradare` | degradarsi |
| `delegare` | delegarla |
| `deliberare` | deliberarla |
| `delimitare` | delimitarne |
| `delineare` | delinearsi |
| `deliziare` | deliziarsi |
| `deludere` | deludermi |
| `demandare` | demandarne |
| `democratizzare` | democratizzarsi |
| `demolire` | demolirne |
| `demoralizzare` | demoralizzarsi |
| `denudare` | denudarmi |
| `denunciare` | denunciarne |
| `deplorare` | deplorarlo |
| `deportare` | deportarli |
| `depositare` | depositarvi |
| `depredare` | depredarlo |
| `deprivare` | deprivarlo |
| `depurare` | depurarsi |
| `deridere` | deriderli |
| `derivare` | derivarne |
| `derubare` | derubarvi |
| `descrivere` | descrivervi |
| `desiderare` | desiderarlo |
| `designare` | designarlo |
| `destare` | destarlo |
| `destabilizzare` | destabilizzarne |
| `destinare` | destinarsi |
| `destituire` | destituirvi |
| `destreggiare` | destreggiarsi |
| `desumere` | desumersi |
| `deteriorare` | deteriorarsi |
| `determinare` | determinarsi |
| `detestare` | detestarlo |
| `detronizzare` | detronizzarla |
| `dettare` | dettarle |
| `dire` | dirvi |
| `deturpare` | deturparne |
| `deviare` | deviarlo |
| `diagnosticare` | diagnosticarlo |
| `dibattere` | dibattersi |
| `dichiarare` | dichiararsi |
| `diffamare` | diffamarli |
| `differenziare` | differenziarsi |
| `diffidare` | diffidarne |
| `diffondere` | diffondersi |
| `digerire` | digerirle |
| `digitare` | digitarlo |
| `dilaniare` | dilaniarsi |
| `dilapidare` | dilapidarsi |
| `dilatare` | dilatarsi |
| `dileguare` | dileguarsi |
| `dilettare` | dilettarsi |
| `diluire` | diluirsi |
| `dilungare` | dilungarti |
| `dimenare` | dimenarsi |
| `dimensionare` | dimensionarla |
| `dimenticare` | dimenticarvi |
| `dimettere` | dimettersi |
| `dimezzare` | dimezzarla |
| `diminuire` | diminuirne |
| `dimostrare` | dimostrarvelo |
| `dipanare` | dipanarsi |
| `dipartire` | dipartirsi |
| `dipingere` | dipingersi |
| `diplomare` | diplomarsi |
| `diradare` | diradarsi |
| `dirigere` | dirigerti |
| `dirottare` | dirottarne |
| `disarcionare` | disarcionarlo |
| `disarmare` | disarmarlo |
| `disattivare` | disattivarlo |
| `dischiudere` | dischiudermi |
| `disciplinare` | disciplinarlo |
| `discolpare` | discolparvi |
| `discoprire` | discoprirne |
| `discorrere` | discorrervene |
| `discostare` | discostarsi |
| `discriminare` | discriminarlo |
| `disegnare` | disegnarti |
| `diseredare` | diseredarlo |
| `disfare` | disfarsi |
| `disgiungere` | disgiungersi |
| `disgregare` | disgregarsi |
| `disgustare` | disgustarsi |
| `disilludere` | disilluderlo |
| `disimpegnare` | disimpegnarsi |
| `disintegrare` | disintegrarsi |
| `disinteressare` | disinteressarsi |
| `disintossicare` | disintossicarsi |
| `dislocare` | dislocarsi |
| `disorientare` | disorientarli |
| `disperare` | disperarsi |
| `dispiacere` | dispiacermi |
| `dispiegare` | dispiegarsi |
| `disporre` | disporvi |
| `disprezzare` | disprezzarsi |
| `disputare` | disputarsi |
| `disquisire` | disquisirne |
| `dissacrare` | dissacrarne |
| `dissanguare` | dissanguarsi |
| `disseccare` | disseccarsi |
| `dissetare` | dissetarsi |
| `dissimulare` | dissimularmi |
| `dissipare` | dissiparsi |
| `dissociare` | dissociarsi |
| `dissolvere` | dissolversi |
| `dissuadere` | dissuadervi |
| `distaccare` | distaccarvi |
| `distanziare` | distanziarsi |
| `distinguere` | distinguervi |
| `distogliere` | distogliervi |
| `distrarre` | distrarti |
| `distribuire` | distribuirsi |
| `districare` | districarsi |
| `distruggere` | distruggervi |
| `disturbare` | disturbarvi |
| `divaricare` | divaricarsi |
| `divenire` | divenirne |
| `diventare` | diventarne |
| `diversificare` | diversificarsi |
| `divertire` | divertirvi |
| `dividere` | dividersi |
| `divincolare` | divincolarsi |
| `divinizzare` | divinizzarsi |
| `divorare` | divorarsi |
| `divulgare` | divulgarli |
| `documentare` | documentarsi |
| `domare` | domarli |
| `domandare` | domandarti |
| `dominare` | dominarmi |
| `donare` | donarvi |
| `dondolare` | dondolarsi |
| `doppiare` | doppiarmi |
| `dosare` | dosarsi |
| `dotare` | dotarsi |
| `dragare` | dragarne |
| `drammatizzare` | drammatizzarle |
| `drizzare` | drizzarne |
| `drogare` | drogarti |
| `dubitare` | dubitarne |
| `duplicare` | duplicarsi |
| `eccitare` | eccitarsi |
| `eclissare` | eclissarsi |
| `economizzare` | economizzarne |
| `edificare` | edificarmi |
| `educare` | educarsi |
| `effettuare` | effettuarsi |
| `eguagliare` | eguagliarmi |
| `elaborare` | elaborarne |
| `eleggere` | eleggerne |
| `elencare` | elencarne |
| `elettrizzare` | elettrizzarvi |
| `elevare` | elevarsi |
| `eliminare` | eliminarne |
| `elogiare` | elogiarlo |
| `eludere` | eluderlo |
| `emanare` | emanarsi |
| `emancipare` | emanciparvi |
| `emarginare` | emarginarli |
| `emergere` | emergerne |
| `emettere` | emettersi |
| `emozionare` | emozionarsi |
| `encomiare` | encomiarla |
| `entrare` | entrarvi |
| `entusiasmare` | entusiasmarvi |
| `enucleare` | enuclearsi |
| `enumerare` | enumerarle |
| `enunciare` | enunciargli |
| `ereditare` | ereditarne |
| `erodere` | eroderne |
| `erogare` | erogarsi |
| `esagerare` | esagerarne |
| `esaltare` | esaltarsi |
| `esaminare` | esaminarne |
| `esasperare` | esasperarlo |
| `esaudire` | esaudirlo |
| `esaurire` | esaurirsi |
| `esautorare` | esautorarne |
| `uscire` | uscirsene |
| `escludere` | escluderti |
| `eseguire` | eseguirvi |
| `esemplificare` | esemplificarne |
| `esercitare` | esercitarti |
| `esibire` | esibirsi |
| `esiliare` | esiliarsi |
| `esimere` | esimersi |
| `esistere` | esistervi |
| `esonerare` | esonerarlo |
| `esorcizzare` | esorcizzarne |
| `esortare` | esortarvi |
| `espletare` | espletarsi |
| `esplicare` | esplicarsi |
| `esplicitare` | esplicitarsi |
| `esplodere` | esplodersi |
| `esplorare` | esplorarti |
| `esporre` | esporvi |
| `esportare` | esportarvi |
| `esprimere` | esprimervi |
| `espropriare` | espropriarlo |
| `espugnare` | espugnarla |
| `esternare` | esternarsi |
| `estinguere` | estinguersi |
| `estirpare` | estirparne |
| `estorcere` | estorcergli |
| `estraniare` | estraniarsi |
| `estromettere` | estrometterlo |
| `evacuare` | evacuarla |
| `evidenziare` | evidenziarvi |
| `evitare` | evitarvi |
| `evocare` | evocarne |
| `fare` | farvi |
| `fabbricare` | fabbricarsi |
| `facilitare` | facilitarsi |
| `falsare` | falsarlo |
| `falsificare` | falsificarlo |
| `familiarizzare` | familiarizzarsi |
| `fasciare` | fasciarsi |
| `fatturare` | fatturarne |
| `favorire` | favorirne |
| `fecondare` | fecondarle |
| `felicitare` | felicitarsi |
| `ferire` | ferirsi |
| `fermare` | fermarvi |
| `festeggiare` | festeggiarmi |
| `fiaccare` | fiaccarne |
| `ficcare` | ficcarsi |
| `fidare` | fidarvi |
| `fidanzare` | fidanzarsi |
| `figurare` | figurarvi |
| `filare` | filarsela |
| `filmare` | filmarla |
| `filtrare` | filtrarlo |
| `finalizzare` | finalizzarsi |
| `finanziare` | finanziarsi |
| `finire` | finirvi |
| `fiorire` | fiorirvi |
| `firmare` | firmarsi |
| `fiscalizzare` | fiscalizzarle |
| `fischiare` | fischiarmi |
| `fissare` | fissarvi |
| `fiutare` | fiutarlo |
| `focalizzare` | focalizzarvi |
| `folgorare` | folgorarlo |
| `fondare` | fondarsi |
| `fondere` | fondersi |
| `forgiare` | forgiarsi |
| `formare` | formarsi |
| `formalizzare` | formalizzarsi |
| `formulare` | formularsi |
| `fornire` | fornirvi |
| `fortificare` | fortificarlo |
| `forzare` | forzarlo |
| `fotografare` | fotografarlo |
| `fracassare` | fracassarsi |
| `frammentare` | frammentarsi |
| `frantumare` | frantumarsi |
| `frapporre` | frapporsi |
| `frastornare` | frastornarlo |
| `frazionare` | frazionarlo |
| `fregare` | fregarti |
| `fregiare` | fregiarsi |
| `frenare` | frenarti |
| `frequentare` | frequentarsi |
| `fronteggiare` | fronteggiarsi |
| `fruire` | fruirne |
| `frustare` | frustarle |
| `fruttare` | fruttarne |
| `fucilare` | fucilarne |
| `fuggire` | fuggirne |
| `fulminare` | fulminarla |
| `fumare` | fumarsi |
| `funzionare` | funzionarvi |
| `fuorviare` | fuorviarli |
| `garantire` | garantirvi |
| `gelare` | gelarvi |
| `generare` | generarsi |
| `generalizzare` | generalizzarsi |
| `gestire` | gestirsi |
| `gettare` | gettarvi |
| `ghermire` | ghermirlo |
| `ghettizzare` | ghettizzarla |
| `gingillare` | gingillarsi |
| `giocare` | giocarvi |
| `giovare` | giovarsi |
| `girare` | girarvi |
| `giudicare` | giudicarsi |
| `giurare` | giurarlo |
| `giustificare` | giustificarsi |
| `giustiziare` | giustiziarlo |
| `gloriare` | gloriarsi |
| `glorificare` | glorificarlo |
| `godere` | godervi |
| `gonfiare` | gonfiarsi |
| `governare` | governarsi |
| `gradire` | gradirlo |
| `gratificare` | gratificarsi |
| `grattare` | grattarsi |
| `gravare` | gravarsi |
| `graziare` | graziarlo |
| `gridare` | gridarne |
| `grufolare` | grufolarsi |
| `guadare` | guadarsi |
| `guadagnare` | guadagnarti |
| `guardare` | guardarvi |
| `guarire` | guarirsi |
| `guastare` | guastarvi |
| `guidare` | guidarvi |
| `gustare` | gustarvi |
| `identificare` | identificarsi |
| `ignorare` | ignorarti |
| `illanguidire` | illanguidirsi |
| `illudere` | illudersi |
| `illuminare` | illuminarti |
| `illustrare` | illustrarne |
| `imballare` | imballarti |
| `imbarazzare` | imbarazzarsi |
| `imbarcare` | imbarcarvi |
| `imbastire` | imbastirvi |
| `imbellettare` | imbellettarsi |
| `imbestialire` | imbestialirsi |
| `imbiancare` | imbiancarsi |
| `imbizzarrire` | imbizzarrirsi |
| `imboccare` | imboccarla |
| `imbottire` | imbottirsi |
| `imbottigliare` | imbottigliarti |
| `imbrigliare` | imbrigliarsi |
| `imbrogliare` | imbrogliarmi |
| `imitare` | imitarvi |
| `immagazzinare` | immagazzinarlo |
| `immaginare` | immaginarvi |
| `immatricolare` | immatricolarti |
| `immedesimare` | immedesimarsi |
| `immergere` | immergervi |
| `immettere` | immettersi |
| `immischiare` | immischiarsi |
| `immiserire` | immiserirsi |
| `immobilizzare` | immobilizzarlo |
| `immolare` | immolarsi |
| `impalare` | impalarlo |
| `impancarsi` | impancarmi |
| `impantanare` | impantanarsi |
| `impappinare` | impappinarsi |
| `imparare` | impararsi |
| `impaurire` | impaurirsi |
| `impedire` | impedirsi |
| `impegnare` | impegnarvi |
| `impelagarsi` | impelagarci |
| `impennare` | impennarsi |
| `impensierire` | impensierirla |
| `imperniare` | imperniarsi |
| `impersonare` | impersonarla |
| `impiantare` | impiantarsi |
| `impiastricciare` | impiastricciarsi |
| `impiccare` | impiccarsi |
| `impicciare` | impicciarsi |
| `impiegare` | impiegarsi |
| `impigliare` | impigliarsi |
| `implorare` | implorarlo |
| `imporre` | imporvi |
| `importare` | importarti |
| `impostare` | impostarsi |
| `impoverire` | impoverirsi |
| `impratichire` | impratichirsi |
| `imprimere` | imprimersi |
| `impressionare` | impressionarmi |
| `impreziosire` | impreziosirne |
| `imprigionare` | imprigionarsi |
| `improntare` | improntarsi |
| `improvvisare` | improvvisarsi |
| `impuntare` | impuntarsi |
| `imputare` | imputarsi |
| `inabissare` | inabissarsi |
| `inacidire` | inacidirsi |
| `inaridire` | inaridirsi |
| `inasprire` | inasprirsi |
| `inaugurare` | inaugurarsi |
| `incagliare` | incagliarsi |
| `incalzare` | incalzarli |
| `incamminare` | incamminarvi |
| `incancrenire` | incancrenirsi |
| `incantare` | incantarsi |
| `incaricare` | incaricarsi |
| `incarnare` | incarnarsi |
| `incarognire` | incarognirsi |
| `incassare` | incassarla |
| `incastonare` | incastonarle |
| `incastrare` | incastrarsi |
| `incatenare` | incatenarmi |
| `incendiare` | incendiarsi |
| `incensare` | incensarlo |
| `incentivare` | incentivarne |
| `incentrare` | incentrarsi |
| `inceppare` | incepparsi |
| `inchinare` | inchinarsi |
| `inchiodare` | inchiodarlo |
| `incidere` | inciderlo |
| `incipriare` | incipriarmi |
| `inclinare` | inclinarsi |
| `includere` | includervi |
| `incollare` | incollarsi |
| `incolonnare` | incolonnarsi |
| `incontrare` | incontrarvi |
| `incoraggiare` | incoraggiarvi |
| `incornare` | incornarla |
| `incorniciare` | incorniciarle |
| `incoronare` | incoronarlo |
| `incorporare` | incorporarlo |
| `incrementare` | incrementarsi |
| `increspare` | incresparsi |
| `incriminare` | incriminarlo |
| `incrinare` | incrinarsi |
| `incrociare` | incrociarsi |
| `incrudire` | incrudirsi |
| `incuneare` | incunearsi |
| `incupire` | incupirsi |
| `incuriosire` | incuriosirlo |
| `indagare` | indagarne |
| `indebitare` | indebitarsi |
| `indebolire` | indebolirsi |
| `indire` | indirne |
| `indicare` | indicarti |
| `indignare` | indignarsi |
| `indirizzare` | indirizzarvi |
| `indispettire` | indispettirsi |
| `individuare` | individuarsi |
| `indossare` | indossarlo |
| `indovinare` | indovinarne |
| `indurire` | indurirsi |
| `infamare` | infamarla |
| `infangare` | infangarsi |
| `infarinare` | infarinarsi |
| `infastidire` | infastidirmi |
| `infatuare` | infatuarsi |
| `infettare` | infettarsi |
| `infeudare` | infeudarsi |
| `infiammare` | infiammarvi |
| `inficiare` | inficiarne |
| `infilare` | infilarvi |
| `infilzare` | infilzarsi |
| `infittire` | infittirsi |
| `influenzare` | influenzarne |
| `infoltire` | infoltirsi |
| `infondere` | infondervi |
| `informare` | informarvi |
| `infornare` | infornarlo |
| `infuocare` | infuocarsi |
| `infuriare` | infuriarsi |
| `ingabbiare` | ingabbiarlo |
| `ingaggiare` | ingaggiarti |
| `ingannare` | ingannarvi |
| `ingerire` | ingerirsi |
| `ingessare` | ingessargli |
| `inghiottire` | inghiottirli |
| `ingigantire` | ingigantirsi |
| `inginocchiarsi` | inginocchiarti |
| `inglobare` | inglobarne |
| `ingoiare` | ingoiarlo |
| `ingorgare` | ingorgarsi |
| `ingozzare` | ingozzarsi |
| `ingrandire` | ingrandirsi |
| `ingraziare` | ingraziarsi |
| `ingrossare` | ingrossarsi |
| `inguaiare` | inguaiarti |
| `inibire` | inibirle |
| `iniettare` | iniettarsi |
| `inimicare` | inimicarsi |
| `iniziare` | iniziarsi |
| `innaffiare` | innaffiarle |
| `innalzare` | innalzarsi |
| `innamorare` | innamorarti |
| `innervare` | innervarsi |
| `innervosire` | innervosirsi |
| `innescare` | innescarsi |
| `innestare` | innestarsi |
| `innovare` | innovarsi |
| `inoltrare` | inoltrarsi |
| `inondare` | inondarla |
| `inquadrare` | inquadrarsi |
| `inquinare` | inquinarti |
| `inquisire` | inquisirlo |
| `insabbiare` | insabbiarsi |
| `inscrivere` | inscriversi |
| `insediare` | insediarvi |
| `insegnare` | insegnarvi |
| `inseguire` | inseguirsi |
| `inserire` | inserirvi |
| `insidiare` | insidiarmi |
| `insinuare` | insinuarsi |
| `insolentire` | insolentirmi |
| `insorgere` | insorgerne |
| `insospettire` | insospettirmi |
| `installare` | installarsi |
| `instaurare` | instaurarsi |
| `insultare` | insultarmi |
| `intaccare` | intaccarne |
| `integrare` | integrarvi |
| `intenerire` | intenerirsi |
| `intensificare` | intensificarsi |
| `intercettare` | intercettarlo |
| `interessare` | interessarvi |
| `interiorizzare` | interiorizzarli |
| `internare` | internarsi |
| `internazionalizzare` | internazionalizzarsi |
| `interpellare` | interpellarne |
| `interporre` | interporti |
| `interpretare` | interpretarsi |
| `interrogare` | interrogarsi |
| `interrompere` | interrompersi |
| `intersecare` | intersecarsi |
| `intervenire` | intervenirvi |
| `intervistare` | intervistarlo |
| `intimare` | intimarle |
| `intimidire` | intimidirmi |
| `intimorire` | intimorirsi |
| `intitolare` | intitolarsi |
| `intonare` | intonarsi |
| `intorbidare` | intorbidarlo |
| `intrappolare` | intrappolarlo |
| `intrattenere` | intrattenersi |
| `intravedere` | intravedervi |
| `intrecciare` | intrecciarsi |
| `intricare` | intricarsi |
| `intristire` | intristirsi |
| `introdurre` | introdurvi |
| `intrufolare` | intrufolarsi |
| `intuire` | intuirne |
| `invadere` | invaderti |
| `inventare` | inventarti |
| `invertire` | invertirsi |
| `investire` | investirvi |
| `inviare` | inviarvi |
| `invidiare` | invidiargli |
| `invitare` | invitarvi |
| `invogliare` | invogliarvi |
| `inzuppare` | inzupparvi |
| `ipnotizzare` | ipnotizzarmi |
| `ipotizzare` | ipotizzarsi |
| `irradiare` | irradiarsi |
| `irretire` | irretirsi |
| `irrigare` | irrigarlo |
| `irrigidire` | irrigidirsi |
| `irritare` | irritarsi |
| `irrobustire` | irrobustirsi |
| `irrogare` | irrogarle |
| `iscrivere` | iscrivervi |
| `isolare` | isolarvi |
| `ispessire` | ispessirsi |
| `ispezionare` | ispezionarne |
| `ispirare` | ispirarsi |
| `issare` | issarsi |
| `istallare` | istallarsi |
| `istituire` | istituirsi |
| `istruire` | istruirmi |
| `lambire` | lambirla |
| `lambiccare` | lambiccarsi |
| `lamentare` | lamentarti |
| `lanciare` | lanciarvi |
| `lasciare` | lasciarvi |
| `laureare` | laurearti |
| `lavare` | lavarti |
| `lavorare` | lavorarvi |
| `leccare` | leccarsi |
| `legare` | legarvi |
| `leggere` | leggervi |
| `legittimare` | legittimarsi |
| `levare` | levarsi |
| `liberare` | liberartene |
| `liberalizzare` | liberalizzarsi |
| `librare` | librarsi |
| `licenziare` | licenziarmi |
| `limitare` | limitarsi |
| `linciare` | linciarlo |
| `liquefare` | liquefarsi |
| `liquidare` | liquidarsi |
| `livellare` | livellarsi |
| `localizzare` | localizzarsi |
| `lodare` | lodarlo |
| `logorare` | logorarsi |
| `lottizzare` | lottizzarne |
| `lubrificare` | lubrificarla |
| `lucere` | lucerne |
| `lustrare` | lustrargli |
| `macchiare` | macchiarsi |
| `magnetizzare` | magnetizzarlo |
| `magnificare` | magnificarsi |
| `maltrattare` | maltrattarlo |
| `mancare` | mancarmi |
| `mandare` | mandarvi |
| `maneggiare` | maneggiarsi |
| `mangiare` | mangiarsi |
| `manifestare` | manifestarti |
| `manipolare` | manipolarli |
| `manovrare` | manovrarli |
| `mantenere` | mantenervi |
| `marcare` | marcarsi |
| `maritare` | maritarsi |
| `martirizzare` | martirizzarla |
| `mascherare` | mascherarsi |
| `massacrare` | massacrarsi |
| `massaggiare` | massaggiarlo |
| `masticare` | masticarli |
| `masturbare` | masturbarsi |
| `materializzare` | materializzarsi |
| `maturare` | maturarlo |
| `medicare` | medicarsi |
| `memorizzare` | memorizzarle |
| `mentire` | mentirsi |
| `menzionare` | menzionarsi |
| `meravigliare` | meravigliarti |
| `meritare` | meritarvela |
| `mescolare` | mescolarvi |
| `mettere` | mettervi |
| `migliorare` | migliorarsi |
| `mimare` | mimarne |
| `mimetizzare` | mimetizzarsi |
| `minare` | minarne |
| `minacciare` | minacciarne |
| `minimizzare` | minimizzarsi |
| `mirare` | mirarlo |
| `mischiare` | mischiarsi |
| `misurare` | misurarsi |
| `mitigare` | mitigarlo |
| `mitragliare` | mitragliarlo |
| `mobilitare` | mobilitarvi |
| `modellare` | modellarsi |
| `moderare` | moderarne |
| `modernizzare` | modernizzarsi |
| `modificare` | modificarsi |
| `modulare` | modularsi |
| `mollare` | mollarlo |
| `moltiplicare` | moltiplicarsi |
| `montare` | montarsi |
| `moralizzare` | moralizzarsi |
| `mordere` | mordervi |
| `morire` | morirvi |
| `morsicare` | morsicarmi |
| `mortificare` | mortificarli |
| `muovere` | muovervi |
| `mostrare` | mostrarvi |
| `motivare` | motivarne |
| `movimentare` | movimentarsi |
| `multare` | multarlo |
| `munire` | munirti |
| `municipalizzare` | municipalizzarli |
| `mutare` | mutarsi |
| `mutuare` | mutuarlo |
| `nascere` | nascerne |
| `nascondere` | nascondervi |
| `negare` | negarsi |
| `negoziare` | negoziarne |
| `neutralizzare` | neutralizzarne |
| `nuocere` | nuocerle |
| `nominare` | nominarsi |
| `normalizzare` | normalizzarsi |
| `notare` | notarsi |
| `notificare` | notificarlo |
| `nutrire` | nutrirsi |
| `obbedire` | obbedirvi |
| `obbiettare` | obbiettarle |
| `obbligare` | obbligarlo |
| `obiettare` | obiettarvi |
| `occidentalizzare` | occidentalizzarsi |
| `occultare` | occultarne |
| `occupare` | occuparvi |
| `udire` | udirmi |
| `odiare` | odiarsi |
| `offrire` | offrirvi |
| `offuscare` | offuscarsi |
| `oggettivare` | oggettivarsi |
| `oliare` | oliarsi |
| `oltrepassare` | oltrepassarsi |
| `omettere` | ometterne |
| `omologare` | omologarsi |
| `onorare` | onorarsi |
| `operare` | operarsi |
| `opinare` | opinarsi |
| `opporre` | opporvi |
| `ordinare` | ordinarvelo |
| `organizzare` | organizzarsi |
| `orientare` | orientarvi |
| `originare` | originarsi |
| `orizzontare` | orizzontarmi |
| `ormeggiare` | ormeggiarla |
| `ornare` | ornarsi |
| `oscurare` | oscurarne |
| `ospitare` | ospitarvi |
| `ossequiare` | ossequiarsi |
| `osservare` | osservarvi |
| `ossigenare` | ossigenarsi |
| `ostacolare` | ostacolarti |
| `ostentare` | ostentarli |
| `ottenere` | ottenersi |
| `ottimizzare` | ottimizzarne |
| `ovviare` | ovviarvi |
| `padroneggiare` | padroneggiarne |
| `pagare` | pagarvi |
| `palesare` | palesarsi |
| `paludare` | paludarsi |
| `parare` | pararsi |
| `paracadutare` | paracadutarsi |
| `paragonare` | paragonarsi |
| `paralizzare` | paralizzarsi |
| `parcheggiare` | parcheggiarsi |
| `pareggiare` | pareggiarsi |
| `parlare` | parlarvi |
| `parlottare` | parlottarne |
| `partire` | partirne |
| `partecipare` | parteciparvi |
| `passare` | passarvi |
| `pedinare` | pedinarlo |
| `peggiorare` | peggiorarne |
| `penalizzare` | penalizzarli |
| `penetrare` | penetrarvi |
| `pensare` | pensarvi |
| `percepire` | percepirne |
| `percorrere` | percorrerne |
| `perdere` | perdervi |
| `perdonare` | perdonartelo |
| `perfezionare` | perfezionarsi |
| `perforare` | perforarli |
| `permanere` | permanervi |
| `permettere` | permettervi |
| `permutare` | permutarlo |
| `perpetrare` | perpetrarsi |
| `perpetuare` | perpetuarsi |
| `perquisire` | perquisirmi |
| `perseguire` | perseguirsi |
| `perseguitare` | perseguitarmi |
| `personalizzare` | personalizzarlo |
| `personificare` | personificarlo |
| `persuadere` | persuadersi |
| `pervenire` | pervenirvi |
| `pesare` | pesarmi |
| `pestare` | pestarsi |
| `pettinare` | pettinarsi |
| `piacere` | piacervi |
| `piantare` | piantarsi |
| `piantonare` | piantonarsi |
| `piazzare` | piazzarvi |
| `picchiare` | picchiarsi |
| `piegare` | piegarsi |
| `pigliare` | pigliarsi |
| `piombare` | piombarmi |
| `placare` | placarsi |
| `placcare` | placcarlo |
| `plasmare` | plasmarlo |
| `poggiare` | poggiarvi |
| `politicizzare` | politicizzarsi |
| `polverizzare` | polverizzarsi |
| `pompare` | pomparne |
| `porre` | porvi |
| `popolare` | popolarsi |
| `portare` | portarvi |
| `posare` | posarsi |
| `posizionare` | posizionarsi |
| `potere` | potervi |
| `postare` | postarle |
| `potenziare` | potenziarsi |
| `praticare` | praticarne |
| `preannunciare` | preannunciarlo |
| `precedere` | precederlo |
| `precettare` | precettarli |
| `precipitare` | precipitarsi |
| `precisare` | precisarvi |
| `precludere` | precludersi |
| `precostituire` | precostituirsi |
| `predire` | predirgli |
| `predisporre` | predisporsi |
| `preferire` | preferirsi |
| `prefigurare` | prefigurarsi |
| `pregare` | pregarvi |
| `pregiudicare` | pregiudicarne |
| `prelevare` | prelevarne |
| `premiare` | premiarlo |
| `premunire` | premunirsi |
| `premurare` | premurarsi |
| `prendere` | prendertela |
| `prenotare` | prenotarsi |
| `preoccupare` | preoccuparvi |
| `preordinare` | preordinarsi |
| `preparare` | prepararvi |
| `prescindere` | prescinderne |
| `prescrivere` | prescriverne |
| `presentare` | presentarvi |
| `preservare` | preservarsi |
| `presidiare` | presidiarlo |
| `pressare` | pressarti |
| `prestare` | prestarvi |
| `presumere` | presumersi |
| `prevedere` | prevedersi |
| `prevenire` | prevenirne |
| `privare` | privarvi |
| `privatizzare` | privatizzarlo |
| `privilegiare` | privilegiarsi |
| `procacciare` | procacciarsi |
| `procedere` | procedervi |
| `processare` | processarlo |
| `proclamare` | proclamarti |
| `procurare` | procurarti |
| `prodigare` | prodigarsi |
| `produrre` | prodursi |
| `profanare` | profanarli |
| `professare` | professarsi |
| `professionalizzare` | professionalizzarsi |
| `profilare` | profilarsi |
| `progettare` | progettarne |
| `programmare` | programmarne |
| `proibire` | proibirne |
| `proiettare` | proiettarsi |
| `prolungare` | prolungarsi |
| `promettere` | promettervi |
| `promuovere` | promuoversi |
| `pronunciare` | pronunciarvi |
| `pronunziare` | pronunziarsi |
| `propagare` | propagarsi |
| `propagandare` | propagandarla |
| `propinare` | propinarmi |
| `propiziare` | propiziarsi |
| `proporre` | proporvi |
| `proporzionare` | proporzionarle |
| `prorogare` | prorogarle |
| `prosciugare` | prosciugarsi |
| `proseguire` | proseguirlo |
| `prospettare` | prospettarsi |
| `prostituire` | prostituirsi |
| `prostrare` | prostrarti |
| `proteggere` | proteggervi |
| `protrarre` | protrarsi |
| `provare` | provarvi |
| `provocare` | provocarsi |
| `provvedere` | provvedervi |
| `pubblicare` | pubblicarne |
| `pubblicizzare` | pubblicizzarlo |
| `pulire` | pulirsi |
| `punire` | punirmi |
| `puntare` | puntarsi |
| `punteggiare` | punteggiarsi |
| `puntualizzare` | puntualizzarle |
| `punzecchiare` | punzecchiarlo |
| `purificare` | purificarsi |
| `qualificare` | qualificarsi |
| `quantificare` | quantificarne |
| `querelare` | querelarlo |
| `quietare` | quietarsi |
| `quotare` | quotarsi |
| `rabbonire` | rabbonirli |
| `raccapezzare` | raccapezzarsi |
| `raccattare` | raccattarlo |
| `racchiudere` | racchiuderlo |
| `raccogliere` | raccogliervi |
| `raccomandare` | raccomandarsi |
| `raccontare` | raccontarvi |
| `raccordare` | raccordarsi |
| `raddoppiare` | raddoppiarsi |
| `raddrizzare` | raddrizzarlo |
| `radicare` | radicarsi |
| `radunare` | radunarvi |
| `raffigurare` | raffigurarselo |
| `rafforzare` | rafforzarti |
| `raffreddare` | raffreddarsi |
| `raffrontare` | raffrontarne |
| `raggiungere` | raggiungerti |
| `raggruppare` | raggrupparvi |
| `ragionare` | ragionarvi |
| `rallegrare` | rallegrarsi |
| `rallentare` | rallentarsi |
| `rammaricare` | rammaricarsi |
| `rammentare` | rammentarsi |
| `rampare` | ramparne |
| `rannicchiare` | rannicchiarsi |
| `rapire` | rapirmi |
| `rapinare` | rapinarla |
| `rappacificare` | rappacificarsi |
| `rapportare` | rapportarsi |
| `rappresentare` | rappresentarvi |
| `rarefare` | rarefarsi |
| `rassegnare` | rassegnarvi |
| `rasserenare` | rasserenarmi |
| `rassettare` | rassettarsi |
| `rassicurare` | rassicurarsi |
| `rassomigliare` | rassomigliarsi |
| `rastrellare` | rastrellarla |
| `ratificare` | ratificarlo |
| `rattoppare` | rattopparla |
| `rattristare` | rattristarmi |
| `ravvicinare` | ravvicinarle |
| `ravvisare` | ravvisarsi |
| `realizzare` | realizzarsi |
| `recare` | recarvi |
| `recapitare` | recapitargliela |
| `recepire` | recepirla |
| `recitare` | recitarvi |
| `recuperare` | recuperarne |
| `regalare` | regalarvi |
| `reggere` | reggersi |
| `registrare` | registrarvi |
| `regnare` | regnarvi |
| `regolare` | regolarvi |
| `regolamentare` | regolamentarla |
| `reinserire` | reinserirsi |
| `reintegrare` | reintegrarlo |
| `reinvestire` | reinvestirli |
| `relativizzare` | relativizzarne |
| `relazionare` | relazionarsi |
| `relegare` | relegarlo |
| `rendere` | rendervi |
| `reperire` | reperirsi |
| `replicare` | replicarsi |
| `reprimere` | reprimersi |
| `requisire` | requisirli |
| `respingere` | respingersi |
| `respirare` | respirarne |
| `restare` | restarvi |
| `restaurare` | restaurarle |
| `restituire` | restituirsi |
| `restringere` | restringersi |
| `retrodatare` | retrodatarli |
| `revocare` | revocarne |
| `riavere` | riaversi |
| `riabbracciare` | riabbracciarti |
| `riabilitare` | riabilitarlo |
| `riabituare` | riabituarsi |
| `riaccostare` | riaccostarsi |
| `riacquistare` | riacquistarli |
| `riacutizzare` | riacutizzarsi |
| `riadattare` | riadattarsi |
| `riaffacciare` | riaffacciarsi |
| `riaffermare` | riaffermarsi |
| `riaggiustare` | riaggiustarsi |
| `riallacciare` | riallacciarsi |
| `rialzare` | rialzarsi |
| `riammettere` | riammetterlo |
| `rianimare` | rianimarlo |
| `riaprire` | riaprirsi |
| `riascoltare` | riascoltarne |
| `riassettare` | riassettarlo |
| `riassicurare` | riassicurarsi |
| `riassorbire` | riassorbirlo |
| `riassumere` | riassumerlo |
| `riattaccare` | riattaccarli |
| `riattivare` | riattivarsi |
| `riattizzare` | riattizzarla |
| `riavvicinare` | riavvicinarsi |
| `ribadire` | ribadirne |
| `ribaltare` | ribaltarsi |
| `ribattere` | ribattervi |
| `ribattezzare` | ribattezzarli |
| `ribellare` | ribellarvi |
| `ributtare` | ributtarmi |
| `ricacciare` | ricacciarsi |
| `ricambiare` | ricambiarli |
| `ricapitolare` | ricapitolarsi |
| `ricaricare` | ricaricarsi |
| `ricattare` | ricattarti |
| `ricavare` | ricavarsi |
| `ricercare` | ricercarsi |
| `richiamare` | richiamarvi |
| `richiedere` | richiederne |
| `richiudere` | richiudersi |
| `riciclare` | riciclarsi |
| `ricollegare` | ricollegarti |
| `ricompensare` | ricompensarlo |
| `ricomperare` | ricomperarli |
| `ricomporre` | ricomporsi |
| `ricomprare` | ricomprarle |
| `ricomunicare` | ricomunicargliele |
| `riconciliare` | riconciliarsi |
| `ricondurre` | ricondursi |
| `riconfermare` | riconfermarlo |
| `riconoscere` | riconoscervi |
| `riconquistare` | riconquistarti |
| `riconsacrare` | riconsacrarla |
| `riconsegnare` | riconsegnarli |
| `riconvertire` | riconvertirsi |
| `ricoprire` | ricoprirsi |
| `ricordare` | ricordarvi |
| `ricorrere` | ricorrervi |
| `ricostituire` | ricostituirsi |
| `ricostruire` | ricostruirsi |
| `ricoverare` | ricoverarsi |
| `ricreare` | ricrearvi |
| `ricredere` | ricredersi |
| `ricucire` | ricucirsi |
| `ridere` | ridersi |
| `ridare` | ridarvi |
| `ridire` | ridirti |
| `ridimensionare` | ridimensionarsi |
| `ridisegnare` | ridisegnarne |
| `ridistribuire` | ridistribuirli |
| `ridurre` | ridursi |
| `riedificare` | riedificarlo |
| `rielaborare` | rielaborarli |
| `riempire` | riempirti |
| `rientrare` | rientrarvi |
| `riequilibrare` | riequilibrarsi |
| `riuscire` | riuscirvi |
| `rievocare` | rievocarlo |
| `rifare` | rifarsi |
| `riferire` | riferirvi |
| `rifilare` | rifilargli |
| `rifinire` | rifinirli |
| `rifiutare` | rifiutarsi |
| `riflettere` | riflettersi |
| `rifocillare` | rifocillarsi |
| `rifondere` | rifonderle |
| `riformare` | riformarsi |
| `rifornire` | rifornirti |
| `rifugiare` | rifugiarsi |
| `rigenerare` | rigenerarsi |
| `rigettare` | rigettarne |
| `rigirare` | rigirarsi |
| `riguardare` | riguardarsi |
| `rilanciare` | rilanciarsi |
| `rilasciare` | rilasciarne |
| `rilassare` | rilassarti |
| `rilegare` | rilegarlo |
| `rileggere` | rileggerti |
| `rilevare` | rilevarsi |
| `rimandare` | rimandarti |
| `rimanere` | rimanervi |
| `rimangiare` | rimangiarsi |
| `rimarcare` | rimarcarne |
| `rimarginare` | rimarginarsi |
| `rimboccare` | rimboccarsi |
| `rimborsare` | rimborsarne |
| `rimediare` | rimediarvi |
| `rimettere` | rimetterti |
| `rimirare` | rimirarsi |
| `rimontar` | rimontati |
| `rimuovere` | rimuoverti |
| `rimpatriare` | rimpatriarli |
| `rimpiazzare` | rimpiazzarlo |
| `rimpinguare` | rimpinguarla |
| `rimpinzare` | rimpinzarla |
| `rimproverare` | rimproverarsi |
| `rinchiudere` | rinchiudersi |
| `rincontrare` | rincontrarsi |
| `rincorrere` | rincorrersi |
| `rincrudire` | rincrudirsi |
| `rincuorare` | rincuorarlo |
| `rinfacciare` | rinfacciarmi |
| `rinforzare` | rinforzarsi |
| `rinfrancare` | rinfrancarmi |
| `rinfrescare` | rinfrescarti |
| `ringiovanire` | ringiovanirsi |
| `ringraziare` | ringraziarvi |
| `rinnegare` | rinnegarlo |
| `rinnovare` | rinnovarsi |
| `rinsaldare` | rinsaldarsi |
| `rintanare` | rintanarsi |
| `rintracciare` | rintracciarvi |
| `rinunciare` | rinunciarvi |
| `rinunziare` | rinunziarvi |
| `rinvenire` | rinvenirsi |
| `rinverdire` | rinverdirsi |
| `rinviare` | rinviarti |
| `rinvigorire` | rinvigorirsi |
| `riordinare` | riordinarlo |
| `riorganizzare` | riorganizzarsi |
| `ripagare` | ripagarvi |
| `riparare` | ripararsi |
| `riparlare` | riparlarne |
| `ripartire` | ripartirsi |
| `ripensare` | ripensarsi |
| `ripercorrere` | ripercorrerne |
| `ripercuotere` | ripercuotersi |
| `ripescare` | ripescarlo |
| `ripetere` | ripetersi |
| `ripiegare` | ripiegarsi |
| `ripiombare` | ripiombargli |
| `ripopolare` | ripopolarsi |
| `riportare` | riportarsi |
| `riposare` | riposarvi |
| `riprendere` | riprendervi |
| `ripresentare` | ripresentarsi |
| `ripristinare` | ripristinarne |
| `riprodurre` | riprodursi |
| `riproporre` | riproporsi |
| `riprovare` | riprovarli |
| `ripubblicare` | ripubblicarli |
| `ripulire` | ripulirsi |
| `riqualificare` | riqualificarsi |
| `risalire` | risalirne |
| `risanare` | risanarsi |
| `risarcire` | risarcirti |
| `riscaldare` | riscaldarsi |
| `riscattare` | riscattarsi |
| `rischiare` | rischiarlo |
| `riscontrare` | riscontrarvi |
| `riscoprire` | riscoprirsi |
| `riscrivere` | riscriverne |
| `risentire` | risentirsi |
| `riservare` | riservarsi |
| `risollevare` | risollevarsi |
| `risolvere` | risolversi |
| `risparmiare` | risparmiarsi |
| `rispecchiare` | rispecchiarsi |
| `rispedire` | rispedirne |
| `rispettare` | rispettarvi |
| `rispolverare` | rispolverarlo |
| `rispondere` | rispondergli |
| `risposare` | risposarsi |
| `ristabilire` | ristabilirsi |
| `ristampare` | ristamparlo |
| `ristorare` | ristorarsi |
| `ristrutturare` | ristrutturarvi |
| `risucchiare` | risucchiarle |
| `risultare` | risultarne |
| `risvegliare` | risvegliarsi |
| `ritagliare` | ritagliarsi |
| `ritardare` | ritardarne |
| `ritemprare` | ritemprarsi |
| `ritenere` | ritenerti |
| `ritirare` | ritirarsi |
| `ritoccare` | ritoccarsi |
| `ritorcere` | ritorcersi |
| `ritornare` | ritornarvi |
| `ritrarre` | ritrarsi |
| `ritrasmettere` | ritrasmetterlo |
| `ritrovare` | ritrovarvi |
| `rituffare` | rituffarsi |
| `riunire` | riunirvi |
| `riutilizzare` | riutilizzarlo |
| `rivalutare` | rivalutarne |
| `rivedere` | rivedersi |
| `rivelare` | rivelarsi |
| `rivendere` | rivendersela |
| `rivendicare` | rivendicarne |
| `riverberare` | riverberarsi |
| `riverire` | riverirla |
| `riversare` | riversarsi |
| `rivestire` | rivestirsi |
| `rivivere` | riviverlo |
| `rivolgere` | rivolgervi |
| `rivoltare` | rivoltarsi |
| `rivoluzionare` | rivoluzionarle |
| `rodare` | rodarsi |
| `rodere` | roderti |
| `rompere` | rompervi |
| `rosolare` | rosolarsi |
| `rotolare` | rotolarsi |
| `rovesciare` | rovesciarsi |
| `rovinare` | rovinarti |
| `rubare` | rubarvi |
| `ruotare` | ruotarne |
| `sapere` | sapervi |
| `sabotare` | sabotarlo |
| `sacrificare` | sacrificarvi |
| `saggiare` | saggiarne |
| `saldare` | saldarsi |
| `salire` | salirvi |
| `saltare` | saltarlo |
| `salutare` | salutarvi |
| `salvare` | salvarti |
| `salvaguardare` | salvaguardarsi |
| `sanare` | sanarle |
| `sancire` | sancirne |
| `santificare` | santificarsi |
| `sanzionare` | sanzionarlo |
| `satollare` | satollarsi |
| `saturare` | saturarle |
| `sbagliare` | sbagliarvi |
| `sballottare` | sballottarli |
| `sbalordire` | sbalordirlo |
| `sbandare` | sbandarsi |
| `sbaraccare` | sbaraccarlo |
| `sbarazzare` | sbarazzartene |
| `sbattere` | sbatterti |
| `sbellicarsi` | sbellicarci |
| `sbigottire` | sbigottirmene |
| `sbilanciare` | sbilanciarsi |
| `sbirciare` | sbirciarli |
| `sbizzarrire` | sbizzarrirvi |
| `sbloccare` | sbloccarsi |
| `sbollentare` | sbollentarli |
| `sborsare` | sborsarne |
| `sbottonare` | sbottonarsi |
| `sbracare` | sbracarsi |
| `sbrecciare` | sbrecciarsi |
| `sbriciolare` | sbriciolarsi |
| `sbrigare` | sbrigarsi |
| `sbrodolare` | sbrodolarsi |
| `sbucciare` | sbucciarli |
| `scacciare` | scacciarmi |
| `scagionare` | scagionarlo |
| `scagliare` | scagliarsi |
| `scalare` | scalarlo |
| `scaldare` | scaldarsi |
| `scalzare` | scalzarlo |
| `scambiare` | scambiarvi |
| `scandagliare` | scandagliarne |
| `scandalizzare` | scandalizzarvi |
| `scandire` | scandirsi |
| `scannare` | scannarsi |
| `scansare` | scansarsi |
| `scappare` | scapparne |
| `scardinare` | scardinarsi |
| `scaricare` | scaricarvi |
| `scartare` | scartarlo |
| `scatenare` | scatenarsi |
| `scaturire` | scaturirne |
| `scavare` | scavarsi |
| `scavalcare` | scavalcarsi |
| `scavezzare` | scavezzarsi |
| `schedare` | schedarli |
| `schematizzare` | schematizzarsi |
| `schermare` | schermarsi |
| `schermire` | schermirsi |
| `schiacciare` | schiacciarsi |
| `schiaffeggiare` | schiaffeggiarvi |
| `schiantare` | schiantarsi |
| `schiarire` | schiarirsi |
| `schiavizzare` | schiavizzarli |
| `schierare` | schierarsi |
| `sciacquare` | sciacquarsi |
| `scimmiottare` | scimmiottarlo |
| `scindere` | scindersi |
| `scioccare` | scioccarvi |
| `sciogliere` | sciogliersi |
| `sciupare` | sciuparne |
| `sclerotizzare` | sclerotizzarsi |
| `scodinzolare` | scodinzolarvi |
| `scolare` | scolarli |
| `scollare` | scollarsi |
| `scolorire` | scolorirsi |
| `scommettere` | scommettervi |
| `scomodare` | scomodarsi |
| `scompigliare` | scompigliarsi |
| `scomporre` | scomporsi |
| `sconfessare` | sconfessarlo |
| `sconfinare` | sconfinarlo |
| `scongiurare` | scongiurarlo |
| `sconsigliare` | sconsigliarne |
| `scontare` | scontarsi |
| `scontentare` | scontentarli |
| `scontrare` | scontrarvi |
| `sconvolgere` | sconvolgerti |
| `scoprire` | scoprirvi |
| `scoraggiare` | scoraggiarsi |
| `scordare` | scordartelo |
| `scorgere` | scorgervi |
| `scorrere` | scorrerlo |
| `scortare` | scortarlo |
| `scuotere` | scuoterli |
| `scostare` | scostarsi |
| `scottare` | scottarsi |
| `scovare` | scovarli |
| `screditare` | screditarmi |
| `scrivere` | scrivervi |
| `scrollare` | scrollarsi |
| `scrostare` | scrostarlo |
| `scrutare` | scrutarne |
| `scuoiare` | scuoiarla |
| `scusare` | scusarsi |
| `sdebitare` | sdebitarsi |
| `sdegnare` | sdegnarsi |
| `sdraiare` | sdraiarsi |
| `sdrammatizzare` | sdrammatizzarsi |
| `seccare` | seccarsi |
| `secondare` | secondarlo |
| `sedare` | sedarti |
| `sedere` | sedersi |
| `sedimentare` | sedimentarsi |
| `segare` | segarlo |
| `segnare` | segnarselo |
| `segnalare` | segnalarvi |
| `segregare` | segregarlo |
| `seguire` | seguirti |
| `selezionare` | selezionarne |
| `sembrare` | sembrarvi |
| `seminare` | seminarne |
| `semplificare` | semplificarsi |
| `sensibilizzare` | sensibilizzarlo |
| `sentire` | sentirvi |
| `separare` | separarsi |
| `seppellire` | seppellirsi |
| `sequestrare` | sequestrarne |
| `serrare` | serrarsi |
| `servire` | servirvi |
| `sezionare` | sezionarla |
| `sfaldare` | sfaldarsi |
| `sfamare` | sfamarvi |
| `sfangare` | sfangarsela |
| `sfasciare` | sfasciarsi |
| `sferrare` | sferrarle |
| `sfiancare` | sfiancarsi |
| `sfiatare` | sfiatarsi |
| `sfidare` | sfidarsi |
| `sfilare` | sfilarsi |
| `sfinire` | sfinirsi |
| `sfiorare` | sfiorarti |
| `sfogare` | sfogarti |
| `sfogliare` | sfogliarli |
| `sfoltire` | sfoltirla |
| `sfondare` | sfondarle |
| `sformare` | sformarsi |
| `sfornare` | sfornarne |
| `sforzare` | sforzarti |
| `sfrattare` | sfrattarla |
| `sfrondare` | sfrondarlo |
| `sfruttare` | sfruttarne |
| `sfuggire` | sfuggirvi |
| `sfumare` | sfumarlo |
| `sgambettare` | sgambettarlo |
| `sganasciare` | sganasciarti |
| `sganciare` | sganciarsi |
| `sgombrare` | sgombrarlo |
| `sgonfiare` | sgonfiarsi |
| `sgranare` | sgranarsi |
| `sgranchire` | sgranchirsi |
| `sgravare` | sgravarla |
| `sgretolare` | sgretolarsi |
| `sgridare` | sgridarlo |
| `sgrovigliare` | sgrovigliarlo |
| `sibilare` | sibilarsi |
| `sigillare` | sigillarla |
| `siglare` | siglarne |
| `significare` | significarne |
| `simulare` | simularne |
| `sincerare` | sincerarsi |
| `sincronizzare` | sincronizzarsi |
| `sindacalizzare` | sindacalizzarsi |
| `sintetizzare` | sintetizzarsi |
| `sintonizzare` | sintonizzarsi |
| `sistemare` | sistemarvi |
| `situare` | situarsi |
| `slacciare` | slacciarsi |
| `slanciare` | slanciarsi |
| `slegare` | slegarti |
| `smacchiare` | smacchiarlo |
| `smaltire` | smaltirli |
| `smantellare` | smantellarlo |
| `smarcare` | smarcarsi |
| `smarrire` | smarrirsi |
| `smascherare` | smascherarsi |
| `smembrare` | smembrarlo |
| `smentire` | smentirsi |
| `smettere` | smetterlo |
| `sminuire` | sminuirle |
| `smorzare` | smorzarsi |
| `smuovere` | smuoverlo |
| `smussare` | smussarne |
| `snervare` | snervarsi |
| `snidare` | snidarlo |
| `snobbare` | snobbarlo |
| `snocciolare` | snocciolarle |
| `snodare` | snodarsi |
| `sobbarcare` | sobbarcarsi |
| `soddisfare` | soddisfarvi |
| `soffermare` | soffermarvi |
| `soffrire` | soffrirne |
| `soffiare` | soffiarsi |
| `soffocare` | soffocarsi |
| `soffondere` | soffondersi |
| `soggiogare` | soggiogarla |
| `soggiornare` | soggiornarvi |
| `sognare` | sognarsi |
| `sollecitare` | sollecitarne |
| `solleticare` | solleticarne |
| `sollevare` | sollevarti |
| `somigliare` | somigliarle |
| `sommare` | sommarsi |
| `sommergere` | sommergervi |
| `somministrare` | somministrarsi |
| `sopire` | sopirsi |
| `soppesare` | soppesarlo |
| `soppiantare` | soppiantarlo |
| `sopportare` | sopportarsi |
| `sopprimere` | sopprimersi |
| `sopraffare` | sopraffarsi |
| `sopravvalutare` | sopravvalutarlo |
| `sopravvivere` | sopravvivergli |
| `sorbire` | sorbirsi |
| `sorpassare` | sorpassarsi |
| `sorridere` | sorriderne |
| `sorvegliare` | sorvegliarlo |
| `sorvolare` | sorvolarlo |
| `sospettare` | sospettarlo |
| `sospingere` | sospingerlo |
| `sostare` | sostarvi |
| `sostenere` | sostenersi |
| `sostentare` | sostentarsi |
| `sostituire` | sostituirti |
| `sottolineare` | sottolinearti |
| `sottomettere` | sottomettersi |
| `sottoporre` | sottoporvi |
| `sottoscrivere` | sottoscriversi |
| `sottovalutare` | sottovalutarne |
| `sottrarre` | sottrarsi |
| `sovraccaricare` | sovraccaricarsi |
| `sovrapporre` | sovrapporsi |
| `sovvenzionare` | sovvenzionarne |
| `sovvertire` | sovvertirla |
| `spaccare` | spaccarsi |
| `spacciare` | spacciarsi |
| `spalancare` | spalancarsi |
| `spalmare` | spalmarsi |
| `sparare` | spararvi |
| `spargere` | spargersi |
| `spartire` | spartirsi |
| `spassare` | spassarsela |
| `spaventare` | spaventarvi |
| `spazientire` | spazientirsi |
| `spazzare` | spazzarlo |
| `specchiarsi` | specchiarvi |
| `specializzare` | specializzarvi |
| `specificare` | specificarne |
| `spedire` | spedirne |
| `spellare` | spellarsi |
| `sperare` | sperarlo |
| `sperimentare` | sperimentarsi |
| `spettinare` | spettinarsi |
| `spezzare` | spezzarsi |
| `spianare` | spianarle |
| `spiazzare` | spiazzarti |
| `spicciare` | spicciarne |
| `spiegare` | spiegarvi |
| `spingere` | spingerti |
| `spintonare` | spintonarla |
| `spodestare` | spodestarla |
| `spogliare` | spogliarti |
| `spolverare` | spolverarla |
| `sponsorizzare` | sponsorizzarne |
| `sporcare` | sporcarsi |
| `sposare` | sposarvi |
| `spostare` | spostarvi |
| `sprecare` | sprecarsi |
| `sprigionare` | sprigionarsi |
| `sprofondare` | sprofondarlo |
| `spronare` | spronarlo |
| `spuntare` | spuntarla |
| `sputare` | sputargli |
| `sputtanare` | sputtanarsi |
| `squagliare` | squagliarsela |
| `squalificare` | squalificarlo |
| `sradicare` | sradicarmi |
| `srotolare` | srotolarsi |
| `stare` | starvi |
| `stabilire` | stabilirvi |
| `stabilizzare` | stabilizzarsi |
| `staccare` | staccarsi |
| `stagliare` | stagliarsi |
| `stampare` | stamparvelo |
| `stanare` | stanarlo |
| `stancare` | stancarsi |
| `stanziare` | stanziarli |
| `stemperare` | stemperarsi |
| `sterilizzare` | sterilizzarlo |
| `sterminare` | sterminarsi |
| `stimare` | stimarsi |
| `stimolare` | stimolarvi |
| `stipulare` | stipularsi |
| `stoppare` | stopparlo |
| `stordire` | stordirsi |
| `stracciare` | stracciarsi |
| `strangolare` | strangolarsi |
| `straniare` | straniarmi |
| `strapazzare` | strapazzarla |
| `strappare` | strapparti |
| `strascinare` | strascinarsi |
| `strattonare` | strattonarlo |
| `straziare` | straziarsi |
| `stremare` | stremarti |
| `stringere` | stringersi |
| `stritolare` | stritolarlo |
| `stroncare` | stroncarne |
| `strozzare` | strozzarti |
| `strumentalizzare` | strumentalizzarla |
| `strutturare` | strutturarlo |
| `studiare` | studiarsi |
| `stufare` | stufarsi |
| `stupire` | stupirvi |
| `stuprare` | stuprarla |
| `stuzzicare` | stuzzicarle |
| `subire` | subirne |
| `subentrare` | subentrargli |
| `sublimare` | sublimarsi |
| `subordinare` | subordinarsi |
| `succedere` | succedersi |
| `succhiare` | succhiarsi |
| `sudare` | sudarsi |
| `suddividere` | suddividersi |
| `suggerire` | suggerirlo |
| `suggestionare` | suggestionarli |
| `suonare` | suonartele |
| `superare` | superarsi |
| `supporre` | supporsi |
| `supportare` | supportarli |
| `surriscaldare` | surriscaldarsi |
| `suscitare` | suscitarne |
| `susseguire` | susseguirsi |
| `sussurrare` | sussurrarlo |
| `svagare` | svagarsi |
| `svaligiare` | svaligiarlo |
| `svalutare` | svalutarsi |
| `svegliare` | svegliarti |
| `svelare` | svelarvi |
| `svelenire` | svelenirsi |
| `svenare` | svenarsi |
| `sventare` | sventarlo |
| `sventolare` | sventolargli |
| `svestire` | svestirsi |
| `svezzare` | svezzarsi |
| `svignare` | svignarsela |
| `svilire` | svilirlo |
| `sviluppare` | svilupparvi |
| `svincolare` | svincolarsi |
| `sviscerare` | sviscerarne |
| `svolgere` | svolgervi |
| `svuotare` | svuotarsi |
| `tacciare` | tacciarmi |
| `tacitare` | tacitarsi |
| `tagliare` | tagliarsi |
| `tallonare` | tallonarlo |
| `tamponare` | tamponarsi |
| `tappare` | tapparsi |
| `tassare` | tassarne |
| `tatuare` | tatuarsi |
| `telefonare` | telefonarmi |
| `tempestare` | tempestarlo |
| `temprare` | temprarsi |
| `tenere` | tenervi |
| `tentare` | tentarne |
| `teorizzare` | teorizzarlo |
| `terminare` | terminarli |
| `tessere` | tesserne |
| `tesserare` | tesserarsi |
| `testimoniare` | testimoniarne |
| `tingere` | tingersi |
| `tirare` | tirarti |
| `titillare` | titillarla |
| `toccare` | toccarti |
| `togliere` | togliervi |
| `tollerare` | tollerarlo |
| `torcere` | torcerle |
| `torchiare` | torchiarlo |
| `tormentare` | tormentarmi |
| `tornare` | tornarvi |
| `torturare` | torturarsi |
| `tosare` | tosarla |
| `tracciare` | tracciarne |
| `tradire` | tradirsi |
| `tradurre` | tradursi |
| `trarre` | trarsi |
| `traghettare` | traghettarli |
| `trainare` | trainarlo |
| `tramutare` | tramutarsi |
| `tranciare` | tranciarlo |
| `tranquillizzare` | tranquillizzarsi |
| `transennare` | transennarla |
| `trapiantare` | trapiantarsi |
| `trascinare` | trascinarvi |
| `trascorrere` | trascorrervi |
| `trascrivere` | trascriversi |
| `trascurare` | trascurarsi |
| `trasferire` | trasferirvi |
| `trasfigurare` | trasfigurarla |
| `trasfondere` | trasfondersi |
| `trasformare` | trasformarsi |
| `trasgredire` | trasgredirli |
| `trasmettere` | trasmetterti |
| `trasportare` | trasportarlo |
| `trastullare` | trastullarmi |
| `trattare` | trattarsi |
| `trattenere` | trattenersi |
| `travestire` | travestirsi |
| `travolgere` | travolgerti |
| `tributare` | tributargli |
| `trincerare` | trincerarsi |
| `troncare` | troncarle |
| `trovare` | trovarvi |
| `truccare` | truccarsi |
| `trucidare` | trucidarsi |
| `truffare` | truffarti |
| `tuffare` | tuffarvi |
| `turbare` | turbarlo |
| `tutelare` | tutelarsi |
| `ubriacare` | ubriacarvi |
| `uccidere` | uccidervi |
| `ufficializzare` | ufficializzarla |
| `uguagliare` | uguagliarsi |
| `umiliare` | umiliarsi |
| `unire` | unirvi |
| `unificare` | unificarsi |
| `uniformare` | uniformarsi |
| `urlare` | urlarmi |
| `urtare` | urtarsi |
| `usare` | usarti |
| `ustionare` | ustionarti |
| `usufruire` | usufruirne |
| `usurare` | usurarsi |
| `utilizzare` | utilizzarsi |
| `vaccinare` | vaccinarsi |
| `vagliare` | vagliarle |
| `valere` | valersi |
| `valorizzare` | valorizzarsi |
| `valutare` | valutarsi |
| `vanificare` | vanificarsi |
| `vantare` | vantarsi |
| `varare` | vararne |
| `varcare` | varcarle |
| `variare` | variarne |
| `vedere` | vedervi |
| `vegliare` | vegliarlo |
| `velare` | velarsi |
| `vendere` | vendervi |
| `vendicare` | vendicarsi |
| `venire` | venirvi |
| `verbalizzare` | verbalizzarsi |
| `vergognarsi` | vergognarvi |
| `verificare` | verificarsi |
| `versare` | versarsi |
| `vestire` | vestirti |
| `vezzeggiare` | vezzeggiarlo |
| `viaggiare` | viaggiarli |
| `vibrare` | vibrarsi |
| `vietare` | vietarne |
| `vigilare` | vigilarli |
| `vincere` | vincerne |
| `vincolare` | vincolarsi |
| `violare` | violarne |
| `violentare` | violentarlo |
| `visionare` | visionarne |
| `visitare` | visitarvi |
| `vivere` | viverlo |
| `visualizzare` | visualizzarne |
| `vivacizzare` | vivacizzarlo |
| `viziare` | viziarlo |
| `volere` | volervi |
| `volatilizzare` | volatilizzarsi |
| `volgere` | volgersi |
| `volgarizzare` | volgarizzarle |
| `voltare` | voltarti |
| `votare` | votarsi |
| `vuotare` | vuotarsi |
| `zappare` | zapparlo |
| `zittire` | zittirlo |

### Gerunds with a pronoun attached (1,209)

Cut the word at `-ando` or `-endo`.

| Key | Stored | Should be |
| --- | --- | --- |
| `abbagliare` | abbagliandoci | abbagliando |
| `abbandonare` | abbandonandosi | abbandonando |
| `abbassare` | abbassandosi | abbassando |
| `abbattere` | abbattendosi | abbattendo |
| `abbellire` | abbellendoli | abbellendo |
| `abbinare` | abbinandolo | abbinando |
| `abbonare` | abbonandosi | abbonando |
| `abbracciare` | abbracciandovi | abbracciando |
| `abburattare` | abburattandone | abburattando |
| `accalcare` | accalcandosi | accalcando |
| `accanirsi` | accanendosi | accanendo |
| `accaparrare` | accaparrandosi | accaparrando |
| `accarezzare` | accarezzandoli | accarezzando |
| `accartocciare` | accartocciandosi | accartocciando |
| `accasciare` | accasciandosi | accasciando |
| `accelerare` | accelerandosi | accelerando |
| `accennare` | accennandola | accennando |
| `accentuare` | accentuandosi | accentuando |
| `accettare` | accettandone | accettando |
| `accingere` | accingendosi | accingendo |
| `accodare` | accodandolo | accodando |
| `accogliere` | accogliendone | accogliendo |
| `accollare` | accollandosi | accollando |
| `accoltellare` | accoltellandolo | accoltellando |
| `accomodare` | accomodandosi | accomodando |
| `accompagnare` | accompagnandosi | accompagnando |
| `accontentare` | accontentandosi | accontentando |
| `accoppiare` | accoppiandoli | accoppiando |
| `accorciare` | accorciandone | accorciando |
| `accordare` | accordandosi | accordando |
| `accorgersi` | accorgendosi | accorgendo |
| `accostare` | accostandosi | accostando |
| `accrescere` | accrescendosi | accrescendo |
| `accreditare` | accreditandosi | accreditando |
| `accudire` | accudendomi | accudendo |
| `accumulare` | accumulandosi | accumulando |
| `accusare` | accusandosi | accusando |
| `acquisire` | acquisendone | acquisendo |
| `acquistare` | acquistandosi | acquistando |
| `acutizzare` | acutizzandosi | acutizzando |
| `adattare` | adattandosi | adattando |
| `additare` | additandolo | additando |
| `addormentare` | addormentandolo | addormentando |
| `addossare` | addossandosi | addossando |
| `adeguare` | adeguandosi | adeguando |
| `adoperare` | adoperandosi | adoperando |
| `adorare` | adorandola | adorando |
| `adottare` | adottandola | adottando |
| `affacciare` | affacciandosi | affacciando |
| `affermare` | affermandosi | affermando |
| `afferrare` | afferrandosi | afferrando |
| `affezionare` | affezionandosi | affezionando |
| `affiancare` | affiancandovi | affiancando |
| `affibbiare` | affibbiandogli | affibbiando |
| `affidare` | affidandosi | affidando |
| `affievolire` | affievolendosi | affievolendo |
| `afflosciare` | afflosciandola | afflosciando |
| `affrettare` | affrettandosi | affrettando |
| `affrontare` | affrontandoli | affrontando |
| `agevolare` | agevolandone | agevolando |
| `agganciare` | agganciandosi | agganciando |
| `aggiornare` | aggiornandosi | aggiornando |
| `aggirare` | aggirandosi | aggirando |
| `aggiudicare` | aggiudicandosi | aggiudicando |
| `aggiungere` | aggiungendovi | aggiungendo |
| `aggrappare` | aggrappandosi | aggrappando |
| `aggravare` | aggravandosi | aggravando |
| `aggredire` | aggredendolo | aggredendo |
| `aggregare` | aggregandovene | aggregando |
| `agitare` | agitandosi | agitando |
| `aiutare` | aiutandovi | aiutando |
| `alimentare` | alimentandosi | alimentando |
| `allagare` | allagandone | allagando |
| `allargare` | allargandosi | allargando |
| `alleare` | alleandosi | alleando |
| `allegare` | allegandole | allegando |
| `alleggerire` | alleggerendone | alleggerendo |
| `allenare` | allenandosi | allenando |
| `allentare` | allentandosi | allentando |
| `allettare` | allettandolo | allettando |
| `alleviare` | alleviandolo | alleviando |
| `allineare` | allineandosi | allineando |
| `allontanare` | allontanandosi | allontanando |
| `allungare` | allungandosi | allungando |
| `alterare` | alterandone | alterando |
| `alternare` | alternandosi | alternando |
| `alzare` | alzandosi | alzando |
| `amare` | amandola | amando |
| `amalgamare` | amalgamandosi | amalgamando |
| `ammaccare` | ammaccandosi | ammaccando |
| `ammiccare` | ammiccandomi | ammiccando |
| `ammirare` | ammirandola | ammirando |
| `ammorbidire` | ammorbidendone | ammorbidendo |
| `ammutinare` | ammutinandosi | ammutinando |
| `ampliare` | ampliandosi | ampliando |
| `amputare` | amputandole | amputando |
| `analizzare` | analizzandone | analizzando |
| `anatomizzare` | anatomizzandoli | anatomizzando |
| `andare` | andandosi | andando |
| `anestetizzare` | anestetizzandolo | anestetizzando |
| `annegare` | annegandosi | annegando |
| `annichilire` | annichilendolo | annichilendo |
| `annientare` | annientandoci | annientando |
| `annoiare` | annoiandosi | annoiando |
| `annotare` | annotandone | annotando |
| `annullare` | annullandosi | annullando |
| `annunciare` | annunciandosi | annunciando |
| `anticipare` | anticipandone | anticipando |
| `aprire` | aprendosi | aprendo |
| `apostrofare` | apostrofandolo | apostrofando |
| `appassionare` | appassionandosi | appassionando |
| `appellare` | appellandosi | appellando |
| `appesantire` | appesantendoli | appesantendo |
| `appiccare` | appiccandovi | appiccando |
| `appigliarsi` | appigliandosi | appigliando |
| `applaudire` | applaudendoli | applaudendo |
| `applicare` | applicandosi | applicando |
| `appoggiare` | appoggiandovi | appoggiando |
| `apporre` | apponendovi | apponendo |
| `apportare` | apportandovi | apportando |
| `appostare` | appostandosi | appostando |
| `apprestare` | apprestandosi | apprestando |
| `apprezzare` | apprezzandone | apprezzando |
| `approfondire` | approfondendosi | approfondendo |
| `appropriare` | appropriandosi | appropriando |
| `approssimare` | approssimandosi | approssimando |
| `approvare` | approvandone | approvando |
| `appuntare` | appuntandosi | appuntando |
| `ardire` | ardendosi | ardendo |
| `armare` | armandola | armando |
| `armonizzare` | armonizzandosi | armonizzando |
| `arrampicare` | arrampicandosi | arrampicando |
| `arrangiare` | arrangiandosi | arrangiando |
| `arrestare` | arrestandosi | arrestando |
| `arricchire` | arricchendosi | arricchendo |
| `arrivare` | arrivandoci | arrivando |
| `arroccare` | arroccandosi | arroccando |
| `arrogare` | arrogandosi | arrogando |
| `arrotolare` | arrotolandosi | arrotolando |
| `arrovellare` | arrovellandosi | arrovellando |
| `arroventare` | arroventandosi | arroventando |
| `articolare` | articolandosi | articolando |
| `asciugare` | asciugandosi | asciugando |
| `ascoltare` | ascoltandone | ascoltando |
| `aspettare` | aspettandosi | aspettando |
| `aspirare` | aspirandola | aspirando |
| `asportare` | asportandone | asportando |
| `assassinare` | assassinandole | assassinando |
| `assegnare` | assegnandoli | assegnando |
| `assestare` | assestandosi | assestando |
| `assicurare` | assicurandosi | assicurando |
| `assiepare` | assiepandosi | assiepando |
| `assimilare` | assimilandoli | assimilando |
| `assistere` | assistendolo | assistendo |
| `associare` | associandovi | associando |
| `assoggettare` | assoggettandola | assoggettando |
| `assoldare` | assoldandone | assoldando |
| `assolvere` | assolvendoli | assolvendo |
| `assottigliare` | assottigliandosi | assottigliando |
| `assumere` | assumendosi | assumendo |
| `astenere` | astenendosi | astenendo |
| `attaccare` | attaccandoti | attaccando |
| `atteggiare` | atteggiandosi | atteggiando |
| `attenere` | attenendosi | attenendo |
| `attenuare` | attenuandosi | attenuando |
| `attestare` | attestandosi | attestando |
| `attirare` | attirandosi | attirando |
| `attivare` | attivandone | attivando |
| `attizzare` | attizzandovi | attizzando |
| `attorcigliare` | attorcigliandolo | attorcigliando |
| `attorniare` | attorniandoli | attorniando |
| `attraversare` | attraversandolo | attraversando |
| `attribuire` | attribuendoli | attribuendo |
| `attuare` | attuandole | attuando |
| `attualizzare` | attualizzandolo | attualizzando |
| `augurare` | augurandovi | augurando |
| `aumentare` | aumentandone | aumentando |
| `auspicare` | auspicandone | auspicando |
| `autenticare` | autenticandolo | autenticando |
| `autorizzare` | autorizzandomi | autorizzando |
| `avvalersi` | avvalendoti | avvalendo |
| `avvantaggiare` | avvantaggiandosi | avvantaggiando |
| `avventare` | avventandosi | avventando |
| `avventurare` | avventurandosi | avventurando |
| `avversare` | avversandone | avversando |
| `avvertire` | avvertendone | avvertendo |
| `avviare` | avviandosi | avviando |
| `avvicinare` | avvicinandosi | avvicinando |
| `avvinghiare` | avvinghiandosi | avvinghiando |
| `avvisare` | avvisandoli | avvisando |
| `avvolgere` | avvolgendosi | avvolgendo |
| `azzerare` | azzerandola | azzerando |
| `baciare` | baciandolo | baciando |
| `bagnare` | bagnandosi | bagnando |
| `barcamenarsi` | barcamenandosi | barcamenando |
| `barricare` | barricandosi | barricando |
| `basare` | basandoti | basando |
| `bastare` | bastandone | bastando |
| `battere` | battendosi | battendo |
| `beare` | beandosi | beando |
| `beccare` | beccandosi | beccando |
| `beffare` | beffandosi | beffando |
| `bere` | bevendosi | bevendo |
| `biascicare` | biascicandosi | biascicando |
| `bloccare` | bloccandone | bloccando |
| `bocciare` | bocciandola | bocciando |
| `brandire` | brandendosi | brandendo |
| `bruciare` | bruciandoli | bruciando |
| `bruciacchiare` | bruciacchiandosi | bruciacchiando |
| `buttare` | buttandosi | buttando |
| `cacciare` | cacciandosi | cacciando |
| `cagionare` | cagionandomi | cagionando |
| `calare` | calandosi | calando |
| `calcolare` | calcolandone | calcolando |
| `calere` | calendoli | calendo |
| `cambiare` | cambiandosi | cambiando |
| `camuffare` | camuffandoli | camuffando |
| `canalizzare` | canalizzandolo | canalizzando |
| `cancellare` | cancellandola | cancellando |
| `cantare` | cantandolo | cantando |
| `cappottare` | cappottandosi | cappottando |
| `caratterizzare` | caratterizzandosi | caratterizzando |
| `carezzare` | carezzandosi | carezzando |
| `caricare` | caricandole | caricando |
| `castrare` | castrandola | castrando |
| `catturare` | catturandolo | catturando |
| `causare` | causandone | causando |
| `cautelare` | cautelandosi | cautelando |
| `cavare` | cavandosela | cavando |
| `cedere` | cedendolo | cedendo |
| `celare` | celandosi | celando |
| `centrare` | centrandolo | centrando |
| `centralizzare` | centralizzandoci | centralizzando |
| `cercare` | cercandovi | cercando |
| `chiamare` | chiamandosi | chiamando |
| `chiedere` | chiedendosi | chiedendo |
| `chinare` | chinandosi | chinando |
| `chiudere` | chiudendosi | chiudendo |
| `cibare` | cibandosi | cibando |
| `circondare` | circondandolo | circondando |
| `citare` | citandone | citando |
| `classificare` | classificandosi | classificando |
| `coadiuvare` | coadiuvandoli | coadiuvando |
| `coalizzare` | coalizzandosi | coalizzando |
| `cogliere` | cogliendone | cogliendo |
| `coinvolgere` | coinvolgendovi | coinvolgendo |
| `collaudare` | collaudandoli | collaudando |
| `collegare` | collegandovi | collegando |
| `collocare` | collocandosi | collocando |
| `colmare` | colmandole | colmando |
| `colorare` | colorandola | colorando |
| `colpire` | colpendolo | colpendo |
| `coltivare` | coltivandone | coltivando |
| `comandare` | comandandone | comandando |
| `combattere` | combattendosi | combattendo |
| `combinare` | combinandosi | combinando |
| `cominciare` | cominciandone | cominciando |
| `commentare` | commentandone | commentando |
| `commiserare` | commiserandosi | commiserando |
| `commuovere` | commuovendosi | commuovendo |
| `comparare` | comparandolo | comparando |
| `compattare` | compattandosi | compattando |
| `compensare` | compensandole | compensando |
| `compiacere` | compiacendosi | compiacendo |
| `completare` | completandone | completando |
| `complicare` | complicandosi | complicando |
| `complimentare` | complimentandosi | complimentando |
| `comporre` | componendosi | componendo |
| `comportare` | comportandosi | comportando |
| `comprare` | comprandosi | comprando |
| `comprimere` | comprimendolo | comprimendo |
| `compromettere` | compromettendosi | compromettendo |
| `comunicare` | comunicandolo | comunicando |
| `concedere` | concedendovi | concedendo |
| `concentrare` | concentrandosi | concentrando |
| `concertare` | concertandosi | concertando |
| `concludere` | concludendosi | concludendo |
| `conculcare` | conculcandone | conculcando |
| `condannare` | condannandosi | condannando |
| `condividere` | condividendone | condividendo |
| `condizionare` | condizionandone | condizionando |
| `condurre` | conducendolo | conducendo |
| `conferire` | conferendogli | conferendo |
| `confermare` | confermandosi | confermando |
| `confessare` | confessandola | confessando |
| `conficcare` | conficcandoti | conficcando |
| `configurare` | configurandosi | configurando |
| `confinare` | confinandolo | confinando |
| `confondere` | confondendosi | confondendo |
| `conformare` | conformandosi | conformando |
| `confortare` | confortandolo | confortando |
| `confrontare` | confrontandosi | confrontando |
| `congedare` | congedandosi | congedando |
| `congelare` | congelandone | congelando |
| `congratularsi` | congratulandosi | congratulando |
| `coniugare` | coniugandola | coniugando |
| `conoscere` | conoscendone | conoscendo |
| `conquistare` | conquistandosi | conquistando |
| `consegnare` | consegnandosi | consegnando |
| `consentire` | consentendovi | consentendo |
| `conservare` | conservandocene | conservando |
| `considerare` | considerandosi | considerando |
| `consigliare` | consigliandovi | consigliando |
| `consolidare` | consolidandosi | consolidando |
| `consultare` | consultandosi | consultando |
| `consumare` | consumandosi | consumando |
| `contaminare` | contaminandolo | contaminando |
| `contattare` | contattandoci | contattando |
| `contemplare` | contemplandovi | contemplando |
| `contenere` | contenendosi | contenendo |
| `contentare` | contentandosi | contentando |
| `contestare` | contestandole | contestando |
| `contorcere` | contorcendosi | contorcendo |
| `contraddire` | contraddicendosi | contraddicendo |
| `contrapporre` | contrapponendosi | contrapponendo |
| `controllare` | controllandone | controllando |
| `convalidare` | convalidandone | convalidando |
| `convertire` | convertendosi | convertendo |
| `convincere` | convincendosi | convincendo |
| `coordinare` | coordinandosi | coordinando |
| `coprire` | coprendosi | coprendo |
| `corredare` | corredandolo | corredando |
| `correggere` | correggendone | correggendo |
| `corrompere` | corrompendoli | corrompendo |
| `cospargere` | cospargendosi | cospargendo |
| `costeggiare` | costeggiandola | costeggiando |
| `costituire` | costituendosi | costituendo |
| `costringere` | costringendomi | costringendo |
| `costruire` | costruendosi | costruendo |
| `creare` | creandovi | creando |
| `credere` | credendosi | credendo |
| `cristianizzare` | cristianizzandolo | cristianizzando |
| `criticare` | criticandolo | criticando |
| `cucire` | cucendogli | cucendo |
| `cucinare` | cucinandolo | cucinando |
| `cullare` | cullandosi | cullando |
| `curare` | curandosi | curando |
| `custodire` | custodendolo | custodendo |
| `dare` | dandovi | dando |
| `danneggiare` | danneggiandone | danneggiando |
| `dovere` | dovendosi | dovendo |
| `decidere` | decidendosi | decidendo |
| `decomporre` | decomponendosi | decomponendo |
| `decorare` | decorandolo | decorando |
| `decretare` | decretandone | decretando |
| `dedicare` | dedicandosi | dedicando |
| `defilare` | defilandosi | defilando |
| `definire` | definendosi | definendo |
| `deformare` | deformandosi | deformando |
| `defraudare` | defraudandoci | defraudando |
| `degradare` | degradandolo | degradando |
| `delegare` | delegandolo | delegando |
| `delimitare` | delimitandone | delimitando |
| `delineare` | delineandosi | delineando |
| `deliziare` | deliziandovi | deliziando |
| `demarcare` | demarcandosi | demarcando |
| `denudare` | denudandosi | denudando |
| `denunciare` | denunciandone | denunciando |
| `deplorare` | deplorandola | deplorando |
| `deporre` | deponendovi | deponendo |
| `deprimere` | deprimendolo | deprimendo |
| `depurare` | depurandolo | depurando |
| `descrivere` | descrivendone | descrivendo |
| `destinare` | destinandone | destinando |
| `destreggiare` | destreggiandosi | destreggiando |
| `deteriorare` | deteriorandosi | deteriorando |
| `determinare` | determinandosi | determinando |
| `detrarre` | detraendola | detraendo |
| `dettare` | dettandoci | dettando |
| `dire` | dicendovi | dicendo |
| `devitalizzare` | devitalizzandone | devitalizzando |
| `diagnosticare` | diagnosticandole | diagnosticando |
| `dibattere` | dibattendoli | dibattendo |
| `dichiarare` | dichiarandosi | dichiarando |
| `differenziare` | differenziandola | differenziando |
| `diffondere` | diffondendosi | diffondendo |
| `dilatare` | dilatandosi | dilatando |
| `dileguare` | dileguandosi | dileguando |
| `diluire` | diluendolo | diluendo |
| `dilungare` | dilungandoti | dilungando |
| `dimenare` | dimenandosi | dimenando |
| `dimenticare` | dimenticandosi | dimenticando |
| `dimettere` | dimettendosi | dimettendo |
| `dimezzare` | dimezzandola | dimezzando |
| `dimostrare` | dimostrandosi | dimostrando |
| `dipingere` | dipingendola | dipingendo |
| `dirigere` | dirigendosi | dirigendo |
| `dirottare` | dirottandone | dirottando |
| `disapprovare` | disapprovandolo | disapprovando |
| `disarcionare` | disarcionandoli | disarcionando |
| `disciplinare` | disciplinandone | disciplinando |
| `discostare` | discostandosi | discostando |
| `disincentivare` | disincentivandone | disincentivando |
| `disintegrare` | disintegrandosi | disintegrando |
| `disinteressare` | disinteressandosi | disinteressando |
| `disporre` | disponendosi | disponendo |
| `dissociare` | dissociandosi | dissociando |
| `dissolvere` | dissolvendosi | dissolvendo |
| `distaccare` | distaccandosi | distaccando |
| `distanziare` | distanziandosi | distanziando |
| `distillare` | distillandone | distillando |
| `distinguere` | distinguendosi | distinguendo |
| `distogliere` | distogliendoli | distogliendo |
| `distorcere` | distorcendolo | distorcendo |
| `distrarre` | distraendosi | distraendo |
| `distribuire` | distribuendosi | distribuendo |
| `distruggere` | distruggendosi | distruggendo |
| `divenire` | divenendone | divenendo |
| `diventare` | diventandone | diventando |
| `diversificare` | diversificandoli | diversificando |
| `divertire` | divertendoti | divertendo |
| `dividere` | dividendosi | dividendo |
| `divincolare` | divincolandosi | divincolando |
| `documentare` | documentandosi | documentando |
| `domare` | domandone | domando |
| `domandare` | domandandosi | domandando |
| `dominare` | dominandolo | dominando |
| `donare` | donandoci | donando |
| `dondolare` | dondolandosi | dondolando |
| `dotare` | dotandovi | dotando |
| `drogare` | drogandola | drogando |
| `duplicare` | duplicandosi | duplicando |
| `eclissare` | eclissandosi | eclissando |
| `edificare` | edificandosi | edificando |
| `educare` | educandosi | educando |
| `effettuare` | effettuandosi | effettuando |
| `elaborare` | elaborandolo | elaborando |
| `elencare` | elencandone | elencando |
| `elevare` | elevandosi | elevando |
| `eliminare` | eliminandosi | eliminando |
| `emancipare` | emancipandosi | emancipando |
| `emozionare` | emozionandosi | emozionando |
| `enfatizzare` | enfatizzandoli | enfatizzando |
| `entrare` | entrandovi | entrando |
| `equiparare` | equiparandosi | equiparando |
| `ereditare` | ereditandola | ereditando |
| `esagerare` | esagerandone | esagerando |
| `esaltare` | esaltandosi | esaltando |
| `esaminare` | esaminandolo | esaminando |
| `esaurire` | esaurendosi | esaurendo |
| `uscire` | uscendone | uscendo |
| `escludere` | escludendosi | escludendo |
| `esercitare` | esercitandosi | esercitando |
| `esibire` | esibendosi | esibendo |
| `esistere` | esistendone | esistendo |
| `esporre` | esponendosi | esponendo |
| `esprimere` | esprimendosi | esprimendo |
| `espropriare` | espropriandone | espropriando |
| `essiccare` | essiccandola | essiccando |
| `estirpare` | estirpandogli | estirpando |
| `estorcere` | estorcendole | estorcendo |
| `estrarre` | estraendovi | estraendo |
| `estrapolare` | estrapolandola | estrapolando |
| `evidenziare` | evidenziandone | evidenziando |
| `evitare` | evitandone | evitando |
| `evocare` | evocandoli | evocando |
| `fare` | facendovi | facendo |
| `facilitare` | facilitandone | facilitando |
| `fagocitare` | fagocitandoli | fagocitando |
| `falsificare` | falsificandolo | falsificando |
| `favorire` | favorendone | favorendo |
| `ferire` | ferendosi | ferendo |
| `fermare` | fermandosi | fermando |
| `fidare` | fidandosi | fidando |
| `filare` | filandola | filando |
| `filtrare` | filtrandole | filtrando |
| `finalizzare` | finalizzandole | finalizzando |
| `finanziare` | finanziandosi | finanziando |
| `firmare` | firmandosi | firmando |
| `fischiare` | fischiandolo | fischiando |
| `fissare` | fissandosi | fissando |
| `fondare` | fondandovi | fondando |
| `fondere` | fondendosi | fondendo |
| `formare` | formandosi | formando |
| `fornire` | fornendoti | fornendo |
| `forzare` | forzandone | forzando |
| `fotografare` | fotografandoli | fotografando |
| `fracassare` | fracassandogli | fracassando |
| `frammentare` | frammentandosi | frammentando |
| `frantumare` | frantumandosi | frantumando |
| `frapporre` | frapponendosi | frapponendo |
| `fratturare` | fratturandosi | fratturando |
| `freddare` | freddandolo | freddando |
| `fregare` | fregandosi | fregando |
| `frustrare` | frustrandone | frustrando |
| `fulminare` | fulminandosi | fulminando |
| `garantire` | garantendosi | garantendo |
| `gemellare` | gemellandoli | gemellando |
| `gestire` | gestendone | gestendo |
| `gettare` | gettandosi | gettando |
| `ghettizzare` | ghettizzandoli | ghettizzando |
| `giocare` | giocandosi | giocando |
| `giovare` | giovandosi | giovando |
| `girare` | girandole | girando |
| `giudicare` | giudicandone | giudicando |
| `giustapporre` | giustapponendola | giustapponendo |
| `giustificare` | giustificandosi | giustificando |
| `godere` | godendovi | godendo |
| `gonfiare` | gonfiandola | gonfiando |
| `gratificare` | gratificandoli | gratificando |
| `grattare` | grattandosi | grattando |
| `grattugiare` | grattugiandolo | grattugiando |
| `gravare` | gravandoli | gravando |
| `gridare` | gridandole | gridando |
| `guadagnare` | guadagnandosi | guadagnando |
| `guardare` | guardandovi | guardando |
| `guidare` | guidandoti | guidando |
| `identificare` | identificandosi | identificando |
| `ignorare` | ignorandosi | ignorando |
| `illudere` | illudendosi | illudendo |
| `illuminare` | illuminandone | illuminando |
| `imbarcare` | imbarcandoci | imbarcando |
| `imboccare` | imboccandolo | imboccando |
| `imbottire` | imbottendosi | imbottendo |
| `imbrattare` | imbrattandolo | imbrattando |
| `imitare` | imitandone | imitando |
| `immaginare` | immaginandosi | immaginando |
| `immedesimare` | immedesimandosi | immedesimando |
| `immergere` | immergendosi | immergendo |
| `immettere` | immettendovi | immettendo |
| `immischiare` | immischiandosi | immischiando |
| `immolare` | immolandosi | immolando |
| `impadronirsi` | impadronendosi | impadronendo |
| `impantanare` | impantanandolo | impantanando |
| `imparare` | imparandole | imparando |
| `impaurire` | impaurendoli | impaurendo |
| `impedire` | impedendone | impedendo |
| `impegnare` | impegnandosi | impegnando |
| `impennare` | impennandosi | impennando |
| `impiccare` | impiccandosi | impiccando |
| `impiegare` | impiegandone | impiegando |
| `implorare` | implorandolo | implorando |
| `imporre` | imponendosi | imponendo |
| `importare` | importandogli | importando |
| `impossessarsi` | impossessandosi | impossessando |
| `imprigionare` | imprigionandolo | imprigionando |
| `improvvisare` | improvvisandosi | improvvisando |
| `impugnare` | impugnandosi | impugnando |
| `impuntare` | impuntandosi | impuntando |
| `imputare` | imputandole | imputando |
| `inabissare` | inabissandosi | inabissando |
| `inaridire` | inaridendone | inaridendo |
| `incagliare` | incagliandosi | incagliando |
| `incamerare` | incamerandone | incamerando |
| `incamminare` | incamminandoti | incamminando |
| `incassare` | incassandone | incassando |
| `incastrare` | incastrandole | incastrando |
| `incatenare` | incatenandola | incatenando |
| `incendiare` | incendiandoli | incendiando |
| `incentivare` | incentivandone | incentivando |
| `inchinare` | inchinandosi | inchinando |
| `inchiodare` | inchiodandolo | inchiodando |
| `incidere` | incidendolo | incidendo |
| `inclinare` | inclinandosi | inclinando |
| `includere` | includendovi | includendo |
| `incontrare` | incontrandosi | incontrando |
| `incoraggiare` | incoraggiandolo | incoraggiando |
| `incorporare` | incorporandola | incorporando |
| `incrementare` | incrementandosi | incrementando |
| `incriminare` | incriminandoli | incriminando |
| `incrociare` | incrociandosi | incrociando |
| `incuneare` | incuneandosi | incuneando |
| `indebitare` | indebitandosi | indebitando |
| `indennizzare` | indennizzandole | indennizzando |
| `indicare` | indicandone | indicando |
| `indirizzare` | indirizzandosi | indirizzando |
| `individuare` | individuandone | individuando |
| `indossare` | indossandolo | indossando |
| `indurre` | inducendolo | inducendo |
| `infettare` | infettandoli | infettando |
| `infiammare` | infiammandosi | infiammando |
| `infilare` | infilandosi | infilando |
| `infischiarsi` | infischiandosene | infischiando |
| `infondere` | infondendole | infondendo |
| `informare` | informandovi | informando |
| `ingannare` | ingannandosi | ingannando |
| `ingegnarsi` | ingegnandosi | ingegnando |
| `inginocchiarsi` | inginocchiandosi | inginocchiando |
| `inglobare` | inglobandone | inglobando |
| `ingolfare` | ingolfandole | ingolfando |
| `ingrandire` | ingrandendosi | ingrandendo |
| `ingrossare` | ingrossandosi | ingrossando |
| `inibire` | inibendone | inibendo |
| `inimicare` | inimicandosi | inimicando |
| `innalzare` | innalzandosi | innalzando |
| `innamorare` | innamorandosi | innamorando |
| `innestare` | innestandogli | innestando |
| `innovare` | innovandoli | innovando |
| `inoltrare` | inoltrandosi | inoltrando |
| `inondare` | inondandole | inondando |
| `inquadrare` | inquadrandosi | inquadrando |
| `inquietare` | inquietandoci | inquietando |
| `insegnare` | insegnandoli | insegnando |
| `inseguire` | inseguendolo | inseguendo |
| `inserire` | inserendovi | inserendo |
| `insidiare` | insidiandone | insidiando |
| `insinuare` | insinuandosi | insinuando |
| `insospettire` | insospettendosi | insospettendo |
| `installare` | installandovi | installando |
| `instaurare` | instaurandosi | instaurando |
| `insultare` | insultandolo | insultando |
| `intascare` | intascandosi | intascando |
| `integrare` | integrandosi | integrando |
| `intensificare` | intensificandosi | intensificando |
| `interessare` | interessandosi | interessando |
| `internazionalizzare` | internazionalizzandosi | internazionalizzando |
| `interporre` | interponendosi | interponendo |
| `interpretare` | interpretandolo | interpretando |
| `interrogare` | interrogandosi | interrogando |
| `interrompere` | interrompendosi | interrompendo |
| `intersecare` | intersecandosi | intersecando |
| `intestare` | intestandola | intestando |
| `intimare` | intimandomi | intimando |
| `intimidire` | intimidendone | intimidendo |
| `intitolare` | intitolandolo | intitolando |
| `intonare` | intonandole | intonando |
| `intrattenere` | intrattenendosi | intrattenendo |
| `intrecciare` | intrecciandosi | intrecciando |
| `introdurre` | introducendovi | introducendo |
| `invecchiare` | invecchiandole | invecchiando |
| `inventare` | inventandosi | inventando |
| `invertire` | invertendole | invertendo |
| `investire` | investendone | investendo |
| `inviare` | inviandone | inviando |
| `invitare` | invitandovi | invitando |
| `invocare` | invocandone | invocando |
| `invogliare` | invogliandolo | invogliando |
| `ipotecare` | ipotecandone | ipotecando |
| `ipotizzare` | ipotizzandone | ipotizzando |
| `irridire` | irridendolo | irridendo |
| `irritare` | irritandosi | irritando |
| `irrobustire` | irrobustendosi | irrobustendo |
| `iscrivere` | iscrivendovi | iscrivendo |
| `isolare` | isolandosi | isolando |
| `ispessire` | ispessendosi | ispessendo |
| `ispirare` | ispirandosi | ispirando |
| `istallare` | istallandovi | istallando |
| `istituire` | istituendone | istituendo |
| `istruire` | istruendoli | istruendo |
| `lacerare` | lacerandosi | lacerando |
| `lamentare` | lamentandosi | lamentando |
| `lanciare` | lanciandosi | lanciando |
| `lasciare` | lasciandovi | lasciando |
| `laureare` | laureandosi | laureando |
| `lavare` | lavandosi | lavando |
| `lavorare` | lavorandosi | lavorando |
| `leccare` | leccandosi | leccando |
| `legare` | legandosi | legando |
| `leggere` | leggendovi | leggendo |
| `levare` | levandosi | levando |
| `liberare` | liberandovi | liberando |
| `limitare` | limitandovi | limitando |
| `liquidare` | liquidandole | liquidando |
| `lisciare` | lisciandosi | lisciando |
| `livellare` | livellandosi | livellando |
| `localizzare` | localizzandosi | localizzando |
| `lodare` | lodandolo | lodando |
| `logorare` | logorandone | logorando |
| `lottizzare` | lottizzandola | lottizzando |
| `lustrare` | lustrandogli | lustrando |
| `mancare` | mancandolo | mancando |
| `mandare` | mandandomi | mandando |
| `mangiare` | mangiandosi | mangiando |
| `manifestare` | manifestandosi | manifestando |
| `manipolare` | manipolandone | manipolando |
| `mantenere` | mantenendovi | mantenendo |
| `mascherare` | mascherandosi | mascherando |
| `massacrare` | massacrandosi | massacrando |
| `massaggiare` | massaggiandosi | massaggiando |
| `meravigliare` | meravigliandosi | meravigliando |
| `meritare` | meritandosi | meritando |
| `mescolare` | mescolandosi | mescolando |
| `mettere` | mettendoti | mettendo |
| `migliorare` | migliorandone | migliorando |
| `mimetizzare` | mimetizzandosi | mimetizzando |
| `minacciare` | minacciandone | minacciando |
| `mirare` | mirandola | mirando |
| `mischiare` | mischiandosi | mischiando |
| `misurare` | misurandosi | misurando |
| `mobilitare` | mobilitandone | mobilitando |
| `modificare` | modificandosi | modificando |
| `moltiplicare` | moltiplicandosi | moltiplicando |
| `muovere` | muovendovi | muovendo |
| `mostrare` | mostrandosi | mostrando |
| `motivare` | motivandolo | motivando |
| `munire` | munendoli | munendo |
| `mutare` | mutandosi | mutando |
| `nascondere` | nascondendovi | nascondendo |
| `naturalizzare` | naturalizzandola | naturalizzando |
| `navigare` | navigandoci | navigando |
| `negare` | negandoti | negando |
| `neutralizzare` | neutralizzandone | neutralizzando |
| `noleggiare` | noleggiandolo | noleggiando |
| `nominare` | nominandone | nominando |
| `normalizzare` | normalizzandosi | normalizzando |
| `numerare` | numerandole | numerando |
| `nutrire` | nutrendosi | nutrendo |
| `obbligare` | obbligandosi | obbligando |
| `occultare` | occultandone | occultando |
| `occupare` | occupandosi | occupando |
| `offrire` | offrendoti | offrendo |
| `offuscare` | offuscandosi | offuscando |
| `omologare` | omologandosi | omologando |
| `operare` | operandovi | operando |
| `opporre` | opponendosi | opponendo |
| `orchestrare` | orchestrandosi | orchestrando |
| `ordinare` | ordinandone | ordinando |
| `organizzare` | organizzandovi | organizzando |
| `orientare` | orientandosi | orientando |
| `orinare` | orinandogli | orinando |
| `ospitare` | ospitandoli | ospitando |
| `osservare` | osservandosi | osservando |
| `ostinarsi` | ostinandosi | ostinando |
| `ottenere` | ottenendone | ottenendo |
| `pagare` | pagandolo | pagando |
| `parere` | parendomi | parendo |
| `palleggiare` | palleggiandosi | palleggiando |
| `paludare` | paludandosi | paludando |
| `parafrasare` | parafrasandolo | parafrasando |
| `paragonare` | paragonandoli | paragonando |
| `paralizzare` | paralizzandone | paralizzando |
| `parlare` | parlandosi | parlando |
| `partire` | partendosi | partendo |
| `passare` | passandolo | passando |
| `peggiorare` | peggiorandolo | peggiorando |
| `penalizzare` | penalizzandola | penalizzando |
| `penetrare` | penetrandola | penetrando |
| `pensare` | pensandola | pensando |
| `percepire` | percependone | percependo |
| `perdere` | perdendosi | perdendo |
| `perforare` | perforandole | perforando |
| `permettere` | permettendovi | permettendo |
| `perseguitare` | perseguitandoci | perseguitando |
| `persuadere` | persuadendomi | persuadendo |
| `pestare` | pestandosi | pestando |
| `piacere` | piacendomi | piacendo |
| `pianificare` | pianificandone | pianificando |
| `piantare` | piantandole | piantando |
| `piazzare` | piazzandosi | piazzando |
| `picchiare` | picchiandosi | picchiando |
| `piegare` | piegandoti | piegando |
| `pilotare` | pilotandola | pilotando |
| `plasmare` | plasmandola | plasmando |
| `poggiare` | poggiandosi | poggiando |
| `polarizzare` | polarizzandosi | polarizzando |
| `pompare` | pompandosi | pompando |
| `porre` | ponendosi | ponendo |
| `portare` | portandovi | portando |
| `posare` | posandola | posando |
| `posizionare` | posizionandosi | posizionando |
| `potere` | potendosi | potendo |
| `praticare` | praticandolo | praticando |
| `preannunciare` | preannunciandone | preannunciando |
| `precedere` | precedendolo | precedendo |
| `precipitare` | precipitandosi | precipitando |
| `precisare` | precisandovi | precisando |
| `precludere` | precludendosi | precludendo |
| `precostituire` | precostituendosi | precostituendo |
| `predeterminare` | predeterminandosi | predeterminando |
| `predicare` | predicandole | predicando |
| `prediligere` | prediligendosi | prediligendo |
| `preferire` | preferendolo | preferendo |
| `prefigurare` | prefigurandone | prefigurando |
| `pregare` | pregandomi | pregando |
| `premiare` | premiandole | premiando |
| `premurare` | premurandosi | premurando |
| `prendere` | prendendovi | prendendo |
| `prenotare` | prenotandolo | prenotando |
| `preoccupare` | preoccupandosi | preoccupando |
| `preparare` | preparandosi | preparando |
| `presentare` | presentandovele | presentando |
| `preservare` | preservandoli | preservando |
| `prestare` | prestandosi | prestando |
| `prestabilire` | prestabilendone | prestabilendo |
| `prevedere` | prevedendosi | prevedendo |
| `privare` | privandosi | privando |
| `proclamare` | proclamandosi | proclamando |
| `procrastinare` | procrastinandolo | procrastinando |
| `procurare` | procurandoti | procurando |
| `produrre` | producendosi | producendo |
| `professare` | professandosi | professando |
| `profilare` | profilandosi | profilando |
| `proiettare` | proiettandosi | proiettando |
| `prolungare` | prolungandosi | prolungando |
| `promettere` | promettendomi | promettendo |
| `promuovere` | promuovendone | promuovendo |
| `pronunciare` | pronunciandosi | pronunciando |
| `propagare` | propagandosi | propagando |
| `proporre` | proponendoti | proponendo |
| `proseguire` | proseguendone | proseguendo |
| `prospettare` | prospettandosi | prospettando |
| `prostituire` | prostituendosi | prostituendo |
| `prostrare` | prostrandosi | prostrando |
| `provare` | provandoli | provando |
| `provocare` | provocandovi | provocando |
| `provvedere` | provvedendoli | provvedendo |
| `pubblicare` | pubblicandone | pubblicando |
| `pubblicizzare` | pubblicizzandola | pubblicizzando |
| `pulire` | pulendogli | pulendo |
| `puntare` | puntandola | puntando |
| `puntellare` | puntellandolo | puntellando |
| `purgare` | purgandolo | purgando |
| `purificare` | purificandosi | purificando |
| `qualificare` | qualificandosi | qualificando |
| `querelare` | querelandolo | querelando |
| `raccogliere` | raccogliendovi | raccogliendo |
| `raccomandare` | raccomandandomi | raccomandando |
| `raccontare` | raccontandosi | raccontando |
| `raccordare` | raccordandosi | raccordando |
| `radicare` | radicandosi | radicando |
| `raffinare` | raffinandosi | raffinando |
| `rafforzare` | rafforzandosi | rafforzando |
| `raggiungere` | raggiungendolo | raggiungendo |
| `raggruppare` | raggruppandosi | raggruppando |
| `ragguagliare` | ragguagliandoci | ragguagliando |
| `rallegrare` | rallegrandosi | rallegrando |
| `rallentare` | rallentandole | rallentando |
| `rammaricare` | rammaricandosi | rammaricando |
| `rapire` | rapendole | rapendo |
| `rapportare` | rapportandolo | rapportando |
| `rappresentare` | rappresentandolo | rappresentando |
| `rassegnare` | rassegnandosi | rassegnando |
| `rassicurare` | rassicurandolo | rassicurando |
| `razionalizzare` | razionalizzandola | razionalizzando |
| `realizzare` | realizzandosi | realizzando |
| `recare` | recandovi | recando |
| `recensire` | recensendolo | recensendo |
| `recepire` | recependone | recependo |
| `recitare` | recitandolo | recitando |
| `recludere` | recludendola | recludendo |
| `regalare` | regalandole | regalando |
| `reggere` | reggendoti | reggendo |
| `registrare` | registrandovi | registrando |
| `regolare` | regolandosi | regolando |
| `reintegrare` | reintegrandolo | reintegrando |
| `relativizzare` | relativizzandone | relativizzando |
| `relegare` | relegandoli | relegando |
| `replicare` | replicandone | replicando |
| `respingere` | respingendolo | respingendo |
| `restare` | restandoci | restando |
| `restituire` | restituendolo | restituendo |
| `restringere` | restringendone | restringendo |
| `riacutizzare` | riacutizzandosi | riacutizzando |
| `riallacciare` | riallacciandosi | riallacciando |
| `rialzare` | rialzandosi | rialzando |
| `riaprire` | riaprendosi | riaprendo |
| `riappropriarsi` | riappropriandosi | riappropriando |
| `riarmare` | riarmandosi | riarmando |
| `riavvicinare` | riavvicinandosi | riavvicinando |
| `ribadire` | ribadendone | ribadendo |
| `ribaltare` | ribaltandosi | ribaltando |
| `ribattezzare` | ribattezzandosi | ribattezzando |
| `ribellare` | ribellandosi | ribellando |
| `ributtare` | ributtandoli | ributtando |
| `ricacciare` | ricacciandolo | ricacciando |
| `ricamare` | ricamandoci | ricamando |
| `ricattare` | ricattandoli | ricattando |
| `ricavare` | ricavandone | ricavando |
| `richiamare` | richiamandosi | richiamando |
| `ricollegare` | ricollegandosi | ricollegando |
| `ricomporre` | ricomponendosi | ricomponendo |
| `ricondurre` | riconducendosi | riconducendo |
| `riconoscere` | riconoscendovi | riconoscendo |
| `riconsacrare` | riconsacrandolo | riconsacrando |
| `riconvocare` | riconvocandole | riconvocando |
| `ricoprire` | ricoprendolo | ricoprendo |
| `ricopiare` | ricopiandola | ricopiando |
| `ricordare` | ricordandosi | ricordando |
| `ricorrere` | ricorrendone | ricorrendo |
| `ricostruire` | ricostruendone | ricostruendo |
| `ridicolizzare` | ridicolizzandolo | ridicolizzando |
| `ridimensionare` | ridimensionandosi | ridimensionando |
| `ridurre` | riducendosi | riducendo |
| `rientrare` | rientrandone | rientrando |
| `riequilibrare` | riequilibrandolo | riequilibrando |
| `riesaminare` | riesaminandoli | riesaminando |
| `riuscire` | riuscendovi | riuscendo |
| `rifare` | rifacendosi | rifacendo |
| `riferire` | riferendosi | riferendo |
| `rifiutare` | rifiutandosi | rifiutando |
| `riflettere` | riflettendosi | riflettendo |
| `rifornire` | rifornendoli | rifornendo |
| `rifugiare` | rifugiandosi | rifugiando |
| `rifugiarsi` | rifugiandosi | rifugiando |
| `rilanciare` | rilanciandosi | rilanciando |
| `rilassare` | rilassandosi | rilassando |
| `rileggere` | rileggendolo | rileggendo |
| `rilevare` | rilevandosi | rilevando |
| `rimandare` | rimandandola | rimandando |
| `rimanere` | rimanendone | rimanendo |
| `rimaneggiare` | rimaneggiandolo | rimaneggiando |
| `rimangiare` | rimangiandosi | rimangiando |
| `rimboccare` | rimboccandosi | rimboccando |
| `rimettere` | rimettendosi | rimettendo |
| `rimuovere` | rimuovendone | rimuovendo |
| `rimpiazzare` | rimpiazzandoli | rimpiazzando |
| `rimproverare` | rimproverandosi | rimproverando |
| `rinchiudere` | rinchiudendosi | rinchiudendo |
| `rincorrere` | rincorrendosi | rincorrendo |
| `rinfacciare` | rinfacciandogli | rinfacciando |
| `rinfrescare` | rinfrescandosi | rinfrescando |
| `ringraziare` | ringraziandoli | ringraziando |
| `rinnovare` | rinnovandosi | rinnovando |
| `rinviare` | rinviandolo | rinviando |
| `riordinare` | riordinandole | riordinando |
| `riorganizzare` | riorganizzandosi | riorganizzando |
| `ripagare` | ripagandola | ripagando |
| `riparare` | riparandosi | riparando |
| `ripartire` | ripartendone | ripartendo |
| `ripassare` | ripassandosi | ripassando |
| `ripensare` | ripensandoci | ripensando |
| `ripetere` | ripetendosi | ripetendo |
| `ripiegare` | ripiegandosi | ripiegando |
| `riportare` | riportandosi | riportando |
| `riposare` | riposandoci | riposando |
| `ripresentare` | ripresentandosi | ripresentando |
| `ripristinare` | ripristinandoli | ripristinando |
| `riprodurre` | riproducendone | riproducendo |
| `ripromettere` | ripromettendosi | ripromettendo |
| `riproporre` | riproponendosi | riproponendo |
| `riprovare` | riprovandoci | riprovando |
| `riscaldare` | riscaldandosi | riscaldando |
| `riscattare` | riscattandole | riscattando |
| `rischiarare` | rischiarandola | rischiarando |
| `riscoprire` | riscoprendolo | riscoprendo |
| `riscrivere` | riscrivendone | riscrivendo |
| `riservare` | riservandosi | riservando |
| `risollevare` | risollevandosi | risollevando |
| `risolvere` | risolvendosi | risolvendo |
| `risparmiare` | risparmiandosi | risparmiando |
| `rispecchiare` | rispecchiandosi | rispecchiando |
| `rispettare` | rispettandoti | rispettando |
| `risucchiare` | risucchiandola | risucchiando |
| `risultare` | risultandone | risultando |
| `risuscitare` | risuscitandolo | risuscitando |
| `risvegliare` | risvegliandosi | risvegliando |
| `ritagliare` | ritagliandosi | ritagliando |
| `ritardare` | ritardandone | ritardando |
| `ritenere` | ritenendosi | ritenendo |
| `ritirare` | ritirandosi | ritirando |
| `ritoccare` | ritoccandolo | ritoccando |
| `ritornare` | ritornandovi | ritornando |
| `ritrovare` | ritrovandosi | ritrovando |
| `rituffare` | rituffandosi | rituffando |
| `riunire` | riunendosi | riunendo |
| `rivalutare` | rivalutandola | rivalutando |
| `rivedere` | rivedendone | rivedendo |
| `rivelare` | rivelandosi | rivelando |
| `rivendere` | rivendendolo | rivendendo |
| `rivendicare` | rivendicandone | rivendicando |
| `riversare` | riversandosi | riversando |
| `rivestire` | rivestendola | rivestendo |
| `rivivere` | rivivendoli | rivivendo |
| `rivolgere` | rivolgendovi | rivolgendo |
| `rivoltare` | rivoltandone | rivoltando |
| `rivoluzionare` | rivoluzionandolo | rivoluzionando |
| `rizzare` | rizzandosi | rizzando |
| `rompere` | rompendosi | rompendo |
| `rosicchiare` | rosicchiandogli | rosicchiando |
| `rovesciare` | rovesciandosi | rovesciando |
| `rovinare` | rovinandosi | rovinando |
| `rubare` | rubandosi | rubando |
| `rubricare` | rubricandola | rubricando |
| `sapere` | sapendosi | sapendo |
| `sacrificare` | sacrificandosi | sacrificando |
| `saldare` | saldandosi | saldando |
| `salutare` | salutandosi | salutando |
| `salvare` | salvandosi | salvando |
| `salvaguardare` | salvaguardandone | salvaguardando |
| `sballottare` | sballottandoli | sballottando |
| `sbaragliare` | sbaragliandole | sbaragliando |
| `sbarazzare` | sbarazzandosi | sbarazzando |
| `sbattere` | sbattendosi | sbattendo |
| `sbilanciare` | sbilanciandosi | sbilanciando |
| `scacciare` | scacciandovi | scacciando |
| `scagliare` | scagliandosi | scagliando |
| `scalciare` | scalciandoli | scalciando |
| `scaldare` | scaldandosi | scaldando |
| `scambiare` | scambiandosi | scambiando |
| `scandalizzare` | scandalizzandosi | scandalizzando |
| `scandire` | scandendone | scandendo |
| `scansare` | scansandola | scansando |
| `scaraventare` | scaraventandola | scaraventando |
| `scarcerare` | scarcerandolo | scarcerando |
| `scaricare` | scaricandosi | scaricando |
| `scartare` | scartandole | scartando |
| `scatenare` | scatenandosi | scatenando |
| `scavare` | scavandovi | scavando |
| `scavalcare` | scavalcandoci | scavalcando |
| `schiacciare` | schiacciandosi | schiacciando |
| `schiaffeggiare` | schiaffeggiandoci | schiaffeggiando |
| `schiantare` | schiantandosi | schiantando |
| `schierare` | schierandosi | schierando |
| `sciacquare` | sciacquandole | sciacquando |
| `sciogliere` | sciogliendosi | sciogliendo |
| `scomporre` | scomponendone | scomponendo |
| `scongiurare` | scongiurandolo | scongiurando |
| `sconsigliare` | sconsigliandone | sconsigliando |
| `scontrare` | scontrandosi | scontrando |
| `sconvolgere` | sconvolgendone | sconvolgendo |
| `scoprire` | scoprendosi | scoprendo |
| `scoraggiare` | scoraggiandosi | scoraggiando |
| `scordare` | scordandosi | scordando |
| `scorgere` | scorgendovi | scorgendo |
| `scorrere` | scorrendola | scorrendo |
| `scostare` | scostandosi | scostando |
| `scrivere` | scrivendone | scrivendo |
| `scrollare` | scrollandosi | scrollando |
| `scrutare` | scrutandolo | scrutando |
| `scusare` | scusandosi | scusando |
| `sdegnare` | sdegnandomi | sdegnando |
| `sedurre` | seducendone | seducendo |
| `segnare` | segnandone | segnando |
| `segnalare` | segnalandosi | segnalando |
| `seguire` | seguendone | seguendo |
| `seminare` | seminandovi | seminando |
| `semplificare` | semplificandolo | semplificando |
| `sentire` | sentendosi | sentendo |
| `separare` | separandola | separando |
| `seppellire` | seppellendolo | seppellendo |
| `servire` | servendosi | servendo |
| `seviziare` | seviziandola | seviziando |
| `sfaldare` | sfaldandosi | sfaldando |
| `sfasciare` | sfasciandosi | sfasciando |
| `sfilare` | sfilandoti | sfilando |
| `sfilacciare` | sfilacciandosi | sfilacciando |
| `sfiorare` | sfiorandolo | sfiorando |
| `sfogliare` | sfogliandone | sfogliando |
| `sforzare` | sforzandosi | sforzando |
| `sfracellare` | sfracellandosi | sfracellando |
| `sfregare` | sfregandosi | sfregando |
| `sfruttare` | sfruttandone | sfruttando |
| `sganciare` | sganciandosi | sganciando |
| `sgonfiare` | sgonfiandosi | sgonfiando |
| `sgretolare` | sgretolandosi | sgretolando |
| `simulare` | simulandone | simulando |
| `sintonizzare` | sintonizzandosi | sintonizzando |
| `sistemare` | sistemandosi | sistemando |
| `situare` | situandosi | situando |
| `smarcare` | smarcandosi | smarcando |
| `smontare` | smontandolo | smontando |
| `snodare` | snodandosi | snodando |
| `sobbarcare` | sobbarcandoci | sobbarcando |
| `soffermare` | soffermandosi | soffermando |
| `soffrire` | soffrendone | soffrendo |
| `soffiare` | soffiandola | soffiando |
| `soffondere` | soffondendosi | soffondendo |
| `soggiogare` | soggiogandolo | soggiogando |
| `sollecitare` | sollecitandone | sollecitando |
| `sollevare` | sollevandosi | sollevando |
| `sommare` | sommandosi | sommando |
| `sopportare` | sopportandoli | sopportando |
| `sopprimere` | sopprimendoli | sopprimendo |
| `sopravvivere` | sopravvivendogli | sopravvivendo |
| `sorbire` | sorbendosi | sorbendo |
| `sorpassare` | sorpassandolo | sorpassando |
| `sorridere` | sorridendomi | sorridendo |
| `sospettare` | sospettandola | sospettando |
| `sostenere` | sostenendosi | sostenendo |
| `sostituire` | sostituendovi | sostituendo |
| `sottolineare` | sottolineandovi | sottolineando |
| `sottomettere` | sottomettendolo | sottomettendo |
| `sottoporre` | sottoponendosi | sottoponendo |
| `sottoscrivere` | sottoscrivendone | sottoscrivendo |
| `sottrarre` | sottraendosi | sottraendo |
| `sovraccaricare` | sovraccaricandolo | sovraccaricando |
| `sovrapporre` | sovrapponendosi | sovrapponendo |
| `spaccare` | spaccandolo | spaccando |
| `spacciare` | spacciandosi | spacciando |
| `spalmare` | spalmandosi | spalmando |
| `sparare` | sparandosi | sparando |
| `spargere` | spargendosi | spargendo |
| `spaventare` | spaventandosi | spaventando |
| `specchiarsi` | specchiandosi | specchiando |
| `specializzare` | specializzandosi | specializzando |
| `spedire` | spedendovi | spedendo |
| `spersonalizzare` | spersonalizzandosi | spersonalizzando |
| `spezzare` | spezzandosi | spezzando |
| `spezzettare` | spezzettandolo | spezzettando |
| `spiegare` | spiegandovi | spiegando |
| `spingere` | spingendosi | spingendo |
| `spintonare` | spintonandosi | spintonando |
| `spogliare` | spogliandosi | spogliando |
| `spopolare` | spopolandosi | spopolando |
| `sporcare` | sporcandosi | sporcando |
| `sposare` | sposandomi | sposando |
| `spostare` | spostandosi | spostando |
| `sprecare` | sprecandosi | sprecando |
| `squartare` | squartandolo | squartando |
| `squilibrare` | squilibrandosi | squilibrando |
| `stare` | standosene | stando |
| `stabilire` | stabilendovi | stabilendo |
| `stabilizzare` | stabilizzandosi | stabilizzando |
| `staccare` | staccandosi | staccando |
| `standardizzare` | standardizzandosi | standardizzando |
| `sterminare` | sterminandone | sterminando |
| `stimolare` | stimolandone | stimolando |
| `stipare` | stipandone | stipando |
| `stiracchiare` | stiracchiandolo | stiracchiando |
| `stordire` | stordendolo | stordendo |
| `storicizzare` | storicizzandoli | storicizzando |
| `strangolare` | strangolandola | strangolando |
| `straniare` | straniandosi | straniando |
| `strappare` | strappandosi | strappando |
| `straziare` | straziandoci | straziando |
| `stringere` | stringendosi | stringendo |
| `stroncare` | stroncandole | stroncando |
| `strumentalizzare` | strumentalizzandoli | strumentalizzando |
| `studiare` | studiandosi | studiando |
| `stupire` | stupendomi | stupendo |
| `subire` | subendone | subendo |
| `subordinare` | subordinandolo | subordinando |
| `succhiare` | succhiandolo | succhiando |
| `suddividere` | suddividendolo | suddividendo |
| `suggerire` | suggerendosi | suggerendo |
| `suicidarsi` | suicidandosi | suicidando |
| `superare` | superandosi | superando |
| `supplire` | supplendovi | supplendo |
| `supplicare` | supplicandolo | supplicando |
| `supporre` | supponendola | supponendo |
| `surclassare` | surclassandola | surclassando |
| `suscitare` | suscitandone | suscitando |
| `svalutare` | svalutandosi | svalutando |
| `svegliare` | svegliandosi | svegliando |
| `svelare` | svelandovi | svelando |
| `sventolare` | sventolandomi | sventolando |
| `sviare` | sviandolo | sviando |
| `sviluppare` | sviluppandosi | sviluppando |
| `svincolare` | svincolandosi | svincolando |
| `sviscerare` | sviscerandone | sviscerando |
| `svolgere` | svolgendosi | svolgendo |
| `svuotare` | svuotandolo | svuotando |
| `tacciare` | tacciandoli | tacciando |
| `tagliare` | tagliandosi | tagliando |
| `tenere` | tenendovi | tenendo |
| `tentare` | tentandovi | tentando |
| `terrorizzare` | terrorizzandolo | terrorizzando |
| `tessere` | tessendone | tessendo |
| `tesserare` | tesserandoti | tesserando |
| `testare` | testandoli | testando |
| `testimoniare` | testimoniandolo | testimoniando |
| `tirare` | tirandosi | tirando |
| `toccare` | toccandosi | toccando |
| `togliere` | togliendosi | togliendo |
| `torcere` | torcendosi | torcendo |
| `tormentare` | tormentandogli | tormentando |
| `tornare` | tornandovi | tornando |
| `torturare` | torturandole | torturando |
| `tracciare` | tracciandolo | tracciando |
| `tradurre` | traducendosi | traducendo |
| `trarre` | traendone | traendo |
| `trainare` | trainandolo | trainando |
| `tramortire` | tramortendolo | tramortendo |
| `tramutare` | tramutandosi | tramutando |
| `tranciare` | tranciandolo | tranciando |
| `trascinare` | trascinandosi | trascinando |
| `trascurare` | trascurandosi | trascurando |
| `trasferire` | trasferendosi | trasferendo |
| `trasfondere` | trasfondendosi | trasfondendo |
| `trasformare` | trasformandosi | trasformando |
| `trasmettere` | trasmettendosi | trasmettendo |
| `trasportare` | trasportandolo | trasportando |
| `trattare` | trattandosi | trattando |
| `trattenere` | trattenendone | trattenendo |
| `travestire` | travestendoli | travestendo |
| `travolgere` | travolgendoli | travolgendo |
| `tributare` | tributandogli | tributando |
| `trincerare` | trincerandosi | trincerando |
| `trovare` | trovandovi | trovando |
| `tuffare` | tuffandosi | tuffando |
| `tutelare` | tutelandone | tutelando |
| `uccidere` | uccidendone | uccidendo |
| `umiliare` | umiliandone | umiliando |
| `unire` | unendovi | unendo |
| `unificare` | unificandosi | unificando |
| `uniformare` | uniformandovi | uniformando |
| `urlare` | urlandogli | urlando |
| `urtare` | urtandosi | urtando |
| `usare` | usandosi | usando |
| `ustionare` | ustionandoti | ustionando |
| `utilizzare` | utilizzandolo | utilizzando |
| `vagliare` | vagliandolo | vagliando |
| `valere` | valendovi | valendo |
| `valorizzare` | valorizzandone | valorizzando |
| `valutare` | valutandone | valutando |
| `vantare` | vantandosi | vantando |
| `variare` | variandone | variando |
| `vedere` | vedendosi | vedendo |
| `veicolare` | veicolandola | veicolando |
| `velare` | velandosi | velando |
| `vendere` | vendendoti | vendendo |
| `venire` | venendosi | venendo |
| `vergognarsi` | vergognandosi | vergognando |
| `verificare` | verificandosi | verificando |
| `versare` | versandogli | versando |
| `vestire` | vestendosi | vestendo |
| `vietare` | vietandosi | vietando |
| `vincere` | vincendone | vincendo |
| `vincolare` | vincolandola | vincolando |
| `violentare` | violentandole | violentando |
| `visitare` | visitandone | visitando |
| `vivere` | vivendone | vivendo |
| `visualizzare` | visualizzandolo | visualizzando |
| `viziare` | viziandolo | viziando |
| `volere` | volendosi | volendo |
| `volare` | volandoci | volando |
| `volgere` | volgendoli | volgendo |
| `voltare` | voltandosi | voltando |
| `votare` | votandogli | votando |

### Gerunds that are not gerunds (10)

An imperfect indicative overwrote the field. Cannot be repaired by trimming.

| Key | Stored | Should be |
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

### Present participles that are not participles (9)

The same overwrite. All four gender/number slots hold the same wrong word.

| Key | Stored | Should be |
| --- | --- | --- |
| `disdire` | disdicevo | disdicente |
| `percuotere` | percuotevo | percuotente |
| `possedere` | possiedevo | possedente |
| `ripercuotere` | ripercuotevo | ripercuotente |
| `riscuotere` | riscuotevo | riscuotente |
| `risedere` | risiedevo | risedente |
| `scuotere` | scuotevo | scuotente |
| `sedere` | siedevo | sedente |
| `soprassedere` | soprassiedevo | soprassedente |

### Entries that are not verbs (2)

| Key | Stored | What it really is |
| --- | --- | --- |
| `dimmi` | an imperative, *dimmi* | "tell me", a form of `dire` |
| `rimontar` | an imperative, *rimontati* | a shortened spelling of `rimontare` |

### Stray mood key (1)

| Key | Stored | Should be |
| --- | --- | --- |
| `muovere` | a mood named `null` holding `{"past":{"S":"mossoci"}}` | no such mood |

## Summary

| Field | Trust it? |
| --- | --- |
| The key (infinitive) | Always |
| `ind`, `sub`, `cond`, `impr` | Yes |
| `part` | Yes |
| `inf.pres` | **No** — use the key |
| `ger.pres` | **Only after trimming** at `-ando`/`-endo` |

Counts were measured against `italian-verbs-dict` 3.4.0.
