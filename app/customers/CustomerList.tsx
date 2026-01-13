"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import type { Customer } from "@/src/lib/services";
import { deleteCustomer } from "../actions/customers";
import {
  SearchInput,
  SortSelect,
  FilterBar,
  Pagination,
  ResultsCounter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Button,
  EmptyState,
  LoadingSpinner,
} from "../components/ui";
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
          className="w-64"
        />
        <SortSelect
          options={sortOptions}
          value={sort}
          onChange={(v) => setParam("sort", v)}
        />
      </FilterBar>

      <div className="flex items-center justify-between">
        <ResultsCounter
          start={filteredCustomers.length === 0 ? 0 : startIndex + 1}
          end={Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)}
          total={filteredCustomers.length}
        />
      </div>

      {paginatedCustomers.length === 0 ? (
        <EmptyState
          title={search ? "No customers found" : "No customers yet"}
          description={
            search
              ? "Try adjusting your search terms"
              : "Get started by adding your first customer"
          }
          action={
            !search && (
              <Link href="/customers/new">
                <Button>Add Customer</Button>
              </Link>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer.id} clickable>
                <TableCell>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-accent hover:text-accent-dark font-medium"
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell variant="muted">
                  {customer.contactName || "-"}
                </TableCell>
                <TableCell variant="muted">
                  {customer.email || "-"}
                </TableCell>
                <TableCell variant="muted">
                  {customer.phone || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/customers/${customer.id}/edit`}
                      className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      disabled={deleting === customer.id}
                      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      {deleting === customer.id ? (
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

export function CustomerList({ customers }: { customers: Customer[] }) {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="mx-auto" />}>
      <CustomerListContent customers={customers} />
    </Suspense>
  );
}
