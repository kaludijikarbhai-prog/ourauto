export default function StatCard({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  )
}
