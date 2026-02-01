
"use client";



"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";


interface OfferCardProps {
  offer: any;
  isSeller?: boolean;
  onStatusChange?: (status: string) => void;
}

export default function OfferCard({ offer, isSeller, onStatusChange }: OfferCardProps) {
  const [status, setStatus] = useState(offer.status);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const handleUpdate = async (newStatus: "accepted" | "rejected") => {
    setLoading(true);
    await supabase
      .from("offers")
      .update({ status: newStatus })
      .eq("id", offer.id);
    setStatus(newStatus);
    setLoading(false);
    onStatusChange && onStatusChange(newStatus);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="text-white font-semibold text-lg mb-1">{offer.car.title}</div>
        <div className="text-gray-400 text-sm mb-1">Buyer: {offer.buyer.full_name}</div>
        <div className="text-blue-400 font-bold text-xl mb-1">${offer.offer_price.toLocaleString()}</div>
        <div className={`text-sm font-medium ${status === "pending" ? "text-yellow-400" : status === "accepted" ? "text-green-400" : "text-red-400"}`}>Status: {status}</div>
      </div>
      {isSeller && status === "pending" && (
        <div className="flex gap-2">
          <button
            className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
            onClick={() => handleUpdate("accepted")}
            disabled={loading}
          >
            Accept
          </button>
          <button
            className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
            onClick={() => handleUpdate("rejected")}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
