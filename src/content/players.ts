import { memories } from "@/content/memories";

/**
 * The names the stars answer to: click a star in the background sky and it
 * lights up as one of these players. See `StarNames`.
 *
 * To add someone, append them to `named`. Everyone on the memories wall is
 * included automatically, as a player: a star is marked staff only here, never
 * from the "Staff" caption on the wall.
 */
export type Player = {
  pseudo: string;
  /** Members of the team: their star is tagged, and finding one earns a badge. */
  staff?: true;
};

const named: readonly Player[] = [
  { pseudo: "TheStaff", staff: true },
  { pseudo: "Kado33" },
  { pseudo: "Zared" },
  { pseudo: "Haru" },
  { pseudo: "Stand" },
  { pseudo: "arnaud59" },
  { pseudo: "Zeers" },
  { pseudo: "Apo" },
  { pseudo: "YingYang", staff: true },
  { pseudo: "Fullmoon", staff: true },
  { pseudo: "TheCleement" },
  { pseudo: "Exils" },
  { pseudo: "KapruN" },
  { pseudo: "Offi" },
  { pseudo: "Introuvable" },
  { pseudo: "Choupinette13" },
  { pseudo: "Daezen" },
  { pseudo: "Waidz" },
  { pseudo: "Zalik" },
  { pseudo: "bubulle" },
  { pseudo: "Noway" },
  { pseudo: "Roxie" },
  // From the users table of the 2017 relaunch.
  { pseudo: "Emetophobic" },
  { pseudo: "Asticot" },
  { pseudo: "Tiraymond" },
  { pseudo: "Luffy" },
  { pseudo: "Apollo" },
  { pseudo: "Bluescreen" },
  { pseudo: "Virgil" },
  { pseudo: "Aloka" },
  { pseudo: "MadHatter" },
  { pseudo: "Melanie" },
  { pseudo: "Thranos" },
  { pseudo: "Straping" },
];

const fromMemories: readonly Player[] = memories
  .filter((memory) => !named.some((player) => player.pseudo === memory.pseudo))
  .map((memory) => ({ pseudo: memory.pseudo }));

export const players: readonly Player[] = [...named, ...fromMemories];
