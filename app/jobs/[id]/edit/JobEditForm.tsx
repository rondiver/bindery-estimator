"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Job, Quote } from "@/src/lib/services";
import { updateJob } from "../../../actions/jobs";
import { Card, CardContent, Input, Textarea, Button, SectionLabel } from "../../../components/ui";

interface JobEditFormProps {
  job: Job;
  quote: Quote | null;
}

export function JobEditForm({ job, quote }: JobEditFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    try {
      await updateJob(job.id, {
        customerJobNumber: (formData.get("customerJobNumber") as string) || undefined,
        poNumber: (formData.get("poNumber") as string) || undefined,
        partNumber: (formData.get("partNumber") as string) || undefined,
        expectedInDate: (formData.get("expectedInDate") as string) || undefined,
        dueDate: (formData.get("dueDate") as string) || undefined,
        allowedSamples: formData.get("allowedSamples")
          ? parseInt(formData.get("allowedSamples") as string, 10)
          : undefined,
        allowedOvers: formData.get("allowedOvers")
          ? parseFloat(formData.get("allowedOvers") as string)
          : undefined,
        deliveryInformation: (formData.get("deliveryInformation") as string) || undefined,
        miscellaneousNotes: (formData.get("miscellaneousNotes") as string) || undefined,
      });
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  }

  const total = job.quantity * job.unitPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Section A: Quote Source Information (Read-only) */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <SectionLabel className="mb-4">Quote Source Information (Read-only)</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-slate-500">Source Quote</dt>
            <dd className="font-medium">
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
            <dt className="text-sm text-slate-500">Customer</dt>
            <dd className="font-medium text-slate-900">{job.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Job Title</dt>
            <dd className="font-medium text-slate-900">{job.jobTitle}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Finished Size</dt>
            <dd className="font-medium text-slate-900">{job.finishedSize}</dd>
          </div>
          {job.paperStock && (
            <div>
              <dt className="text-sm text-slate-500">Paper Stock</dt>
              <dd className="font-medium text-slate-900">{job.paperStock}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-slate-500">Order Quantity</dt>
            <dd className="font-medium text-slate-900">{job.quantity.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Unit Price</dt>
            <dd className="font-medium text-slate-900">${job.unitPrice.toFixed(3)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Quote Total</dt>
            <dd className="font-bold text-green-600">${total.toFixed(2)}</dd>
          </div>
        </div>
        {job.description && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <dt className="text-sm text-slate-500 mb-1">Description</dt>
            <dd className="text-slate-700 text-sm whitespace-pre-wrap">
              {job.description}
            </dd>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-4 italic">
          These fields are inherited from the source quote and cannot be edited.
          To make changes, edit the original quote.
        </p>
      </div>

      {/* Section B: Job-Specific Fields (Editable) */}
      <Card variant="elevated">
        <CardContent>
          <SectionLabel className="mb-4">Job-Specific Fields</SectionLabel>

          <div className="space-y-5">
            {/* Reference Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Customer Job #"
                id="customerJobNumber"
                name="customerJobNumber"
                defaultValue={job.customerJobNumber}
                placeholder="Customer's internal job number"
              />
              <Input
                label="PO Number"
                id="poNumber"
                name="poNumber"
                defaultValue={job.poNumber}
                placeholder="Purchase order number"
              />
              <Input
                label="Part Number"
                id="partNumber"
                name="partNumber"
                defaultValue={job.partNumber}
                placeholder="Part number reference"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Expected In Date"
                type="date"
                id="expectedInDate"
                name="expectedInDate"
                defaultValue={job.expectedInDate}
                helperText="When materials are expected to arrive"
              />
              <Input
                label="Due Date"
                type="date"
                id="dueDate"
                name="dueDate"
                defaultValue={job.dueDate}
                helperText="When the job is due to be completed"
              />
            </div>

            {/* Production Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Allowed Samples"
                type="number"
                id="allowedSamples"
                name="allowedSamples"
                defaultValue={job.allowedSamples}
                min={0}
                placeholder="Units allowed for sampling"
              />
              <Input
                label="Allowed Overs (%)"
                type="number"
                id="allowedOvers"
                name="allowedOvers"
                defaultValue={job.allowedOvers}
                min={0}
                max={100}
                step={0.1}
                placeholder="Percentage overage allowed"
              />
            </div>

            {/* Delivery Information */}
            <Textarea
              label="Delivery Information"
              id="deliveryInformation"
              name="deliveryInformation"
              rows={3}
              defaultValue={job.deliveryInformation}
              placeholder="Shipping address, carrier preferences, special handling..."
            />

            {/* Miscellaneous Notes */}
            <Textarea
              label="Miscellaneous Notes"
              id="miscellaneousNotes"
              name="miscellaneousNotes"
              rows={3}
              defaultValue={job.miscellaneousNotes}
              placeholder="Additional notes about this job..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={saving} isLoading={saving}>
          Save Changes
        </Button>
        <Link href={`/jobs/${job.id}`}>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
