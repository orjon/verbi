"use client"

import { Splash } from "./splash"
import { useVerbParam } from "./navigation"
import { VerbList } from "./verb-list"
import { VerbView } from "./verb-view"

/** The list, or one verb when the address asks for it. */
export function App() {
  const verb = useVerbParam()
  if (verb === undefined) return <Splash />
  return verb ? <VerbView key={verb} verb={verb} /> : <VerbList />
}
