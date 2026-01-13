import { notFound } from "next/navigation";
import { getQuote } from "../../../actions/quotes";
import { getCustomers } from "../../../actions/customers";
import { QuoteEditForm } from "./QuoteEditForm";
import { PageHeader } from "../../../components/ui";

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

  const quoteNumber = quote.version > 1
    ? `${quote.quoteNumber}-v${quote.version}`
    : quote.quoteNumber;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Quote ${quoteNumber}`}
        backHref={`/quotes/${quote.id}`}
        backLabel="Cancel"
      />
      <QuoteEditForm quote={quote} customers={customers} />
    </div>
  );
}
