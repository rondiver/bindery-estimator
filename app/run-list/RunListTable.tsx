"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { RunListItem, RunListStatus } from "@/src/lib/services";
import { RunListEditModal } from "./RunListEditModal";
import { Badge, EmptyState } from "../components/ui";

interface RunListTableProps {
  items: RunListItem[];
}

type SortField =
  | "category"
  | "dueOut"
  | "status"
  | "jobNumber"
  | "customerName"
  | "jobTitle"
  | "customerPO"
  | "customerJobNumber"
  | "dueIn"
  | "quantity"
  | "operations"
  | "description";

type SortDirection = "asc" | "desc";

const statusLabels: Record<RunListStatus, string> = {
  planned: "Planned",
  in: "In",
  hold: "Hold",
  complete: "Complete",
};

export function RunListTable({ items }: RunListTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("category");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedItem, setSelectedItem] = useState<RunListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and sort items
  const sortedItems = useMemo(() => {
    // First, filter by search term
    let filtered = items;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = items.filter(
        (item) =>
          item.customerName?.toLowerCase().includes(term) ||
          item.jobTitle?.toLowerCase().includes(term) ||
          item.jobNumber?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.customerPO?.toLowerCase().includes(term) ||
          item.customerJobNumber?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term)
      );
    }

    // Then sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "");
          break;
        case "dueOut":
          const aOut = a.dueOut ? new Date(a.dueOut).getTime() : Infinity;
          const bOut = b.dueOut ? new Date(b.dueOut).getTime() : Infinity;
          comparison = aOut - bOut;
          break;
        case "dueIn":
          const aIn = a.dueIn ? new Date(a.dueIn).getTime() : Infinity;
          const bIn = b.dueIn ? new Date(b.dueIn).getTime() : Infinity;
          comparison = aIn - bIn;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "jobNumber":
          comparison = a.jobNumber.localeCompare(b.jobNumber);
          break;
        case "customerName":
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case "jobTitle":
          comparison = a.jobTitle.localeCompare(b.jobTitle);
          break;
        case "customerPO":
          comparison = (a.customerPO || "").localeCompare(b.customerPO || "");
          break;
        case "customerJobNumber":
          comparison = (a.customerJobNumber || "").localeCompare(
            b.customerJobNumber || ""
          );
          break;
        case "quantity":
          comparison = a.quantity - b.quantity;
          break;
        case "operations":
          comparison = a.operations.join(",").localeCompare(b.operations.join(","));
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });

    // Secondary sort by dueOut when primary sort is category
    if (sortField === "category") {
      sorted.sort((a, b) => {
        const categoryCompare = (a.category || "").localeCompare(b.category || "");
        if (categoryCompare !== 0) {
          return sortDirection === "desc" ? -categoryCompare : categoryCompare;
        }
        // Secondary: dueOut ascending (earliest first)
        const aOut = a.dueOut ? new Date(a.dueOut).getTime() : Infinity;
        const bOut = b.dueOut ? new Date(b.dueOut).getTime() : Infinity;
        return aOut - bOut;
      });
    }

    return sorted;
  }, [items, searchTerm, sortField, sortDirection]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      // Toggle direction
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      // Default direction based on field type
      setSortDirection(field === "category" ? "desc" : "asc");
    }
  }

  function handleSaved() {
    router.refresh();
  }

  function SortHeader({
    field,
    children,
    className = "",
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) {
    const isActive = sortField === field;
    return (
      <th
        className={`
          text-left px-3 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider
          cursor-pointer hover:bg-slate-100 select-none transition-colors
          ${className}
        `}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          {isActive && (
            <span className="text-accent">
              {sortDirection === "asc" ? "↑" : "↓"}
            </span>
          )}
        </div>
      </th>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No items in the Run List"
        description="Add jobs to the Run List from the job detail page"
      />
    );
  }

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-elevation-1">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <SortHeader field="dueOut">Due Out</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <SortHeader field="category">Category</SortHeader>
              <SortHeader field="dueIn">Due In</SortHeader>
              <SortHeader field="customerName">Customer</SortHeader>
              <SortHeader field="jobTitle">Job Title</SortHeader>
              <SortHeader field="jobNumber">Job #</SortHeader>
              <SortHeader field="quantity">Qty</SortHeader>
              <SortHeader field="description" className="min-w-[200px]">
                Description
              </SortHeader>
              <SortHeader field="operations">Operations</SortHeader>
              <SortHeader field="customerPO">Customer PO</SortHeader>
              <SortHeader field="customerJobNumber">Cust Job #</SortHeader>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedItems.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSelectedItem(item)}
              >
                <td className="px-3 py-3 text-slate-600">
                  {item.dueOut
                    ? new Date(item.dueOut).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-3 py-3">
                  <Badge variant={item.status as any} rounded size="sm">
                    {statusLabels[item.status]}
                  </Badge>
                </td>
                <td className="px-3 py-3 font-medium text-slate-900">
                  {item.category || "-"}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {item.dueIn
                    ? new Date(item.dueIn).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-3 py-3 text-slate-900">{item.customerName}</td>
                <td className="px-3 py-3 text-slate-600 max-w-[200px] truncate">
                  {item.jobTitle}
                </td>
                <td className="px-3 py-3 font-mono text-accent">
                  {item.jobNumber}
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {item.quantity.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-slate-600 max-w-[200px] truncate">
                  {item.description}
                </td>
                <td className="px-3 py-3">
                  {item.operations.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.operations.map((op) => (
                        <Badge key={op} variant="primary" size="sm">
                          {op}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-500">
                  {item.customerPO || "-"}
                </td>
                <td className="px-3 py-3 text-slate-500">
                  {item.customerJobNumber || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <RunListEditModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
