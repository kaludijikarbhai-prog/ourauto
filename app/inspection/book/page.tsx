'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  bookInspection,
  getUserCarsForInspection,
  isSlotAvailable,
  TIME_SLOTS,
  INSPECTION_CITIES,
  getMinDate,
  getMaxDate,
} from '@/lib/inspection-booking';

export default function BookInspectionPage() {
  const router = useRouter();

  const [cars, setCars] = useState<
    Array<{ id: string; brand: string; model: string; year: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availabilityCheck, setAvailabilityCheck] = useState('');

  const [formData, setFormData] = useState({
    carId: '',
    city: '',
    date: '',
    timeSlot: '',
  });

  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    setLoading(true);
    const result = await getUserCarsForInspection();
    setCars(result);
    setLoading(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const checkAvailability = async () => {
    if (!formData.city || !formData.date || !formData.timeSlot) {
      setAvailabilityCheck('Please select city, date, and time slot');
      return;
    }

    setAvailabilityCheck('Checking availability...');
    const available = await isSlotAvailable(
      formData.city,
      formData.date,
      formData.timeSlot
    );

    if (available) {
      setAvailabilityCheck('✓ Slot is available');
      setAvailability((prev) => ({
        ...prev,
        [`${formData.city}-${formData.date}-${formData.timeSlot}`]: true,
      }));
    } else {
      setAvailabilityCheck('✗ Slot is not available, try another time');
      setAvailability((prev) => ({
        ...prev,
        [`${formData.city}-${formData.date}-${formData.timeSlot}`]: false,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.carId || !formData.city || !formData.date || !formData.timeSlot) {
      setError('Please fill in all fields');
      return;
    }

    // Check availability before booking
    const slotKey = `${formData.city}-${formData.date}-${formData.timeSlot}`;
    if (!availability[slotKey]) {
      setError('Please check slot availability first');
      return;
    }

    try {
      setSubmitting(true);
      const result = await bookInspection({
        car_id: formData.carId,
        city: formData.city,
        date: formData.date,
        time_slot: formData.timeSlot,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/my-inspections');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to book inspection'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="text-center">Loading your cars...</div>
      </main>
    );
  }

  if (cars.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 mb-4">
            You don't have any active car listings yet
          </p>
          <a
            href="/cars/new"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            List your first car →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book an Inspection</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Car Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Car *
            </label>
            <select
              name="carId"
              value={formData.carId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Choose a car</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.year} {car.brand} {car.model}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection City *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Choose a city</option>
              {INSPECTION_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {getMinDate()} to {getMaxDate()}
            </p>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Slot *
            </label>
            <select
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Choose a time slot</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Check Availability Button */}
          <button
            type="button"
            onClick={checkAvailability}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg"
          >
            Check Availability
          </button>

          {/* Availability Message */}
          {availabilityCheck && (
            <div
              className={`p-3 rounded-lg text-sm ${
                availabilityCheck.includes('✓')
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              }`}
            >
              {availabilityCheck}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg"
          >
            {submitting ? 'Booking...' : 'Book Inspection'}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-900 text-sm">
            <strong>Note:</strong> Inspections are available for 30 days in advance.
            Each time slot can accommodate up to 3 bookings per city per day.
          </p>
        </div>
      </div>
    </main>
  );
}
