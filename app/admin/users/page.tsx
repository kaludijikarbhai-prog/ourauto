"use client"

import { useEffect, useState } from "react"
import { getAllUsers, banUser, unbanUser } from "@/lib/admin-service"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await getAllUsers()
    setUsers(data || [])
  }

  async function toggleBan(user: any) {
    if (user.banned) {
      await unbanUser(user.id)
    } else {
      await banUser(user.id)
    }
    load()
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
