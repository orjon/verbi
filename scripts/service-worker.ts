/**
 * Writes out/sw.js, the service worker that keeps the whole site on the device so
 * every verb works with no connection. Run after `next build` (pnpm build does).
 *
 * It lists every file the app needs, by reading out/, and is versioned by a hash of
 * those files, so a device fetches the new site when anything in it changes.
 *
 * Everything under the site's address is served from the device first. A page
 * asked for as /verbi/?v=cominciare, or any address that is not a file, is the app's
 * one page.
 */
import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

const OUT = "out"

// Not kept: the worker itself, and the files Next writes for moving between its own
// pages (this site has one page and moves without them), and the error page.
const NOT_KEPT = [/^sw\.js$/, /\.txt$/, /^404\.html$/, /^404\//, /^_not-found/]

const files: string[] = []
const walk = (dir: string) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else {
      const relative = path.relative(OUT, full).split(path.sep).join("/")
      if (!NOT_KEPT.some((pattern) => pattern.test(relative))) files.push(relative)
    }
  }
}
walk(OUT)
files.sort()

const hash = createHash("sha256")
for (const file of files) hash.update(file).update(fs.readFileSync(path.join(OUT, file)))
const version = hash.digest("hex").slice(0, 12)

// The page itself is asked for by the folder, not by index.html.
const urls = files.map((file) => (file === "index.html" ? "./" : file))

const worker = `// Written by scripts/service-worker.ts. Do not edit.
const CACHE = "verbi-${version}"
const FILES = ${JSON.stringify(urls, null, 2)}
const SCOPE = self.registration.scope

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(FILES.map((file) => new Request(new URL(file, SCOPE), { cache: "reload" }))),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith("verbi-") && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== location.origin || !url.href.startsWith(SCOPE)) return
  const isPage = request.mode === "navigate"
  event.respondWith(
    caches
      .match(request, { ignoreSearch: isPage })
      .then((hit) => hit || (isPage ? caches.match(SCOPE, { ignoreSearch: true }) : undefined))
      .then((hit) => hit || fetch(request)),
  )
})
`

fs.writeFileSync(path.join(OUT, "sw.js"), worker)
const bytes = files.reduce((sum, file) => sum + fs.statSync(path.join(OUT, file)).size, 0)
console.log(`service worker: ${files.length} files kept on the device, ${(bytes / 1e6).toFixed(2)} MB, version ${version}`)
