import Link from "next/link";

export type DataTableRow = {
  id: string;
  title: string;
  meta: string;
  status: string;
  href?: string;
};

export function DataTable({
  rows,
  emptyLabel,
}: {
  rows: DataTableRow[];
  emptyLabel: string;
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-left">
        <thead className="border-b bg-slate-50 text-sm">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Details</th>
            <th className="p-4">Status</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b last:border-0" key={row.id}>
              <td className="p-4 font-semibold">{row.title}</td>
              <td className="p-4 text-sm text-slate-600">{row.meta}</td>
              <td className="p-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                  {row.status}
                </span>
              </td>
              <td className="p-4">
                {row.href ? (
                  <Link className="font-semibold text-blue-600" href={row.href}>
                    View
                  </Link>
                ) : (
                  <span className="text-slate-400">Listed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="p-10 text-center text-slate-500">{emptyLabel}</p>
      )}
    </div>
  );
}
