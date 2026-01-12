import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "../../actions/jobs";
import { getQuote } from "../../actions/quotes";
import { getCustomer } from "../../actions/customers";
import { getRunListItemByJobId } from "../../actions/runList";
import { JobActions } from "./JobActions";

interface PageProps {
  params: { id: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  complete: "bg-green-100 text-green-800 border-green-200",
  on_hold: "bg-orange-100 text-orange-800 border-orange-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  complete: "Complete",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export default async function JobDetailPage({ params }: PageProps) {
  const job = await getJob(params.id);

  if (!job) {
    console.error(`[JobDetailPage] Invalid job ID requested: ${params.id}`);
    notFound();
  }

  // Fetch related data
  const [quote, customer, runListItem] = await Promise.all([
    getQuote(job.quoteId),
    getCustomer(job.customerId),
    getRunListItemByJobId(job.id),
  ]);

  const total = job.quantity * job.unitPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-mono">{job.jobNumber}</h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[job.status]}`}
            >
              {statusLabels[job.status]}
            </span>
          </div>
          <h3 className="text-lg text-gray-600 mt-1">{job.jobTitle}</h3>
        </div>
        <Link
          href="/jobs"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Back to Jobs
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Source Information (Collapsible) */}
          <details className="bg-white rounded-lg border border-gray-200" open>
            <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Quote Source Information (Read-only)
              </span>
            </summary>
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-gray-500">Source Quote</dt>
                  <dd className="text-lg font-medium">
                    {quote ? (
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="text-blue-600 hover:underline font-mono"
                      >
                        {quote.quoteNumber}
                        {quote.version > 1 && `-v${quote.version}`}
                      </Link>
                    ) : (
                      <span className="text-gray-400">Not found</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Finished Size</dt>
                  <dd className="text-lg font-medium">{job.finishedSize}</dd>
                </div>
                {job.paperStock && (
                  <div>
                    <dt className="text-sm text-gray-500">Paper Stock</dt>
                    <dd className="text-lg font-medium">{job.paperStock}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Quantity</dt>
                  <dd className="text-lg font-medium">
                    {job.quantity.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Unit Price</dt>
                  <dd className="text-lg font-medium">
                    ${job.unitPrice.toFixed(3)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Quote Total</dt>
                  <dd className="text-xl font-bold text-green-600">
                    ${total.toFixed(2)}
                  </dd>
                </div>
              </div>
              {job.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <dt className="text-sm text-gray-500 mb-2">Description</dt>
                  <dd className="text-gray-700 whitespace-pre-wrap text-sm">
                    {job.description}
                  </dd>
                </div>
              )}
            </div>
          </details>

          {/* Job Schedule */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Job Schedule
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Expected In Date</dt>
                <dd className="text-lg font-medium">
                  {job.expectedInDate
                    ? new Date(job.expectedInDate).toLocaleDateString()
                    : <span className="text-gray-400">Not set</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Due Date</dt>
                <dd className="text-lg font-medium">
                  {job.dueDate
                    ? new Date(job.dueDate).toLocaleDateString()
                    : <span className="text-gray-400">Not set</span>}
                </dd>
              </div>
            </div>
          </div>

          {/* Job Reference Numbers */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Reference Numbers
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Customer Job #</dt>
                <dd className="text-lg font-medium">
                  {job.customerJobNumber || <span className="text-gray-400">-</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">PO Number</dt>
                <dd className="text-lg font-medium">
                  {job.poNumber || <span className="text-gray-400">-</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Part Number</dt>
                <dd className="text-lg font-medium">
                  {job.partNumber || <span className="text-gray-400">-</span>}
                </dd>
              </div>
            </div>
          </div>

          {/* Production Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Production Details
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Order Quantity</dt>
                <dd className="text-lg font-medium">
                  {job.quantity.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Allowed Samples</dt>
                <dd className="text-lg font-medium">
                  {job.allowedSamples != null
                    ? job.allowedSamples.toLocaleString()
                    : <span className="text-gray-400">-</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Allowed Overs</dt>
                <dd className="text-lg font-medium">
                  {job.allowedOvers != null
                    ? `${job.allowedOvers}%`
                    : <span className="text-gray-400">-</span>}
                </dd>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {job.deliveryInformation && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Delivery Information
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {job.deliveryInformation}
              </p>
            </div>
          )}

          {/* Miscellaneous Notes */}
          {job.miscellaneousNotes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Miscellaneous Notes
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {job.miscellaneousNotes}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">
                  {new Date(job.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="font-medium">
                  {new Date(job.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {job.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span className="font-medium text-green-600">
                    {new Date(job.completedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Actions
            </h4>
            <JobActions job={job} isInRunList={!!runListItem} />
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Customer
            </h4>
            {customer ? (
              <div className="space-y-2">
                <Link
                  href={`/customers/${customer.id}`}
                  className="text-blue-600 hover:underline font-medium block"
                >
                  {customer.name}
                </Link>
                {customer.contactName && (
                  <p className="text-sm text-gray-600">{customer.contactName}</p>
                )}
                {customer.email && (
                  <p className="text-sm text-gray-500">{customer.email}</p>
                )}
                {customer.phone && (
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Customer not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
