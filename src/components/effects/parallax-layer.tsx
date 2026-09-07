"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { useParallax } from "@/hooks/use-parallax";

type ParallaxLayerProps = ComponentPropsWithoutRef<"div"> & {
  /** Fraction of the scroll offset applied as a vertical translation. */
  factor: number;
};

export function ParallaxLayer({ factor, ...props }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  useParallax(ref, factor);
  return <div ref={ref} {...props} />;
}
