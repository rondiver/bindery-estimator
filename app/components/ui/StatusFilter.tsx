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
  className?: string;
}

export function StatusFilter({
  options,
  value,
  onChange,
  allLabel = "All",
  className = "",
}: StatusFilterProps) {
  const buttonBase = `
    px-3 py-1.5 text-sm font-medium rounded-lg
    transition-all duration-200
  `;

  const buttonInactive = `
    ${buttonBase}
    bg-slate-100 text-slate-600
    hover:bg-slate-200
  `;

  const buttonActive = `
    ${buttonBase}
    bg-gradient-accent text-white shadow-accent-sm
  `;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      <button
        onClick={() => onChange("")}
        className={value === "" ? buttonActive : buttonInactive}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={value === opt.value ? buttonActive : buttonInactive}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
