"use client";

interface StatusOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  options: StatusOption[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
}

export function StatusFilter({
  options,
  value,
  onChange,
  allLabel = "All",
}: StatusFilterProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange("")}
        className={`px-3 py-1.5 text-sm rounded ${
          value === ""
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm rounded ${
            value === opt.value
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
