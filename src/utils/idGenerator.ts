/**
 * ID and number generation utilities
 */

import { randomUUID } from "node:crypto";

// Generate a UUID for internal IDs
export function generateId(): string {
  return randomUUID();
}

// Generate quote/job number in YYMM-NNNN format
export function generateNumber(
  existingNumbers: string[],
  prefix?: string
): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yearMonth = `${yy}${mm}`;

  // Find highest sequence number for this month
  const pattern = prefix ? `${prefix}-${yearMonth}-` : `${yearMonth}-`;
  const thisMonthNumbers = existingNumbers.filter((n) => n.startsWith(pattern));

  let maxSeq = 0;
  for (const num of thisMonthNumbers) {
    const seqPart = num.split("-").pop();
    if (seqPart) {
      const seq = parseInt(seqPart, 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }

  const nextSeq = String(maxSeq + 1).padStart(4, "0");
  return prefix ? `${prefix}-${yearMonth}-${nextSeq}` : `${yearMonth}-${nextSeq}`;
}

// Generate quote number (no prefix per plan)
export function generateQuoteNumber(existingNumbers: string[]): string {
  return generateNumber(existingNumbers);
}

// Generate job number (no prefix per plan)
export function generateJobNumber(existingNumbers: string[]): string {
  return generateNumber(existingNumbers);
}

// Get current ISO timestamp
export function now(): string {
  return new Date().toISOString();
}
