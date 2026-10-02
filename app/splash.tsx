/**
 * What is on screen before the page's code has run: black, with the name in the
 * same type as a verb's title.
 */
export function Splash() {
  return (
    <div className="flex h-dvh items-center justify-center bg-black">
      <title>Verbi</title>
      <h1 className="text-3xl font-semibold tracking-tight text-white">Verbi</h1>
    </div>
  )
}
