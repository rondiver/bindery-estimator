/**
 * Seed Data Generator for Bindery Estimator
 *
 * Generates:
 * - 10 customers (various industries)
 * - 100 quotes (10 per customer)
 *
 * Run with: npx ts-node scripts/seed-data.ts
 */

import * as fs from "fs";
import * as path from "path";
import type { Customer, Quote, QuoteStatus, QuantityOption } from "../src/types";

// UUID generator (simple version to avoid external dependency)
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - randomBetween(0, daysBack));
  return date.toISOString();
}

// Customer definitions
const CUSTOMER_DATA = [
  { name: "Acme Publishing", contact: "Jane Smith", email: "jane@acmepub.com", phone: "555-0101", industry: "publishing" },
  { name: "Sterling Press", contact: "Mike Sterling", email: "mike@sterlingpress.com", phone: "555-0102", industry: "packaging" },
  { name: "Artisan Bindery", contact: "Sarah Chen", email: "sarah@artisanbindery.com", phone: "555-0103", industry: "specialty" },
  { name: "Corporate Solutions Inc", contact: "Bob Johnson", email: "bob@corpsolutions.com", phone: "555-0104", industry: "corporate" },
  { name: "Educational Press", contact: "Linda Williams", email: "linda@edpress.com", phone: "555-0105", industry: "education" },
  { name: "Digital Services Ltd", contact: "Tom Brown", email: "tom@digitalservices.com", phone: "555-0106", industry: "hybrid" },
  { name: "Luxury Brands Co", contact: "Emma Davis", email: "emma@luxurybrands.com", phone: "555-0107", industry: "premium" },
  { name: "Government Services", contact: "James Wilson", email: "james@govservices.gov", phone: "555-0108", industry: "government" },
  { name: "Medical Publications", contact: "Dr. Patricia Lee", email: "patricia@medpub.com", phone: "555-0109", industry: "healthcare" },
  { name: "Tech Documentation", contact: "Alex Martinez", email: "alex@techdocs.io", phone: "555-0110", industry: "technology" },
];

// Bindery services with pricing (per 1000 units)
const SERVICES = [
  { name: "Perfect Binding", minPrice: 150, maxPrice: 400, description: "Professional adhesive binding with square spine" },
  { name: "Case Binding", minPrice: 400, maxPrice: 800, description: "Hardcover binding with cloth or paper case" },
  { name: "Saddle Stitch", minPrice: 50, maxPrice: 150, description: "Wire staple binding through the fold" },
  { name: "Comb Binding", minPrice: 75, maxPrice: 250, description: "Plastic comb binding with punched pages" },
  { name: "Spiral Binding", minPrice: 100, maxPrice: 300, description: "Continuous wire coil binding" },
  { name: "Wire-O Binding", minPrice: 120, maxPrice: 350, description: "Double loop wire binding" },
  { name: "Foil Stamping", minPrice: 200, maxPrice: 600, description: "Hot foil application for premium finish" },
  { name: "Embossing", minPrice: 150, maxPrice: 400, description: "Raised relief impression on covers" },
  { name: "Die Cutting", minPrice: 100, maxPrice: 500, description: "Custom shape cutting with steel rule dies" },
  { name: "Lamination", minPrice: 80, maxPrice: 200, description: "Protective film application" },
];

// Job titles by industry
const JOB_TITLES: Record<string, string[]> = {
  publishing: ["Annual Report 2026", "Quarterly Magazine", "Product Catalog", "Coffee Table Book", "Technical Manual"],
  packaging: ["Presentation Folder", "Product Box Set", "Gift Package", "Retail Display", "Premium Packaging"],
  specialty: ["Wedding Album", "Portfolio Collection", "Art Book Edition", "Limited Edition", "Custom Journal"],
  corporate: ["Employee Handbook", "Training Manual", "Strategic Plan", "Corporate Brochure", "Board Report"],
  education: ["Course Textbook", "Student Workbook", "Lab Manual", "Curriculum Guide", "Research Publication"],
  hybrid: ["Digital Print Catalog", "Variable Data Book", "Personalized Album", "On-Demand Publication", "Print-on-Demand Guide"],
  premium: ["Luxury Catalog", "VIP Invitation Set", "Executive Portfolio", "Premium Lookbook", "Brand Book"],
  government: ["Regulatory Manual", "Public Report", "Compliance Guide", "Official Document", "Policy Handbook"],
  healthcare: ["Medical Journal", "Patient Guide", "Clinical Manual", "Research Protocol", "Healthcare Directory"],
  technology: ["API Documentation", "User Manual", "Technical Specification", "Developer Guide", "Release Notes"],
};

// Paper stocks
const PAPER_STOCKS = [
  "80# Gloss Text",
  "100# Gloss Text",
  "80# Matte Text",
  "100# Matte Text",
  "60# Uncoated Text",
  "80# Uncoated Text",
  "100# Gloss Cover",
  "120# Gloss Cover",
  "80# Matte Cover",
  "100# Uncoated Cover",
];

// Finished sizes
const FINISHED_SIZES = [
  "8.5 x 11",
  "11 x 17",
  "6 x 9",
  "5.5 x 8.5",
  "9 x 12",
  "7 x 10",
  "8 x 10",
  "4.25 x 5.5",
  "5 x 7",
  "8.5 x 14",
];

