import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  type BackOfficeSection,
  canAccessBackOfficeSection,
} from "@/lib/auth/back-office-sections";
import type { StaffRole } from "@/lib/auth/permissions";

export async function getBackOfficeSessionOrRedirect() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.active) redirect("/back-office/login");
  return session;
}

export function redirectIfUnauthorized(
  role: StaffRole,
  section: BackOfficeSection,
) {
  if (!canAccessBackOfficeSection(role, section))
    redirect("/back-office/not-authorized");
}
