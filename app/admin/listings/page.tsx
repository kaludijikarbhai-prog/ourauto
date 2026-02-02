"use client"

import { useEffect, useState } from "react"

export default function ListingsPage() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/listings")
      .then(res => res.json())
      .then(data => {
        setCars(data)
        setLoading(false)
      })
  }, [])

  async function approve(id: string) {
    await fetch("/api/admin/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })

    setCars(prev =>
      prev.map(c => c.id === id ? { ...c, status: "approved" } : c)
    )
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-6 space-y-3">
      {cars.map(c => (
        <div key={c.id} className="border p-3 flex justify-between">
          <div>
            <p>{c.brand} {c.model}</p>
            <p className="text-sm text-gray-500">{c.city}</p>
          </div>

          {c.status !== "approved" && (
            <button
              onClick={() => approve(c.id)}
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
