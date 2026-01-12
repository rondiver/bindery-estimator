/**
 * Customer service - business logic for customer management
 */

import type { Customer, CreateCustomerInput, Repository } from "../types";
import { generateId, now } from "../utils/idGenerator";

export interface DuplicateGroup {
  email: string;
  customers: Customer[];
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  duplicateEmail?: Customer;
  duplicateName?: Customer;
}

export class CustomerService {
  constructor(private repository: Repository<Customer>) {}

  async list(): Promise<Customer[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Customer | null> {
    return this.repository.findById(id);
  }

  /**
   * Check if a customer with the same email or name already exists
   */
  async checkForDuplicates(
    input: CreateCustomerInput,
    excludeId?: string
  ): Promise<DuplicateCheckResult> {
    const all = await this.repository.findAll();
    const result: DuplicateCheckResult = { hasDuplicates: false };

    if (input.email) {
      const emailMatch = all.find(
        (c) =>
          c.id !== excludeId &&
          c.email?.toLowerCase() === input.email?.toLowerCase()
      );
      if (emailMatch) {
        result.hasDuplicates = true;
        result.duplicateEmail = emailMatch;
      }
    }

    const nameMatch = all.find(
      (c) =>
        c.id !== excludeId &&
        c.name.toLowerCase() === input.name.toLowerCase()
    );
    if (nameMatch) {
      result.hasDuplicates = true;
      result.duplicateName = nameMatch;
    }

    return result;
  }

  /**
   * Find all duplicate customer groups by email
   */
  async findDuplicates(): Promise<DuplicateGroup[]> {
    const all = await this.repository.findAll();
    const emailGroups = new Map<string, Customer[]>();

    for (const customer of all) {
      if (customer.email) {
        const key = customer.email.toLowerCase();
        const group = emailGroups.get(key) || [];
        group.push(customer);
        emailGroups.set(key, group);
      }
    }

    const duplicates: DuplicateGroup[] = [];
    for (const [email, customers] of emailGroups) {
      if (customers.length > 1) {
        duplicates.push({ email, customers });
      }
    }

    return duplicates;
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    // Check for duplicate email (unique constraint)
    if (input.email) {
      const duplicateCheck = await this.checkForDuplicates(input);
      if (duplicateCheck.duplicateEmail) {
        throw new Error(
          `A customer with email "${input.email}" already exists: ${duplicateCheck.duplicateEmail.name}`
        );
      }
    }

    const customer: Customer = {
      id: generateId(),
      name: input.name,
      contactName: input.contactName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      notes: input.notes,
      createdAt: now(),
    };

    return this.repository.create(customer);
  }

  async update(
    id: string,
    input: Partial<CreateCustomerInput>
  ): Promise<Customer> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Customer ${id} not found`);
    }

    // Check for duplicate email if email is being changed
    if (input.email && input.email !== existing.email) {
      const duplicateCheck = await this.checkForDuplicates(
        { ...existing, ...input } as CreateCustomerInput,
        id
      );
      if (duplicateCheck.duplicateEmail) {
        throw new Error(
          `A customer with email "${input.email}" already exists: ${duplicateCheck.duplicateEmail.name}`
        );
      }
    }

    const updated: Customer = {
      ...existing,
      ...input,
    };

    return this.repository.update(id, updated);
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async findByName(name: string): Promise<Customer[]> {
    const all = await this.repository.findAll();
    const lowerName = name.toLowerCase();
    return all.filter((c) => c.name.toLowerCase().includes(lowerName));
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const all = await this.repository.findAll();
    return all.find((c) => c.email?.toLowerCase() === email.toLowerCase()) ?? null;
  }

  /**
   * Merge duplicate customers, keeping the oldest record
   * Returns the merged customer and list of deleted IDs
   */
  async mergeDuplicates(
    customerIds: string[]
  ): Promise<{ merged: Customer; deletedIds: string[] }> {
    if (customerIds.length < 2) {
      throw new Error("Need at least 2 customers to merge");
    }

    const customers: Customer[] = [];
    for (const id of customerIds) {
      const customer = await this.repository.findById(id);
      if (customer) {
        customers.push(customer);
      }
    }

    if (customers.length < 2) {
      throw new Error("Could not find enough customers to merge");
    }

    // Sort by createdAt, keep the oldest
    customers.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const [keeper, ...duplicates] = customers;
    const deletedIds: string[] = [];

    // Delete the duplicates
    for (const dup of duplicates) {
      await this.repository.delete(dup.id);
      deletedIds.push(dup.id);
    }

    return { merged: keeper, deletedIds };
  }
}
