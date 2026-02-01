import { getUserCars, deleteCar } from '@/lib/supabaseClient';
import type { Car } from '@/lib/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function MyCarsPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookies() }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const cars: Car[] = await getUserCars(user.id);
  return (
    <main className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Listings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cars.map((car: Car) => (
          <div key={car.id} className="border rounded-lg p-4 flex flex-col gap-2">
            <div className="font-bold text-lg">{car.title}</div>
            <div>₹{car.price.toLocaleString()}</div>
            <div>{car.brand} {car.model} ({car.year})</div>
            <div>{car.km} km • {car.fuel}</div>
            <div>{car.city}</div>
            <div className="flex gap-2 mt-2">
              <Link href={`/cars/${car.id}`} className="bg-blue-600 text-white px-3 py-1 rounded">View</Link>
              <Link href={`/dashboard/my-cars/edit/${car.id}`} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</Link>
              <form action={async () => { await deleteCar(car.id, user.id); }} method="post">
                <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
