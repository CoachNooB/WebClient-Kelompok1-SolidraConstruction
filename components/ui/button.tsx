import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Button({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md border border-blue-700 bg-blue-600 px-4 font-semibold text-white shadow-sm hover:border-blue-800 hover:bg-blue-700 hover:shadow disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}
