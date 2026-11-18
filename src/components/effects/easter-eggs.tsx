import { BadgeToast } from "@/components/badges/badge-toast";
import { Blackout } from "@/components/effects/blackout";
import { BobbaChat } from "@/components/effects/bobba-chat";
import { DuckEasterEgg } from "@/components/effects/duck-easter-egg";
import { SkyEvents } from "@/components/effects/sky/sky-events";
import { StarNames } from "@/components/effects/star-names";

/**
 * Everything hidden on the site, mounted once for every page:
 *
 * - the living sky — the duck, an aurora, a constellation and a comet take
 *   turns on a shared clock (`sky-schedule`);
 * - the stars that answer to a player's name when clicked;
 * - the chat bar that appears when typing, and turns rude words into "#&@!%";
 * - the blackout of 24 April 2013, set off from the timeline;
 * - the badge toast that announces each one the first time it is found.
 *
 * The 404 page hides one more, the waiting queue.
 */
export function EasterEggs() {
  return (
    <>
      <DuckEasterEgg />
      <SkyEvents />
      <StarNames />
      <BobbaChat />
      <Blackout />
      <BadgeToast />
    </>
  );
}
