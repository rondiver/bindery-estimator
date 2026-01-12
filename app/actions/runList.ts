"use server";

import { revalidatePath } from "next/cache";
import { runListService } from "@/src/lib/services";
import type {
  CreateRunListItemInput,
  UpdateRunListItemInput,
  RunListStatus,
} from "@/src/lib/services";

export async function getRunList() {
  return runListService.list();
}

export async function getRunListItem(id: string) {
  return runListService.getById(id);
}

export async function getRunListItemByJobId(jobId: string) {
  return runListService.findByJobId(jobId);
}

export async function addJobToRunList(input: CreateRunListItemInput) {
  const item = await runListService.createFromJob(input);
  revalidatePath("/run-list");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${input.jobId}`);
  return item;
}

export async function updateRunListItem(
  id: string,
  input: UpdateRunListItemInput
) {
  const item = await runListService.update(id, input);
  revalidatePath("/run-list");
  return item;
}

export async function updateRunListStatus(id: string, status: RunListStatus) {
  const item = await runListService.updateStatus(id, status);
  revalidatePath("/run-list");
  return item;
}

export async function deleteRunListItem(id: string) {
  const result = await runListService.delete(id);
  revalidatePath("/run-list");
  return result;
}

export async function getActiveRunList() {
  return runListService.findActive();
}

export async function getRunListByStatus(status: RunListStatus) {
  return runListService.findByStatus(status);
}
