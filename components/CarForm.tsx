'use client';


"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';
import CouponInput from './CouponInput';
import { insertCar } from '@/lib/supabaseClient';
import { incrementCouponUsage } from '@/lib/checkCoupon';
import VerifiedBadge from '@/components/VerifiedBadge';

type CarFormProps = {
  userId: string;
  car?: any;
  seller: {
    name: string;
    dealer_verified: boolean;
  };
};

export default function CarForm({ userId, car, seller }: CarFormProps) {
  const [form, setForm] = useState({
    title: car?.title || '',
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || '',
    price: car?.price || '',
    km: car?.km || '',
    fuel: car?.fuel || '',
    city: car?.city || '',
    description: car?.description || '',
    images: car?.images || [],
  });
  const [uploading, setUploading] = useState(false);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponValid, setCouponValid] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (images: string[]) => {
    setForm({ ...form, images });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponValid || !coupon) return;
    setUploading(true);
    await insertCar({ ...form, user_id: userId });
    await incrementCouponUsage(coupon);
    setUploading(false);
    router.push('/dashboard/my-cars');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CouponInput
        onValid={code => {
          setCoupon(code);
          setCouponValid(true);
        }}
        onInvalid={() => {
          setCoupon(null);
          setCouponValid(false);
        }}
      />
      <input name="title" value={form.title} onChange={handleChange} required placeholder="Title" className="input" />
      <input name="brand" value={form.brand} onChange={handleChange} required placeholder="Brand" className="input" />
      <input name="model" value={form.model} onChange={handleChange} required placeholder="Model" className="input" />
      <input name="year" value={form.year} onChange={handleChange} required placeholder="Year" type="number" className="input" />
      <input name="price" value={form.price} onChange={handleChange} required placeholder="Price" type="number" className="input" />
      <input name="km" value={form.km} onChange={handleChange} required placeholder="Kilometers" type="number" className="input" />
      <input name="fuel" value={form.fuel} onChange={handleChange} required placeholder="Fuel" className="input" />
      <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="input" />
      <textarea name="description" value={form.description} onChange={handleChange} required placeholder="Description" className="input" />
      <ImageUpload onChange={handleImages} value={form.images} />
      <div className="flex items-center gap-2">
        <span className="font-semibold">{seller.name}</span>
        {seller.dealer_verified && <VerifiedBadge />}
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={uploading || !couponValid}>{uploading ? 'Submitting...' : 'Submit'}</button>
    </form>
  );
}
