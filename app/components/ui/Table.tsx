"use client";

import { forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

// Table Root
interface TableProps extends HTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = "", ...props }, ref) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-elevation-1">
      <table
        ref={ref}
        className={`w-full text-sm ${className}`}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

// Table Header
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className = "", ...props }, ref) => (
    <thead
      ref={ref}
      className={`bg-slate-50 border-b border-slate-200 ${className}`}
      {...props}
    />
  )
);
TableHeader.displayName = "TableHeader";

// Table Body
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className = "", ...props }, ref) => (
    <tbody
      ref={ref}
      className={`divide-y divide-slate-100 ${className}`}
      {...props}
    />
  )
);
TableBody.displayName = "TableBody";

// Table Row
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ clickable = false, className = "", ...props }, ref) => (
    <tr
      ref={ref}
      className={`
        ${clickable ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

// Table Head Cell
interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sorted?: "asc" | "desc" | false;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ sortable = false, sorted = false, className = "", children, ...props }, ref) => (
    <th
      ref={ref}
      className={`
        text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider
        ${sortable ? "cursor-pointer select-none hover:bg-slate-100 transition-colors" : ""}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && sorted && (
          <span className="text-accent">
            {sorted === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = "TableHead";

// Table Cell
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  variant?: "default" | "mono" | "muted";
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ variant = "default", className = "", ...props }, ref) => {
    const variantStyles = {
      default: "text-slate-900",
      mono: "font-mono text-accent",
      muted: "text-slate-500",
    };

    return (
      <td
        ref={ref}
        className={`px-4 py-3 ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);
TableCell.displayName = "TableCell";

// Empty state for tables
interface TableEmptyProps {
  message?: string;
  description?: string;
  action?: React.ReactNode;
}

export function TableEmpty({
  message = "No results found",
  description,
  action,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={100} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <svg
            className="w-12 h-12 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-slate-600 font-medium">{message}</p>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
