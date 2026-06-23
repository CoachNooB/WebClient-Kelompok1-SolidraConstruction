"use client";

import { useState } from "react";

function initials(label: string) {
  const letters = label
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return letters || "?";
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      aria-label={`${label} photo placeholder`}
      className="mb-5 flex aspect-[4/3] w-full items-center justify-center rounded-md bg-slate-100 text-3xl font-black text-slate-500 ring-1 ring-slate-200"
    >
      {initials(label)}
    </div>
  );
}

export function CardImage({
  src,
  label,
  placeholder = true,
}: {
  src?: string;
  label: string;
  placeholder?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return placeholder ? <Placeholder label={label} /> : null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="mb-5 aspect-[4/3] w-full rounded-md object-cover"
      onError={() => setFailed(true)}
    />
  );
}
