"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ContentCard, type CardItem } from "@/components/public/content-card";

export function CardCarousel({
  items,
  locale,
}: {
  items: CardItem[];
  locale: "id" | "en";
}) {
  const [start, setStart] = useState(0);
  const maxStart = Math.max(0, items.length - 3);
  const visible = items.slice(start, start + 3);

  return (
    <div className="mt-8">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Previous directors"
          disabled={start === 0}
          onClick={() => setStart((value) => Math.max(0, value - 1))}
          className="inline-flex size-11 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          aria-label="Next directors"
          disabled={start === maxStart}
          onClick={() => setStart((value) => Math.min(maxStart, value + 1))}
          className="inline-flex size-11 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {visible.map((item, index) => (
          <ContentCard
            key={`${item.title ?? item.label}-${start + index}`}
            item={item}
            locale={locale}
            imagePlaceholder
          />
        ))}
      </div>
    </div>
  );
}
