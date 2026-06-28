import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return NextResponse.next();
  if (request.nextUrl.pathname === "/api/health")
    return NextResponse.json({ status: "preview-disabled" });
  return new NextResponse(
    "This preview deployment is isolated from production services.",
    {
      status: 503,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
