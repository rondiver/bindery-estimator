"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import type { Job } from "@/src/lib/services";
import { startJob, completeJob } from "../actions/jobs";
import {
  SearchInput,
  StatusFilter,
  FilterBar,
  Pagination,
  ResultsCounter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  EmptyState,
  LoadingSpinner,
} from "../components/ui";
import { useFilterParams } from "../hooks/useFilterParams";

const ITEMS_PER_PAGE = 10;

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
          className="w-64"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status:</span>
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
        <EmptyState
          title={search || status ? "No jobs found" : "No jobs yet"}
          description={
            search || status
              ? "Try adjusting your filters"
              : "Jobs are created from accepted quotes"
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job #</TableHead>
              <TableHead>Customer Job #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedJobs.map((job) => {
              const isDueSoon = job.dueDate && new Date(job.dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
              const isOverdue = job.dueDate && new Date(job.dueDate) < new Date() && job.status !== "complete" && job.status !== "cancelled";
              return (
                <TableRow key={job.id} clickable>
                  <TableCell variant="mono">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="hover:text-accent-dark"
                    >
                      {job.jobNumber}
                    </Link>
                  </TableCell>
                  <TableCell variant="muted">
                    {job.customerJobNumber || "-"}
                  </TableCell>
                  <TableCell>{job.customerName}</TableCell>
                  <TableCell variant="muted">{job.jobTitle}</TableCell>
                  <TableCell>
                    {job.dueDate ? (
                      <span className={`font-medium ${isOverdue ? "text-red-600" : isDueSoon ? "text-orange-600" : "text-slate-600"}`}>
                        {new Date(job.dueDate).toLocaleDateString()}
                        {isOverdue && (
                          <Badge variant="danger" size="sm" className="ml-2">
                            Overdue
                          </Badge>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={job.status as any} rounded>
                      {statusLabels[job.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {job.status === "pending" && (
                        <button
                          onClick={() => handleStart(job.id)}
                          disabled={actionInProgress === job.id}
                          className="text-accent hover:text-accent-dark text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                          {actionInProgress === job.id ? <LoadingSpinner size="sm" /> : "Start"}
                        </button>
                      )}
                      {job.status === "in_progress" && (
                        <button
                          onClick={() => handleComplete(job.id)}
                          disabled={actionInProgress === job.id}
                          className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                          {actionInProgress === job.id ? <LoadingSpinner size="sm" /> : "Complete"}
                        </button>
                      )}
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
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
    <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto" />}>
      <JobListContent jobs={jobs} />
    </Suspense>
  );
}
