/** The outside sources a form can be checked against. IT8's real name is in
 *  .env.local (not committed). */
export const SOURCE = {
  it8: "IT8",
  it6: "IT6",
  wiktionary: "Wiktionary",
} as const

/**
 * Sources used only for Lillian checks: they can confirm, disagree with or
 * reclassify a form that another source already gives, but never supply a
 * form or count as one of its sources. A form only they give is recorded
 * as a disagreement (`differs`), not added.
 */
export const LILLIAN_SOURCES: ReadonlySet<string> = new Set([
  SOURCE.it8,
  SOURCE.it6,
])

/**
 * What a source says about one form, in data-sources/checks.json:
 *
 *   standard  the source gives this as the normal form
 *   variant   a valid alternative, of the check's `kind`
 *   absent    the source does not list this form
 *   none      the source confirms the slot has no form at all
 */
export const VERDICT = {
  standard: "standard",
  variant: "variant",
  absent: "absent",
  none: "none",
} as const
