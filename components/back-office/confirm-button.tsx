"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmButton({
  label,
  confirmTitle,
  confirmBody,
  confirmLabel,
  disabled,
  className,
  onConfirm,
}: {
  label: string;
  confirmTitle: string;
  confirmBody: string;
  confirmLabel: string;
  disabled?: boolean;
  className?: string;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="grid gap-3">
      <Button
        type="button"
        className={className}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open && (
        <div className="rounded border bg-slate-50 p-4">
          <h3 className="font-bold">{confirmTitle}</h3>
          <p className="mt-1 text-sm text-slate-600">{confirmBody}</p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              className="bg-white text-slate-900 ring-1 ring-slate-300"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={className}
              disabled={pending}
              onClick={confirm}
            >
              {pending ? "Working..." : confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
