"use client";

import { forwardRef, HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "featured" | "inverted";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-white border border-slate-200
    shadow-elevation-1
  `,
  elevated: `
    bg-white border border-slate-100
    shadow-elevation-3
  `,
  featured: `
    bg-white gradient-border
    shadow-elevation-3
  `,
  inverted: `
    bg-slate-900 text-white border border-slate-800
    shadow-elevation-3
  `,
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      interactive = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const interactiveStyles = interactive
      ? "transition-all duration-200 hover:shadow-elevation-4 hover:-translate-y-0.5 cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={`
          rounded-xl overflow-hidden
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${interactiveStyles}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card subcomponents
interface CardSubComponentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardSubComponentProps) {
  return (
    <div className={`border-b border-slate-100 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardSubComponentProps) {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }: CardSubComponentProps) {
  return (
    <p className={`text-sm text-slate-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }: CardSubComponentProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = "" }: CardSubComponentProps) {
  return (
    <div className={`border-t border-slate-100 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}
