"use client";

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { uploadDealerDocument, createDealerProfile } from "@/lib/dealer";

export default function DealerForm() {
  const [shopName, setShopName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!file) throw new Error("Document is required");
      const document_url = await uploadDealerDocument(file);
      await createDealerProfile({ shop_name: shopName, phone, city, document_url });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
      <div>
        <label className="block font-medium mb-1">Shop Name</label>
        <input type="text" className="input input-bordered w-full" value={shopName} onChange={e => setShopName(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Phone</label>
        <input type="tel" className="input input-bordered w-full" value={phone} onChange={e => setPhone(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">City</label>
        <input type="text" className="input input-bordered w-full" value={city} onChange={e => setCity(e.target.value)} required />
      </div>
      <div>
        <label className="block font-medium mb-1">Upload Document</label>
        <input type="file" accept="application/pdf,image/*" className="file-input w-full" onChange={e => setFile(e.target.files?.[0] || null)} required />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
