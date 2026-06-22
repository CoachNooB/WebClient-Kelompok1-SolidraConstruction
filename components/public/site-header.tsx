"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { type Locale, localizePath } from "@/lib/i18n";

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open,setOpen]=useState(false); const path=usePathname();
  const labels=locale==="id"?["Beranda","Tentang","Investor","Karier","Kontak"]:["Home","About","Investors","Careers","Contact"];
  const routes=["", "about","investors","careers","contact"];
  return <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur"><div className="container flex h-18 items-center justify-between">
    <Link href={`/${locale}`} className="text-xl font-black tracking-tight text-slate-900"><span className="text-blue-600">SOLIDRA</span> CONSTRUCTION</Link>
    <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">{routes.map((r,i)=><Link key={r} href={`/${locale}/${r}`.replace(/\/$/,"")} className="text-sm font-semibold text-slate-600 hover:text-blue-600">{labels[i]}</Link>)}<Link className="rounded border px-3 py-2 text-xs font-bold" href={localizePath(path,locale==="id"?"en":"id")}>{locale==="id"?"EN":"ID"}</Link></nav>
    <button aria-label="Toggle menu" className="min-h-11 min-w-11 md:hidden" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
  </div>{open&&<nav className="container grid gap-1 border-t py-3 md:hidden">{routes.map((r,i)=><Link onClick={()=>setOpen(false)} className="min-h-11 py-3 font-semibold" key={r} href={`/${locale}/${r}`.replace(/\/$/,"")}>{labels[i]}</Link>)}<Link href={localizePath(path,locale==="id"?"en":"id")} className="py-3 font-bold text-blue-600">{locale==="id"?"English":"Bahasa Indonesia"}</Link></nav>}</header>;
}
