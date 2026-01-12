/**
 * Run List service - business logic for production run list management
 * This is a standalone feature - edits never affect the Jobs table
 */

import type {
  RunListItem,
  RunListStatus,
  CreateRunListItemInput,
  UpdateRunListItemInput,
  Repository,
  Job,
} from "../types";
import { generateId, now } from "../utils/idGenerator";

export class RunListService {
  constructor(
    private runListRepository: Repository<RunListItem>,
    private jobRepository: Repository<Job>
  ) {}

  async list(): Promise<RunListItem[]> {
    return this.runListRepository.findAll();
  }

  async getById(id: string): Promise<RunListItem | null> {
    return this.runListRepository.findById(id);
  }

  /**
   * Find run list item by job ID
   */
  async findByJobId(jobId: string): Promise<RunListItem | null> {
    const all = await this.runListRepository.findAll();
    return all.find((item) => item.jobId === jobId) ?? null;
  }

  /**
   * Create a run list item from a job
   * Copies relevant job data to create a standalone run list entry
   */
  async createFromJob(input: CreateRunListItemInput): Promise<RunListItem> {
    // Validate job exists
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) {
      throw new Error(`Job ${input.jobId} not found`);
    }

    // Check if job is already in run list
    const existing = await this.findByJobId(input.jobId);
    if (existing) {
      throw new Error(`Job ${job.jobNumber} is already in the Run List`);
    }

    const runListItem: RunListItem = {
      id: generateId(),
      jobId: job.id,
      // Copy from job
      jobNumber: job.jobNumber,
      customerName: job.customerName,
      jobTitle: job.jobTitle,
      customerPO: job.poNumber,
      customerJobNumber: job.customerJobNumber,
      quantity: job.quantity,
      description: job.description,
      // Run list specific fields
      category: input.category || "",
      dueOut: input.dueOut,
      dueIn: input.dueIn || job.expectedInDate,
      status: "planned",
      operations: input.operations || [],
      createdAt: now(),
      updatedAt: now(),
    };

    return this.runListRepository.create(runListItem);
  }

  /**
   * Update run list item fields
   * This never affects the source Job
   */
  async update(id: string, input: UpdateRunListItemInput): Promise<RunListItem> {
    const existing = await this.runListRepository.findById(id);
    if (!existing) {
      throw new Error(`Run List item ${id} not found`);
    }

    const updated: RunListItem = {
      ...existing,
      category: input.category ?? existing.category,
      dueOut: input.dueOut ?? existing.dueOut,
      dueIn: input.dueIn ?? existing.dueIn,
      status: input.status ?? existing.status,
      operations: input.operations ?? existing.operations,
      customerPO: input.customerPO ?? existing.customerPO,
      customerJobNumber: input.customerJobNumber ?? existing.customerJobNumber,
      quantity: input.quantity ?? existing.quantity,
      description: input.description ?? existing.description,
      updatedAt: now(),
    };

    return this.runListRepository.update(id, updated);
  }

  /**
   * Update run list item status
   */
  async updateStatus(id: string, status: RunListStatus): Promise<RunListItem> {
    const existing = await this.runListRepository.findById(id);
    if (!existing) {
      throw new Error(`Run List item ${id} not found`);
    }

    const updated: RunListItem = {
      ...existing,
      status,
      updatedAt: now(),
    };

    return this.runListRepository.update(id, updated);
  }

  /**
   * Delete run list item
   * This never affects the source Job
   */
  async delete(id: string): Promise<boolean> {
    return this.runListRepository.delete(id);
  }

  /**
   * Find run list items by status
   */
  async findByStatus(status: RunListStatus): Promise<RunListItem[]> {
    const all = await this.runListRepository.findAll();
    return all.filter((item) => item.status === status);
  }

  /**
   * Get active run list items (not complete)
   */
  async findActive(): Promise<RunListItem[]> {
    const all = await this.runListRepository.findAll();
    return all.filter((item) => item.status !== "complete");
  }

  /**
   * Sort run list items by category (desc) then due out (asc)
   */
  sortByDefault(items: RunListItem[]): RunListItem[] {
    return [...items].sort((a, b) => {
      // Category descending (Z-A)
      const categoryCompare = (b.category || "").localeCompare(a.category || "");
      if (categoryCompare !== 0) return categoryCompare;

      // Due out ascending (earliest first)
      const aDate = a.dueOut ? new Date(a.dueOut).getTime() : Infinity;
      const bDate = b.dueOut ? new Date(b.dueOut).getTime() : Infinity;
      return aDate - bDate;
    });
  }
}
