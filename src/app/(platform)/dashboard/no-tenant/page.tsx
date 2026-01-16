export default function NoTenantPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Account Not Configured</h1>
        <p className="mt-2 text-gray-600">
          Your account is not associated with a wedding site.
        </p>
        <p className="mt-1 text-gray-600">
          Please contact the platform administrator.
        </p>
      </div>
    </div>
  )
}
