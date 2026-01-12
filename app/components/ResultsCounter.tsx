"use client";

interface ResultsCounterProps {
  start: number;
  end: number;
  total: number;
}

export function ResultsCounter({ start, end, total }: ResultsCounterProps) {
  if (total === 0) {
    return <span className="text-sm text-gray-500">No results</span>;
  }

  return (
    <span className="text-sm text-gray-500">
      Showing {start}-{end} of {total} results
    </span>
  );
}
