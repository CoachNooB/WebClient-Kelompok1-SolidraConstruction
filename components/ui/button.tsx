import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 font-semibold text-white disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
