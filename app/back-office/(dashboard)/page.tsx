import { getDashboardStats } from "@/lib/repositories/public-content";

export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const stats = await getDashboardStats();
  const cards = [
    [stats.publishedPages, "Published pages"],
    [stats.openVacancies, "Open vacancies"],
    [stats.newMessages, "New messages"],
    [stats.newApplications, "New applications"],
  ] as const;
  return (
    <>
      <p className="eyebrow">Back office</p>
      <h1 className="mt-2 text-3xl font-black">Dashboard</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((x) => (
          <div className="card" key={x[1]}>
            <b className="text-3xl">{x[0]}</b>
            <p className="mt-2 text-sm text-slate-600">{x[1]}</p>
          </div>
        ))}
      </div>
    </>
  );
}
