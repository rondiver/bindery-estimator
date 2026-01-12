"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Customer,
  Quote,
  CreateQuantityOptionInput,
} from "@/src/lib/services";
import { updateQuote } from "../../../actions/quotes";

interface QuoteEditFormProps {
  quote: Quote;
  customers: Customer[];
}

export function QuoteEditForm({ quote, customers }: QuoteEditFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantityOptions, setQuantityOptions] = useState<
    CreateQuantityOptionInput[]
  >(
    quote.quantityOptions.map((o) => ({
      quantity: o.quantity,
      unitPrice: o.unitPrice,
    }))
  );

  function addQuantityOption() {
    setQuantityOptions([...quantityOptions, { quantity: 0, unitPrice: 0 }]);
  }

  function removeQuantityOption(index: number) {
    if (quantityOptions.length <= 1) return;
    setQuantityOptions(quantityOptions.filter((_, i) => i !== index));
  }

  function updateQuantityOption(
    index: number,
    field: "quantity" | "unitPrice",
    value: number
  ) {
    const updated = [...quantityOptions];
    updated[index] = { ...updated[index], [field]: value };
    setQuantityOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Validation
    if (quantityOptions.length === 0) {
      setError("At least one quantity option is required");
      return;
    }

    for (const opt of quantityOptions) {
      if (opt.quantity <= 0) {
        setError("All quantities must be greater than 0");
        return;
      }
      if (opt.unitPrice < 0) {
        setError("Unit prices cannot be negative");
        return;
      }
    }

    setSaving(true);

    const formData = new FormData(e.currentTarget);

    try {
      await updateQuote(quote.id, {
        customerNumber: (formData.get("customerNumber") as string) || undefined,
        jobTitle: formData.get("jobTitle") as string,
        description: formData.get("description") as string,
        finishedSize: formData.get("finishedSize") as string,
        paperStock: (formData.get("paperStock") as string) || undefined,
        quantityOptions,
        notes: (formData.get("notes") as string) || undefined,
      });
      router.push(`/quotes/${quote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-6 max-w-3xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <input
              type="text"
              value={quote.customerName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customer cannot be changed. Create a new quote for a different
              customer.
            </p>
          </div>
          <div>
            <label
              htmlFor="customerNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Customer PO/Job #
            </label>
            <input
              type="text"
              id="customerNumber"
              name="customerNumber"
              defaultValue={quote.customerNumber}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="jobTitle"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Job Title *
          </label>
          <input
            type="text"
            id="jobTitle"
            name="jobTitle"
            required
            defaultValue={quote.jobTitle}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={quote.description}
            placeholder="Describe the bindery services to be performed..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="finishedSize"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Finished Size *
            </label>
            <input
              type="text"
              id="finishedSize"
              name="finishedSize"
              required
              placeholder="e.g., 8.5 x 11"
              defaultValue={quote.finishedSize}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="paperStock"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Paper Stock
            </label>
            <input
              type="text"
              id="paperStock"
              name="paperStock"
              placeholder="e.g., 80# gloss text"
              defaultValue={quote.paperStock}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity Options *
          </label>
          <div className="space-y-2">
            {quantityOptions.map((opt, index) => (
              <div key={index} className="flex gap-3 items-center">
                <div className="flex-1">
                  <input
                    type="number"
                    value={opt.quantity}
                    onChange={(e) =>
                      updateQuantityOption(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="Quantity"
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-gray-500">@</span>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={opt.unitPrice}
                      onChange={(e) =>
                        updateQuantityOption(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="Unit price"
                      step="0.001"
                      min={0}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <span className="text-gray-600 w-24 text-right">
                  = ${(opt.quantity * opt.unitPrice).toFixed(2)}
                </span>
                {quantityOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuantityOption(index)}
                    className="text-red-600 hover:text-red-800 px-2"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addQuantityOption}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            + Add quantity option
          </button>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={quote.notes}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Info */}
        <div className="p-4 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Current Status:</strong>{" "}
            <span className="capitalize">{quote.status}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            To change status, use the actions on the quote detail page.
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <a
          href={`/quotes/${quote.id}`}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
