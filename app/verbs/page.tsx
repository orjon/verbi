import type { Metadata } from "next";
import { listVerbs, verbType } from "@/conjugation";
import { VerbList } from "./verb-list";

export const metadata: Metadata = {
  title: "All verbs",
  description: "Every Italian verb in the dictionary, in the infinitive.",
};

export default function VerbsPage() {
  const verbs = listVerbs();
  // Only the letters Italian actually uses — no j, k, w, x or y.
  const letters = [...new Set(verbs.map((v) => v[0]))].sort();

  const entries = verbs.map((verb) => ({ verb, type: verbType(verb) }));

  return <VerbList verbs={entries} letters={letters} />;
}
