"use client";

import { NavLink } from "./navigation";
import {
  auxInfo,
  auxTooltipSections,
  conjugateTenseDisplay,
  definitionsOf,
  FORM_SEPARATOR,
  progressiveTense,
  PROGRESSIVE_TENSES,
  hasVerb,
  isExcluded,
  nonFiniteForms,
  PRONOUNS,
  TENSE_GROUPS,
  TIMES,
} from "@/conjugation";

const TIME_LABEL = { past: "Passato", present: "Presente", future: "Futuro" };

/** A very faint tint for each time column, so the three are easy to tell apart. */
const TIME_TINT = {
  past: "bg-[#ff0000]/8 dark:bg-[#ff0000]/15",
  present: "bg-sky-500/8 dark:bg-sky-400/15",
  future: "bg-emerald-500/8 dark:bg-emerald-400/15",
};

/** A form, with the pipe between two equal auxiliaries greyed out. */
function FormText({ text }: { text: string }) {
  return text.split(FORM_SEPARATOR).map((part, i) => (
    <span key={i}>
      {i > 0 && (
        <span className="mx-1.5 text-black/30 dark:text-white/30">|</span>
      )}
      {part}
    </span>
  ));
}

/**
 * A section of the page that folds up when its heading is clicked, with nothing
 * but the pointer to say so. It starts open. A mood has a short description beside its name and, on hover, a longer
 * explanation.
 */
