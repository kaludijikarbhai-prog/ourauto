"use client";
import { useState } from "react";
import ValuationForm from "../../components/ValuationForm";
import PriceResult from "../../components/PriceResult";

export default function ValuationPage() {
  const [price, setPrice] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 py-12">
      <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 text-center">Check Your Car Value</h1>
      <div className="w-full max-w-md">
        <ValuationForm
          onResult={(_data, price) => {
            setPrice(price);
          }}
        />
        {price !== null && (
          <div className="mt-8">
            <PriceResult price={price} />
          </div>
        )}
      </div>
    </div>
  );
}
