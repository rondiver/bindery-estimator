"use client";

interface FilterBarProps {
  children: React.ReactNode;
  onClearFilters?: () => void;
  showClearButton?: boolean;
}

export function FilterBar({
  children,
  onClearFilters,
  showClearButton = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {children}
      {showClearButton && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
