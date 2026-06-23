import type { StaffRole } from "@/lib/auth/permissions";
export function validateStaffUpdate(input: {
  actorId: string;
  targetId: string;
  currentRole: StaffRole;
  nextRole: StaffRole;
  nextActive: boolean;
  activeSuperAdmins: number;
}) {
  const removesSuperAdmin =
    input.currentRole === "SUPER_ADMIN" &&
    (input.nextRole !== "SUPER_ADMIN" || !input.nextActive);
  if (input.actorId === input.targetId && removesSuperAdmin)
    throw new Error("Self-demotion is not allowed");
  if (removesSuperAdmin && input.activeSuperAdmins <= 1)
    throw new Error("At least one active super administrator is required");
}
