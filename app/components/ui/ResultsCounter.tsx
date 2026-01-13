"use client";

interface ResultsCounterProps {
  start: number;
  end: number;
  total: number;
  className?: string;
}

export function ResultsCounter({
  start,
  end,
  total,
  className = "",
}: ResultsCounterProps) {
  return (
    <p className={`text-sm text-slate-500 ${className}`}>
      Showing{" "}
      <span className="font-medium text-slate-700">{start}</span>
      {" - "}
      <span className="font-medium text-slate-700">{end}</span>
      {" of "}
      <span className="font-medium text-slate-700">{total}</span>
      {" results"}
    </p>
  );
}
