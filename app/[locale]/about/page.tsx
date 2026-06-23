import {notFound} from "next/navigation";import {DatabasePage} from "@/components/public/database-page";import {isLocale} from "@/lib/i18n";
export default async function About({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <DatabasePage pageKey="about" locale={locale}/>}
