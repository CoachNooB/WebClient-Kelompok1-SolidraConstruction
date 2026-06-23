export function TableFilters({ q, status, statuses }: { q?: string; status?: string; statuses: string[] }) {
  return <form className="mt-6 flex flex-wrap gap-3">
    <input name="q" defaultValue={q} placeholder="Search" className="min-h-11 rounded border px-3"/>
    <select name="status" defaultValue={status} className="min-h-11 rounded border px-3"><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select>
    <button className="btn btn-primary">Filter</button>
  </form>;
}
