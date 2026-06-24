"use client";

import { useEffect, useRef } from "react";

const selector = "input, textarea, select, button";

export function ReadOnlyBoundary({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const disableControls = () => {
      root.querySelectorAll<HTMLElement>(selector).forEach((control) => {
        if (
          control instanceof HTMLInputElement ||
          control instanceof HTMLTextAreaElement ||
          control instanceof HTMLSelectElement ||
          control instanceof HTMLButtonElement
        ) {
          if (control.closest("[data-read-only-allowed='true']")) {
            control.disabled = false;
            control.removeAttribute("aria-disabled");
            return;
          }
          control.disabled = true;
          control.setAttribute("aria-disabled", "true");
        }
      });
    };

    disableControls();
    const observer = new MutationObserver(disableControls);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="bo-readonly">
      <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
        Reviewer mode: this account can edit application and message workflow
        records. Other editing controls are disabled.
      </div>
      {children}
    </div>
  );
}
