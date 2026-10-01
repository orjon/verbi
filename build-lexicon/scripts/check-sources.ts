/**
 * Fetches each word's page from each source and saves what comes back, with a
 * record of what was and was not fetched and why, so it can be read later
 * without looking anything up by hand.
 *
 *   node build-lexicon/scripts/check-sources.ts <sources> <words> [output]
 *
 *   sources  comma-separated names, e.g. IT8,IT6
 *   words    a text file, or a list written out (commas, spaces or new lines)
 *   output   defaults to notes/source-check.json
 *
 * Where a source's pages are is not in the code. A source named IT8 is read
 * from SOURCE_IT8 in .env.local (not committed): its address, with {word}
 * where the word goes, and {initial} where its first letter goes, in capitals.
 *
 * It goes slowly: after each page, a source is left alone for a random 2.5 to
 * 7.5 seconds (longer if its robots.txt sets a crawl delay), though two
 * sources are asked within the same gap. It skips paths the site's robots.txt
 * disallows, stops a source on a 403 or 429, and keeps what it has fetched in
 * the output file, so running it again only fetches the words still missing.
 */
import fs from "node:fs"
import { ENV_FILE, SOURCE_CHECK_FILE } from "../constants/paths.ts"

/** The shortest and longest wait between two requests to one source, in milliseconds. */
const delay = { min: 2500, max: 7500 }

const randomDelay = (): number =>
  Math.floor(Math.random() * (delay.max - delay.min + 1)) + delay.min
const USER_AGENT = "progetto personale"

/** One fetched page, kept as text. */
type Page = { status: number; fetched: string; text: string }

/** What a source's robots.txt says, as read. */
type Robots = {
  /** The HTTP status of /robots.txt, or null if it could not be reached. */
  status: number | null
  /** Paths disallowed for every crawler. */
  disallowed: string[]
  /** Seconds between requests asked of every crawler, if it says. */
  crawlDelay: number | null
  /** Every crawler the file names, whether or not it is ours. */
  namedCrawlers: string[]
  /** The file's own comments, in order. */
  comments: string[]
  /** The whole file. */
  text: string
}

type SourceResult = {
  robots: Robots
  /** Word → why it was not fetched. */
  skipped: Record<string, string>
  /** Plain-language account of what was and was not checked, and why. */
  notes: string[]
  pages: Record<string, Page>
}

type Result = { sources: Record<string, SourceResult> }

/** A source's address for one word: its pattern with the word filled in. */
const pageUrl = (pattern: string, word: string): string =>
  pattern
    .replace("{initial}", word[0].toUpperCase())
    .replace("{word}", encodeURIComponent(word))

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** A source's address pattern, from its SOURCE_<NAME> line in .env.local. */
const patternOf = (name: string): string | undefined =>
  process.env[`SOURCE_${name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`]

/** The words from a file, or from the list itself. */
const readWords = (arg: string): string[] => {
  const text = fs.existsSync(arg) ? fs.readFileSync(arg, "utf8") : arg
  return [...new Set(text.split(/[\s,;]+/).filter(Boolean))]
}

/** A page's readable text: no scripts, styles or tags. */
const textOf = (html: string): string =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()

/** Reads a site's robots.txt: the rules for every crawler, and anything else it says. */
const readRobots = async (origin: string): Promise<Robots> => {
  const robots: Robots = {
    status: null,
    disallowed: [],
    crawlDelay: null,
    namedCrawlers: [],
    comments: [],
    text: "",
  }
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
    })
    robots.status = res.status
    if (!res.ok) return robots
    robots.text = await res.text()
  } catch {
    return robots
  }
  let forEveryone = false
  for (const raw of robots.text.split("\n")) {
    const [content, ...comment] = raw.split("#")
    if (comment.length) robots.comments.push(comment.join("#").trim())
    const line = content.trim()
    const colon = line.indexOf(":")
    if (colon < 0) continue
    const key = line.slice(0, colon).trim().toLowerCase()
    const value = line.slice(colon + 1).trim()
    if (key === "user-agent") {
      forEveryone = value === "*"
      if (!robots.namedCrawlers.includes(value))
        robots.namedCrawlers.push(value)
    } else if (forEveryone && key === "disallow" && value)
      robots.disallowed.push(value)
    else if (forEveryone && key === "crawl-delay")
      robots.crawlDelay = Number(value) || null
  }
  return robots
}

