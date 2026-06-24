import { NextResponse } from "next/server";

export const MB = 1024 * 1024;

export const uploadRequestLimits = {
  image: 10 * MB,
  document: 17 * MB,
  cv: 7 * MB,
  sectionCard: 10 * MB,
} as const;

export function assertContentLength(
  request: Request,
  maxBytes: number,
): NextResponse | null {
  const raw = request.headers.get("content-length");
  if (!raw) {
    return NextResponse.json(
      { error: "Content-Length required" },
      { status: 411 },
    );
  }

  const size = Number(raw);
  if (!Number.isSafeInteger(size) || size < 0) {
    return NextResponse.json(
      { error: "Invalid content length" },
      { status: 400 },
    );
  }

  if (size > maxBytes) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413 },
    );
  }

  return null;
}
