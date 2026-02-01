'use client';

import { useState } from 'react';
import { createCarListing, uploadCarImages } from '@/lib/user-service';
import { useRouter } from 'next/navigation';

export default function SellCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    km: 0,
    price: 0,
    city: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  const brands = ['Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Kia', 'Skoda', 'Volkswagen', 'Ford'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'year' || name === 'km' || name === 'price' ? parseInt(value) : value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create car listing
      const createResult = await createCarListing(formData);
      if (createResult.error) {
        setError(createResult.error);
        setLoading(false);
        return;
      }

      const carId = createResult.data?.id;
      if (!carId) {
        setError('Failed to create listing');
        setLoading(false);
        return;
      }

      // Upload images if any
      if (files.length > 0) {
        const uploadResult = await uploadCarImages(carId, files);
        if (uploadResult.error) {
          setError(`Car created but upload failed: ${uploadResult.error}`);
        }
      }

      setSuccess('Car listing created successfully!');
      setTimeout(() => {
        router.push('/my-listings');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sell Your Car</h1>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-6">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="title"
                placeholder="Car Title (e.g., Maruti Swift Petrol)"
                value={formData.title}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded"
                required
              />

              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded"
                required
              >
                <option value="">Select Brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="model"
                placeholder="Model (e.g., Swift)"
                value={formData.model}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded"
                required
              />

              <input
                type="number"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded"
                required
              />

              <input
                type="number"
                name="km"
                placeholder="Kilometers"
                value={formData.km}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded"
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price (₹)"
                value={formData.price}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded"
                required
              />

              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                className="px-4 py-2 border rounded"
                required
              />

              <input
                type="text"
                placeholder="Fuel Type"
                className="px-4 py-2 border rounded"
              />
            </div>
          </div>

          {/* Description */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <textarea
              name="description"
              placeholder="Describe your car (condition, features, service history, etc.)"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          {/* Images */}
          <div className="pb-6">
            <h2 className="text-lg font-semibold mb-4">Photos</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="text-gray-600 mb-4">
                  {files.length > 0 ? (
                    <div>
                      <p className="font-semibold">{files.length} image(s) selected</p>
                      <ul className="mt-2 text-sm">
                        {files.map((file, idx) => (
                          <li key={idx}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">Click to upload photos</p>
                      <p className="text-sm">or drag and drop</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-900 py-3 rounded font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
