# verbi

An Italian verb conjugation app. Type a verb, see every form across all tenses and moods. Simple, fast, works offline.

Built by [orjon.com](https://www.orjon.com)

## Roadmap

- **v0.1 — Lookup** *(current)* — search a verb, get the full conjugation table. No account, no backend.
- **v0.2 — Accounts** — optional sign-in. Lookup stays free and needs no account.
- **v0.3 — Practice** — fill-in-the-blank drills and a verb of the day, tracking progress to resurface weak spots.
- **v0.4 — Mobile** — a React Native app sharing the same conjugation logic.

Built with Next.js, TypeScript and Tailwind. Conjugation data comes from the `italian-verbs` and
`italian-verbs-dict` packages, which derive from [Morph-it!](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it)
by Marco Baroni and Eros Zanchetta, used under CC BY-SA 2.0.

## Setup

```bash
nvm use                # Node.js version from .nvmrc
corepack enable pnpm   # once per Node.js version
pnpm install
```

Corepack comes with Node.js and fetches the pnpm version pinned in `package.json`, so everyone gets the same one.

## Run

```bash
pnpm dev     # http://localhost:3000
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint    # check the code
pnpm test    # run the conjugation tests
```

## "command not found: pnpm"

If `node` and `corepack` are also missing, no Node.js version is switched on — run `nvm use`. To make that the default everywhere: `nvm alias default 22`.

If `node` works but `pnpm` doesn't, run `corepack enable pnpm` — it's tied to the Node.js version that was active when you first ran it.

## The verb data

Conjugation data is keyed by infinitive, and under each verb sit three layers:
**mood → tense → person**. So `parlare.ind.pres.S1` is *parlo*. These tables
explain the keys.

### Moods (the first layer)

| Key | Italian | English | Forms | What it's for | Example |
| --- | --- | --- | --- | --- | --- |
| `inf` | infinito | infinitive | n/a | The dictionary form — what you look a verb up by | parlare — *to speak* |
| `ger` | gerundio | gerund | n/a | "-ing" | parlando — *speaking* |
| `part` | participio | participle | `S SF P PF` | Building block for compound tenses | parlato — *spoken* |
| `ind` | indicativo | indicative | `S1 S2 S3 P1 P2 P3` | States facts — the everyday mood | lui parla — *he speaks* |
| `cond` | condizionale | conditional | `S1 S2 S3 P1 P2 P3` | "Would" | parlerei — *I would speak* |
| `sub` | congiuntivo | subjunctive | `S1 S2 S3 P1 P2 P3` | Doubt, wishes, opinions | spero che lui parli — *I hope he speaks* |
| `impr` | imperativo | imperative | `S2 P1 P2` | Commands | parla! — *speak!* |

The **Forms** column lists the keys you will find at the third layer. It is n/a
for `inf` and `ger`, which have no third layer at all — the value sits directly
under the tense as a single string. The imperative is missing `S1`, `S3` and
`P3` because you cannot command yourself or a third party, and `part` uses
gender and number rather than person — both covered below.

### Tenses (the second layer)

| Key | Italian | English | Example |
| --- | --- | --- | --- |
| `pres` | presente | present | parlo — *I speak* |
| `impf` | imperfetto | imperfect | parlavo — *I was speaking / used to speak* |
| `past` | passato remoto | simple past | parlai — *I spoke* |
| `fut` | futuro | future | parlerò — *I will speak* |

The two layers combine — `ind.pres` is present indicative, `sub.impf` is
imperfect subjunctive — but not every pairing exists. The subjunctive has no
future; the conditional has only `pres`.

And `pres` doesn't always mean present. Under `inf`, `ger` and `impr` it is
simply where the single form is parked: `inf.pres` is *parlare*, which has no
tense at all. Likewise `part.past` is the past participle *parlato*, not the
passato remoto.

### Person and number (the third layer)

The letter is number: `S` singular, `P` plural.

The digit is the grammatical person — who is being talked about:

- `1` — whoever is speaking
- `2` — whoever is being spoken to
- `3` — whoever is being spoken about

| Key | Italian | English |
| --- | --- | --- |
| `S1` | io | I |
| `S2` | tu | you *(one person)* |
| `S3` | lui / lei | he / she / it |
| `P1` | noi | we |
| `P2` | voi | you *(more than one)* |
| `P3` | loro | they |

### Gender and number (the third layer, under `part`)

Participles are the exception. They don't have a person, because they describe
something rather than say who is doing it — so the third layer holds gender and
number instead.

| Key | Meaning | Example |
| --- | --- | --- |
| `S` | masculine singular | parlato |
| `SF` | feminine singular | parlata |
| `P` | masculine plural | parlati |
| `PF` | feminine plural | parlate |

Masculine is unmarked and feminine adds an `F`, so `S` means masculine singular
rather than "singular" on its own.

This matters for compound tenses built with *essere*, where the participle
agrees with the subject: *sono andato* if a man says it, *sono andata* if a
woman does, *siamo andati* for a group. With *avere* there is no agreement, and
the participle stays in the `S` form.

Note that the present participle makes no gender distinction — `S` and `SF` are
both *parlante* — so only number is doing any work there.

### One verb in full: `parlare`

A blank cell means the same key as the row above — which is what the nesting
means: everything under `ind` shares one `ind` key.

| Mood | Tense | Person | Form | English |
| --- | --- | --- | --- | --- |
| `inf` | `pres` | — | parlare | to speak |
| `part` | `pres` | `S` | parlante | speaking (m. sing.) |
|  |  | `SF` | parlante | speaking (f. sing.) |
|  |  | `P` | parlanti | speaking (m. plur.) |
|  |  | `PF` | parlanti | speaking (f. plur.) |
| | `past` | `S` | parlato | spoken (m. sing.) |
| |  | `SF` | parlata | spoken (f. sing.) |
| |  | `P` | parlati | spoken (m. plur.) |
| |  | `PF` | parlate | spoken (f. plur.) |
| `ger` | `pres` | — | parlando | speaking |
| `ind` | `pres` | `S1` | parlo | I speak |
|  |  | `S2` | parli | you speak |
|  |  | `S3` | parla | he / she speaks |
|  |  | `P1` | parliamo | we speak |
|  |  | `P2` | parlate | you speak |
|  |  | `P3` | parlano | they speak |
|  | `impf` | `S1` | parlavo | I was speaking |
|  |  | `S2` | parlavi | you were speaking |
|  |  | `S3` | parlava | he / she was speaking |
|  |  | `P1` | parlavamo | we were speaking |
|  |  | `P2` | parlavate | you were speaking |
|  |  | `P3` | parlavano | they were speaking |
|  | `past` | `S1` | parlai | I spoke |
|  |  | `S2` | parlasti | you spoke |
|  |  | `S3` | parlò | he / she spoke |
|  |  | `P1` | parlammo | we spoke |
|  |  | `P2` | parlaste | you spoke |
|  |  | `P3` | parlarono | they spoke |
|  | `fut` | `S1` | parlerò | I will speak |
|  |  | `S2` | parlerai | you will speak |
|  |  | `S3` | parlerà | he / she will speak |
|  |  | `P1` | parleremo | we will speak |
|  |  | `P2` | parlerete | you will speak |
|  |  | `P3` | parleranno | they will speak |
| `cond` | `pres` | `S1` | parlerei | I would speak |
|  |  | `S2` | parleresti | you would speak |
|  |  | `S3` | parlerebbe | he / she would speak |
|  |  | `P1` | parleremmo | we would speak |
|  |  | `P2` | parlereste | you would speak |
|  |  | `P3` | parlerebbero | they would speak |
| `sub` | `pres` | `S1` | parli | (that) I speak |
|  |  | `S2` | parli | (that) you speak |
|  |  | `S3` | parli | (that) he / she speaks |
|  |  | `P1` | parliamo | (that) we speak |
|  |  | `P2` | parliate | (that) you speak |
|  |  | `P3` | parlino | (that) they speak |
|  | `impf` | `S1` | parlassi | (that) I spoke |
|  |  | `S2` | parlassi | (that) you spoke |
|  |  | `S3` | parlasse | (that) he / she spoke |
|  |  | `P1` | parlassimo | (that) we spoke |
|  |  | `P2` | parlaste | (that) you spoke |
|  |  | `P3` | parlassero | (that) they spoke |
| `impr` | `pres` | `S2` | parla | speak! |
|  |  | `P1` | parliamo | let us speak |
|  |  | `P2` | parlate | speak! |

`parlare` is a fully regular first-conjugation verb, so every form above follows
the standard pattern. Two shapes differ from the rest: `inf` and `ger` show `—`
for person, because the value there is a plain string rather than an object, and
`part` uses gender and number (`S`, `SF`, `P`, `PF`) instead of person.

One warning. The infinitive and gerund above are the correct forms, but they are
**not** what the dictionary stores. For `parlare` it holds `parlarvi` and
`parlandosi` — the form with a pronoun attached, which Italian writes as one
word. This affects 36% of infinitives and 20% of gerunds, including most common
verbs. Take the infinitive from the dictionary key instead, and build the gerund
from the stem.
