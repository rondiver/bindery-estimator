"use client";

interface SectionLabelProps {
  children: React.ReactNode;
  badge?: string | number;
  className?: string;
}

export function SectionLabel({
  children,
  badge,
  className = "",
}: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-mono text-label-md uppercase tracking-widest text-slate-500">
        {children}
      </span>
      {badge !== undefined && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
}
