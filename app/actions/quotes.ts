"use server";

import { revalidatePath } from "next/cache";
import { quoteService } from "@/src/lib/services";
import type { CreateQuoteInput, QuoteStatus } from "@/src/lib/services";

export async function getQuotes() {
  return quoteService.list();
}

export async function getQuote(id: string) {
  return quoteService.getById(id);
}

export async function createQuote(input: CreateQuoteInput) {
  const quote = await quoteService.create(input);
  revalidatePath("/quotes");
  return quote;
}

export async function updateQuote(
  id: string,
  input: Partial<Omit<CreateQuoteInput, "customerId">>
) {
  const quote = await quoteService.update(id, input);
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  return quote;
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const quote = await quoteService.updateStatus(id, status);
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${id}`);
  return quote;
}

export async function createQuoteRevision(id: string) {
  const quote = await quoteService.createRevision(id);
  revalidatePath("/quotes");
  return quote;
}

export async function deleteQuote(id: string) {
  const result = await quoteService.delete(id);
  revalidatePath("/quotes");
  return result;
}

export async function getQuotesByCustomer(customerId: string) {
  return quoteService.findByCustomer(customerId);
}

export async function getQuotesByStatus(status: QuoteStatus) {
  return quoteService.findByStatus(status);
}
