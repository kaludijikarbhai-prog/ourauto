"use client";

"use client";
import { useState } from "react";
import { approveDealer, rejectDealer } from "@/lib/admin-service";
import VerifiedBadge from "@/components/VerifiedBadge";

interface DealerCardProps {
  dealer: any;
  adminView?: boolean;
}

export default function DealerCard({ dealer, adminView }: DealerCardProps) {
  const [status, setStatus] = useState(dealer.status);
  const [verified, setVerified] = useState(dealer.verified);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await approveDealer(dealer.id);
    setStatus("approved");
    setVerified(true);
    setLoading(false);
  };
  const handleReject = async () => {
    setLoading(true);
    await rejectDealer(dealer.id);
    setStatus("rejected");
    setVerified(false);
    setLoading(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{dealer.shop_name}</span>
          {verified && <VerifiedBadge />}
        </div>
        <div className="text-gray-600 text-sm">{dealer.city}</div>
        <div className="text-gray-600 text-sm">{dealer.phone}</div>
        <div className="text-xs mt-1">Status: <span className={status === "approved" ? "text-green-600" : status === "rejected" ? "text-red-600" : "text-yellow-600"}>{status}</span></div>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <a href={dealer.document_url} target="_blank" rel="noopener" className="btn btn-sm btn-outline mb-2">View Document</a>
        {adminView && status === "pending" && (
          <div className="flex gap-2">
            <button className="btn btn-success btn-sm" onClick={handleApprove} disabled={loading}>Approve</button>
            <button className="btn btn-error btn-sm" onClick={handleReject} disabled={loading}>Reject</button>
          </div>
        )}
        {verified && <span className="text-xs text-blue-600 font-semibold">Verified Dealer</span>}
      </div>
    </div>
  );
}
