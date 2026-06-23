import type { Metadata } from "next";
export const metadata: Metadata = { title: "Back Office | Solidra" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
