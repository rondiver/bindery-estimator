"use server";

import { revalidatePath } from "next/cache";
import { jobService } from "@/src/lib/services";
import type { JobStatus, UpdateJobInput } from "@/src/lib/services";

export async function getJobs() {
  return jobService.list();
}

export async function getJob(id: string) {
  return jobService.getById(id);
}

export async function getJobByQuoteId(quoteId: string) {
  return jobService.findByQuoteId(quoteId);
}

export async function createJobFromQuote(quoteId: string, selectedQuantity: number) {
  const job = await jobService.createFromQuote(quoteId, selectedQuantity);
  revalidatePath("/jobs");
  revalidatePath("/quotes");
  revalidatePath(`/quotes/${quoteId}`);
  return job;
}

export async function updateJob(id: string, input: UpdateJobInput) {
  const job = await jobService.update(id, input);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return job;
}

export async function updateJobStatus(id: string, status: JobStatus) {
  const job = await jobService.updateStatus(id, status);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return job;
}

export async function startJob(id: string) {
  const job = await jobService.startJob(id);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return job;
}

export async function completeJob(id: string) {
  const job = await jobService.completeJob(id);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return job;
}

export async function holdJob(id: string) {
  const job = await jobService.holdJob(id);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return job;
}

export async function cancelJob(id: string) {
  const job = await jobService.cancelJob(id);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return job;
}

export async function deleteJob(id: string) {
  const result = await jobService.delete(id);
  revalidatePath("/jobs");
  revalidatePath("/quotes");
  return result;
}

export async function getJobsByCustomer(customerId: string) {
  return jobService.findByCustomer(customerId);
}

export async function getJobsByStatus(status: JobStatus) {
  return jobService.findByStatus(status);
}

export async function getActiveJobs() {
  return jobService.findActiveJobs();
}
