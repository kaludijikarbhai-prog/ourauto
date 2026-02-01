'use client';

import { useEffect, useState } from 'react';
import {
  getUserInspections,
  updateInspectionStatus,
  cancelInspection,
  InspectionBooking,
} from '@/lib/inspection-booking';

interface InspectionWithCar extends InspectionBooking {
  brand: string;
  model: string;
  year: number;
}

export default function MyInspectionsPage() {
  const [inspections, setInspections] = useState<InspectionWithCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    const result = await getUserInspections();
    setInspections(result);
    setLoading(false);
  };

  const handleStatusChange = async (
    inspectionId: string,
    newStatus: 'pending' | 'confirmed' | 'completed'
  ) => {
    const result = await updateInspectionStatus(inspectionId, newStatus);
    if (result.error) {
      setError(result.error);
    } else {
      await loadInspections();
    }
  };

  const handleCancel = async (inspectionId: string) => {
    if (!confirm('Are you sure you want to cancel this inspection?')) return;

    const result = await cancelInspection(inspectionId);
    if (result.error) {
      setError(result.error);
    } else {
      await loadInspections();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="text-center">Loading inspections...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Inspections</h1>
            <p className="text-gray-600">
              Total: {inspections.length} inspection
              {inspections.length !== 1 ? 's' : ''}
            </p>
          </div>
          <a
            href="/inspection/book"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            + Book New Inspection
          </a>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {inspections.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-600 text-lg mb-4">No inspections booked yet</p>
            <a
              href="/inspection/book"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Book your first inspection →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {inspections.map((inspection) => (
              <div
                key={inspection.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                {/* Row 1: Car + Status */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {inspection.year} {inspection.brand} {inspection.model}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      ID: {inspection.id.substring(0, 8)}...
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                      inspection.status
                    )}`}
                  >
                    {inspection.status}
                  </span>
                </div>

                {/* Row 2: Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      City
                    </p>
                    <p className="text-gray-900">{inspection.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Date
                    </p>
                    <p className="text-gray-900">
                      {formatDate(inspection.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Time
                    </p>
                    <p className="text-gray-900">{inspection.time_slot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">
                      Booked
                    </p>
                    <p className="text-gray-900">
                      {formatDate(inspection.created_at)}
                    </p>
                  </div>
                </div>

                {/* Row 3: Actions */}
                <div className="flex gap-2 flex-wrap">
                  {inspection.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(inspection.id, 'confirmed')}
                        className="text-green-600 hover:text-green-700 font-semibold text-sm"
                      >
                        Mark Confirmed
                      </button>
                      <span className="text-gray-300">|</span>
                    </>
                  )}

                  {inspection.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(inspection.id, 'completed')}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        Mark Completed
                      </button>
                      <span className="text-gray-300">|</span>
                    </>
                  )}

                  {(inspection.status === 'pending' ||
                    inspection.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(inspection.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
