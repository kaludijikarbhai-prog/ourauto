'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type Option = { value: string; label: string };
type FilterOptions = {
  brands: Option[];
  cities: Option[];
  fuels: Option[];
  yearMin: number;
  yearMax: number;
  priceMin: number;
  priceMax: number;
};

type Props = {
  filterOptions: FilterOptions;
  params: any;
};

export default function Filters({ filterOptions, params }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [brand, setBrand] = useState(params.brand || '');
  const [city, setCity] = useState(params.city || '');
  const [fuel, setFuel] = useState(params.fuel || '');
  const [min, setMin] = useState(params.min || '');
  const [max, setMax] = useState(params.max || '');
  const [yearMin, setYearMin] = useState(params.yearMin || filterOptions.yearMin);
  const [yearMax, setYearMax] = useState(params.yearMax || filterOptions.yearMax);

  const update = (key: string, value: string | number) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === '' || value === 0) sp.delete(key);
    else sp.set(key, String(value));
    sp.set('page', '1');
    router.push(`${pathname}?${sp.toString()}`);
  };

  const reset = () => {
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4 sticky top-4">
      <div>
        <label className="block font-semibold mb-1">Brand</label>
        <select className="input w-full" value={brand} onChange={e => { setBrand(e.target.value); update('brand', e.target.value); }}>
          <option value="">All</option>
          {filterOptions.brands.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">City</label>
        <select className="input w-full" value={city} onChange={e => { setCity(e.target.value); update('city', e.target.value); }}>
          <option value="">All</option>
          {filterOptions.cities.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Fuel</label>
        <select className="input w-full" value={fuel} onChange={e => { setFuel(e.target.value); update('fuel', e.target.value); }}>
          <option value="">All</option>
          {filterOptions.fuels.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Min Price</label>
          <input type="number" className="input w-full" value={min} min={filterOptions.priceMin} max={filterOptions.priceMax} onChange={e => { setMin(e.target.value); update('min', e.target.value); }} />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Max Price</label>
          <input type="number" className="input w-full" value={max} min={filterOptions.priceMin} max={filterOptions.priceMax} onChange={e => { setMax(e.target.value); update('max', e.target.value); }} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Year Min</label>
          <input type="number" className="input w-full" value={yearMin} min={filterOptions.yearMin} max={filterOptions.yearMax} onChange={e => { setYearMin(Number(e.target.value)); update('yearMin', e.target.value); }} />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Year Max</label>
          <input type="number" className="input w-full" value={yearMax} min={filterOptions.yearMin} max={filterOptions.yearMax} onChange={e => { setYearMax(Number(e.target.value)); update('yearMax', e.target.value); }} />
        </div>
      </div>
      <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded w-full mt-2" onClick={reset}>Reset Filters</button>
    </div>
  );
}
