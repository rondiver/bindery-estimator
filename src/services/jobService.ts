/**
 * Job service - business logic for job management
 */

import type { Job, Quote, JobStatus, UpdateJobInput, Repository } from "../types";
import { generateId, now } from "../utils/idGenerator";

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
   * Find job by quote ID
   */
  async findByQuoteId(quoteId: string): Promise<Job | null> {
    const all = await this.jobRepository.findAll();
    return all.find((j) => j.quoteId === quoteId) ?? null;
  }

  /**
   * Create a job from an accepted quote (promote quote to job)
   * @param quoteId - The quote to promote
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

    // Check if quote has already been promoted
    if (quote.jobId) {
      const existingJob = await this.jobRepository.findById(quote.jobId);
      if (existingJob) {
        throw new Error(
          `Quote ${quote.quoteNumber} has already been promoted to Job ${existingJob.jobNumber}`
        );
      }
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

    // Check for duplicate job number (jobs inherit quote numbers)
    const existingJobs = await this.jobRepository.findAll();
    const duplicateJob = existingJobs.find((j) => j.jobNumber === quote.quoteNumber);
    if (duplicateJob) {
      throw new Error(
        `A job with number ${quote.quoteNumber} already exists`
      );
    }

    // Use quote number as job number (jobs inherit quote numbers)
    const jobNumber = quote.quoteNumber;

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

    // Create the job
    const createdJob = await this.jobRepository.create(job);

    // Update quote with job reference
    const updatedQuote: Quote = {
      ...quote,
      jobId: createdJob.id,
      updatedAt: now(),
    };
    await this.quoteRepository.update(quote.id, updatedQuote);

    return createdJob;
  }

  /**
   * Update job-specific fields (not quote-derived fields)
   */
  async update(id: string, input: UpdateJobInput): Promise<Job> {
    const existing = await this.jobRepository.findById(id);
    if (!existing) {
      throw new Error(`Job ${id} not found`);
    }

    const updated: Job = {
      ...existing,
      customerJobNumber: input.customerJobNumber ?? existing.customerJobNumber,
      poNumber: input.poNumber ?? existing.poNumber,
      partNumber: input.partNumber ?? existing.partNumber,
      expectedInDate: input.expectedInDate ?? existing.expectedInDate,
      dueDate: input.dueDate ?? existing.dueDate,
      allowedSamples: input.allowedSamples ?? existing.allowedSamples,
      allowedOvers: input.allowedOvers ?? existing.allowedOvers,
      deliveryInformation: input.deliveryInformation ?? existing.deliveryInformation,
      miscellaneousNotes: input.miscellaneousNotes ?? existing.miscellaneousNotes,
      updatedAt: now(),
    };

    return this.jobRepository.update(id, updated);
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

  async holdJob(id: string): Promise<Job> {
    return this.updateStatus(id, "on_hold");
  }

  async cancelJob(id: string): Promise<Job> {
    return this.updateStatus(id, "cancelled");
  }

  async delete(id: string): Promise<boolean> {
    // Get job first to update quote
    const job = await this.jobRepository.findById(id);
    if (job) {
      // Remove job reference from quote
      const quote = await this.quoteRepository.findById(job.quoteId);
      if (quote && quote.jobId === id) {
        const updatedQuote: Quote = {
          ...quote,
          jobId: undefined,
          updatedAt: now(),
        };
        await this.quoteRepository.update(quote.id, updatedQuote);
      }
    }

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
    return all.filter((j) => j.status !== "complete" && j.status !== "cancelled");
  }

  async findByDueDateRange(startDate: string, endDate: string): Promise<Job[]> {
    const all = await this.jobRepository.findAll();
    return all.filter((j) => {
      if (!j.dueDate) return false;
      return j.dueDate >= startDate && j.dueDate <= endDate;
    });
  }

  // Calculate job total
  calculateTotal(job: Job): number {
    return job.quantity * job.unitPrice;
  }
}
