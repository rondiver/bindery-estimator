"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { RunListItem, RunListStatus } from "@/src/lib/services";
import { RunListEditModal } from "./RunListEditModal";

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

const statusColors: Record<RunListStatus, string> = {
  planned: "bg-gray-100 text-gray-700",
  in: "bg-blue-100 text-blue-700",
  hold: "bg-orange-100 text-orange-700",
  complete: "bg-green-100 text-green-700",
};

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

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
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
  }, [items, sortField, sortDirection]);

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
        className={`text-left px-3 py-2 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none ${className}`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          {children}
          <span className="text-gray-400">
            {isActive ? (sortDirection === "asc" ? "↑" : "↓") : ""}
          </span>
        </div>
      </th>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No items in the Run List.</p>
        <p className="text-gray-400 text-sm mt-1">
          Add jobs to the Run List from the job detail page.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <SortHeader field="category">Category</SortHeader>
                <SortHeader field="dueOut">Due Out</SortHeader>
                <SortHeader field="status">Status</SortHeader>
                <SortHeader field="jobNumber">Job #</SortHeader>
                <SortHeader field="customerName">Customer</SortHeader>
                <SortHeader field="jobTitle">Job Title</SortHeader>
                <SortHeader field="customerPO">Customer PO</SortHeader>
                <SortHeader field="customerJobNumber">Cust Job #</SortHeader>
                <SortHeader field="dueIn">Due In</SortHeader>
                <SortHeader field="quantity">Qty</SortHeader>
                <SortHeader field="operations">Operations</SortHeader>
                <SortHeader field="description" className="min-w-[200px]">
                  Description
                </SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <td className="px-3 py-2 font-medium">{item.category || "-"}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {item.dueOut
                      ? new Date(item.dueOut).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[item.status]}`}
                    >
                      {statusLabels[item.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-blue-600">
                    {item.jobNumber}
                  </td>
                  <td className="px-3 py-2">{item.customerName}</td>
                  <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate">
                    {item.jobTitle}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {item.customerPO || "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {item.customerJobNumber || "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {item.dueIn
                      ? new Date(item.dueIn).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {item.operations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.operations.map((op) => (
                          <span
                            key={op}
                            className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate">
                    {item.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
