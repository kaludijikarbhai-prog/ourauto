"use client"

import { useEffect, useState } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(setStats)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="space-y-2">
        <p>Total Cars: {stats.cars}</p>
        <p>Total Users: {stats.users}</p>
      </div>
    </div>
  )
}


