/**
 * Says when the lexicon was last built. Run before `pnpm dev` in place of a
 * rebuild: the data does not change often, so the build is a separate command
 * (`pnpm build:lexicon`).
 */
import fs from "node:fs"
import { STATS_FILE } from "../constants/paths.ts"

const REBUILD = "pnpm build:lexicon"

/** How long ago, in the largest unit that reads sensibly: minutes, hours or days. */
const ago = (from: Date): string => {
  const minutes = Math.floor((Date.now() - from.getTime()) / 60_000)
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"} ago`
  if (minutes < 1) return "less than a minute ago"
  if (minutes < 120) return plural(minutes, "minute")
  if (minutes < 2 * 24 * 60) return plural(Math.floor(minutes / 60), "hour")
  return plural(Math.floor(minutes / (24 * 60)), "day")
}

if (!fs.existsSync(STATS_FILE)) {
  console.log(`\nTHE LEXICON HAS NOT BEEN BUILT YET\nTo build use: "${REBUILD}"\n`)
} else {
  const { generated } = JSON.parse(fs.readFileSync(STATS_FILE, "utf8"))
  const built = new Date(generated)
  const when = built.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  })
  console.log(
    `\nNOT REBUILDING THE LEXICON\nLast build was: ${when} (${ago(built)})\nTo build use: "${REBUILD}"\n`,
  )
}
