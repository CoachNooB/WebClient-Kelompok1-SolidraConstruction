"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-md border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 shadow-sm hover:border-red-300 hover:bg-red-50 hover:shadow"
      onClick={async () => {
        await authClient.signOut();
        router.replace("/back-office/login");
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
