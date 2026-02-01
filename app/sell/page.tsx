
'use client';

import CarForm from '@/components/CarForm';

export default function SellCarPage() {
  // You may want to get userId from auth context or session
  const userId = "user-id-from-auth";
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Sell Your Car</h1>
      <CarForm userId={userId} seller={{ name: "", dealer_verified: false }} />
    </div>
  );
}
