"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Customer, CreateCustomerInput } from "@/src/lib/services";
import { createCustomer, updateCustomer, checkForDuplicates } from "../actions/customers";

interface DuplicateWarning {
  type: "email" | "name";
  existingCustomer: Customer;
}

interface CustomerFormProps {
  customer?: Customer;
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarnings, setDuplicateWarnings] = useState<DuplicateWarning[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  const checkDuplicates = useCallback(
    async (name: string, email: string) => {
      if (!name && !email) {
        setDuplicateWarnings([]);
        return;
      }

      setCheckingDuplicates(true);
      try {
        const result = await checkForDuplicates(
          { name, email: email || undefined },
          customer?.id
        );

        const warnings: DuplicateWarning[] = [];
        if (result.duplicateEmail) {
          warnings.push({ type: "email", existingCustomer: result.duplicateEmail });
        }
        if (result.duplicateName && result.duplicateName.id !== result.duplicateEmail?.id) {
          warnings.push({ type: "name", existingCustomer: result.duplicateName });
        }
        setDuplicateWarnings(warnings);
      } catch {
        // Ignore errors during duplicate check
      } finally {
        setCheckingDuplicates(false);
      }
    },
    [customer?.id]
  );

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const form = e.currentTarget.form;
    if (!form) return;

    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    checkDuplicates(name, email);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const input: CreateCustomerInput = {
      name: formData.get("name") as string,
      contactName: (formData.get("contactName") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    try {
      if (customer) {
        await updateCustomer(customer.id, input);
      } else {
        await createCustomer(input);
      }
      router.push("/customers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {duplicateWarnings.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
          <p className="font-medium">Potential duplicate detected:</p>
          <ul className="mt-1 text-sm list-disc list-inside">
            {duplicateWarnings.map((warning, i) => (
              <li key={i}>
                {warning.type === "email" ? (
                  <>
                    Email already used by{" "}
                    <a
                      href={`/customers/${warning.existingCustomer.id}`}
                      className="underline hover:text-yellow-900"
                    >
                      {warning.existingCustomer.name}
                    </a>
                  </>
                ) : (
                  <>
                    Company name matches{" "}
                    <a
                      href={`/customers/${warning.existingCustomer.id}`}
                      className="underline hover:text-yellow-900"
                    >
                      {warning.existingCustomer.name}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={customer?.name}
            onBlur={handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Name
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            defaultValue={customer?.contactName}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={customer?.email}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {checkingDuplicates && (
              <p className="text-xs text-gray-500 mt-1">Checking for duplicates...</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={customer?.phone}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={customer?.address}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={customer?.notes}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
        </button>
        <a
          href="/customers"
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
