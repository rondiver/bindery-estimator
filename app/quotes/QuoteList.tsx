"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import type { Quote } from "@/src/lib/services";
import { deleteQuote, updateQuoteStatus } from "../actions/quotes";
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
  Button,
  EmptyState,
  LoadingSpinner,
} from "../components/ui";
import { useFilterParams } from "../hooks/useFilterParams";

const ITEMS_PER_PAGE = 10;

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

function formatQuoteNumber(quote: Quote): string {
  if (quote.version === 1) return quote.quoteNumber;
  return `${quote.quoteNumber}-v${quote.version}`;
}

function QuoteListContent({ quotes }: { quotes: Quote[] }) {
  const { getParam, setParam, clearParams, hasFilters } = useFilterParams();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const search = getParam("search");
  const status = getParam("status");
  const page = parseInt(getParam("page", "1"), 10);

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.quoteNumber.toLowerCase().includes(searchLower) ||
          q.customerName.toLowerCase().includes(searchLower) ||
          q.jobTitle.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (status) {
      result = result.filter((q) => q.status === status);
    }

    // Sort by most recent first
    result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return result;
  }, [quotes, search, status]);

  // Pagination
  const totalPages = Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedQuotes = filteredQuotes.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this quote?")) return;
    setActionInProgress(id);
    try {
      await deleteQuote(id);
    } finally {
      setActionInProgress(null);
    }
  }

  async function handleStatusChange(id: string, newStatus: Quote["status"]) {
    setActionInProgress(id);
    try {
      await updateQuoteStatus(id, newStatus);
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
          placeholder="Search quote #, customer, title..."
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
          start={filteredQuotes.length === 0 ? 0 : startIndex + 1}
          end={Math.min(startIndex + ITEMS_PER_PAGE, filteredQuotes.length)}
          total={filteredQuotes.length}
        />
      </div>

      {paginatedQuotes.length === 0 ? (
        <EmptyState
          title={search || status ? "No quotes found" : "No quotes yet"}
          description={
            search || status
              ? "Try adjusting your filters"
              : "Get started by creating your first quote"
          }
          action={
            !(search || status) && (
              <Link href="/quotes/new">
                <Button>Create Quote</Button>
              </Link>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuotes.map((quote) => (
              <TableRow key={quote.id} clickable>
                <TableCell variant="mono">
                  <Link
                    href={`/quotes/${quote.id}`}
                    className="hover:text-accent-dark"
                  >
                    {formatQuoteNumber(quote)}
                  </Link>
                </TableCell>
                <TableCell>{quote.customerName}</TableCell>
                <TableCell variant="muted">{quote.jobTitle}</TableCell>
                <TableCell>
                  <Badge variant={quote.status as any} rounded>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell variant="muted">
                  {new Date(quote.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {quote.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange(quote.id, "sent")}
                        disabled={actionInProgress === quote.id}
                        className="text-accent hover:text-accent-dark text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        Send
                      </button>
                    )}
                    {quote.status === "sent" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(quote.id, "accepted")}
                          disabled={actionInProgress === quote.id}
                          className="text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(quote.id, "declined")}
                          disabled={actionInProgress === quote.id}
                          className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <Link
                      href={`/quotes/${quote.id}/edit`}
                      className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      disabled={actionInProgress === quote.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {actionInProgress === quote.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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

export function QuoteList({ quotes }: { quotes: Quote[] }) {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto" />}>
      <QuoteListContent quotes={quotes} />
    </Suspense>
  );
}
