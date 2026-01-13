"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardTitle, CardDescription, Button, SectionLabel } from "./components/ui";

// Icons
function QuoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function JobIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function RunListIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    </svg>
  );
}

function CustomerIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

const quickAccessItems = [
  {
    title: "Quotes",
    description: "Create and manage estimates for bindery work",
    href: "/quotes",
    icon: QuoteIcon,
    featured: true,
  },
  {
    title: "Jobs",
    description: "Track production progress and deadlines",
    href: "/jobs",
    icon: JobIcon,
    featured: false,
  },
  {
    title: "Run List",
    description: "View and manage production schedule",
    href: "/run-list",
    icon: RunListIcon,
    featured: false,
  },
  {
    title: "Customers",
    description: "Manage customer contacts and records",
    href: "/customers",
    icon: CustomerIcon,
    featured: false,
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center py-12 lg:py-16"
      >
        <h1 className="font-display text-display-xl text-slate-900 mb-4">
          Bindery{" "}
          <span className="text-gradient">Estimator</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
          Quote and job tracking for commercial bindery services.
          Streamline your workflow from estimate to completion.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/quotes/new">
            <Button size="lg">
              <QuoteIcon className="w-5 h-5" />
              Create Quote
            </Button>
          </Link>
          <Link href="/run-list">
            <Button variant="secondary" size="lg">
              <RunListIcon className="w-5 h-5" />
              View Run List
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* Quick Access Cards */}
      <section>
        <SectionLabel className="mb-6">Quick Access</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.1, ease: "easeOut" }}
            >
              <Link href={item.href} className="block h-full">
                <Card
                  variant={item.featured ? "featured" : "elevated"}
                  interactive
                  className="h-full group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        p-3 rounded-xl
                        ${
                          item.featured
                            ? "bg-gradient-accent text-white shadow-accent-sm"
                            : "bg-slate-100 text-slate-600 group-hover:bg-accent-50 group-hover:text-accent"
                        }
                        transition-colors duration-200
                      `}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="group-hover:text-accent transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Getting Started Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-slate-50 rounded-2xl p-8 lg:p-12"
      >
        <div className="max-w-3xl mx-auto text-center">
          <SectionLabel className="justify-center mb-4">Getting Started</SectionLabel>
          <h2 className="font-display text-display-sm text-slate-900 mb-4">
            Your Workflow, Simplified
          </h2>
          <p className="text-slate-500 mb-8">
            From initial quote to completed job, track every step of your bindery projects
            in one place. Start by creating a quote, convert accepted quotes to jobs,
            and manage your production run list.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-accent text-white rounded-lg flex items-center justify-center font-semibold text-sm shadow-accent-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Create Quote</h3>
                <p className="text-sm text-slate-500">
                  Build detailed estimates with quantity options
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-accent text-white rounded-lg flex items-center justify-center font-semibold text-sm shadow-accent-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Convert to Job</h3>
                <p className="text-sm text-slate-500">
                  Promote accepted quotes to active jobs
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-accent text-white rounded-lg flex items-center justify-center font-semibold text-sm shadow-accent-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Track Progress</h3>
                <p className="text-sm text-slate-500">
                  Monitor jobs through completion
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
