import { Sidebar } from "@/components/back-office/sidebar";
import { LogoutButton } from "@/components/back-office/logout-button";
import { ReadOnlyBoundary } from "@/components/back-office/read-only-boundary";
import { getBackOfficeSessionOrRedirect } from "@/lib/auth/back-office";
import type { StaffRole } from "@/lib/auth/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getBackOfficeSessionOrRedirect();
  const role = session.user.role as StaffRole;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <Sidebar role={role} />
      <main className="p-5 md:p-10">
        <header className="mb-8 flex justify-between border-b pb-4 text-sm text-slate-600">
          <span>
            {session.user.name} · {session.user.role}
          </span>
          <LogoutButton />
        </header>
        {role === "REVIEWER" ? (
          <ReadOnlyBoundary>{children}</ReadOnlyBoundary>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
