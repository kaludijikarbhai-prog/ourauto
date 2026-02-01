'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function Pagination({ total, page, perPage }: { total: number; page: number; perPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(p));
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="flex gap-2 justify-center mt-8">
      <button className="px-3 py-1 rounded bg-gray-200" disabled={page <= 1} onClick={() => goTo(page - 1)}>Prev</button>
      <span className="px-3 py-1">Page {page} of {totalPages}</span>
      <button className="px-3 py-1 rounded bg-gray-200" disabled={page >= totalPages} onClick={() => goTo(page + 1)}>Next</button>
    </div>
  );
}
