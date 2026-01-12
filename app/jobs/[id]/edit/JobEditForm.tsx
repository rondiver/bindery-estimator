"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Job, Quote } from "@/src/lib/services";
import { updateJob } from "../../../actions/jobs";

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
        <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Section A: Quote Source Information (Read-only) */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Quote Source Information (Read-only)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Source Quote</dt>
            <dd className="font-medium">
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
            <dt className="text-sm text-gray-500">Customer</dt>
            <dd className="font-medium">{job.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Job Title</dt>
            <dd className="font-medium">{job.jobTitle}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Finished Size</dt>
            <dd className="font-medium">{job.finishedSize}</dd>
          </div>
          {job.paperStock && (
            <div>
              <dt className="text-sm text-gray-500">Paper Stock</dt>
              <dd className="font-medium">{job.paperStock}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-gray-500">Order Quantity</dt>
            <dd className="font-medium">{job.quantity.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Unit Price</dt>
            <dd className="font-medium">${job.unitPrice.toFixed(3)}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Quote Total</dt>
            <dd className="font-bold text-green-600">${total.toFixed(2)}</dd>
          </div>
        </div>
        {job.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <dt className="text-sm text-gray-500 mb-1">Description</dt>
            <dd className="text-gray-700 text-sm whitespace-pre-wrap">
              {job.description}
            </dd>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-4 italic">
          These fields are inherited from the source quote and cannot be edited.
          To make changes, edit the original quote.
        </p>
      </div>

      {/* Section B: Job-Specific Fields (Editable) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Job-Specific Fields
        </h3>

        <div className="space-y-4">
          {/* Reference Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="customerJobNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Customer Job #
              </label>
              <input
                type="text"
                id="customerJobNumber"
                name="customerJobNumber"
                defaultValue={job.customerJobNumber}
                placeholder="Customer's internal job number"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="poNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                PO Number
              </label>
              <input
                type="text"
                id="poNumber"
                name="poNumber"
                defaultValue={job.poNumber}
                placeholder="Purchase order number"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="partNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Part Number
              </label>
              <input
                type="text"
                id="partNumber"
                name="partNumber"
                defaultValue={job.partNumber}
                placeholder="Part number reference"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="expectedInDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expected In Date
              </label>
              <input
                type="date"
                id="expectedInDate"
                name="expectedInDate"
                defaultValue={job.expectedInDate}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                When materials are expected to arrive
              </p>
            </div>
            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                defaultValue={job.dueDate}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                When the job is due to be completed
              </p>
            </div>
          </div>

          {/* Production Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="allowedSamples"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Allowed Samples
              </label>
              <input
                type="number"
                id="allowedSamples"
                name="allowedSamples"
                defaultValue={job.allowedSamples}
                min={0}
                placeholder="Units allowed for sampling"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="allowedOvers"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Allowed Overs (%)
              </label>
              <input
                type="number"
                id="allowedOvers"
                name="allowedOvers"
                defaultValue={job.allowedOvers}
                min={0}
                max={100}
                step={0.1}
                placeholder="Percentage overage allowed"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Delivery Information */}
          <div>
            <label
              htmlFor="deliveryInformation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Delivery Information
            </label>
            <textarea
              id="deliveryInformation"
              name="deliveryInformation"
              rows={3}
              defaultValue={job.deliveryInformation}
              placeholder="Shipping address, carrier preferences, special handling..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Miscellaneous Notes */}
          <div>
            <label
              htmlFor="miscellaneousNotes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Miscellaneous Notes
            </label>
            <textarea
              id="miscellaneousNotes"
              name="miscellaneousNotes"
              rows={3}
              defaultValue={job.miscellaneousNotes}
              placeholder="Additional notes about this job..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <Link
          href={`/jobs/${job.id}`}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
