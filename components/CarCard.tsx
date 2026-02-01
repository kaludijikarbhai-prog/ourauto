import Link from 'next/link';
import Image from 'next/image';
import VerifiedBadge from '@/components/VerifiedBadge';

type Car = {
  id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  seller_name: string;
  dealer_verified: boolean;
};

export default function CarCard({ car }: { car: Car }) {
  return (
    <Link href={`/cars/${car.id}`} className="block border rounded-lg overflow-hidden hover:shadow-lg transition">
      <Image src={car.images[0]} alt={car.title} width={400} height={300} className="w-full h-48 object-cover" />
      <div className="p-4">
        <div className="font-bold text-lg mb-1">{car.title}</div>
        <div className="text-blue-600 font-semibold mb-1">₹{car.price.toLocaleString()}</div>
        <div className="text-gray-500">{car.city}</div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{car.seller_name}</span>
          {car.dealer_verified && <VerifiedBadge />}
        </div>
      </div>
    </Link>
  );
}
