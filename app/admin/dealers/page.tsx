"use client"

import { useEffect, useState } from "react"

type Dealer = {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  verified: boolean | null
}

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)

  // 🔥 fetch dealers from API
  useEffect(() => {
    fetch("/api/admin/dealers")
      .then(res => res.json())
      .then(data => {
        setDealers(data)
        setLoading(false)
      })
  }, [])

  // 🔥 verify dealer
  async function verifyDealer(id: string) {
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
        verified: true,
      }),
    })

    // refresh list
    setDealers(prev =>
      prev.map(d =>
        d.id === id ? { ...d, verified: true } : d
      )
    )
  }

  if (loading) return <p className="p-6">Loading dealers...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dealer Verification</h1>

      <div className="space-y-3">
        {dealers.map(d => (
          <div
            key={d.id}
            className="flex justify-between items-center border rounded p-3"
          >
            <div>
              <p className="font-semibold">{d.full_name}</p>
              <p className="text-sm text-gray-500">{d.email}</p>
              <p className="text-sm text-gray-500">{d.phone}</p>
            </div>

            {d.verified ? (
              <span className="text-green-600 font-semibold">
                Verified ✓
              </span>
            ) : (
              <button
                onClick={() => verifyDealer(d.id)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Verify
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
