import type { ComponentPropsWithoutRef } from "react";

type ContainerProps = ComponentPropsWithoutRef<"div">;

export function Container({ className = "", ...props }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1080px] px-6 ${className}`} {...props} />
  );
}
