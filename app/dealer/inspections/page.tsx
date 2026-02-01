'use client'

import { useEffect, useState } from 'react'
import { getDealerInspections } from '@/lib/dealer'
import { getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Inspection {
  id: string
  car_id: string
  inspection_date: string
  inspection_time: string
  location: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
  car_title?: string
}

export default function InspectionsPage() {
  const router = useRouter()
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInspections = async () => {
      try {
        const user = await getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const data = await getDealerInspections()
        setInspections(data as Inspection[])
      } catch (error) {
        console.error('Error loading inspections:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInspections()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inspections</h1>
            <p className="text-gray-600 mt-2">Manage booking slots and track inspections</p>
          </div>
          <Link
            href="/inspection/book"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Book Inspection
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <StatBox
            label="Total"
            value={inspections.length}
            color="bg-blue-50 text-blue-600"
          />
          <StatBox
            label="Pending"
            value={inspections.filter((i) => i.status === 'pending').length}
            color="bg-yellow-50 text-yellow-600"
          />
          <StatBox
            label="Confirmed"
            value={inspections.filter((i) => i.status === 'confirmed').length}
            color="bg-purple-50 text-purple-600"
          />
          <StatBox
            label="Completed"
            value={inspections.filter((i) => i.status === 'completed').length}
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading inspections...</div>
          ) : inspections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No inspections yet</p>
              <Link href="/inspection/book" className="text-blue-600 hover:underline mt-2 inline-block">
                Book your first inspection
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Car
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((inspection) => (
                    <tr key={inspection.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {inspection.car_title || `Car #${inspection.car_id.slice(0, 8)}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(inspection.inspection_date).toLocaleDateString()} at{' '}
                        {inspection.inspection_time}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {inspection.location}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <StatusBadge status={inspection.status} />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:underline">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-lg p-4`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
