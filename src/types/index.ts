/**
 * Core type definitions for Bindery Estimator
 */

// Quote status lifecycle
export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

// Job status lifecycle
export type JobStatus = "pending" | "in_progress" | "complete";

export interface Customer {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string; // ISO 8601
}

export interface QuantityOption {
  id: string;
  quantity: number; // e.g., 500, 1000, 2500
  unitPrice: number; // Price per finished piece
}

export interface Quote {
  id: string;
  quoteNumber: string; // Format: "YYMM-NNNN"
  version: number;
  customerId: string;
  customerName: string;
  customerNumber?: string;
  jobTitle: string;
  description: string; // Paragraph describing services
  finishedSize: string; // e.g., "8.5 x 11"
  paperStock?: string; // e.g., "80# gloss text"
  quantityOptions: QuantityOption[];
  status: QuoteStatus;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Job {
  id: string;
  jobNumber: string; // Format: "YYMM-NNNN"
  quoteId: string;
  customerId: string;
  customerName: string;
  jobTitle: string;
  description: string;
  finishedSize: string;
  paperStock?: string;
  quantity: number; // Selected quantity from quote
  unitPrice: number; // Price at selected quantity
  status: JobStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
}

// Input types for creating new entities

export interface CreateCustomerInput {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface CreateQuantityOptionInput {
  quantity: number;
  unitPrice: number;
}

export interface CreateQuoteInput {
  customerId: string;
  customerNumber?: string;
  jobTitle: string;
  description: string;
  finishedSize: string;
  paperStock?: string;
  quantityOptions: CreateQuantityOptionInput[];
  notes?: string;
}

// Repository interface for swappable storage
export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}
