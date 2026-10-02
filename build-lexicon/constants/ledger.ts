/**
 * Ledger keys whose values print on one line rather than one array/object
 * entry per line — short, and read as a unit.
 */
export const COMPACT_KEYS = new Set([
  "checked",
  "rule",
  "candidates",
  "differs",
  "alternatives",
  "sources",
  "aux",
])
