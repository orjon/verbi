/**
 * Verbs with no present participle.
 *
 * Morph-it records none for these, and none is in use — most Italian verbs
 * have no living present participle, and many of these are the base forms of
 * verbs that are normally reflexive (`abbuffare` behind `abbuffarsi`).
 *
 * Listed here rather than in data-sources/overrides.json because that file is for
 * decisions about individual forms, and this is one decision about 83 verbs.
 */
export const NO_PRESENT_PARTICIPLE = new Set<string>([
  "abboffare",
  "abbuffare",
  "accaldare",
  "accanire",
  "accapigliare",
  "accigliare",
  "accoccolare",
  "accorgere",
  "accosciare",
  "accovacciare",
  "accucciare",
  "adirare",
  "adontare",
  "affare",
  "afflosciare",
  "appigliare",
  "appisolare",
  "appollaiare",
  "arrabattare",
  "assentare",
  "attagliare",
  "attendare",
  "autocandidare",
  "avvalere",
  "avvedere",
  "barcamenare",
  "congratulare",
  "defaticare",
  "imbattere",
  "immusonire",
  "impadronire",
  "impancare",
  "impaperare",
  "impelagare",
  "impipare",
  "impossessare",
  "incaponire",
  "incapricciare",
  "incavolare",
  "incazzare",
  "incrodare",
  "industriare",
  "inerpicare",
  "infischiare",
  "infognare",
  "infortunare",
  "ingegnare",
  "inginocchiare",
  "intestardire",
  "inurbare",
  "lagnare",
  "ostinare",
  "pavoneggiare",
  "pentire",
  "peritare",
  "piccare",
  "riappropriare",
  "rimpossessare",
  "rincagnare",
  "ripentire",
  "rivalere",
  "sbellicare",
  "sbracciare",
  "sbronzare",
  "scalmanare",
  "scamiciare",
  "scapicollare",
  "scervellare",
  "scollacciare",
  "sfegatare",
  "sfratare",
  "sgolare",
  "spaparacchiare",
  "spaparanzare",
  "specchiare",
  "spericolare",
  "spolmonare",
  "spretare",
  "stempiare",
  "stravaccare",
  "suicidare",
  "vanagloriare",
  "vergognare",
  // added 2026-09-29, checked against English Wiktionary's tables ("-" given
  // for the slot, and no valid alternate): ambire, compatire, deperire,
  // gioire, perire, riessere, risapere, risentire. Five more have a genuine
  // rare/archaic/literary alternate kept in data-sources/overrides.json
  // instead of being lost: esperire, percepire, presentire, punire, tornire.
  // sapere added 2026-09-29, decided by Orjon (source: ChatGPT): "sapiente"
  // has fully detached from the verb — it can no longer be used verbally
  // ("la persona sapiente la verità" is not valid; only "la persona che sa
  // la verità"), so keeping it would be historical clutter, not a living
  // present participle.
  "ambire",
  "compatire",
  "deperire",
  "esperire",
  "gioire",
  "percepire",
  "perire",
  "presentire",
  "punire",
  "riessere",
  "risapere",
  "risentire",
  "sapere",
  "tornire",
])

/**
 * Verbs used only in the third person (monopersonali). Morph-it gives every verb
 * all six persons, but these have no io, tu, noi or voi form in use; their third
 * person singular and plural are kept. The three lists differ only in why.
 */

/**
 * Verbs with no past participle, so no compound tenses. Morph-it gives one
 * anyway (a regular -uto ending on a Latinate stem that never took it:
 * *vertuto*, *urto*), which is simply wrong — not a valid rare alternative.
 * Each is a defective verb without one, checked 2026-09-29. Four of these
 * (controvertere, divergere, serpere, urgere) also lack the passato remoto,
 * handled separately in data-sources/overrides.json. eccellere and convergere
 * were flagged by the same Wiktionary comparison but turned out to have a
 * real participle on checking (eccelso; converso, rare) — set directly
 * instead of being added here.
 */
export const NO_PAST_PARTICIPLE = new Set<string>([
  "competere",
  "controvertere",
  "discernere",
  "divergere",
  "equidistare",
  "erompere",
  "esimere",
  "fervere",
  "fulgere",
  "irrompere",
  "lucere",
  "mingere",
  "rilucere",
  "risplendere",
  "serpere",
  "strapiombare",
  "suggere",
  "tralucere",
  "urgere",
  "vertere",
])

/**
 * -ire verbs whose present participle keeps the Latin -iente ending instead of
 * the regular -ente (venire's own "veniente", not "venente"). Morph-it gives
 * only the -ente form, so no conflict ever reaches a rule. Checked 2026-09-29
 * (e.g. *conveniente*, *nutriente*, *progrediente*, *ubbidiente*); adempire,
 * compire and inorgoglire added later the same day,
 * matching the same stem+iente pattern (riempire already had it correctly
 * from Morph-it). Four further verbs
 * with an irregular present participle (assentire, dissentire, concepire,
 * concupire) are handled by data-sources/overrides.json instead, since each is
 * its own word, not "stem + iente".
 */
export const PARTICIPLE_IENTE_VERBS = new Set([
  // venire and its compounds
  "addivenire",
  "avvenire",
  "circonvenire",
  "contravvenire",
  "convenire",
  "divenire",
  "intervenire",
  "pervenire",
  "riconvenire",
  "rinvenire",
  "sopravvenire",
  "sovvenire",
  "svenire",
  "venire",
  // other -ire verbs
  "adempire",
  "ammollire",
  "compire",
  "inorgoglire",
  "blandire",
  "empire",
  "esaudire",
  "esaurire",
  "impedire",
  "lenire",
  "munire",
  "nutrire",
  "partorire",
  "premunire",
  "progredire",
  "regredire",
  "trasgredire",
  "ubbidire",
])
