# verbi

A [Next.js](https://nextjs.org) app. Packages are installed with **pnpm**.

## Setup

```bash
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

Your terminal only looks up where a command lives once, and `pnpm` arrived after this window opened. Type `rehash`, or open a new window.

If you've switched Node.js version since, run `corepack enable pnpm` again.
