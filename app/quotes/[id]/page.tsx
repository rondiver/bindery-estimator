import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuote } from "../../actions/quotes";
import { getCustomer } from "../../actions/customers";
import { getJob } from "../../actions/jobs";
import { QuoteActions } from "./QuoteActions";
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  SectionLabel,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui";

interface PageProps {
  params: { id: string };
}

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
      <PageHeader
        title={quote.jobTitle}
        subtitle={
          <span className="font-mono text-accent">
            {formatQuoteNumber(quote.quoteNumber, quote.version)}
          </span>
        }
        backHref="/quotes"
        backLabel="Back to Quotes"
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={quote.status} rounded size="lg">
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </Badge>
            {linkedJob && (
              <Link href={`/jobs/${linkedJob.id}`}>
                <Badge variant="in_progress" rounded size="lg">
                  Job: {linkedJob.jobNumber}
                </Badge>
              </Link>
            )}
          </div>
        }
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <SectionLabel>Job Information</SectionLabel>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-slate-500">Finished Size</dt>
                  <dd className="text-lg font-medium text-slate-900">{quote.finishedSize}</dd>
                </div>
                {quote.paperStock && (
                  <div>
                    <dt className="text-sm text-slate-500">Paper Stock</dt>
                    <dd className="text-lg font-medium text-slate-900">{quote.paperStock}</dd>
                  </div>
                )}
                {quote.customerNumber && (
                  <div>
                    <dt className="text-sm text-slate-500">Customer PO/Job #</dt>
                    <dd className="text-lg font-medium text-slate-900">{quote.customerNumber}</dd>
                  </div>
                )}
              </dl>

              {quote.description && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <dt className="text-sm text-slate-500 mb-2">Description</dt>
                  <dd className="text-slate-700 whitespace-pre-wrap">
                    {quote.description}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quantity Options / Pricing */}
          <Card>
            <CardHeader>
              <SectionLabel>Pricing Options</SectionLabel>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quantityTotals.map((opt) => (
                    <TableRow key={opt.id}>
                      <TableCell className="font-medium">
                        {opt.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        ${opt.unitPrice.toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${opt.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          {quote.notes && (
            <Card>
              <CardHeader>
                <SectionLabel>Notes</SectionLabel>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline / Dates */}
          <Card>
            <CardHeader>
              <SectionLabel>Timeline</SectionLabel>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="font-medium text-slate-900">
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
                  <span className="text-slate-500">Last Updated</span>
                  <span className="font-medium text-slate-900">
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
                    <span className="text-slate-500">Version</span>
                    <span className="font-medium text-slate-900">v{quote.version}</span>
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
              <QuoteActions quote={quote} linkedJob={linkedJob} />
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