function Section({
  title,
  gist,
  about,
  children,
}: {
  title: string;
  gist?: string;
  about?: string;
  children: React.ReactNode;
}) {
  const name = (
    <>
      {title}
      {gist && (
        <span className="ml-3 text-sm font-normal tracking-normal text-black/60 normal-case dark:text-white/60">
          {gist}
        </span>
      )}
    </>
  );
  return (
    <details open className="group/section mb-3 open:mb-10">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <h2 className="text-base font-semibold tracking-widest uppercase">
          {about ? (
            <span className="group relative inline-block">
              {name}
              <span
                role="tooltip"
                className="pointer-events-none absolute top-full left-0 z-20 mt-1 hidden w-max max-w-[min(18rem,calc(100vw-3rem))] rounded border border-black/10 bg-white p-3 text-xs font-normal tracking-normal text-black/80 normal-case shadow-lg group-hover:block dark:border-white/20 dark:bg-neutral-900 dark:text-white/80"
              >
                {about}
              </span>
            </span>
          ) : (
            name
          )}
        </h2>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

/** The verb's auxiliaries, with the hover that explains them. */
function AuxList({
  auxiliaries,
  tip,
}: {
  auxiliaries: ReturnType<typeof auxInfo>;
  tip: ReturnType<typeof auxTooltipSections>;
}) {
  return (
    <span className="group relative inline-block" tabIndex={tip.length > 0 ? 0 : undefined}>
      <span className={`font-medium ${tip.length > 0 ? "cursor-help" : ""}`}>
        {auxiliaries.map((a, i) => (
          <span key={a.aux}>
            {i > 0 && (
              <span className="mx-2 font-normal text-black/30 dark:text-white/30">|</span>
            )}
            {a.label}
          </span>
        ))}
      </span>
      {tip.length > 0 && (
        <span
          role="tooltip"
          className="pointer-events-none absolute top-full left-0 z-20 mt-1 hidden w-max max-w-[min(34rem,calc(100vw-3rem))] space-y-2 rounded border border-black/10 bg-white p-3 text-xs font-normal shadow-lg group-hover:block group-focus:block dark:border-white/20 dark:bg-neutral-900"
        >
          {tip.map((section, i) => (
            <span key={i} className="block">
              {section.title && (
                <span className="block text-sm font-semibold">{section.title}</span>
              )}
              <span className="block space-y-0.5 text-black/80 dark:text-white/80">
                {section.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

/** One verb's page. */
export function VerbView({ verb }: { verb: string }) {
  if (!hasVerb(verb) || isExcluded(verb))
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3">
        <p className="text-sm text-black/60 dark:text-white/60">&ldquo;{verb}&rdquo; is not a verb.</p>
        <NavLink to={null} className="text-sm">
          Verbi
        </NavLink>
      </div>
    );

  const nonFinite = nonFiniteForms(verb);
  const auxiliaries = auxInfo(verb);
  const definitions = definitionsOf(verb);
  const tip = auxTooltipSections(auxiliaries);

  return (
    <>
    <title>{verb}</title>
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="shrink-0 overflow-y-hidden border-b border-black/10 px-6 py-2.5 [scrollbar-gutter:stable] dark:border-white/10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight">{verb}</h1>
            <NavLink
              to={null}
              className="shrink-0 text-sm whitespace-nowrap text-black/60 dark:text-white/60"
            >
              Verbi
            </NavLink>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 [scrollbar-gutter:stable]">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col">
          <Section title="Significato">
            <div className="bg-black/5 p-4 dark:bg-white/5">
              {definitions.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {definitions.map((definition) => (
                    <li key={definition}>{definition}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-black/50 dark:text-white/50">
                  No definition in Wiktionary.
                </p>
              )}
            </div>
          </Section>

          {TENSE_GROUPS.map((group) => {
            // Past, present and future are always the left, middle and right
            // columns, so a column with nothing in it is left blank.
            const times = TIMES;
            // The tenses a row shows in a column: only those the verb has a form for.
            const itemsFor = (row: { done: boolean; progressive: boolean }, time: (typeof TIMES)[number]) =>
              (row.progressive
                ? PROGRESSIVE_TENSES.filter((x) => x.time === time)
                : group.tenses.filter((x) => x.time === time && x.done === row.done)
              )
                .map(({ tense, label, note }) => ({
                  tense,
                  label,
                  note,
                  forms: row.progressive
                    ? progressiveTense(verb, tense)
                    : conjugateTenseDisplay(verb, tense),
                }))
                .filter((item) => item.forms.some((f) => f !== null));
            // The progressive row, which is in the Indicativo only, sits between the
            // simple and the compound tenses. A row with nothing in it is left out.
            const rows = [
              { done: false, progressive: false, label: "Simple · the action" },
              ...(group.mood === "Indicativo" && nonFinite.gerund
                ? [{ done: false, progressive: true, label: "Progressive · in progress" }]
                : []),
              { done: true, progressive: false, label: "Compound · already done" },
            ]
              .map((row) => ({
                ...row,
                cells: times.map((time) => ({ time, items: itemsFor(row, time) })),
              }))
              .filter((row) => row.cells.some((cell) => cell.items.length > 0));
            // Each column is named in the first row where it has something.
            const labelledIn = (time: (typeof TIMES)[number]) =>
              rows.find((row) => row.cells.find((c) => c.time === time)!.items.length > 0)?.label;

            // A mood the verb has nothing in is not shown at all.
            if (rows.length === 0) return null;

            return (
              <Section
                key={group.mood}
                title={group.mood}
                gist={group.gist}
                about={group.about}
              >
                <div className="space-y-6">
                  {rows.map((row) => (
                    <div key={row.label}>
                      <h3 className="pl-3 text-sm tracking-wide text-black/50 uppercase dark:text-white/50">
                        {row.label}
                      </h3>
                      {row.done && (
                        <p className="mt-2 pl-3 text-sm">
                          <span className="text-black/50 dark:text-white/50">
                            Ausiliare
                          </span>
                          <span className="ml-3">
                            <AuxList auxiliaries={auxiliaries} tip={tip} />
                          </span>
                        </p>
                      )}
                      {row.progressive && nonFinite.gerund && (
                        <p className="mt-2 pl-3 text-sm">
                          <span className="text-black/50 dark:text-white/50">
                            Gerundio
                          </span>
                          <span className="ml-3">{nonFinite.gerund}</span>
                        </p>
                      )}
                      {group.mood === "Indicativo" &&
                        row.done &&
                        nonFinite.participlePast && (
                          <p className="mt-2 pl-3 text-sm">
                            <span className="text-black/50 dark:text-white/50">
                              Participio passato
                            </span>
                            <span className="ml-3">
                              {nonFinite.participlePast.S} /{" "}
                              {nonFinite.participlePast.SF} /{" "}
                              {nonFinite.participlePast.P} /{" "}
                              {nonFinite.participlePast.PF}
                            </span>
                          </p>
                        )}
                      <div className="mt-2 grid gap-6 sm:grid-cols-3 sm:gap-3 lg:gap-6">
                        {row.cells.map(({ time, items }) =>
                          items.length === 0 ? (
                            <div key={time} className="bg-black/10 dark:bg-white/3" />
                          ) : (
                            <div key={time} className={`p-3 ${TIME_TINT[time]}`}>
                              {labelledIn(time) === row.label && (
                                <p className="mb-3 border-b border-black/10 pb-1 text-xs font-medium text-black/50 uppercase dark:border-white/10 dark:text-white/50">
                                  {TIME_LABEL[time]}
                                </p>
                              )}
                              <div className="space-y-6">
                              {items.map(({ tense, label, note, forms }) => (
                                <div key={tense}>
                                  <h4 className="text-sm font-medium">
                                    {label}
                                    {note && (
                                      <span className="ml-2 text-xs font-normal text-black/50 dark:text-white/50">
                                        {note}
                                      </span>
                                    )}
                                  </h4>
                                  <dl className="mt-1 grid grid-cols-[5rem_1fr] gap-y-0.5 text-sm sm:grid-cols-[3rem_1fr] lg:grid-cols-[5rem_1fr]">
                                    {forms.map((form, i) => (
                                      <div key={PRONOUNS[i]} className="contents">
                                        <dt className="text-black/40 dark:text-white/40">
                                          {PRONOUNS[i]}
                                        </dt>
                                        <dd>{form ? <FormText text={form} /> : "—"}</dd>
                                      </div>
                                    ))}
                                  </dl>
                                </div>
                              ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            );
          })}

          {nonFinite.participlePresent && (
            <Section title="Participio presente" gist="Adjective or noun">
              <p className="text-sm">
                {nonFinite.participlePresent.S} / {nonFinite.participlePresent.P}
              </p>
            </Section>
          )}

          <footer className="mt-auto space-y-1 border-t border-black/10 pt-4 text-xs text-black/40 dark:border-white/10 dark:text-white/40">
            <p>Verb forms from Morph-it! (Baroni and Zanchetta).</p>
            {definitions.length > 0 && (
              <p>Definitions from Wiktionary, CC BY-SA 4.0.</p>
            )}
          </footer>
        </div>
      </div>
    </div>
    </>
  );
}
