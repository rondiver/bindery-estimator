/**
 * Core type definitions for Bindery Estimator
 */

// Quote status lifecycle
export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

// Job status lifecycle
export type JobStatus = "pending" | "in_progress" | "complete" | "on_hold" | "cancelled";

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
  // Job promotion tracking
  jobId?: string; // FK to Job - set when quote is promoted to job
}

export interface Job {
  id: string;
  jobNumber: string; // Format: "YYMM-NNNN"
  quoteId: string; // FK to Quote - every job must reference a quote
  customerId: string;
  customerName: string;
  jobTitle: string;
  description: string;
  finishedSize: string;
  paperStock?: string;
  quantity: number; // Selected quantity from quote (orderQuantity)
  unitPrice: number; // Price at selected quantity
  status: JobStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  completedAt?: string; // ISO 8601

  // Job-specific fields (new)
  customerJobNumber?: string; // Customer's internal job number
  poNumber?: string; // Purchase order number
  partNumber?: string; // Part number reference
  expectedInDate?: string; // ISO 8601 - when materials expected
  dueDate?: string; // ISO 8601 - job due date (required for new jobs)
  allowedSamples?: number; // Units allowed for sampling
  allowedOvers?: number; // Percentage or fixed overage allowed
  deliveryInformation?: string; // Shipping/delivery instructions
  miscellaneousNotes?: string; // Additional job notes
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

// Input for updating job-specific fields
export interface UpdateJobInput {
  customerJobNumber?: string;
  poNumber?: string;
  partNumber?: string;
  expectedInDate?: string;
  dueDate?: string;
  allowedSamples?: number;
  allowedOvers?: number;
  deliveryInformation?: string;
  miscellaneousNotes?: string;
}

// Run List status lifecycle
export type RunListStatus = "planned" | "in" | "hold" | "complete";

// Run List item - standalone copy of job data for production tracking
export interface RunListItem {
  id: string;
  jobId: string; // Reference to source Job (for tracking/duplicate prevention only)
  // Copied from Job (editable independently)
  jobNumber: string;
  customerName: string;
  jobTitle: string;
  customerPO?: string; // From job.poNumber
  customerJobNumber?: string;
  quantity: number;
  description: string;
  // Run List specific fields
  category: string; // Free-text category
  dueOut?: string; // ISO 8601 - when job should be completed
  dueIn?: string; // ISO 8601 - when materials expected
  status: RunListStatus;
  operations: string[]; // Array of operation codes (tags)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Input for creating a Run List item from a Job
export interface CreateRunListItemInput {
  jobId: string;
  category?: string;
  dueOut?: string;
  dueIn?: string;
  operations?: string[];
}

// Input for updating a Run List item
export interface UpdateRunListItemInput {
  category?: string;
  dueOut?: string;
  dueIn?: string;
  status?: RunListStatus;
  operations?: string[];
  customerPO?: string;
  customerJobNumber?: string;
  quantity?: number;
  description?: string;
}

// Repository interface for swappable storage
export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, entity: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}
