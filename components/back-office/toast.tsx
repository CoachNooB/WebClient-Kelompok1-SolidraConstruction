"use client";

const tones = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

export function ToastMessage({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "error" | "info";
}) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={`rounded border px-3 py-2 text-sm font-medium ${tones[tone]}`}
    >
      {message}
    </p>
  );
}
