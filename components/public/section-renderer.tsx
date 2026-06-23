import Link from "next/link";
import type { SectionDto } from "@/lib/repositories/public-content";

type Item = { title?: string; value?: string; description?: string; label?: string; url?: string };
function items(config: unknown): Item[] { if (!config || typeof config !== "object" || Array.isArray(config)) return []; const value=(config as {items?:unknown}).items; return Array.isArray(value)?value.filter((item):item is Item=>Boolean(item)&&typeof item==="object"):[]; }

export function SectionRenderer({section,locale}:{section:SectionDto;locale:"id"|"en"}) {
  const cards=items(section.config);
  if(section.type==="HERO") return null;
  if(["METRICS","SERVICES","PROJECTS","TIMELINE","VALUES","LEADERSHIP","CERTIFICATIONS","FINANCIALS","DOCUMENTS","GOVERNANCE","OFFICES","BENEFITS","PROCESS","VACANCIES"].includes(section.type)) return <section className="section"><div className="container">{section.heading&&<h2 className="text-3xl font-black">{section.heading}</h2>}{section.body&&<p className="mt-4 max-w-3xl leading-8 text-slate-600">{section.body}</p>}<div className="mt-8 grid gap-5 md:grid-cols-3">{cards.map((item,index)=><article className="card" key={`${item.title??item.label}-${index}`}>{item.value&&<b className="text-4xl text-blue-600">{item.value}</b>}<h3 className="mt-2 text-xl font-bold">{item.title??item.label}</h3>{item.description&&<p className="mt-3 leading-7 text-slate-600">{item.description}</p>}{item.url&&<Link className="mt-4 inline-block font-semibold text-blue-600" href={item.url.startsWith("/")?`/${locale}${item.url}`:item.url}>{locale==="id"?"Selengkapnya":"Learn more"}</Link>}</article>)}</div></div></section>;
  if(section.type==="CTA") return <section className="bg-blue-600 py-16 text-white"><div className="container flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><h2 className="text-3xl font-black">{section.heading}</h2>{section.body&&<p className="mt-3">{section.body}</p>}</div>{section.ctaLabel&&section.ctaUrl&&<Link className="btn bg-white text-blue-700" href={`/${locale}${section.ctaUrl}`}>{section.ctaLabel}</Link>}</div></section>;
  return <section className="section"><div className="container">{section.heading&&<h2 className="text-3xl font-black">{section.heading}</h2>}{section.body&&<div className="mt-4 whitespace-pre-line leading-8 text-slate-600">{section.body}</div>}</div></section>;
}
