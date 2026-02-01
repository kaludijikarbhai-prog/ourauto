export default function BannedPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow text-center max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          🔒 Account Suspended
        </h1>
        <p className="text-gray-600">Your account has been suspended.</p>
        <p className="text-gray-500 text-sm mt-4">Please contact support for more information.</p>
      </div>
    </div>
  )
}
