"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
export function LogoutButton(){const router=useRouter();return <button className="text-sm font-semibold text-red-600" onClick={async()=>{await authClient.signOut();router.replace("/back-office/login");router.refresh()}}>Logout</button>}
