import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "../../actions/jobs";
import { getQuote } from "../../actions/quotes";
import { getCustomer } from "../../actions/customers";
import { getRunListItemByJobId } from "../../actions/runList";
import { JobActions } from "./JobActions";
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  Badge,
  SectionLabel,
} from "../../components/ui";

interface PageProps {
  params: { id: string };
}

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
      <PageHeader
        title={job.jobNumber}
        subtitle={job.jobTitle}
        backHref="/jobs"
        backLabel="Back to Jobs"
        actions={
          <Badge variant={job.status} rounded size="lg">
            {statusLabels[job.status]}
          </Badge>
        }
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Source Information (Collapsible) */}
          <details className="bg-white rounded-xl border border-slate-200 shadow-elevation-1" open>
            <summary className="px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <SectionLabel>Quote Source Information (Read-only)</SectionLabel>
            </summary>
            <div className="px-6 pb-6 border-t border-slate-100">
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500">Source Quote</dt>
                  <dd className="text-lg font-medium">
                    {quote ? (
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="text-accent hover:text-accent-dark font-mono transition-colors"
                      >
                        {quote.quoteNumber}
                        {quote.version > 1 && `-v${quote.version}`}
                      </Link>
                    ) : (
                      <span className="text-slate-400">Not found</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Finished Size</dt>
                  <dd className="text-lg font-medium text-slate-900">{job.finishedSize}</dd>
                </div>
                {job.paperStock && (
                  <div>
                    <dt className="text-sm text-slate-500">Paper Stock</dt>
                    <dd className="text-lg font-medium text-slate-900">{job.paperStock}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-slate-500">Quantity</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.quantity.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Unit Price</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    ${job.unitPrice.toFixed(3)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Quote Total</dt>
                  <dd className="text-xl font-bold text-green-600">
                    ${total.toFixed(2)}
                  </dd>
                </div>
              </div>
              {job.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <dt className="text-sm text-slate-500 mb-2">Description</dt>
                  <dd className="text-slate-700 whitespace-pre-wrap text-sm">
                    {job.description}
                  </dd>
                </div>
              )}
            </div>
          </details>

          {/* Job Schedule */}
          <Card>
            <CardHeader>
              <SectionLabel>Job Schedule</SectionLabel>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500">Expected In Date</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.expectedInDate
                      ? new Date(job.expectedInDate).toLocaleDateString()
                      : <span className="text-slate-400">Not set</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Due Date</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.dueDate
                      ? new Date(job.dueDate).toLocaleDateString()
                      : <span className="text-slate-400">Not set</span>}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Reference Numbers */}
          <Card>
            <CardHeader>
              <SectionLabel>Reference Numbers</SectionLabel>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-slate-500">Customer Job #</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.customerJobNumber || <span className="text-slate-400">-</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">PO Number</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.poNumber || <span className="text-slate-400">-</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Part Number</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.partNumber || <span className="text-slate-400">-</span>}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Details */}
          <Card>
            <CardHeader>
              <SectionLabel>Production Details</SectionLabel>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm text-slate-500">Order Quantity</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.quantity.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Allowed Samples</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.allowedSamples != null
                      ? job.allowedSamples.toLocaleString()
                      : <span className="text-slate-400">-</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Allowed Overs</dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {job.allowedOvers != null
                      ? `${job.allowedOvers}%`
                      : <span className="text-slate-400">-</span>}
                  </dd>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {job.deliveryInformation && (
            <Card>
              <CardHeader>
                <SectionLabel>Delivery Information</SectionLabel>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {job.deliveryInformation}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Miscellaneous Notes */}
          {job.miscellaneousNotes && (
            <Card>
              <CardHeader>
                <SectionLabel>Miscellaneous Notes</SectionLabel>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {job.miscellaneousNotes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <SectionLabel>Timeline</SectionLabel>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="font-medium text-slate-900">
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
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-medium text-slate-900">
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
                    <span className="text-slate-500">Completed</span>
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <SectionLabel>Actions</SectionLabel>
            </CardHeader>
            <CardContent>
              <JobActions job={job} isInRunList={!!runListItem} />
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <SectionLabel>Customer</SectionLabel>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-2">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-accent hover:text-accent-dark font-medium block transition-colors"
                  >
                    {customer.name}
                  </Link>
                  {customer.contactName && (
                    <p className="text-sm text-slate-600">{customer.contactName}</p>
                  )}
                  {customer.email && (
                    <p className="text-sm text-slate-500">{customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-sm text-slate-500">{customer.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Customer not found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
