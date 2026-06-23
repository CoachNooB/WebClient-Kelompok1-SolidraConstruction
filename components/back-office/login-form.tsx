"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(data.get("email")),
      password: String(data.get("password")),
    });
    setPending(false);
    if (result.error)
      return setError("Invalid credentials or inactive account.");
    router.replace("/back-office");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-8">
      <div className="text-xl font-black">
        <span className="text-blue-600">SOLIDRA</span> CMS
      </div>
      <h1 className="mt-8 text-2xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">Authorized staff only.</p>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <label className="mt-6 grid gap-2 font-semibold">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-11 rounded border px-3"
        />
      </label>
      <label className="mt-4 grid gap-2 font-semibold">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-11 rounded border px-3"
        />
      </label>
      <button disabled={pending} className="btn btn-primary mt-6 w-full">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
