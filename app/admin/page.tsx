"use client"

import { useEffect, useState } from "react"
import { getStats } from "@/lib/admin-service"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const s = await getStats()
    setStats(s)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <Card title="Users" value={stats.users} />
        <Card title="Cars" value={stats.cars} />
        <Card title="Dealers" value={stats.dealers} />
      </div>
    </div>
  )
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold">{value || 0}</h2>
    </div>
  )
}
