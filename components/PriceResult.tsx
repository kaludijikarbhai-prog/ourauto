export default function PriceResult({ price }: { price: number }) {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-gray-900 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-blue-800">
      <div className="text-gray-400 text-lg mb-2 font-medium">Estimated Value</div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-3">
        ₹ {price.toLocaleString("en-IN")}
      </div>
      <div className="text-blue-400 text-base font-semibold mb-1">Based on market data</div>
    </div>
  );
}
