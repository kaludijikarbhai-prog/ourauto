import CarCard from './CarCard';

type Car = {
  id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  seller_name: string;
  dealer_verified: boolean;
};

export default function CarGrid({ cars }: { cars: Car[] }) {
  if (!cars.length) return <div className="text-center text-gray-500 py-12">No cars found.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {cars.map(car => (
        <CarCard
          key={car.id}
          car={{
            ...car,
            seller_name: car.seller_name ?? '',
            dealer_verified: car.dealer_verified ?? false,
          }}
        />
      ))}
    </div>
  );
}
