"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Job, JobStatus } from "@/src/lib/services";
import { updateJobStatus, deleteJob } from "../../actions/jobs";
import { addJobToRunList } from "../../actions/runList";
import { Button, Select } from "../../components/ui";

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
        <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Status Dropdown */}
      <div>
        <Select
          label="Change Status"
          id="status"
          value={job.status}
          onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
          disabled={updating}
          options={statusOptions}
        />
        {updating && (
          <p className="text-xs text-slate-500 mt-1">Updating...</p>
        )}
      </div>

      {/* Quick Status Buttons */}
      <div className="space-y-2">
        {job.status === "pending" && (
          <Button
            onClick={() => handleStatusChange("in_progress")}
            disabled={updating}
            className="w-full"
          >
            Start Job
          </Button>
        )}
        {job.status === "in_progress" && (
          <>
            <Button
              onClick={() => handleStatusChange("complete")}
              disabled={updating}
              variant="primary"
              className="w-full"
            >
              Mark Complete
            </Button>
            <Button
              onClick={() => handleStatusChange("on_hold")}
              disabled={updating}
              variant="secondary"
              className="w-full"
            >
              Put On Hold
            </Button>
          </>
        )}
        {job.status === "on_hold" && (
          <Button
            onClick={() => handleStatusChange("in_progress")}
            disabled={updating}
            className="w-full"
          >
            Resume Job
          </Button>
        )}
        {(job.status === "pending" || job.status === "in_progress" || job.status === "on_hold") && (
          <Button
            onClick={() => {
              if (confirm(`Are you sure you want to cancel job ${job.jobNumber}?`)) {
                handleStatusChange("cancelled");
              }
            }}
            disabled={updating}
            variant="danger"
            className="w-full"
          >
            Cancel Job
          </Button>
        )}
      </div>

      <hr className="border-slate-200" />

      {/* Run List Actions */}
      {isInRunList ? (
        <Link href="/run-list" className="block">
          <Button variant="secondary" className="w-full bg-accent-50 text-accent border-accent/20 hover:bg-accent-100">
            View in Run List
          </Button>
        </Link>
      ) : (
        <Button
          onClick={handleAddToRunList}
          disabled={addingToRunList || job.status === "complete" || job.status === "cancelled"}
          isLoading={addingToRunList}
          className="w-full"
        >
          Add to Run List
        </Button>
      )}

      <hr className="border-slate-200" />

      {/* Navigation Actions */}
      <Link href={`/jobs/${job.id}/edit`} className="block">
        <Button variant="secondary" className="w-full">
          Edit Job
        </Button>
      </Link>

      <Button
        onClick={handleDelete}
        disabled={deleting}
        isLoading={deleting}
        variant="danger"
        className="w-full"
      >
        Delete Job
      </Button>
    </div>
  );
}
