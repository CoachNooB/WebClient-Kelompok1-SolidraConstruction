import { NextResponse } from "next/server";

function originFromRequestUrl(request: Request): string {
  return new URL(request.url).origin;
}

export function assertSameOrigin(request: Request): NextResponse | null {
  const expected = originFromRequestUrl(request);
  const origin = request.headers.get("origin");

  if (origin) {
    return origin === expected
      ? null
      : NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const referer = request.headers.get("referer");
  if (!referer) {
    return NextResponse.json({ error: "Missing origin" }, { status: 403 });
  }

  try {
    return new URL(referer).origin === expected
      ? null
      : NextResponse.json({ error: "Invalid referer" }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Invalid referer" }, { status: 403 });
  }
}
