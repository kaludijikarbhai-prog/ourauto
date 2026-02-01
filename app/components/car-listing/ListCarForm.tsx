'use client';

import { useState } from 'react';
import {
  createCarListing,
  uploadCarPhoto,
  uploadRcDocument,
  CAR_BRANDS,
  FUEL_TYPES,
  TRANSMISSIONS,
  POPULAR_CITIES,
} from '@/lib/car-listing';
import { useRouter } from 'next/navigation';

export default function ListCarForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    km: 0,
    owners: 1,
    transmission: 'manual' as const,
    fuelType: 'petrol' as const,
    price: 0,
    city: '',
    description: '',
    phoneNumber: '',
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [rcDoc, setRcDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'km' || name === 'year' || name === 'price'
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleRcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setRcDoc(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUploadProgress('');

    // Validation
    if (
      !formData.brand ||
      !formData.model ||
      !formData.city ||
      !formData.phoneNumber
    ) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }

    try {
      setLoading(true);

      // Create temporary car ID for photo/doc upload
      const tempCarId = `car_${Date.now()}`;

      // Upload photos
      setUploadProgress('Uploading photos...');
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const result = await uploadCarPhoto(tempCarId, photo);
        if (result.error) {
          throw new Error(`Photo upload failed: ${result.error}`);
        }
        photoUrls.push(result.url);
      }

      // Upload RC document if provided
      let rcDocUrl: string | undefined;
      if (rcDoc) {
        setUploadProgress('Uploading RC document...');
        const result = await uploadRcDocument(tempCarId, rcDoc);
        if (result.error) {
          throw new Error(`RC upload failed: ${result.error}`);
        }
        rcDocUrl = result.url;
      }

      // Create listing in database
      setUploadProgress('Creating listing...');
      const result = await createCarListing(formData, photoUrls, rcDocUrl);

      if (result.error) {
        throw new Error(result.error);
      }

      // Success
      setUploadProgress('');
      router.push(`/cars/${result.car?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Car Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Car Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            >
              <option value="">Select brand</option>
              {CAR_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              placeholder="e.g., Fortuner"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              min="1990"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>

          {/* KM Driven */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KM Driven
            </label>
            <input
              type="number"
              name="km"
              value={formData.km}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Owners */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Owners
            </label>
            <input
              type="number"
              name="owners"
              value={formData.owners}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <select
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            >
              <option value="">Select city</option>
              {POPULAR_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="10-digit number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Condition, features, maintenance history, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Car Photos
        </h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        {photos.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {photos.length} photo(s) selected
          </p>
        )}
      </div>

      {/* RC Document */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          RC Document (Optional)
        </h3>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleRcChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        {rcDoc && (
          <p className="mt-2 text-sm text-gray-600">RC document selected</p>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {uploadProgress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">{uploadProgress}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg"
      >
        {loading ? 'Publishing...' : 'Publish Listing'}
      </button>
    </form>
  );
}
