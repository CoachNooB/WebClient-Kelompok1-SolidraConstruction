import "server-only";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth, type AuthSession } from "@/lib/auth";
import { can, type Permission, type StaffRole } from "@/lib/auth/permissions";

export async function getActiveBackOfficeSession(): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.active) return null;
  return session;
}

export async function requireBackOfficePermission(
  permission: Permission,
): Promise<AuthSession | NextResponse> {
  const session = await getActiveBackOfficeSession();
  if (!session || !can(session.user.role as StaffRole, permission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return session;
}

export function isAuthResponse(
  value: AuthSession | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
