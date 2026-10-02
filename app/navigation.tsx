"use client"

import { useSyncExternalStore, type AnchorHTMLAttributes } from "react"

// The site is one page. A verb is asked for in the address, /verbi/?v=cominciare,
// and the page redraws without reloading, so it also works with no connection.

/** Tells the page that the address changed. */
const CHANGED = "verbi:navigate"

const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange)
  window.addEventListener(CHANGED, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(CHANGED, onChange)
  }
}

/**
 * The verb the address asks for. null on the list, and undefined until the page
 * is in the browser (the server and the first draw do not know the address).
 */
export function useVerbParam(): string | null | undefined {
  const search = useSyncExternalStore<string | undefined>(
    subscribe,
    () => window.location.search,
    () => undefined,
  )
  return search === undefined ? undefined : new URLSearchParams(search).get("v")
}

/** Goes to a verb's page, or to the list when the verb is null. */
export function goTo(verb: string | null) {
  const url = verb ? `?v=${encodeURIComponent(verb)}` : window.location.pathname
  window.history.pushState(null, "", url)
  window.dispatchEvent(new Event(CHANGED))
}

/** A link to a verb, or to the list when `to` is null. A plain click redraws; others open as usual. */
export function NavLink({
  to,
  ...props
}: { to: string | null } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <a
      {...props}
      href={to ? `?v=${encodeURIComponent(to)}` : "."}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        goTo(to)
      }}
    />
  )
}
