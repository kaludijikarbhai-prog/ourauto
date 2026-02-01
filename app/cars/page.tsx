import { getFilteredCars, getFilterOptions } from '@/lib/supabaseClient';
import CarGrid from '@/components/CarGrid';
import Filters from '@/components/Filters';
import SearchBar from '@/components/SearchBar';
import SortDropdown from '@/components/SortDropdown';
import Pagination from '@/components/Pagination';
import { Suspense } from 'react';

function getQueryParams(searchParams: Record<string, string | string[] | undefined>) {
  return {
    page: Number(searchParams.page) || 1,
    search: typeof searchParams.search === 'string' ? searchParams.search : '',
    brand: typeof searchParams.brand === 'string' ? searchParams.brand : '',
    city: typeof searchParams.city === 'string' ? searchParams.city : '',
    fuel: typeof searchParams.fuel === 'string' ? searchParams.fuel : '',
    min: Number(searchParams.min) || 0,
    max: Number(searchParams.max) || 0,
    yearMin: Number(searchParams.yearMin) || 0,
    yearMax: Number(searchParams.yearMax) || 0,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : 'newest',
  };
}

export default async function CarsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const params = getQueryParams(searchParams);
  const { cars, total } = await getFilteredCars(params);
  const filterOptions = await getFilterOptions();
  const perPage = 12;
  return (
    <main className="max-w-7xl mx-auto py-8 px-2 md:px-0">
      <h1 className="text-3xl font-bold mb-6">Cars for Sale</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-64 w-full">
          <Suspense fallback={<div>Loading filters...</div>}>
            <Filters filterOptions={filterOptions} params={params} />
          </Suspense>
        </aside>
        <section className="flex-1">
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
            <SearchBar initialValue={params.search} />
            <SortDropdown value={params.sort} />
          </div>
          <CarGrid cars={cars} />
          <Pagination total={total} page={params.page} perPage={perPage} />
        </section>
      </div>
    </main>
  );
}
