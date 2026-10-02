import type { Metadata } from "next";
import { auxKind, definitionsOf, listVerbs, verbType } from "@/conjugation";
import { VerbList } from "./verb-list";

export const metadata: Metadata = {
  title: "Verbi",
  description: "Every Italian verb in the dictionary, in the infinitive.",
};

export default function Home() {
  const verbs = listVerbs();
  // Only the letters Italian actually uses — no j, k, w, x or y.
  const letters = [...new Set(verbs.map((v) => v[0]))].sort();

  const entries = verbs.map((verb) => ({
    verb,
    type: verbType(verb),
    aux: auxKind(verb),
    definitions: definitionsOf(verb),
  }));

  return <VerbList verbs={entries} letters={letters} />;
}
