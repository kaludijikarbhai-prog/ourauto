type PriceInput = {
  year: number;
  km: number;
  fuel: string;
};

export function calculatePrice({ year, km, fuel }: PriceInput): number {
  const basePrice = 800000;
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const ageDepreciation = age * 50000;
  const kmDepreciation = (km / 10000) * 8000;
  let finalPrice = basePrice - ageDepreciation - kmDepreciation;

  if (fuel === "diesel") finalPrice += 15000;
  if (fuel === "electric") finalPrice += 30000;

  if (finalPrice < 50000) finalPrice = 50000;
  return Math.round(finalPrice);
}
