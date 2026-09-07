import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "outline";
type Size = "md" | "lg";

const BASE =
  "inline-flex items-center rounded-full no-underline transition-[background-color,border-color,transform] duration-200";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-lime font-semibold text-moss hover:-translate-y-px hover:bg-lime-bright hover:text-moss",
  outline:
    "border border-cream/28 font-medium text-cream hover:border-cream hover:text-cream",
};

const SIZES: Record<Variant, Record<Size, string>> = {
  primary: {
    md: "gap-2.5 px-[26px] py-4 text-[15px]",
    lg: "gap-3 px-8 py-5 text-[17px] whitespace-nowrap",
  },
  outline: {
    md: "gap-2.5 px-6 py-[15px] text-[15px]",
    lg: "gap-3 px-[31px] py-[19px] text-[17px] whitespace-nowrap",
  },
};

export function buttonClassName(
  variant: Variant = "primary",
  size: Size = "md",
  className = "",
) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[variant][size]} ${className}`;
}

type ButtonLinkProps = ComponentPropsWithoutRef<"a"> & {
  href: string;
  variant?: Variant;
  size?: Size;
  /** Opens in a new tab with a safe `rel`. */
  external?: boolean;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  external = false,
  className = "",
  ...props
}: ButtonLinkProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      className={buttonClassName(variant, size, className)}
      {...externalProps}
      {...props}
    />
  );
}
