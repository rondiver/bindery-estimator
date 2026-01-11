/**
 * Customer service - business logic for customer management
 */

import type { Customer, CreateCustomerInput, Repository } from "../types/index.js";
import { generateId, now } from "../utils/idGenerator.js";

export class CustomerService {
  constructor(private repository: Repository<Customer>) {}

  async list(): Promise<Customer[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Customer | null> {
    return this.repository.findById(id);
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
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
}
