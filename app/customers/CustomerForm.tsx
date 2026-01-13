"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Customer, CreateCustomerInput } from "@/src/lib/services";
import { createCustomer, updateCustomer, checkForDuplicates } from "../actions/customers";
import { Card, Input, Textarea, Button } from "../components/ui";

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
    <Card variant="elevated" className="max-w-2xl">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {duplicateWarnings.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">Potential duplicate detected</p>
                <ul className="mt-1 text-sm list-disc list-inside">
                  {duplicateWarnings.map((warning, i) => (
                    <li key={i}>
                      {warning.type === "email" ? (
                        <>
                          Email already used by{" "}
                          <Link
                            href={`/customers/${warning.existingCustomer.id}`}
                            className="underline hover:text-amber-900 font-medium"
                          >
                            {warning.existingCustomer.name}
                          </Link>
                        </>
                      ) : (
                        <>
                          Company name matches{" "}
                          <Link
                            href={`/customers/${warning.existingCustomer.id}`}
                            className="underline hover:text-amber-900 font-medium"
                          >
                            {warning.existingCustomer.name}
                          </Link>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <Input
            label="Company Name"
            name="name"
            required
            defaultValue={customer?.name}
            onBlur={handleBlur}
          />

          <Input
            label="Contact Name"
            name="contactName"
            defaultValue={customer?.contactName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Email"
                type="email"
                name="email"
                defaultValue={customer?.email}
                onBlur={handleBlur}
                helperText={checkingDuplicates ? "Checking for duplicates..." : undefined}
              />
            </div>
            <Input
              label="Phone"
              type="tel"
              name="phone"
              defaultValue={customer?.phone}
            />
          </div>

          <Textarea
            label="Address"
            name="address"
            rows={2}
            defaultValue={customer?.address}
          />

          <Textarea
            label="Notes"
            name="notes"
            rows={3}
            defaultValue={customer?.notes}
          />
        </div>

        <div className="mt-8 flex items-center gap-3 pt-6 border-t border-slate-100">
          <Button type="submit" isLoading={saving}>
            {customer ? "Update Customer" : "Create Customer"}
          </Button>
          <Link href="/customers">
            <Button variant="secondary">Cancel</Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
