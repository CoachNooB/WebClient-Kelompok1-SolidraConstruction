import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/back-office/sidebar";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/back-office/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user.active) redirect("/back-office/login");
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <Sidebar />
      <main className="p-5 md:p-10">
        <header className="mb-8 flex justify-between border-b pb-4 text-sm text-slate-600">
          <span>
            {session.user.name} · {session.user.role}
          </span>
          <LogoutButton />
        </header>
        {children}
      </main>
    </div>
  );
}
