/**
 * Bindery Estimator - Entry Point
 *
 * Wires up storage and services for the application.
 */

import { join } from "node:path";
import { JsonStore } from "./storage/jsonStore.js";
import { CustomerService } from "./services/customerService.js";
import { QuoteService } from "./services/quoteService.js";
import { JobService } from "./services/jobService.js";
import type { Customer, Quote, Job } from "./types/index.js";

// Data directory relative to project root
const DATA_DIR = join(process.cwd(), "data");

// Initialize stores
const customerStore = new JsonStore<Customer>(join(DATA_DIR, "customers.json"));
const quoteStore = new JsonStore<Quote>(join(DATA_DIR, "quotes.json"));
const jobStore = new JsonStore<Job>(join(DATA_DIR, "jobs.json"));

// Initialize services
export const customerService = new CustomerService(customerStore);
export const quoteService = new QuoteService(quoteStore, customerStore);
export const jobService = new JobService(jobStore, quoteStore);

// Re-export types for convenience
export * from "./types/index.js";

async function main(): Promise<void> {
  console.log("Bindery Estimator initialized");
  console.log(`Data directory: ${DATA_DIR}`);

  // Show counts
  const customers = await customerService.list();
  const quotes = await quoteService.list();
  const jobs = await jobService.list();

  console.log(`Customers: ${customers.length}`);
  console.log(`Quotes: ${quotes.length}`);
  console.log(`Jobs: ${jobs.length}`);
}

main().catch(console.error);
