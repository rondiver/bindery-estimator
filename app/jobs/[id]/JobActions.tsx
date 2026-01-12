"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Job, JobStatus } from "@/src/lib/services";
import { updateJobStatus, deleteJob } from "../../actions/jobs";
import { addJobToRunList } from "../../actions/runList";

interface JobActionsProps {
  job: Job;
  isInRunList: boolean;
}

const statusOptions: { value: JobStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

export function JobActions({ job, isInRunList }: JobActionsProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingToRunList, setAddingToRunList] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(newStatus: JobStatus) {
    if (newStatus === job.status) return;

    setError(null);
    setUpdating(true);
    try {
      await updateJobStatus(job.id, newStatus);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete job ${job.jobNumber}? This cannot be undone.`)) {
      return;
    }

    setError(null);
    setDeleting(true);
    try {
      await deleteJob(job.id);
      router.push("/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job");
      setDeleting(false);
    }
  }

  async function handleAddToRunList() {
    setError(null);
    setAddingToRunList(true);
    try {
      await addJobToRunList({ jobId: job.id });
      router.push("/run-list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to Run List");
      setAddingToRunList(false);
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
          value={job.status}
          onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
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
      <div className="space-y-2">
        {job.status === "pending" && (
          <button
            onClick={() => handleStatusChange("in_progress")}
            disabled={updating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Start Job
          </button>
        )}
        {job.status === "in_progress" && (
          <>
            <button
              onClick={() => handleStatusChange("complete")}
              disabled={updating}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Mark Complete
            </button>
            <button
              onClick={() => handleStatusChange("on_hold")}
              disabled={updating}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            >
              Put On Hold
            </button>
          </>
        )}
        {job.status === "on_hold" && (
          <button
            onClick={() => handleStatusChange("in_progress")}
            disabled={updating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Resume Job
          </button>
        )}
        {(job.status === "pending" || job.status === "in_progress" || job.status === "on_hold") && (
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to cancel job ${job.jobNumber}?`)) {
                handleStatusChange("cancelled");
              }
            }}
            disabled={updating}
            className="w-full px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
          >
            Cancel Job
          </button>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Run List Actions */}
      {isInRunList ? (
        <Link
          href="/run-list"
          className="block w-full px-4 py-2 text-center bg-purple-100 text-purple-800 border border-purple-200 rounded hover:bg-purple-200"
        >
          View in Run List
        </Link>
      ) : (
        <button
          onClick={handleAddToRunList}
          disabled={addingToRunList || job.status === "complete" || job.status === "cancelled"}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {addingToRunList ? "Adding..." : "Add to Run List"}
        </button>
      )}

      <hr className="border-gray-200" />

      {/* Navigation Actions */}
      <a
        href={`/jobs/${job.id}/edit`}
        className="block w-full px-4 py-2 text-center border border-gray-300 rounded hover:bg-gray-50"
      >
        Edit Job
      </a>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete Job"}
      </button>
    </div>
  );
}
