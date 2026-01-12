import Link from "next/link";

export default function JobNotFound() {
  return (
    <div className="text-center py-12">
      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-500 mb-6">
          The job you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link
          href="/jobs"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Jobs
        </Link>
      </div>
    </div>
  );
}
