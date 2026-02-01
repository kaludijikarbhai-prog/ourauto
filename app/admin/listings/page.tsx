"use client"

import { useEffect, useState } from "react"
import { getAllListings, deleteListing } from "@/lib/admin-service"

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await getAllListings()
    setListings(data || [])
  }

  async function remove(id: string) {
    await deleteListing(id)
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">📦 Listings</h1>

      {listings.map((c) => (
        <div
          key={c.id}
          className="flex justify-between bg-white p-4 rounded shadow mb-3"
        >
          <span>{c.brand} {c.model}</span>

          <button
            onClick={() => remove(c.id)}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
