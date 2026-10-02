"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { NavLink } from "./navigation"

// The lexicon is in the browser: the site is one page that works with no connection.
import {
  AUX_KINDS,
  AUX_KIND_LABEL,
  auxKind,
  definitionsOf,
  listVerbs,
  VERB_TYPES,
  VERB_TYPE_LABEL,
  verbType,
} from "@/conjugation"
import type { AuxKind, VerbType } from "@/conjugation"

/** A number with a thousands separator. The locale is fixed so the server and the browser agree. */
const count = (n: number) => n.toLocaleString("en-US")

/** A verb, its kind, which auxiliaries it takes and its definitions. */
type Entry = {
  verb: string
  type: VerbType | null
  aux: AuxKind
  definitions: string[]
}

/** The verb the pointer is on, and where its tooltip goes. */
type Tip = {
  verb: string
  left: number
  /** The top of the tooltip, or null when it goes above the verb instead. */
  top: number | null
  bottom: number
}

/** How many definitions the tooltip lists before "and N more". */
const TIP_DEFINITIONS = 10
/** The tooltip's width in pixels, and the room it needs below the verb. */
const TIP_WIDTH = 320
const TIP_ROOM = 280

export function VerbList() {
  const verbs = useMemo<Entry[]>(
    () =>
      listVerbs().map((verb) => ({
        verb,
        type: verbType(verb),
        aux: auxKind(verb),
        definitions: definitionsOf(verb),
      })),
    [],
  )
  // Only the letters Italian actually uses — no j, k, w, x or y.
  const letters = useMemo(() => [...new Set(verbs.map((v) => v.verb[0]))].sort(), [verbs])
  const [letter, setLetter] = useState<string | null>(null)
  const [type, setType] = useState<VerbType | "">("")
  const [aux, setAux] = useState<AuxKind | "">("")
  const [query, setQuery] = useState("")
  const [tip, setTip] = useState<Tip | null>(null)

  /** Opens the tooltip next to a verb, above it when there is little room below. */
  const showTip = (verb: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const fitsBelow = rect.bottom + TIP_ROOM < window.innerHeight
    setTip({
      verb,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - TIP_WIDTH - 8)),
      top: fitsBelow ? rect.bottom + 4 : null,
      bottom: window.innerHeight - rect.top + 4,
    })
  }
  const tipDefinitions = tip ? (verbs.find((v) => v.verb === tip.verb)?.definitions ?? []) : []

  const search = query.trim().toLowerCase()

  const shown = useMemo(
    () =>
      verbs.filter(
        (v) =>
          (!letter || v.verb.startsWith(letter)) &&
          (!type || v.type === type) &&
          (!aux || v.aux === aux) &&
          (!search || v.verb.includes(search)),
      ),
    [verbs, letter, type, aux, search],
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <title>Verbi</title>
      <header className="shrink-0 overflow-y-hidden border-b border-black/10 px-6 pt-2.5 pb-2.5 [scrollbar-gutter:stable] dark:border-white/10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">Verbi</h1>
            <p className="shrink-0 text-sm whitespace-nowrap text-black/60 dark:text-white/60">
              {shown.length === verbs.length
                ? count(verbs.length)
                : `${count(shown.length)} di ${count(verbs.length)}`}{" "}
              verbi
            </p>
          </div>

          {/* A container query: below 40rem the search box takes the whole row and
              the two dropdowns fill the row under it, equal in width. Wider, the
              search box is half the width and the dropdowns sit at the right. */}
          <div className="@container mt-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full @min-[40rem]:w-1/2">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cerca…"
                  aria-label="Cerca verbi"
                  className="h-7.5 w-full border border-black/15 bg-transparent px-2 text-sm placeholder:text-black/40 dark:border-white/20 dark:placeholder:text-white/40"
                />
              </div>

              <div className="grid w-full grid-cols-[auto_1fr_auto_1fr] items-center gap-x-1.5 @min-[40rem]:ml-auto @min-[40rem]:flex @min-[40rem]:w-auto @min-[40rem]:gap-3">
                <div className="contents @min-[40rem]:flex @min-[40rem]:items-center @min-[40rem]:gap-1.5">
                  <label
                    htmlFor="type"
                    className="text-sm text-black/60 dark:text-white/60"
                  >
                    Tipo
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as VerbType | "")}
                    className="h-7.5 w-full min-w-0 border border-black/15 bg-transparent px-2 text-sm @min-[40rem]:w-auto dark:border-white/20"
                  >
                    <option value="">Tutti</option>
                    {VERB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {VERB_TYPE_LABEL[t]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="contents @min-[40rem]:flex @min-[40rem]:items-center @min-[40rem]:gap-1.5">
                  <label
                    htmlFor="aux"
                    className="ml-1.5 text-sm text-black/60 @min-[40rem]:ml-0 dark:text-white/60"
                  >
                    Ausiliare
                  </label>
                  <select
                    id="aux"
                    value={aux}
                    onChange={(e) => setAux(e.target.value as AuxKind | "")}
                    className="h-7.5 w-full min-w-0 border border-black/15 bg-transparent px-2 text-sm @min-[40rem]:w-auto dark:border-white/20"
                  >
                    <option value="">Tutti</option>
                    {AUX_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {AUX_KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <LetterNav
            items={[
              ...letters.map((l) => ({ key: l, label: l.toUpperCase() })),
              { key: null, label: "A–Z" },
            ]}
            active={letter}
            onSelect={setLetter}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 [scrollbar-gutter:stable]">
        {shown.length === 0 && (
          <p className="mx-auto w-full max-w-5xl text-sm text-black/60 dark:text-white/60">
            No verbs match.
          </p>
        )}
        <ul className="mx-auto w-full max-w-5xl columns-[9rem] gap-4">
          {shown.map(({ verb }) => (
            <li key={verb} className="break-inside-avoid">
              <NavLink
                to={verb}
                className="block py-0.5 text-sm"
                onMouseEnter={(e) => showTip(verb, e.currentTarget)}
                onMouseLeave={() => setTip(null)}
                onFocus={(e) => showTip(verb, e.currentTarget)}
                onBlur={() => setTip(null)}
              >
                {verb}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {tip && (
        <div
          role="tooltip"
          style={{
            left: tip.left,
            width: "max-content",
            maxWidth: TIP_WIDTH,
            ...(tip.top !== null ? { top: tip.top } : { bottom: tip.bottom }),
          }}
          className="pointer-events-none fixed z-30 rounded border border-black/10 bg-white p-3 text-xs shadow-lg dark:border-white/20 dark:bg-neutral-900"
        >
          <p className="text-sm font-semibold">{tip.verb}</p>
          {tipDefinitions.length > 0 ? (
            <ul className="mt-1 space-y-0.5 text-black/80 dark:text-white/80">
              {tipDefinitions.slice(0, TIP_DEFINITIONS).map((definition) => (
                <li key={definition}>{definition}</li>
              ))}
              {tipDefinitions.length > TIP_DEFINITIONS && (
                <li className="text-black/50 dark:text-white/50">
                  and {tipDefinitions.length - TIP_DEFINITIONS} more
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-1 text-black/50 dark:text-white/50">
              No definition in Wiktionary.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/** The space between two letter buttons, in pixels. */
const LETTER_GAP = 2

/**
 * How many equal rows the buttons need to fit in `available` pixels: one if
 * they all fit, otherwise the fewest rows, of equal length, that each fit.
 */
function rowsNeeded(widths: number[], available: number): number {
  for (let rows = 1; rows < widths.length; rows++) {
    const perRow = Math.ceil(widths.length / rows)
    let fits = true
    for (let start = 0; start < widths.length && fits; start += perRow) {
      const row = widths.slice(start, start + perRow)
      const total = row.reduce((sum, w) => sum + w, 0) + LETTER_GAP * (row.length - 1)
      fits = total <= available
    }
    if (fits) return rows
  }
  return widths.length
}

/**
 * The row of letters. They stay in one row while they fit. When they do not,
 * they are split into rows of equal length, and each row is spread across the
 * full width.
 */
function LetterNav({
  items,
  active,
  onSelect,
}: {
  items: { key: string | null; label: string }[]
  active: string | null
  onSelect: (key: string | null) => void
}) {
  const nav = useRef<HTMLElement>(null)
  const [rows, setRows] = useState(1)

  useEffect(() => {
    const element = nav.current
    if (!element) return
    const measure = () => {
      const widths = Array.from(element.querySelectorAll("button")).map(
        (button) => button.offsetWidth,
      )
      setRows(rowsNeeded(widths, element.clientWidth))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [items.length])

  const perRow = Math.ceil(items.length / rows)
  const lines = Array.from({ length: rows }, (_, i) =>
    items.slice(i * perRow, (i + 1) * perRow),
  )

  return (
    <nav ref={nav} className="mt-3 flex flex-col gap-0.5">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`flex gap-0.5 ${rows > 1 ? "justify-between" : "flex-wrap"}`}
        >
          {line.map(({ key, label }) => (
            <Letter
              key={label}
              label={label}
              active={active === key}
              onClick={() => onSelect(key)}
            />
          ))}
        </div>
      ))}
    </nav>
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
      className={`h-7.5 min-w-7 border px-1.5 text-sm transition-colors ${
        active
          ? "border-black/15 bg-black/5 dark:border-white/20 dark:bg-white/10"
          : "border-transparent hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  )
}
