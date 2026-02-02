"use client"

import { useEffect, useState } from "react"
// All server logic moved to API route

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const res = await fetch('/api/admin/users');
    const { data } = await res.json();
    setUsers(data || []);
  }

  async function toggleBan(user: any) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, banned: !user.banned }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👥 User Management</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.email}</td>

                <td className="p-3 text-center capitalize">
                  {u.role}
                </td>

                <td className="p-3 text-center">
                  {u.banned ? (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                      Banned
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                      Active
                    </span>
                  )}
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleBan(u)}
                    className={`px-3 py-1 rounded text-white ${
                      u.banned
                        ? "bg-green-600"
                        : "bg-red-600"
                    }`}
                  >
                    {u.banned ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
