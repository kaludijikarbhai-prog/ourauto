"use client"
import Link from "next/link"

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/dealers", label: "Dealers" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/users", label: "Users" },
]

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r p-5">
      <h2 className="text-xl font-bold mb-6">⚙ Admin Panel</h2>

      <nav className="space-y-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block p-2 rounded hover:bg-gray-100"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
