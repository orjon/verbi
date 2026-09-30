/** Small, general-purpose helpers with no knowledge of verbs. */

/** A copy of `record` with its keys in sorted order. */
export const sortKeys = <T>(record: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.keys(record).sort().map((k) => [k, record[k]]));
