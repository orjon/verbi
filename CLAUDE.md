@AGENTS.md

# Verb App — Project Context for Claude

## What this is

An Italian verb conjugation app. Users type a verb and see all its conjugated forms across every tense and mood. Simple, fast, works offline.

Built by [orjon.com](https://www.orjon.com)

---

## Roadmap

### v0.1 — Lookup (current)

- Next.js + TypeScript
- `italian-verbs` + `italian-verbs-dict` npm packages for all conjugation data
- Single page: search a verb → display full conjugation table
- No auth, no backend, no DB
- Target: web only, deployed to Vercel

### v0.2 — Auth + Accounts

- Supabase for auth (email + social login)
- Minimal DB: `users` table, that's it to start
- Optional account — core lookup remains free and unauthenticated
- Low barrier to entry is a priority

### v0.3 — Gamification

- **Fill-in-the-blank** drill mode: given a verb + tense + person, user types the correct form
- **Verb of the day**
- User progress table: `(user_id, verb, tense, person, correct, timestamp)`
- Spaced repetition style — surface weak spots

### v0.4 — React Native

- Expo app sharing the same conjugation logic
- Auth and progress via same Supabase instance
- App Store / Play Store presence
- At this point evaluate PWA vs native properly

---

## Tech stack

| Layer          | Choice                                 | Notes                                             |
| -------------- | -------------------------------------- | ------------------------------------------------- |
| Framework      | Next.js (App Router)                   | SSR not needed for v0.1 but ready for v0.2+       |
| Language       | TypeScript                             | Throughout                                        |
| Conjugation    | `italian-verbs` + `italian-verbs-dict` | Dictionary lookup, covers all tenses + irregulars |
| Auth + DB      | Supabase                               | Free tier, Postgres, handles auth                 |
| Hosting        | Vercel                                 | Free tier                                         |
| Mobile (later) | Expo                                   | Shares conjugation logic and Supabase instance    |

---

## Conjugation data

`getConjugation(verbsList, verb, tense, person, number, options?)`
