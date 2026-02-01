'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const options = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'km_asc', label: 'KM: Low to High' },
];

export default function SortDropdown({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('sort', e.target.value);
    sp.set('page', '1');
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <select className="input w-full sm:w-48" value={value} onChange={handleChange}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
