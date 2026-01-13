"use client";

interface FilterBarProps {
  children: React.ReactNode;
  onClearFilters?: () => void;
  showClearButton?: boolean;
  className?: string;
}

export function FilterBar({
  children,
  onClearFilters,
  showClearButton = false,
  className = "",
}: FilterBarProps) {
  return (
    <div
      className={`
        flex flex-wrap items-center gap-4
        p-4 bg-white rounded-xl border border-slate-200
        shadow-elevation-1
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
      {showClearButton && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="
            text-sm text-slate-500 hover:text-slate-700
            transition-colors
            flex items-center gap-1
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear filters
        </button>
      )}
    </div>
  );
}
