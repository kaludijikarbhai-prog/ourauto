"use client";

"use client";
import { useState } from "react";
import { calculatePrice } from "../lib/priceCalculator";

const brands = [
  "Maruti Suzuki",
  "Hyundai",
  "Honda",
  "Tata",
  "Mahindra",
  "Toyota",
  "Kia",
  "Volkswagen",
  "Renault",
  "Ford",
];

const fuelTypes = ["petrol", "diesel", "electric", "cng", "lpg"];
const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Pune",
  "Hyderabad",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 21 }, (_, i) => currentYear - i);

export default function ValuationForm({ onResult }: { onResult: (data: any, price: number) => void }) {
  const [form, setForm] = useState({
    brand: brands[0],
    model: "",
    year: years[0],
    km: "",
    fuel: fuelTypes[0],
    city: cities[0],
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const price = calculatePrice({
      year: Number(form.year),
      km: Number(form.km),
      fuel: form.fuel,
    });
    setLoading(false);
    onResult(form, price);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col gap-6 border border-gray-800"
    >
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">Brand</label>
        <select
          name="brand"
          value={form.brand}
          onChange={handleChange}
          className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">Model</label>
        <input
          name="model"
          value={form.model}
          onChange={handleChange}
          className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">Year</label>
        <select
          name="year"
          value={form.year}
          onChange={handleChange}
          className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">KM Driven</label>
        <input
          name="km"
          type="number"
          min="0"
          value={form.km}
          onChange={handleChange}
          className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">Fuel Type</label>
        <select
          name="fuel"
          value={form.fuel}
          onChange={handleChange}
          className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
          {fuelTypes.map((f) => (
            <option key={f} value={f}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-gray-300 font-medium">City</label>
        <select
          name="city"
          value={form.city}
          onChange={handleChange}
          className="bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200 shadow-md disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Calculating..." : "Get Price"}
      </button>
    </form>
  );
}
