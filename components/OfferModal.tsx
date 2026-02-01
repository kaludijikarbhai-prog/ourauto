"use client";

"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  sellerId: string;
  buyerId: string;
  onOfferCreated?: () => void;
}

export default function OfferModal({
  isOpen,
  onClose,
  carId,
  sellerId,
  buyerId,
  onOfferCreated,
}: OfferModalProps) {
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.from("offers").insert([
      {
        car_id: carId,
        seller_id: sellerId,
        buyer_id: buyerId,
        offer_price: price,
      },
    ]);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setPrice(0);
      onClose();
      onOfferCreated && onOfferCreated();
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-900 p-8 text-left align-middle shadow-xl transition-all border border-gray-700">
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-white mb-4">
                  Make an Offer
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="number"
                    min={1}
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter offer price"
                  />
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit Offer"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
