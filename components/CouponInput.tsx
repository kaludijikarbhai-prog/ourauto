"use client";
import { useState } from "react";
import { validateCoupon } from "@/lib/checkCoupon";

interface CouponInputProps {
  onValid: (code: string) => void;
  onInvalid: () => void;
}

export default function CouponInput({ onValid, onInvalid }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    const result = await validateCoupon(code.trim());
    setLoading(false);
    if (result.valid) {
      setSuccess(true);
      setError("");
      onValid(code.trim());
    } else {
      setSuccess(false);
      setError(result.message || "Invalid coupon code.");
      onInvalid();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter coupon code"
          value={code}
          onChange={e => setCode(e.target.value)}
          disabled={loading || success}
        />
        <button
          type="button"
          className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 ${success ? "bg-green-600 hover:bg-green-700" : ""}`}
          onClick={handleApply}
          disabled={loading || !code || success}
        >
          {loading ? "Checking..." : success ? "Applied" : "Apply"}
        </button>
      </div>
      {success && (
        <div className="text-green-600 text-sm font-medium">Coupon applied! Free listing unlocked.</div>
      )}
      {error && (
        <div className="text-red-600 text-sm font-medium">{error}</div>
      )}
    </div>
  );
}
