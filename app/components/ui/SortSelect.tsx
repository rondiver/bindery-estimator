"use client";

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function SortSelect({
  options,
  value,
  onChange,
  label = "Sort by",
  className = "",
}: SortSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-slate-500">{label}:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            appearance-none
            pl-3 pr-8 py-1.5
            bg-white border border-slate-200 rounded-lg
            text-sm text-slate-700
            transition-all duration-200
            hover:border-slate-300
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-100
            cursor-pointer
          "
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
