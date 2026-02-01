import { Metadata } from 'next';
import ListCarForm from '@/app/components/car-listing/ListCarForm';

export const metadata: Metadata = {
  title: 'List Your Car | OurAuto',
  description: 'List your car for sale on OurAuto marketplace',
};

export default function ListCarPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Car</h1>
        <p className="text-gray-600 mb-8">
          Fill in the details below to list your car for sale
        </p>

        <ListCarForm />
      </div>
    </main>
  );
}
