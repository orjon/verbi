# verbi

An Italian verb conjugation app. Type a verb, see every form across all tenses and moods. Simple, fast, works offline.

Built by [orjon.com](https://www.orjon.com)

## Roadmap

- **v0.1 — Lookup** *(current)* — search a verb, get the full conjugation table. No account, no backend.
- **v0.2 — Accounts** — optional sign-in. Lookup stays free and needs no account.
- **v0.3 — Practice** — fill-in-the-blank drills and a verb of the day, tracking progress to resurface weak spots.
- **v0.4 — Mobile** — a React Native app sharing the same conjugation logic.

Built with Next.js, TypeScript and Tailwind. Conjugation data comes from the `italian-verbs` and `italian-verbs-dict` packages.

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
```

## "command not found: pnpm"

If `node` and `corepack` are also missing, no Node.js version is switched on — run `nvm use`. To make that the default everywhere: `nvm alias default 22`.

If `node` works but `pnpm` doesn't, run `corepack enable pnpm` — it's tied to the Node.js version that was active when you first ran it.