/** What was and was not checked for a source, and why, in plain words. */
const notesFor = (words: string[], source: SourceResult): string[] => {
  const { robots, skipped, pages } = source
  const notes: string[] = []
  if (robots.status === null)
    notes.push(
      "robots.txt could not be reached, so nothing was treated as disallowed.",
    )
  else if (robots.status !== 200)
    notes.push(
      `robots.txt returned ${robots.status}, so nothing was treated as disallowed.`,
    )
  else {
    notes.push(
      robots.disallowed.length
        ? `robots.txt disallows these paths for every crawler: ${robots.disallowed.join(", ")}.`
        : "robots.txt disallows nothing for every crawler.",
    )
    if (robots.crawlDelay)
      notes.push(
        `robots.txt asks for ${robots.crawlDelay} seconds between requests; that was used if longer than the ${delay.min / 1000} to ${delay.max / 1000} seconds otherwise waited.`,
      )
    const others = robots.namedCrawlers.filter((c) => c !== "*")
    if (others.length)
      notes.push(
        `robots.txt also names ${others.length} specific crawlers (not ours); read its text and comments for anything that bears on this check.`,
      )
  }
  const fetched = words.filter((w) => pages[w])
  const failed = fetched.filter((w) => pages[w].status !== 200)
  notes.push(
    `${fetched.length} of ${words.length} words fetched; ${failed.length} of those did not return a page: ${failed.map((w) => `${w} (${pages[w].status})`).join(", ") || "none"}.`,
  )
  const skippedWords = Object.entries(skipped)
  if (skippedWords.length)
    notes.push(
      `${skippedWords.length} words were not fetched: ${skippedWords.map(([w, why]) => `${w} (${why})`).join("; ")}.`,
    )
  return notes
}

const run = async () => {
  try {
    process.loadEnvFile(ENV_FILE)
  } catch {
    // no .env.local: every source will report that it has no address
  }
  const [sourcesArg, wordsArg, output = SOURCE_CHECK_FILE] =
    process.argv.slice(2)
  if (!sourcesArg || !wordsArg) {
    console.error(
      "usage: node build-lexicon/scripts/check-sources.ts <sources> <words> [output]",
    )
    process.exit(1)
  }
  const names = sourcesArg.split(",").map((s) => s.trim())
  const patterns: Record<string, string> = {}
  for (const name of names) {
    const pattern = patternOf(name)
    if (!pattern?.includes("{word}")) {
      console.error(
        `${name}: no SOURCE_${name.toUpperCase()} address with {word} in ${ENV_FILE}`,
      )
      process.exit(1)
    }
    patterns[name] = pattern
  }

  const words = readWords(wordsArg)
  const result: Result = fs.existsSync(output)
    ? JSON.parse(fs.readFileSync(output, "utf8"))
    : { sources: {} }
  if (!result.sources) {
    console.error(
      `${output} is in a different format: choose another output file or delete it`,
    )
    process.exit(1)
  }

  // Each source's robots.txt is read first, so its rules apply to every word.
  for (const name of names) {
    const origin = new URL(pageUrl(patterns[name], "x")).origin
    const previous = result.sources[name]
    result.sources[name] = {
      robots: await readRobots(origin),
      skipped: {},
      notes: [],
      pages: previous?.pages ?? {},
    }
  }

  // One round per word: every source that still needs it is asked together,
  // then each waits out its own delay before its next request.
  const nextAt: Record<string, number> = {}
  const stopped = new Set<string>()
  for (const word of words) {
    const due = names.filter((name) => {
      const source = result.sources[name]
      if (stopped.has(name) || source.pages[word]) return false
      const url = pageUrl(patterns[name], word)
      const rule = source.robots.disallowed.find((p) =>
        new URL(url).pathname.startsWith(p),
      )
      if (rule) source.skipped[word] = `robots.txt disallows ${rule}`
      return !rule
    })
    if (!due.length) continue
    await sleep(
      Math.max(0, ...due.map((name) => (nextAt[name] ?? 0) - Date.now())),
    )
    await Promise.all(
      due.map(async (name) => {
        const url = pageUrl(patterns[name], word)
        const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } })
        // A fresh wait each time, never shorter than robots.txt asks for.
        const crawlDelay = result.sources[name].robots.crawlDelay ?? 0
        nextAt[name] = Date.now() + Math.max(randomDelay(), crawlDelay * 1000)
        result.sources[name].pages[word] = {
          status: res.status,
          fetched: new Date().toISOString(),
          text: res.ok ? textOf(await res.text()) : "",
        }
        console.log(`${name}: ${word} ${res.status}`)
        if (res.status === 403 || res.status === 429) {
          stopped.add(name)
          console.log(`${name}: stopped, the site refused`)
        }
      }),
    )
    fs.writeFileSync(output, JSON.stringify(result, null, 1) + "\n")
  }

  for (const name of names) {
    const source = result.sources[name]
    for (const word of words)
      if (!source.pages[word] && !source.skipped[word])
        source.skipped[word] =
          "the source refused an earlier request, so the rest were not asked"
    source.notes = notesFor(words, source)
    console.log(`\n${name}:\n  ${source.notes.join("\n  ")}`)
  }
  fs.writeFileSync(output, JSON.stringify(result, null, 1) + "\n")
  console.log(`\nwritten to ${output}`)
}

run()
