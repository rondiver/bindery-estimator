import { notFound } from "next/navigation";
import { getQuote } from "../../../actions/quotes";
import { getCustomers } from "../../../actions/customers";
import { QuoteEditForm } from "./QuoteEditForm";

interface PageProps {
  params: { id: string };
}

export default async function EditQuotePage({ params }: PageProps) {
  const [quote, customers] = await Promise.all([
    getQuote(params.id),
    getCustomers(),
  ]);

  if (!quote) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Edit Quote {quote.quoteNumber}
          {quote.version > 1 && `-v${quote.version}`}
        </h2>
        <a
          href={`/quotes/${quote.id}`}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </a>
      </div>
      <QuoteEditForm quote={quote} customers={customers} />
    </div>
  );
}
