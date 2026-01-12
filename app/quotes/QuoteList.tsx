"use client";

import { useState, useMemo, Suspense } from "react";
import type { Quote } from "@/src/lib/services";
import { deleteQuote, updateQuoteStatus } from "../actions/quotes";
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
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

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
          start={filteredQuotes.length === 0 ? 0 : startIndex + 1}
          end={Math.min(startIndex + ITEMS_PER_PAGE, filteredQuotes.length)}
          total={filteredQuotes.length}
        />
      </div>

      {paginatedQuotes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          {search || status ? (
            <p className="text-gray-500">No quotes match your filters.</p>
          ) : (
            <>
              <p className="text-gray-500">No quotes yet.</p>
              <a
                href="/quotes/new"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Create your first quote
              </a>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Quote #
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Job Title
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Updated
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/quotes/${quote.id}`}
                      className="text-blue-600 hover:underline font-mono"
                    >
                      {formatQuoteNumber(quote)}
                    </a>
                  </td>
                  <td className="px-4 py-3">{quote.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{quote.jobTitle}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[quote.status]}`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {new Date(quote.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {quote.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange(quote.id, "sent")}
                        disabled={actionInProgress === quote.id}
                        className="text-blue-600 hover:text-blue-800 mr-3 disabled:opacity-50"
                      >
                        Send
                      </button>
                    )}
                    {quote.status === "sent" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(quote.id, "accepted")}
                          disabled={actionInProgress === quote.id}
                          className="text-green-600 hover:text-green-800 mr-3 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(quote.id, "declined")}
                          disabled={actionInProgress === quote.id}
                          className="text-red-600 hover:text-red-800 mr-3 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    <a
                      href={`/quotes/${quote.id}/edit`}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(quote.id)}
                      disabled={actionInProgress === quote.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
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

export function QuoteList({ quotes }: { quotes: Quote[] }) {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
      <QuoteListContent quotes={quotes} />
    </Suspense>
  );
}
