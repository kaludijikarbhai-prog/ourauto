"use client"

import { useEffect, useState } from "react"
import { getDealers, approveDealer } from "@/lib/admin-service"

export default function DealersPage() {
  const [dealers, setDealers] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await getDealers()
    setDealers(data || [])
  }

  async function approve(id: string) {
    await approveDealer(id)
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">🚗 Dealers</h1>

      {dealers.map((d) => (
        <div
          key={d.id}
          className="flex justify-between bg-white p-4 rounded shadow mb-3"
        >
          <span>{d.email}</span>

          {!d.approved && (
            <button
              onClick={() => approve(d.id)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Approve
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
