/**
 * Service layer initialization
 * Shared between CLI and web app
 */

import { join } from "node:path";
import { JsonStore } from "../storage/jsonStore";
import { CustomerService } from "../services/customerService";
import { QuoteService } from "../services/quoteService";
import { JobService } from "../services/jobService";
import { RunListService } from "../services/runListService";
import type { Customer, Quote, Job, RunListItem } from "../types";

// Data directory relative to project root
const DATA_DIR = join(process.cwd(), "data");

// Initialize stores
const customerStore = new JsonStore<Customer>(join(DATA_DIR, "customers.json"));
const quoteStore = new JsonStore<Quote>(join(DATA_DIR, "quotes.json"));
const jobStore = new JsonStore<Job>(join(DATA_DIR, "jobs.json"));
const runListStore = new JsonStore<RunListItem>(join(DATA_DIR, "runList.json"));

// Initialize services (singleton instances)
export const customerService = new CustomerService(customerStore);
export const quoteService = new QuoteService(quoteStore, customerStore);
export const jobService = new JobService(jobStore, quoteStore);
export const runListService = new RunListService(runListStore, jobStore);

// Re-export types for convenience
export * from "../types";
