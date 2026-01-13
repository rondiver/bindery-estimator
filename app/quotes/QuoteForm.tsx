"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Customer, Quote, CreateQuoteInput, CreateQuantityOptionInput } from "@/src/lib/services";
import { createQuote, updateQuote } from "../actions/quotes";
import { Card, CardContent, Input, Select, Textarea, Button } from "../components/ui";

interface QuoteFormProps {
  customers: Customer[];
  quote?: Quote;
}

export function QuoteForm({ customers, quote }: QuoteFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantityOptions, setQuantityOptions] = useState<CreateQuantityOptionInput[]>(
    quote?.quantityOptions.map((o) => ({ quantity: o.quantity, unitPrice: o.unitPrice })) ||
      [{ quantity: 500, unitPrice: 0 }]
  );

  function addQuantityOption() {
    setQuantityOptions([...quantityOptions, { quantity: 0, unitPrice: 0 }]);
  }

  function removeQuantityOption(index: number) {
    setQuantityOptions(quantityOptions.filter((_, i) => i !== index));
  }

  function updateQuantityOption(index: number, field: "quantity" | "unitPrice", value: number) {
    const updated = [...quantityOptions];
    updated[index] = { ...updated[index], [field]: value };
    setQuantityOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (quote) {
        const input: Partial<Omit<CreateQuoteInput, "customerId">> = {
          customerNumber: formData.get("customerNumber") as string || undefined,
          jobTitle: formData.get("jobTitle") as string,
          description: formData.get("description") as string,
          finishedSize: formData.get("finishedSize") as string,
          paperStock: formData.get("paperStock") as string || undefined,
          quantityOptions,
          notes: formData.get("notes") as string || undefined,
        };
        await updateQuote(quote.id, input);
      } else {
        const input: CreateQuoteInput = {
          customerId: formData.get("customerId") as string,
          customerNumber: formData.get("customerNumber") as string || undefined,
          jobTitle: formData.get("jobTitle") as string,
          description: formData.get("description") as string,
          finishedSize: formData.get("finishedSize") as string,
          paperStock: formData.get("paperStock") as string || undefined,
          quantityOptions,
          notes: formData.get("notes") as string || undefined,
        };
        await createQuote(input);
      }
      router.push("/quotes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  }

  const customerOptions = [
    { value: "", label: "Select a customer..." },
    ...customers.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Card variant="elevated" className="max-w-3xl">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              {quote ? (
                <Input
                  label="Customer"
                  value={quote.customerName}
                  disabled
                  helperText="Customer cannot be changed"
                />
              ) : (
                <Select
                  label="Customer"
                  id="customerId"
                  name="customerId"
                  required
                  options={customerOptions}
                />
              )}
            </div>
            <Input
              label="Customer PO/Job #"
              id="customerNumber"
              name="customerNumber"
              defaultValue={quote?.customerNumber}
            />
          </div>

          <Input
            label="Job Title"
            id="jobTitle"
            name="jobTitle"
            required
            defaultValue={quote?.jobTitle}
          />

          <Textarea
            label="Description"
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={quote?.description}
            placeholder="Describe the bindery services to be performed..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Finished Size"
              id="finishedSize"
              name="finishedSize"
              required
              placeholder="e.g., 8.5 x 11"
              defaultValue={quote?.finishedSize}
            />
            <Input
              label="Paper Stock"
              id="paperStock"
              name="paperStock"
              placeholder="e.g., 80# gloss text"
              defaultValue={quote?.paperStock}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity Options *
            </label>
            <div className="space-y-3">
              {quantityOptions.map((opt, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={opt.quantity}
                      onChange={(e) => updateQuantityOption(index, "quantity", parseInt(e.target.value) || 0)}
                      placeholder="Quantity"
                      min={1}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm
                                 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent
                                 transition-shadow"
                    />
                  </div>
                  <span className="text-slate-500">@</span>
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500">$</span>
                      <input
                        type="number"
                        value={opt.unitPrice}
                        onChange={(e) => updateQuantityOption(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        placeholder="Unit price"
                        step="0.001"
                        min={0}
                        className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm
                                   focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:border-accent
                                   transition-shadow"
                      />
                    </div>
                  </div>
                  <span className="text-slate-600 w-28 text-right font-medium">
                    = ${(opt.quantity * opt.unitPrice).toFixed(2)}
                  </span>
                  {quantityOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuantityOption(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
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
              className="mt-3 text-accent hover:text-accent-dark text-sm font-medium transition-colors"
            >
              + Add quantity option
            </button>
          </div>

          <Textarea
            label="Notes"
            id="notes"
            name="notes"
            rows={2}
            defaultValue={quote?.notes}
          />

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button type="submit" disabled={saving} isLoading={saving}>
              {quote ? "Update Quote" : "Create Quote"}
            </Button>
            <Link href="/quotes">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
