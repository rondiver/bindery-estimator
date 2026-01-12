"use server";

import { revalidatePath } from "next/cache";
import { jobService, quoteService } from "@/src/lib/services";
import type { JobStatus } from "@/src/lib/services";

export async function getJobs() {
  return jobService.list();
}

export async function getJob(id: string) {
  return jobService.getById(id);
}

export async function createJobFromQuote(quoteId: string, selectedQuantity: number) {
  const job = await jobService.createFromQuote(quoteId, selectedQuantity);
  revalidatePath("/jobs");
  revalidatePath("/quotes");
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

export async function deleteJob(id: string) {
  const result = await jobService.delete(id);
  revalidatePath("/jobs");
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
