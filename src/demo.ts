/**
 * Demo script - exercises the full workflow with corrected quote structure
 */

import { customerService, quoteService, jobService } from "./index.js";

async function demo() {
  console.log("=== Bindery Estimator Demo ===\n");

  // 1. Create a customer
  console.log("1. Creating customer...");
  const customer = await customerService.create({
    name: "Acme Publishing",
    contactName: "Jane Smith",
    email: "jane@acmepub.com",
    phone: "555-1234",
  });
  console.log(`   Created: ${customer.name} (${customer.id})\n`);

  // 2. Create a quote with quantity options
  console.log("2. Creating quote...");
  const quote = await quoteService.create({
    customerId: customer.id,
    jobTitle: "Annual Report 2024",
    description:
      "Print 32-page saddle-stitched booklet. Includes cutting parent sheets to press size, " +
      "folding signatures, collating, and saddle-stitch binding. Full color covers, " +
      "B&W interior.",
    finishedSize: "8.5 x 11",
    paperStock: "100# gloss cover / 80# gloss text",
    quantityOptions: [
      { quantity: 500, unitPrice: 0.45 },
      { quantity: 1000, unitPrice: 0.35 },
      { quantity: 2500, unitPrice: 0.28 },
    ],
  });

  console.log(`   Quote: ${quoteService.formatQuoteNumber(quote)}`);
  console.log(`   Job Title: ${quote.jobTitle}`);
  console.log(`   Finished Size: ${quote.finishedSize}`);
  console.log(`   Paper: ${quote.paperStock}`);
  console.log(`   Status: ${quote.status}`);
  console.log(`   Quantity Options:`);
  for (const opt of quote.quantityOptions) {
    const total = quoteService.calculateTotal(opt);
    console.log(`     - ${opt.quantity} @ $${opt.unitPrice.toFixed(2)} = $${total.toFixed(2)}`);
  }
  console.log();

  // 3. Send and accept the quote
  console.log("3. Updating quote status...");
  await quoteService.updateStatus(quote.id, "sent");
  console.log("   Status: sent");
  const acceptedQuote = await quoteService.updateStatus(quote.id, "accepted");
  console.log(`   Status: ${acceptedQuote.status}\n`);

  // 4. Convert to job - customer chose 1000 quantity
  console.log("4. Converting quote to job (customer chose 1000 qty)...");
  const job = await jobService.createFromQuote(quote.id, 1000);
  console.log(`   Job: ${job.jobNumber}`);
  console.log(`   Quantity: ${job.quantity}`);
  console.log(`   Unit Price: $${job.unitPrice.toFixed(2)}`);
  console.log(`   Total: $${jobService.calculateTotal(job).toFixed(2)}`);
  console.log(`   Status: ${job.status}\n`);

  // 5. Progress the job
  console.log("5. Progressing job...");
  await jobService.startJob(job.id);
  console.log("   Status: in_progress");
  const completedJob = await jobService.completeJob(job.id);
  console.log(`   Status: ${completedJob.status}`);
  console.log(`   Completed: ${completedJob.completedAt}\n`);

  // 6. Summary
  console.log("=== Summary ===");
  const customers = await customerService.list();
  const quotes = await quoteService.list();
  const jobs = await jobService.list();
  console.log(`Customers: ${customers.length}`);
  console.log(`Quotes: ${quotes.length}`);
  console.log(`Jobs: ${jobs.length}`);
}

demo().catch(console.error);
