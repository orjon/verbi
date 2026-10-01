"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

// Import from the files themselves, not from "@/conjugation": that pulls the
// whole lexicon into the browser.
import { VERB_TYPES, VERB_TYPE_LABEL } from "@/conjugation/constants"
import type { VerbType } from "@/conjugation/types"

/** A verb and its kind, worked out on the server. */
type Entry = { verb: string; type: VerbType | null }

export function VerbList({
  verbs,
  letters,
}: {
  verbs: Entry[]
  letters: string[]
}) {
  const [letter, setLetter] = useState<string | null>(null)
  const [type, setType] = useState<VerbType | "">("")
  const [query, setQuery] = useState("")

  const search = query.trim().toLowerCase()

  const shown = useMemo(
    () =>
      verbs.filter(
        (v) =>
          (!letter || v.verb.startsWith(letter)) &&
          (!type || v.type === type) &&
          (!search || v.verb.includes(search)),
      ),
    [verbs, letter, type, search],
  )

  const filters = [
    search && `containing "${search}"`,
    type && `of type ${VERB_TYPE_LABEL[type]}`,
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
              htmlFor="type"
              className="text-sm text-black/60 dark:text-white/60"
            >
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as VerbType | "")}
              className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
            >
              <option value="">All types</option>
              {VERB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {VERB_TYPE_LABEL[t]}
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
          {shown.map(({ verb }) => (
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
