"use client";

import { useState, useEffect } from "react";
import type { RunListItem, RunListStatus } from "@/src/lib/services";
import { updateRunListItem, deleteRunListItem } from "../actions/runList";
import { TagInput } from "./TagInput";
import { Modal, ModalBody, ModalFooter, Button, Input, Select, Textarea } from "../components/ui";

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
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={item ? `Edit Run List Item` : undefined}
      description={item ? item.jobNumber : undefined}
      size="lg"
    >
      {item && (
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Read-only fields */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                  Job Reference
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Job #:</span>{" "}
                    <span className="font-mono text-accent">{item.jobNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Customer:</span>{" "}
                    <span className="text-slate-900">{item.customerName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Title:</span>{" "}
                    <span className="text-slate-700">{item.jobTitle}</span>
                  </div>
                </div>
              </div>

              {/* Editable fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Category"
                  id="category"
                  name="category"
                  defaultValue={item.category}
                />
                <Select
                  label="Status"
                  id="status"
                  name="status"
                  defaultValue={item.status}
                  options={statusOptions}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Due In"
                  type="date"
                  id="dueIn"
                  name="dueIn"
                  defaultValue={item.dueIn}
                />
                <Input
                  label="Due Out"
                  type="date"
                  id="dueOut"
                  name="dueOut"
                  defaultValue={item.dueOut}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Customer PO"
                  id="customerPO"
                  name="customerPO"
                  defaultValue={item.customerPO}
                />
                <Input
                  label="Customer Job #"
                  id="customerJobNumber"
                  name="customerJobNumber"
                  defaultValue={item.customerJobNumber}
                />
              </div>

              <Input
                label="Quantity"
                type="number"
                id="quantity"
                name="quantity"
                defaultValue={item.quantity}
                min={0}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Operations
                </label>
                <TagInput
                  value={operations}
                  onChange={setOperations}
                  placeholder="Add operation code..."
                />
              </div>

              <Textarea
                label="Description"
                id="description"
                name="description"
                rows={3}
                defaultValue={item.description}
              />
            </div>
          </ModalBody>

          <ModalFooter className="justify-between">
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={deleting || saving}
              isLoading={deleting}
            >
              Remove from Run List
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || deleting}
                isLoading={saving}
              >
                Save Changes
              </Button>
            </div>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
