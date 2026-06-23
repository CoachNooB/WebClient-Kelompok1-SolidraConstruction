"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {Briefcase,FileText,Image as ImageIcon,Inbox,LayoutDashboard,Menu,Settings,Users,X} from "lucide-react";

const items=[["","Dashboard",LayoutDashboard],["pages","Pages",FileText],["investor-documents","Investor documents",FileText],["vacancies","Vacancies",Briefcase],["applications","Applications",Inbox],["messages","Messages",Inbox],["media","Media",ImageIcon],["navigation","Navigation",FileText],["footer","Footer",FileText],["settings","Settings",Settings],["users","Users",Users]] as const;
export function Sidebar(){
  const pathname=usePathname();const [open,setOpen]=useState(false);
  const navigation=<nav className="mt-8 grid gap-2">{items.map(([href,label,Icon])=>{const target=`/back-office/${href}`.replace(/\/$/,"");const active=pathname===target||Boolean(href&&pathname.startsWith(`${target}/`));return <Link onClick={()=>setOpen(false)} aria-current={active?"page":undefined} className={`flex min-h-11 items-center gap-3 rounded px-3 py-2 text-sm ${active?"bg-blue-600 text-white":"text-slate-300 hover:bg-slate-800 hover:text-white"}`} key={href} href={target}><Icon size={18}/>{label}</Link>})}</nav>;
  return <><div className="flex items-center justify-between bg-slate-950 p-4 text-white md:hidden"><Link href="/back-office" className="font-black"><span className="text-blue-500">SOLIDRA</span> CMS</Link><button aria-label="Toggle CMS navigation" className="grid min-h-11 min-w-11 place-items-center" onClick={()=>setOpen(value=>!value)}>{open?<X/>:<Menu/>}</button></div>{open&&<button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={()=>setOpen(false)}/>}<aside className={`${open?"translate-x-0":"-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 p-5 text-white transition-transform md:static md:min-h-screen md:w-auto md:translate-x-0`}><div className="flex items-center justify-between"><Link href="/back-office" className="text-lg font-black"><span className="text-blue-500">SOLIDRA</span> CMS</Link><button className="md:hidden" aria-label="Close navigation" onClick={()=>setOpen(false)}><X/></button></div>{navigation}</aside></>;
}
