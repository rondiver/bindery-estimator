"use client";

import { useState, useEffect } from "react";
import type { RunListItem, RunListStatus } from "@/src/lib/services";
import { updateRunListItem, deleteRunListItem } from "../actions/runList";
import { TagInput } from "./TagInput";

interface RunListEditModalProps {
  item: RunListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const statusOptions: { value: RunListStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "in", label: "In" },
  { value: "hold", label: "Hold" },
  { value: "complete", label: "Complete" },
];

export function RunListEditModal({
  item,
  onClose,
  onSaved,
}: RunListEditModalProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operations, setOperations] = useState<string[]>([]);

  // Reset operations when item changes
  useEffect(() => {
    if (item) {
      setOperations(item.operations || []);
    }
  }, [item]);

  if (!item) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    try {
      await updateRunListItem(item!.id, {
        category: formData.get("category") as string,
        dueOut: (formData.get("dueOut") as string) || undefined,
        dueIn: (formData.get("dueIn") as string) || undefined,
        status: formData.get("status") as RunListStatus,
        operations,
        customerPO: (formData.get("customerPO") as string) || undefined,
        customerJobNumber:
          (formData.get("customerJobNumber") as string) || undefined,
        quantity: parseInt(formData.get("quantity") as string, 10) || 0,
        description: formData.get("description") as string,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Run List save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Are you sure you want to remove "${item!.jobNumber}" from the Run List?`
      )
    ) {
      return;
    }

    setError(null);
    setDeleting(true);

    try {
      await deleteRunListItem(item!.id);
      onSaved();
      onClose();
    } catch (err) {
      console.error("Run List delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Edit Run List Item:{" "}
              <span className="font-mono">{item.jobNumber}</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">
                {error}
              </div>
            )}

            {/* Read-only fields */}
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Job Reference (read-only)
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Job #:</span>{" "}
                  <span className="font-mono">{item.jobNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Customer:</span>{" "}
                  {item.customerName}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Title:</span> {item.jobTitle}
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  defaultValue={item.category}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={item.status}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dueIn"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due In
                </label>
                <input
                  type="date"
                  id="dueIn"
                  name="dueIn"
                  defaultValue={item.dueIn}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="dueOut"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Out
                </label>
                <input
                  type="date"
                  id="dueOut"
                  name="dueOut"
                  defaultValue={item.dueOut}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="customerPO"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Customer PO
                </label>
                <input
                  type="text"
                  id="customerPO"
                  name="customerPO"
                  defaultValue={item.customerPO}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="customerJobNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Customer Job #
                </label>
                <input
                  type="text"
                  id="customerJobNumber"
                  name="customerJobNumber"
                  defaultValue={item.customerJobNumber}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                defaultValue={item.quantity}
                min={0}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operations
              </label>
              <TagInput
                value={operations}
                onChange={setOperations}
                placeholder="Add operation code..."
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={item.description}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Remove from Run List"}
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || deleting}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
