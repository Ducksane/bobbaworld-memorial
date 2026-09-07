import type { ComponentPropsWithoutRef } from "react";

type PixelLabelProps = ComponentPropsWithoutRef<"div"> & {
  /** Size of the leading square, in px. */
  dot?: 7 | 8;
  /** Pulses the leading square. */
  blink?: boolean;
};

/** Pixel-font label with a small green square, used as section eyebrow. */
export function PixelLabel({
  dot = 8,
  blink = false,
  className = "",
  children,
  ...props
}: PixelLabelProps) {
  return (
    <div
      className={`flex items-center font-pixel uppercase ${dot === 8 ? "gap-3.5" : "gap-2.5"} ${className}`}
      {...props}
    >
      <span
        aria-hidden
        className={`shrink-0 bg-lime ${dot === 8 ? "size-2" : "size-[7px]"} ${blink ? "animate-blink" : ""}`}
      />
      {children}
    </div>
  );
}
