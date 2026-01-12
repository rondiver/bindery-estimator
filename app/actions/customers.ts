"use server";

import { revalidatePath } from "next/cache";
import { customerService } from "@/src/lib/services";
import type { CreateCustomerInput } from "@/src/lib/services";

export async function getCustomers() {
  return customerService.list();
}

export async function checkForDuplicates(input: CreateCustomerInput, excludeId?: string) {
  return customerService.checkForDuplicates(input, excludeId);
}

export async function getCustomer(id: string) {
  return customerService.getById(id);
}

export async function createCustomer(input: CreateCustomerInput) {
  const customer = await customerService.create(input);
  revalidatePath("/customers");
  return customer;
}

export async function updateCustomer(id: string, input: Partial<CreateCustomerInput>) {
  const customer = await customerService.update(id, input);
  revalidatePath("/customers");
  revalidatePath(`/customers/${id}`);
  return customer;
}

export async function deleteCustomer(id: string) {
  const result = await customerService.delete(id);
  revalidatePath("/customers");
  return result;
}

export async function searchCustomers(name: string) {
  return customerService.findByName(name);
}
