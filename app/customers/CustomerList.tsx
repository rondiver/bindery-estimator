"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Customer } from "@/src/lib/services";
import { deleteCustomer } from "../actions/customers";
import {
  SearchInput,
  SortSelect,
  FilterBar,
  Pagination,
  ResultsCounter,
} from "../components";
import { useFilterParams } from "../hooks/useFilterParams";

const ITEMS_PER_PAGE = 10;

const sortOptions = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "email-asc", label: "Email (A-Z)" },
  { value: "email-desc", label: "Email (Z-A)" },
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
];

function CustomerListContent({ customers }: { customers: Customer[] }) {
  const { getParam, setParam, clearParams, hasFilters } = useFilterParams();
  const [deleting, setDeleting] = useState<string | null>(null);

  const search = getParam("search");
  const sort = getParam("sort", "name-asc");
  const page = parseInt(getParam("page", "1"), 10);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.contactName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const [sortField, sortDir] = sort.split("-");
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "email") {
        comparison = (a.email || "").localeCompare(b.email || "");
      } else if (sortField === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDir === "desc" ? -comparison : comparison;
    });

    return result;
  }, [customers, search, sort]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    setDeleting(id);
    try {
      await deleteCustomer(id);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <FilterBar onClearFilters={clearParams} showClearButton={hasFilters()}>
        <SearchInput
          value={search}
          onChange={(v) => setParam("search", v)}
          placeholder="Search name or email..."
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort:</span>
          <SortSelect
            options={sortOptions}
            value={sort}
            onChange={(v) => setParam("sort", v)}
          />
        </div>
      </FilterBar>

      <div className="flex items-center justify-between">
        <ResultsCounter
          start={filteredCustomers.length === 0 ? 0 : startIndex + 1}
          end={Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)}
          total={filteredCustomers.length}
        />
      </div>

      {paginatedCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          {search ? (
            <p className="text-gray-500">No customers match your search.</p>
          ) : (
            <>
              <p className="text-gray-500">No customers yet.</p>
              <a
                href="/customers/new"
                className="text-blue-600 hover:underline mt-2 inline-block"
              >
                Add your first customer
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
                  Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Contact
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  Phone
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <a
                      href={`/customers/${customer.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {customer.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.contactName || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {customer.phone || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/customers/${customer.id}/edit`}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      disabled={deleting === customer.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deleting === customer.id ? "..." : "Delete"}
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

export function CustomerList({ customers }: { customers: Customer[] }) {
  return (
    <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
      <CustomerListContent customers={customers} />
    </Suspense>
  );
}
