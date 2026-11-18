/**
 * BobbaWorld's chat filter: anything rude came out as a burst of symbols,
 * "#&@!%". (On Habbo it came out as "bobba", which is where the server got its
 * name, and why the badge for setting the filter off is still called that.)
 *
 * Words are compared lower-cased and without accents, so "Enculé" and "encule"
 * are the same entry.
 */
const WORDS = new Set([
  // Français
  "con", "cons", "conne", "connes", "pute", "putes", "cul", "bite", "bites",
  "couille", "couilles", "chier", "chie", "chiant", "chiante", "foutre", "pd",
  "fdp", "ntm", "tg", "batard", "batards", "batarde", "salaud", "salauds",
  "bordel", "abruti", "abrutie",
  // English
  "ass", "damn", "crap", "wtf", "dick", "dicks", "cunt", "cunts", "bitch",
  "bitches", "bastard", "bastards", "asshole", "assholes",
]);

/** Roots that are rude whatever ending follows: "merde", "merdique", "fucking"… */
const STEMS = [
  "merd", "emmerd", "putain", "encul", "niqu", "connard", "connass", "salop",
  "branl", "fuck", "motherfuck", "shit", "bullshit",
];

function isRude(word: string) {
  const plain = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  return WORDS.has(plain) || STEMS.some((stem) => plain.startsWith(stem));
}

/** What a rude word is replaced with. */
const CENSORED = "#&@!%";

/** Replaces every rude word with `CENSORED` and reports whether it had to. */
export function bobbaFilter(text: string) {
  let censored = false;
  const clean = text.replace(/[\p{L}\p{N}]+/gu, (word) => {
    if (!isRude(word)) return word;
    censored = true;
    return CENSORED;
  });
  return { text: clean, censored };
}
