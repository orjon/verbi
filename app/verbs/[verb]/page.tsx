import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  conjugateTense,
  hasVerb,
  isExcluded,
  nonFiniteForms,
  PRONOUNS,
  TENSE_GROUPS,
  TIMES,
} from "@/conjugation";

const TIME_LABEL = { past: "Past", present: "Present", future: "Future" };

export async function generateMetadata({
  params,
}: PageProps<"/verbs/[verb]">): Promise<Metadata> {
  const { verb } = await params;
  return { title: verb, description: `Every form of the Italian verb ${verb}.` };
}

export default async function VerbPage({ params }: PageProps<"/verbs/[verb]">) {
  const { verb } = await params;
  if (!hasVerb(verb) || isExcluded(verb)) notFound();

  const forms = nonFiniteForms(verb);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="shrink-0 border-b border-black/10 px-6 pt-10 pb-4 dark:border-white/10">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            href="/verbs"
            className="text-sm text-black/60 hover:underline dark:text-white/60"
          >
            ← All verbs
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{verb}</h1>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-5xl space-y-10">
          <section>
            <h2 className="text-sm font-semibold tracking-widest uppercase">
              Forms without a person
            </h2>
            <dl className="mt-3 grid grid-cols-[10rem_1fr] gap-y-1 text-sm">
              <dt className="text-black/50 dark:text-white/50">Infinito</dt>
              <dd>{forms.infinitive}</dd>
              <dt className="text-black/50 dark:text-white/50">Gerundio</dt>
              <dd>{forms.gerund ?? "—"}</dd>
              <dt className="text-black/50 dark:text-white/50">
                Participio presente
              </dt>
              <dd>
                {forms.participlePresent
                  ? `${forms.participlePresent.S} / ${forms.participlePresent.P}`
                  : "—"}
              </dd>
              <dt className="text-black/50 dark:text-white/50">
                Participio passato
              </dt>
              <dd>
                {forms.participlePast
                  ? `${forms.participlePast.S} / ${forms.participlePast.SF} / ${forms.participlePast.P} / ${forms.participlePast.PF}`
                  : "—"}
              </dd>
            </dl>
          </section>

          {TENSE_GROUPS.map((group) => {
            // Past, present and future are always the left, middle and right
            // columns, even when a mood has nothing in one of them.
            const times = TIMES;
            // Only the rows that have tenses.
            const rows = [
              { done: false, label: "Simple · the action" },
              { done: true, label: "Compound · already done" },
            ].filter((r) => group.tenses.some((x) => x.done === r.done));

            return (
              <section key={group.mood}>
                <h2 className="text-sm font-semibold tracking-widest uppercase">
                  {group.mood}
                  <span className="ml-3 font-normal tracking-normal text-black/60 normal-case dark:text-white/60">
                    {group.gist}
                  </span>
                </h2>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                  {group.about}
                </p>

                <div className="mt-4 space-y-6">
                  {rows.map((row) => (
                    <div key={row.label}>
                      <h3 className="text-xs tracking-wide text-black/50 uppercase dark:text-white/50">
                        {row.label}
                      </h3>
                      <div className="mt-2 grid gap-6 sm:grid-cols-3">
                        {times.map((time) => (
                          <div key={time} className="space-y-6">
                            {rows.length > 0 && row === rows[0] && (
                              <p className="border-b border-black/10 pb-1 text-xs font-medium text-black/50 uppercase dark:border-white/10 dark:text-white/50">
                                {TIME_LABEL[time]}
                              </p>
                            )}
                            {group.tenses
                              .filter((x) => x.time === time && x.done === row.done)
                              .map(({ tense, label, note }) => {
                                const forms = conjugateTense(verb, tense);
                                if (forms.every((f) => f === null)) return null;
                                return (
                                  <div key={tense}>
                                    <h4 className="text-sm font-medium">
                                      {label}
                                      {note && (
                                        <span className="ml-2 text-xs font-normal text-black/50 dark:text-white/50">
                                          {note}
                                        </span>
                                      )}
                                    </h4>
                                    <dl className="mt-1 grid grid-cols-[5rem_1fr] gap-y-0.5 text-sm">
                                      {forms.map((form, i) => (
                                        <div key={PRONOUNS[i]} className="contents">
                                          <dt className="text-black/40 dark:text-white/40">
                                            {PRONOUNS[i]}
                                          </dt>
                                          <dd>{form ?? "—"}</dd>
                                        </div>
                                      ))}
                                    </dl>
                                  </div>
                                );
                              })}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
