import { notFound } from "next/navigation";
import { PageHero } from "@/components/public/page-hero";
import { SectionRenderer } from "@/components/public/section-renderer";
import { getPublishedPage } from "@/lib/repositories/public-content";

export async function DatabasePage({pageKey,locale}:{pageKey:string;locale:"id"|"en"}){
  const page=await getPublishedPage(pageKey,locale.toUpperCase() as "ID"|"EN"); if(!page) notFound();
  const hero=page.sections.find(section=>section.type==="HERO");
  return <>{<PageHero eyebrow={hero?.heading??page.title} title={hero?.heading??page.title} description={hero?.body??page.description} cta={hero?.ctaLabel??undefined} href={hero?.ctaUrl?`/${locale}${hero.ctaUrl}`:undefined}/>} {page.sections.map(section=><SectionRenderer key={section.id} section={section} locale={locale}/>)}</>;
}
