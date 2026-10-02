"use client"

import { useEffect } from "react"

/**
 * Registers the service worker, which keeps the app, its data and its fonts on the
 * device so every verb works with no connection. The address is relative, so it is
 * /verbi/sw.js at orjon.com/verbi. It is not used in development.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js", { scope: "./" }).catch(() => {})
    }
  }, [])
  return null
}
