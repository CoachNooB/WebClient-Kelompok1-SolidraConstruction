import { notFound } from "next/navigation"; import { isLocale } from "@/lib/i18n"; import { SiteHeader } from "@/components/public/site-header"; import { SiteFooter } from "@/components/public/site-footer";
export function generateStaticParams(){return [{locale:"id"},{locale:"en"}]}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <><SiteHeader locale={locale}/><main>{children}</main><SiteFooter locale={locale}/></>}
