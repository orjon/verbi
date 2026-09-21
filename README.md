# verbi

A [Next.js](https://nextjs.org) app. Packages are installed with **pnpm**.

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
