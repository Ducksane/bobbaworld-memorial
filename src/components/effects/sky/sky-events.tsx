"use client";

import { useMotionAllowed } from "@/hooks/use-motion-allowed";
import { Aurora } from "./aurora";
import { Comet } from "./comet";
import { Constellation } from "./constellation";

/**
 * The purely visual events of the living sky. Under reduced motion none of them
 * mounts, so none subscribes and the shared clock only ever calls the duck.
 */
export function SkyEvents() {
  const motionOk = useMotionAllowed();
  if (!motionOk) return null;

  return (
    <>
      <Aurora />
      <Constellation />
      <Comet />
    </>
  );
}
