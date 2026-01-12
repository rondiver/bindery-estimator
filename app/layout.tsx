import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bindery Estimator",
  description: "Quote and job tracking for commercial bindery services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        <div className="min-h-screen">
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Bindery Estimator</h1>
                <div className="flex gap-4">
                  <a href="/quotes" className="text-gray-600 hover:text-gray-900">
                    Quotes
                  </a>
                  <a href="/jobs" className="text-gray-600 hover:text-gray-900">
                    Jobs
                  </a>
                  <a href="/customers" className="text-gray-600 hover:text-gray-900">
                    Customers
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
