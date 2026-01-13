"use client";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  // Quote status variants
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  // Job status variants
  | "pending"
  | "in_progress"
  | "complete"
  | "on_hold"
  | "cancelled"
  // Run list status variants
  | "planned"
  | "in"
  | "hold";

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  // Generic variants
  default: "bg-slate-100 text-slate-700 border-slate-200",
  primary: "bg-accent-50 text-accent-700 border-accent-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  // Quote statuses
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-accent-50 text-accent-700 border-accent-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
  // Job statuses
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-green-50 text-green-700 border-green-200",
  on_hold: "bg-orange-50 text-orange-700 border-orange-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  // Run list statuses
  planned: "bg-slate-100 text-slate-600 border-slate-200",
  in: "bg-blue-50 text-blue-700 border-blue-200",
  hold: "bg-orange-50 text-orange-700 border-orange-200",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-1 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  rounded = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${rounded ? "rounded-full" : "rounded"}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {children}
    </span>
  );
}

// Helper to convert status strings to badge variants
export function getStatusVariant(status: string): BadgeVariant {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  if (normalizedStatus in variantStyles) {
    return normalizedStatus as BadgeVariant;
  }
  return "default";
}

// Status label formatter
export function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
