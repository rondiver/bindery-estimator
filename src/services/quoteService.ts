/**
 * Quote service - business logic for quote management
 */

import type {
  Quote,
  Customer,
  QuantityOption,
  CreateQuoteInput,
  CreateQuantityOptionInput,
  QuoteStatus,
  Repository,
} from "../types";
import { generateId, generateQuoteNumber, now } from "../utils/idGenerator";

export class QuoteService {
  constructor(
    private quoteRepository: Repository<Quote>,
    private customerRepository: Repository<Customer>
  ) {}

  async list(): Promise<Quote[]> {
    return this.quoteRepository.findAll();
  }

  async getById(id: string): Promise<Quote | null> {
    return this.quoteRepository.findById(id);
  }

  async create(input: CreateQuoteInput): Promise<Quote> {
    // Validate customer exists
    const customer = await this.customerRepository.findById(input.customerId);
    if (!customer) {
      throw new Error(`Customer ${input.customerId} not found`);
    }

    // Generate quote number
    const allQuotes = await this.quoteRepository.findAll();
    const existingNumbers = allQuotes.map((q) => q.quoteNumber);
    const quoteNumber = generateQuoteNumber(existingNumbers);

    // Build quantity options with IDs
    const quantityOptions: QuantityOption[] = input.quantityOptions.map(
      (opt) => this.createQuantityOption(opt)
    );

    const quote: Quote = {
      id: generateId(),
      quoteNumber,
      version: 1,
      customerId: input.customerId,
      customerName: customer.name,
      customerNumber: input.customerNumber,
      jobTitle: input.jobTitle,
      description: input.description,
      finishedSize: input.finishedSize,
      paperStock: input.paperStock,
      quantityOptions,
      status: "draft",
      notes: input.notes,
      createdAt: now(),
      updatedAt: now(),
    };

    return this.quoteRepository.create(quote);
  }

  async update(
    id: string,
    input: Partial<Omit<CreateQuoteInput, "customerId">>
  ): Promise<Quote> {
    const existing = await this.quoteRepository.findById(id);
    if (!existing) {
      throw new Error(`Quote ${id} not found`);
    }

    const updated: Quote = {
      ...existing,
      jobTitle: input.jobTitle ?? existing.jobTitle,
      description: input.description ?? existing.description,
      finishedSize: input.finishedSize ?? existing.finishedSize,
      paperStock: input.paperStock ?? existing.paperStock,
      customerNumber: input.customerNumber ?? existing.customerNumber,
      notes: input.notes ?? existing.notes,
      updatedAt: now(),
    };

    // If quantity options provided, rebuild them
    if (input.quantityOptions) {
      updated.quantityOptions = input.quantityOptions.map((opt) =>
        this.createQuantityOption(opt)
      );
    }

    return this.quoteRepository.update(id, updated);
  }

  async updateStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const existing = await this.quoteRepository.findById(id);
    if (!existing) {
      throw new Error(`Quote ${id} not found`);
    }

    const updated: Quote = {
      ...existing,
      status,
      updatedAt: now(),
    };

    return this.quoteRepository.update(id, updated);
  }

  async createRevision(id: string): Promise<Quote> {
    const existing = await this.quoteRepository.findById(id);
    if (!existing) {
      throw new Error(`Quote ${id} not found`);
    }

    // Find highest version for this quote number
    const allQuotes = await this.quoteRepository.findAll();
    const sameQuoteNumber = allQuotes.filter(
      (q) => q.quoteNumber === existing.quoteNumber
    );
    const maxVersion = Math.max(...sameQuoteNumber.map((q) => q.version));

    const revision: Quote = {
      ...existing,
      id: generateId(),
      version: maxVersion + 1,
      status: "draft",
      createdAt: now(),
      updatedAt: now(),
    };

    return this.quoteRepository.create(revision);
  }

  async delete(id: string): Promise<boolean> {
    return this.quoteRepository.delete(id);
  }

  async findByCustomer(customerId: string): Promise<Quote[]> {
    const all = await this.quoteRepository.findAll();
    return all.filter((q) => q.customerId === customerId);
  }

  async findByStatus(status: QuoteStatus): Promise<Quote[]> {
    const all = await this.quoteRepository.findAll();
    return all.filter((q) => q.status === status);
  }

  // Calculate total for a quantity option
  calculateTotal(option: QuantityOption): number {
    return option.quantity * option.unitPrice;
  }

  // Format quote number with version for display
  formatQuoteNumber(quote: Quote): string {
    if (quote.version === 1) {
      return quote.quoteNumber;
    }
    return `${quote.quoteNumber}-v${quote.version}`;
  }

  private createQuantityOption(input: CreateQuantityOptionInput): QuantityOption {
    return {
      id: generateId(),
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    };
  }
}
