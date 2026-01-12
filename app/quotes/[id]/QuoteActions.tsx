"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Quote, QuoteStatus, Job } from "@/src/lib/services";
import {
  updateQuoteStatus,
  deleteQuote,
  createQuoteRevision,
} from "../../actions/quotes";
import { createJobFromQuote } from "../../actions/jobs";

interface QuoteActionsProps {
  quote: Quote;
  linkedJob: Job | null;
}

const statusOptions: { value: QuoteStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

export function QuoteActions({ quote, linkedJob }: QuoteActionsProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [creatingRevision, setCreatingRevision] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    quote.quantityOptions[0]?.quantity || 0
  );

  async function handleStatusChange(newStatus: QuoteStatus) {
    if (newStatus === quote.status) return;

    setError(null);
    setUpdating(true);
    try {
      await updateQuoteStatus(quote.id, newStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    const quoteNum = quote.version > 1
      ? `${quote.quoteNumber}-v${quote.version}`
      : quote.quoteNumber;

    if (!confirm(`Are you sure you want to delete quote ${quoteNum}? This cannot be undone.`)) {
      return;
    }

    setError(null);
    setDeleting(true);
    try {
      await deleteQuote(quote.id);
      router.push("/quotes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete quote");
      setDeleting(false);
    }
  }

  async function handleCreateRevision() {
    setError(null);
    setCreatingRevision(true);
    try {
      const newQuote = await createQuoteRevision(quote.id);
      router.push(`/quotes/${newQuote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create revision");
      setCreatingRevision(false);
    }
  }

  async function handleCreateJob() {
    setError(null);
    setCreatingJob(true);
    try {
      const job = await createJobFromQuote(quote.id, selectedQuantity);
      router.push(`/jobs/${job.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job");
      setCreatingJob(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Status Dropdown */}
      <div>
        <label htmlFor="status" className="block text-sm text-gray-600 mb-1">
          Change Status
        </label>
        <select
          id="status"
          value={quote.status}
          onChange={(e) => handleStatusChange(e.target.value as QuoteStatus)}
          disabled={updating}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {updating && (
          <p className="text-xs text-gray-500 mt-1">Updating...</p>
        )}
      </div>

      {/* Quick Status Buttons */}
      {quote.status === "draft" && (
        <button
          onClick={() => handleStatusChange("sent")}
          disabled={updating}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Mark as Sent
        </button>
      )}

      {quote.status === "sent" && (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusChange("accepted")}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Accept
          </button>
          <button
            onClick={() => handleStatusChange("declined")}
            disabled={updating}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}

      {/* Linked Job or Create Job from Accepted Quote */}
      {linkedJob ? (
        <div className="p-3 bg-purple-50 rounded border border-purple-200 space-y-2">
          <p className="text-sm font-medium text-purple-800">
            Promoted to Job
          </p>
          <Link
            href={`/jobs/${linkedJob.id}`}
            className="block w-full px-4 py-2 text-center bg-purple-600 text-white rounded hover:bg-purple-700 font-mono"
          >
            View Job {linkedJob.jobNumber}
          </Link>
        </div>
      ) : quote.status === "accepted" && (
        <>
          {!showJobModal ? (
            <button
              onClick={() => setShowJobModal(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Job
            </button>
          ) : (
            <div className="p-3 bg-gray-50 rounded border border-gray-200 space-y-3">
              <p className="text-sm font-medium">Select quantity for job:</p>
              <select
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                {quote.quantityOptions.map((opt) => (
                  <option key={opt.id} value={opt.quantity}>
                    {opt.quantity.toLocaleString()} @ ${opt.unitPrice.toFixed(3)} = $
                    {(opt.quantity * opt.unitPrice).toFixed(2)}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateJob}
                  disabled={creatingJob}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {creatingJob ? "Creating..." : "Create Job"}
                </button>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <hr className="border-gray-200" />

      {/* Create Revision */}
      <button
        onClick={handleCreateRevision}
        disabled={creatingRevision}
        className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
      >
        {creatingRevision ? "Creating..." : "Create Revision"}
      </button>

      {/* Edit */}
      <a
        href={`/quotes/${quote.id}/edit`}
        className="block w-full px-4 py-2 text-center border border-gray-300 rounded hover:bg-gray-50"
      >
        Edit Quote
      </a>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete Quote"}
      </button>
    </div>
  );
}
