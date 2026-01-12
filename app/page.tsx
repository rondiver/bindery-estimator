import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/quotes"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300"
        >
          <h3 className="text-lg font-medium">Quotes</h3>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage quotes
          </p>
        </Link>
        <Link
          href="/jobs"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300"
        >
          <h3 className="text-lg font-medium">Jobs</h3>
          <p className="text-gray-500 text-sm mt-1">
            Track job progress
          </p>
        </Link>
        <Link
          href="/customers"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300"
        >
          <h3 className="text-lg font-medium">Customers</h3>
          <p className="text-gray-500 text-sm mt-1">
            Manage customer records
          </p>
        </Link>
      </div>
    </div>
  );
}
