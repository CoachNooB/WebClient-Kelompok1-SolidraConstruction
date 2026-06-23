export type StaffRole = "SUPER_ADMIN" | "EDITOR" | "REVIEWER";

export type Permission =
  | "content:read"
  | "content:write"
  | "content:publish"
  | "submissions:read"
  | "submissions:write"
  | "users:manage"
  | "settings:manage";

const grants: Record<StaffRole, ReadonlySet<Permission>> = {
  SUPER_ADMIN: new Set([
    "content:read",
    "content:write",
    "content:publish",
    "submissions:read",
    "submissions:write",
    "users:manage",
    "settings:manage",
  ]),
  EDITOR: new Set([
    "content:read",
    "content:write",
    "content:publish",
    "submissions:read",
    "submissions:write",
    "settings:manage",
  ]),
  REVIEWER: new Set(["content:read", "submissions:read", "submissions:write"]),
};

export function can(role: StaffRole, permission: string): boolean {
  return grants[role].has(permission as Permission);
}

export function requirePermission(
  role: StaffRole,
  permission: Permission,
): void {
  if (!can(role, permission)) throw new Error("FORBIDDEN");
}