// Generate customers
function generateCustomers(): Customer[] {
  return CUSTOMER_DATA.map((data) => ({
    id: generateId(),
    name: data.name,
    contactName: data.contact,
    email: data.email,
    phone: data.phone,
    createdAt: randomDate(90),
  }));
}

// Generate quantity options for a quote
function generateQuantityOptions(basePrice: number): QuantityOption[] {
  const quantities = [250, 500, 1000, 2500, 5000];
  const numOptions = randomBetween(2, 4);
  const selectedQuantities = quantities.slice(0, numOptions);

  return selectedQuantities.map((quantity) => {
    // Volume discount: more quantity = lower per-unit price
    const volumeDiscount = quantity >= 5000 ? 0.75 : quantity >= 2500 ? 0.85 : quantity >= 1000 ? 0.92 : 1.0;
    const unitPrice = Math.round((basePrice / 1000) * volumeDiscount * 1000) / 1000;

    return {
      id: generateId(),
      quantity,
      unitPrice,
    };
  });
}

// Generate description based on service
function generateDescription(service: typeof SERVICES[0]): string {
  const pages = randomItem(["24", "32", "48", "64", "80", "96", "128", "160", "200"]);
  const coverType = randomItem(["self-cover", "+ cover", "+ 4pg cover"]);
  const operations = [
    `${pages} page ${coverType}`,
    service.description,
    randomItem(["Trim 3 sides", "Drill 3 hole", "Score and fold", "Collate"]),
    randomItem(["Box and ship", "Palletize", "Shrink wrap", "Carton pack"]),
  ];

  return operations.join("\n");
}

// Get quote status with weighted distribution
function getQuoteStatus(): QuoteStatus {
  const rand = Math.random();
  if (rand < 0.30) return "draft";      // 30%
  if (rand < 0.70) return "sent";       // 40%
  if (rand < 0.90) return "accepted";   // 20%
  return "declined";                     // 10%
}

// Generate quotes for a customer
function generateQuotesForCustomer(
  customer: Customer,
  industry: string,
  startQuoteNumber: number
): Quote[] {
  const quotes: Quote[] = [];
  const jobTitles = JOB_TITLES[industry] || JOB_TITLES.corporate;

  for (let i = 0; i < 10; i++) {
    const service = randomItem(SERVICES);
    const basePrice = randomBetween(service.minPrice, service.maxPrice);
    const quoteNumber = `2601-${String(startQuoteNumber + i).padStart(4, "0")}`;
    const createdAt = randomDate(60);

    const quote: Quote = {
      id: generateId(),
      quoteNumber,
      version: 1,
      customerId: customer.id,
      customerName: customer.name,
      jobTitle: `${randomItem(jobTitles)} - ${service.name}`,
      description: generateDescription(service),
      finishedSize: randomItem(FINISHED_SIZES),
      paperStock: randomItem(PAPER_STOCKS),
      quantityOptions: generateQuantityOptions(basePrice),
      status: getQuoteStatus(),
      notes: randomItem([
        undefined,
        "Rush delivery available",
        "Proof required before production",
        "Customer to supply paper stock",
        "Include samples with delivery",
        "Reprint - match previous job",
      ]),
      createdAt,
      updatedAt: createdAt,
    };

    quotes.push(quote);
  }

  return quotes;
}

// Main execution
async function main() {
  console.log("Seed Data Generator for Bindery Estimator\n");
  console.log("=========================================\n");

  // Generate customers
  console.log("Generating 10 customers...");
  const customers = generateCustomers();

  // Generate quotes
  console.log("Generating 100 quotes (10 per customer)...\n");
  const allQuotes: Quote[] = [];

  customers.forEach((customer, index) => {
    const industry = CUSTOMER_DATA[index].industry;
    const startQuoteNumber = 10 + (index * 10); // Start from 0010
    const quotes = generateQuotesForCustomer(customer, industry, startQuoteNumber);
    allQuotes.push(...quotes);
  });

  // Statistics
  const statusCounts = allQuotes.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log("Quote Status Distribution:");
  Object.entries(statusCounts).forEach(([status, count]) => {
    const pct = ((count / allQuotes.length) * 100).toFixed(1);
    console.log(`  ${status}: ${count} (${pct}%)`);
  });

  // Save to files
  const dataDir = path.join(__dirname, "..", "data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save customers
  const customersPath = path.join(dataDir, "customers.json");
  fs.writeFileSync(customersPath, JSON.stringify(customers, null, 2));
  console.log(`\nSaved ${customers.length} customers to: ${customersPath}`);

  // Save quotes
  const quotesPath = path.join(dataDir, "quotes.json");
  fs.writeFileSync(quotesPath, JSON.stringify(allQuotes, null, 2));
  console.log(`Saved ${allQuotes.length} quotes to: ${quotesPath}`);

  // Clear jobs and run list (they reference old quotes)
  const jobsPath = path.join(dataDir, "jobs.json");
  fs.writeFileSync(jobsPath, "[]");
  console.log("Cleared jobs.json (references old data)");

  const runListPath = path.join(dataDir, "runList.json");
  fs.writeFileSync(runListPath, "[]");
  console.log("Cleared runList.json (references old data)");

  console.log("\nSeed data generation complete!");
  console.log("\nCustomers:");
  customers.forEach((c) => console.log(`  - ${c.name}`));
}

main().catch(console.error);
