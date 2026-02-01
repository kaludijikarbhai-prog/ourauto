'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchBar({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue || '');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handler = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value) sp.set('search', value);
      else sp.delete('search');
      sp.set('page', '1');
      router.push(`${pathname}?${sp.toString()}`);
    }, 400);
    return () => clearTimeout(handler);
  }, [value]);

  return (
    <input
      className="input w-full sm:w-64"
      type="text"
      placeholder="Search title, brand, model..."
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
}
