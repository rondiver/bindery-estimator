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
import { Button, Select } from "../../components/ui";

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
        <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Status Dropdown */}
      <div>
        <Select
          label="Change Status"
          id="status"
          value={quote.status}
          onChange={(e) => handleStatusChange(e.target.value as QuoteStatus)}
          disabled={updating}
          options={statusOptions}
        />
        {updating && (
          <p className="text-xs text-slate-500 mt-1">Updating...</p>
        )}
      </div>

      {/* Quick Status Buttons */}
      {quote.status === "draft" && (
        <Button
          onClick={() => handleStatusChange("sent")}
          disabled={updating}
          className="w-full"
        >
          Mark as Sent
        </Button>
      )}

      {quote.status === "sent" && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleStatusChange("accepted")}
            disabled={updating}
            variant="primary"
            className="flex-1"
          >
            Accept
          </Button>
          <Button
            onClick={() => handleStatusChange("declined")}
            disabled={updating}
            variant="danger"
            className="flex-1"
          >
            Decline
          </Button>
        </div>
      )}

      {/* Linked Job or Create Job from Accepted Quote */}
      {linkedJob ? (
        <div className="p-4 bg-accent-50 rounded-lg border border-accent/20 space-y-3">
          <p className="text-sm font-medium text-accent">
            Promoted to Job
          </p>
          <Link href={`/jobs/${linkedJob.id}`} className="block">
            <Button variant="primary" className="w-full font-mono">
              View Job {linkedJob.jobNumber}
            </Button>
          </Link>
        </div>
      ) : quote.status === "accepted" && (
        <>
          {!showJobModal ? (
            <Button
              onClick={() => setShowJobModal(true)}
              className="w-full"
            >
              Create Job
            </Button>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <p className="text-sm font-medium text-slate-700">Select quantity for job:</p>
              <select
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent"
              >
                {quote.quantityOptions.map((opt) => (
                  <option key={opt.id} value={opt.quantity}>
                    {opt.quantity.toLocaleString()} @ ${opt.unitPrice.toFixed(3)} = $
                    {(opt.quantity * opt.unitPrice).toFixed(2)}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateJob}
                  disabled={creatingJob}
                  isLoading={creatingJob}
                  size="sm"
                  className="flex-1"
                >
                  Create Job
                </Button>
                <Button
                  onClick={() => setShowJobModal(false)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <hr className="border-slate-200" />

      {/* Create Revision */}
      <Button
        onClick={handleCreateRevision}
        disabled={creatingRevision}
        isLoading={creatingRevision}
        variant="secondary"
        className="w-full"
      >
        Create Revision
      </Button>

      {/* Edit */}
      <Link href={`/quotes/${quote.id}/edit`} className="block">
        <Button variant="secondary" className="w-full">
          Edit Quote
        </Button>
      </Link>

      {/* Delete */}
      <Button
        onClick={handleDelete}
        disabled={deleting}
        isLoading={deleting}
        variant="danger"
        className="w-full"
      >
        Delete Quote
      </Button>
    </div>
  );
}
