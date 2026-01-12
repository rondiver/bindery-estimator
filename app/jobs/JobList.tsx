"use client";

import { useState, useMemo, Suspense } from "react";
import type { Job } from "@/src/lib/services";
import { startJob, completeJob } from "../actions/jobs";
import {
  SearchInput,
  StatusFilter,
  FilterBar,
  Pagination,
  ResultsCounter,
} from "../components";
import { useFilterParams } from "../hooks/useFilterParams";

const ITEMS_PER_PAGE = 10;

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  complete: "bg-green-100 text-green-700",
  on_hold: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  complete: "Complete",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "complete", label: "Complete" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

function JobListContent({ jobs }: { jobs: Job[] }) {
  const { getParam, setParam, clearParams, hasFilters } = useFilterParams();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const search = getParam("search");
  const status = getParam("status");
  const page = parseInt(getParam("page", "1"), 10);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.jobNumber.toLowerCase().includes(searchLower) ||
          j.customerName.toLowerCase().includes(searchLower) ||
          j.jobTitle.toLowerCase().includes(searchLower) ||
          (j.customerJobNumber && j.customerJobNumber.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (status) {
      result = result.filter((j) => j.status === status);
    }

    // Sort by status priority, then by due date, then by updated date
    const statusPriority: Record<string, number> = {
      in_progress: 0,
      pending: 1,
      on_hold: 2,
      complete: 3,
      cancelled: 4,
    };
    result.sort((a, b) => {
      const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
      if (priorityDiff !== 0) return priorityDiff;
      // Sort by due date if both have one
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Jobs with due dates come first
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [jobs, search, status]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  async function handleStart(id: string) {
    setActionInProgress(id);
    try {
      await startJob(id);
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleComplete(id: string) {
    setActionInProgress(id);
    try {
      await completeJob(id);
    } finally {
      setActionInProgress(null);
    }
  }

  return (
    <div className="space-y-4">
      <FilterBar onClearFilters={clearParams} showClearButton={hasFilters()}>
        <SearchInput
          value={search}
          onChange={(v) => setParam("search", v)}
          placeholder="Search job #, customer, title..."
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <StatusFilter
            options={statusOptions}
            value={status}
            onChange={(v) => setParam("status", v)}
          />
        </div>
      </FilterBar>

      <div className="flex items-center justify-between">
        <ResultsCounter
          start={filteredJobs.length === 0 ? 0 : startIndex + 1}
          end={Math.min(startIndex + ITEMS_PER_PAGE, filteredJobs.length)}
          total={filteredJobs.length}
        />
      </div>

      {paginatedJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          {search || status ? (
            <p className="text-gray-500">No jobs match your filters.</p>
          ) : (
            <>
              <p className="text-gray-500">No jobs yet.</p>
              <p className="text-gray-400 text-sm mt-1">
                Jobs are created from accepted quotes.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Job #
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Customer Job #
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Due Date
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedJobs.map((job) => {
                const isDueSoon = job.dueDate && new Date(job.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                const isOverdue = job.dueDate && new Date(job.dueDate) < new Date() && job.status !== "complete" && job.status !== "cancelled";
                return (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a
                        href={`/jobs/${job.id}`}
                        className="text-blue-600 hover:underline font-mono"
                      >
                        {job.jobNumber}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {job.customerJobNumber || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">{job.customerName}</td>
                    <td className="px-4 py-3 text-gray-600">{job.jobTitle}</td>
                    <td className="px-4 py-3">
                      {job.dueDate ? (
                        <span className={isOverdue ? "text-red-600 font-medium" : isDueSoon ? "text-orange-600" : "text-gray-600"}>
                          {new Date(job.dueDate).toLocaleDateString()}
                          {isOverdue && " (overdue)"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusColors[job.status]}`}
                      >
                        {statusLabels[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {job.status === "pending" && (
                        <button
                          onClick={() => handleStart(job.id)}
                          disabled={actionInProgress === job.id}
                          className="text-blue-600 hover:text-blue-800 mr-3 disabled:opacity-50"
                        >
                          Start
                        </button>
                      )}
                      {job.status === "in_progress" && (
                        <button
                          onClick={() => handleComplete(job.id)}
                          disabled={actionInProgress === job.id}
                          className="text-green-600 hover:text-green-800 mr-3 disabled:opacity-50"
                        >
                          Complete
                        </button>
                      )}
                      <a
                        href={`/jobs/${job.id}`}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setParam("page", p.toString())}
          />
        </div>
      )}
    </div>
  );
}

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
      <JobListContent jobs={jobs} />
    </Suspense>
  );
}
