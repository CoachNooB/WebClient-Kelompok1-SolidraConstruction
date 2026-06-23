import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  pageUrl,
}: {
  page: number;
  totalPages: number;
  pageUrl: (page: number) => string;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between"
    >
      <Link
        aria-disabled={page === 1}
        className={
          page === 1 ? "pointer-events-none text-slate-400" : "text-blue-600"
        }
        href={pageUrl(page - 1)}
      >
        Previous
      </Link>
      <span className="text-sm">
        Page {page} of {totalPages}
      </span>
      <Link
        aria-disabled={page >= totalPages}
        className={
          page >= totalPages
            ? "pointer-events-none text-slate-400"
            : "text-blue-600"
        }
        href={pageUrl(page + 1)}
      >
        Next
      </Link>
    </nav>
  );
}
