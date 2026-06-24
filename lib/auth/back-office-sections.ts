import type { Permission, StaffRole } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/permissions";

export type BackOfficeSection =
  | "pages"
  | "section-cards"
  | "investor-documents"
  | "vacancies"
  | "applications"
  | "messages"
  | "media"
  | "navigation"
  | "footer"
  | "settings"
  | "users";

export const backOfficeSections: BackOfficeSection[] = [
  "pages",
  "section-cards",
  "investor-documents",
  "vacancies",
  "applications",
  "messages",
  "media",
  "navigation",
  "footer",
  "settings",
  "users",
];

const sectionPermissions: Record<BackOfficeSection, Permission> = {
  pages: "content:read",
  "section-cards": "content:read",
  "investor-documents": "content:read",
  vacancies: "content:read",
  applications: "submissions:read",
  messages: "submissions:read",
  media: "content:read",
  navigation: "settings:manage",
  footer: "settings:manage",
  settings: "settings:manage",
  users: "users:manage",
};

export function isBackOfficeSection(value: string): value is BackOfficeSection {
  return backOfficeSections.includes(value as BackOfficeSection);
}

export function canAccessBackOfficeSection(
  role: StaffRole,
  section: BackOfficeSection,
) {
  return can(role, sectionPermissions[section]);
}
