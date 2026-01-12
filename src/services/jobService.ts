/**
 * Job service - business logic for job management
 */

import type { Job, Quote, JobStatus, Repository } from "../types";
import { generateId, generateJobNumber, now } from "../utils/idGenerator";

export class JobService {
  constructor(
    private jobRepository: Repository<Job>,
    private quoteRepository: Repository<Quote>
  ) {}

  async list(): Promise<Job[]> {
    return this.jobRepository.findAll();
  }

  async getById(id: string): Promise<Job | null> {
    return this.jobRepository.findById(id);
  }

  /**
   * Create a job from an accepted quote
   * @param quoteId - The quote to convert
   * @param selectedQuantity - The quantity option the customer chose
   */
  async createFromQuote(quoteId: string, selectedQuantity: number): Promise<Job> {
    const quote = await this.quoteRepository.findById(quoteId);
    if (!quote) {
      throw new Error(`Quote ${quoteId} not found`);
    }

    if (quote.status !== "accepted") {
      throw new Error(
        `Cannot create job from quote with status "${quote.status}". Quote must be accepted.`
      );
    }

    // Find the selected quantity option
    const selectedOption = quote.quantityOptions.find(
      (opt) => opt.quantity === selectedQuantity
    );
    if (!selectedOption) {
      const available = quote.quantityOptions.map((o) => o.quantity).join(", ");
      throw new Error(
        `Quantity ${selectedQuantity} not found in quote options. Available: ${available}`
      );
    }

    // Check if job already exists for this quote
    const existingJobs = await this.jobRepository.findAll();
    const existingJob = existingJobs.find((j) => j.quoteId === quoteId);
    if (existingJob) {
      throw new Error(
        `Job ${existingJob.jobNumber} already exists for quote ${quote.quoteNumber}`
      );
    }

    // Generate job number
    const existingNumbers = existingJobs.map((j) => j.jobNumber);
    const jobNumber = generateJobNumber(existingNumbers);

    const job: Job = {
      id: generateId(),
      jobNumber,
      quoteId: quote.id,
      customerId: quote.customerId,
      customerName: quote.customerName,
      jobTitle: quote.jobTitle,
      description: quote.description,
      finishedSize: quote.finishedSize,
      paperStock: quote.paperStock,
      quantity: selectedOption.quantity,
      unitPrice: selectedOption.unitPrice,
      status: "pending",
      createdAt: now(),
      updatedAt: now(),
    };

    return this.jobRepository.create(job);
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    const existing = await this.jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job ${id} not found`);
    }

    const updated: Job = {
      ...existing,
      status,
      updatedAt: now(),
      completedAt: status === "complete" ? now() : existing.completedAt,
    };

    return this.jobRepository.update(id, updated);
  }

  async startJob(id: string): Promise<Job> {
    return this.updateStatus(id, "in_progress");
  }

  async completeJob(id: string): Promise<Job> {
    return this.updateStatus(id, "complete");
  }

  async delete(id: string): Promise<boolean> {
    return this.jobRepository.delete(id);
  }

  async findByCustomer(customerId: string): Promise<Job[]> {
    const all = await this.jobRepository.findAll();
    return all.filter((j) => j.customerId === customerId);
  }

  async findByStatus(status: JobStatus): Promise<Job[]> {
    const all = await this.jobRepository.findAll();
    return all.filter((j) => j.status === status);
  }

  async findActiveJobs(): Promise<Job[]> {
    const all = await this.jobRepository.findAll();
    return all.filter((j) => j.status !== "complete");
  }

  // Calculate job total
  calculateTotal(job: Job): number {
    return job.quantity * job.unitPrice;
  }
}
