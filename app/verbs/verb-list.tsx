"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

const ENDINGS = ["are", "ere", "ire", "rre"] as const
type Ending = (typeof ENDINGS)[number]

/**
 * Which of the four infinitive endings a verb has. `-rre` is checked first:
 * those verbs are contracted `-ere` verbs (*porre*, *condurre*) and would not
 * match the others anyway, but the order makes the intent explicit.
 */
function endingOf(verb: string): Ending | null {
  if (verb.endsWith("rre")) return "rre"
  for (const e of ENDINGS) if (verb.endsWith(e)) return e
  return null
}

export function VerbList({
  verbs,
  letters,
}: {
  verbs: string[]
  letters: string[]
}) {
  const [letter, setLetter] = useState<string | null>(null)
  const [ending, setEnding] = useState<Ending | "">("")
  const [query, setQuery] = useState("")

  const search = query.trim().toLowerCase()

  const shown = useMemo(
    () =>
      verbs.filter(
        (v) =>
          (!letter || v.startsWith(letter)) &&
          (!ending || endingOf(v) === ending) &&
          (!search || v.includes(search)),
      ),
    [verbs, letter, ending, search],
  )

  const filters = [
    search && `containing "${search}"`,
    ending && `ending in -${ending}`,
    letter && `starting with ${letter.toUpperCase()}`,
  ].filter(Boolean)

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="shrink-0 border-b border-black/10 px-6 py-4 dark:border-white/10">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-2xl font-semibold tracking-tight">All verbs</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {shown.length.toLocaleString()}
            {filters.length > 0 && ` of ${verbs.length.toLocaleString()}`} verbs
            {filters.length > 0 && ` ${filters.join(", ")}`}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search verbs"
                aria-label="Search verbs"
                className="w-56 rounded border border-black/15 bg-transparent px-2 py-1 text-sm placeholder:text-black/40 dark:border-white/20 dark:placeholder:text-white/40"
              />
            </div>

            <label
              htmlFor="ending"
              className="text-sm text-black/60 dark:text-white/60"
            >
              Type
            </label>
            <select
              id="ending"
              value={ending}
              onChange={(e) => setEnding(e.target.value as Ending | "")}
              className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
            >
              <option value="">All types</option>
              {ENDINGS.map((e) => (
                <option key={e} value={e}>
                  -{e}
                </option>
              ))}
            </select>
          </div>

          <nav className="mt-3 flex flex-wrap gap-1">
            <Letter
              label="All"
              active={letter === null}
              onClick={() => setLetter(null)}
            />
            {letters.map((l) => (
              <Letter
                key={l}
                label={l.toUpperCase()}
                active={letter === l}
                onClick={() => setLetter(l)}
              />
            ))}
          </nav>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {shown.length === 0 && (
          <p className="mx-auto w-full max-w-5xl text-sm text-black/60 dark:text-white/60">
            No verbs match.
          </p>
        )}
        <ul className="mx-auto w-full max-w-5xl columns-2 gap-6 sm:columns-3 lg:columns-4">
          {shown.map((verb) => (
            <li key={verb} className="break-inside-avoid">
              <Link
                href={`/verbs/${verb}`}
                className="block py-0.5 text-sm hover:underline"
              >
                {verb}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Letter({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-8 rounded px-2 py-1 text-sm transition-colors ${
        active
          ? "bg-foreground text-background"
          : "hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  )
}
