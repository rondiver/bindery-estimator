"use client";

import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backLink?: { href: string; label: string };
  // Simpler alternative to backLink
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  backLink,
  backHref,
  backLabel = "Back",
}: PageHeaderProps) {
  // Support both patterns
  const back = backLink || (backHref ? { href: backHref, label: backLabel } : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8"
    >
      <div>
        {back && (
          <a
            href={back.href}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {back.label}
          </a>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-display-md text-slate-900">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
