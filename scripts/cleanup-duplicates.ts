#!/usr/bin/env tsx
/**
 * Database cleanup script - identifies and merges duplicate customer records
 * Run with: npx tsx scripts/cleanup-duplicates.ts
 */

import { customerService } from "../src/lib/services";

async function main() {
  console.log("=== Customer Duplicate Cleanup ===\n");

  // Step 1: Get current state
  const allCustomers = await customerService.list();
  console.log(`BEFORE: ${allCustomers.length} total customers\n`);

  // Step 2: Find duplicates
  const duplicateGroups = await customerService.findDuplicates();

  if (duplicateGroups.length === 0) {
    console.log("No duplicate customers found. Database is clean.\n");
    return;
  }

  console.log(`Found ${duplicateGroups.length} duplicate group(s):\n`);

  for (const group of duplicateGroups) {
    console.log(`Email: ${group.email}`);
    console.log("-".repeat(50));
    for (const customer of group.customers) {
      console.log(`  ID: ${customer.id}`);
      console.log(`  Name: ${customer.name}`);
      console.log(`  Contact: ${customer.contactName || "N/A"}`);
      console.log(`  Created: ${customer.createdAt}`);
      console.log("");
    }
  }

  // Step 3: Merge duplicates
  console.log("Merging duplicates (keeping oldest record)...\n");

  let totalMerged = 0;
  for (const group of duplicateGroups) {
    const customerIds = group.customers.map((c) => c.id);
    try {
      const result = await customerService.mergeDuplicates(customerIds);
      console.log(`Merged ${group.email}:`);
      console.log(`  Kept: ${result.merged.id} (${result.merged.name})`);
      console.log(`  Deleted: ${result.deletedIds.join(", ")}`);
      totalMerged += result.deletedIds.length;
    } catch (err) {
      console.error(`  Error merging ${group.email}: ${err}`);
    }
  }

  // Step 4: Verify final state
  const finalCustomers = await customerService.list();
  console.log("\n" + "=".repeat(50));
  console.log(`AFTER: ${finalCustomers.length} total customers`);
  console.log(`Removed ${totalMerged} duplicate record(s)`);
  console.log("\nRemaining customers:");
  for (const customer of finalCustomers) {
    console.log(`  - ${customer.name} (${customer.email || "no email"})`);
  }
}

main().catch(console.error);
