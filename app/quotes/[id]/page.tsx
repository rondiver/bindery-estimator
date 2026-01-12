import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuote } from "../../actions/quotes";
import { getCustomer } from "../../actions/customers";
import { getJob } from "../../actions/jobs";
import { QuoteActions } from "./QuoteActions";

interface PageProps {
  params: { id: string };
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  declined: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
};

function formatQuoteNumber(quoteNumber: string, version: number): string {
  if (version === 1) return quoteNumber;
  return `${quoteNumber}-v${version}`;
}

export default async function QuoteDetailPage({ params }: PageProps) {
  const quote = await getQuote(params.id);

  if (!quote) {
    console.error(`[QuoteDetailPage] Invalid quote ID requested: ${params.id}`);
    notFound();
  }

  // Fetch customer data and linked job if exists
  const [customer, linkedJob] = await Promise.all([
    getCustomer(quote.customerId),
    quote.jobId ? getJob(quote.jobId) : Promise.resolve(null),
  ]);

  // Calculate totals for each quantity option
  const quantityTotals = quote.quantityOptions.map((opt) => ({
    ...opt,
    total: opt.quantity * opt.unitPrice,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold font-mono">
              {formatQuoteNumber(quote.quoteNumber, quote.version)}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[quote.status]}`}
            >
              {statusLabels[quote.status]}
            </span>
            {linkedJob && (
              <Link
                href={`/jobs/${linkedJob.id}`}
                className="px-3 py-1 rounded-full text-sm font-medium border bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
              >
                Job: {linkedJob.jobNumber}
              </Link>
            )}
          </div>
          <h3 className="text-lg text-gray-600 mt-1">{quote.jobTitle}</h3>
        </div>
        <Link
          href="/quotes"
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Back to Quotes
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Job Information
            </h4>

            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Finished Size</dt>
                <dd className="text-lg font-medium">{quote.finishedSize}</dd>
              </div>
              {quote.paperStock && (
                <div>
                  <dt className="text-sm text-gray-500">Paper Stock</dt>
                  <dd className="text-lg font-medium">{quote.paperStock}</dd>
                </div>
              )}
              {quote.customerNumber && (
                <div>
                  <dt className="text-sm text-gray-500">Customer PO/Job #</dt>
                  <dd className="text-lg font-medium">{quote.customerNumber}</dd>
                </div>
              )}
            </dl>

            {quote.description && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <dt className="text-sm text-gray-500 mb-2">Description</dt>
                <dd className="text-gray-700 whitespace-pre-wrap">
                  {quote.description}
                </dd>
              </div>
            )}
          </div>

          {/* Quantity Options / Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Pricing Options
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">
                      Quantity
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">
                      Unit Price
                    </th>
                    <th className="text-right py-2 text-sm font-medium text-gray-600">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quantityTotals.map((opt) => (
                    <tr key={opt.id}>
                      <td className="py-3 font-medium">
                        {opt.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        ${opt.unitPrice.toFixed(3)}
                      </td>
                      <td className="py-3 text-right font-medium text-green-600">
                        ${opt.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                Notes
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Timeline / Dates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
              Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium">
                  {new Date(quote.createdAt).toLocaleDateString("en-US", {
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
                  {new Date(quote.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {quote.version > 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Version</span>
                  <span className="font-medium">v{quote.version}</span>
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
            <QuoteActions quote={quote} linkedJob={linkedJob} />
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
