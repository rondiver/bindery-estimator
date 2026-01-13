import Link from "next/link";
import { getQuotes } from "../actions/quotes";
import { QuoteList } from "./QuoteList";
import { PageHeader, Button } from "../components/ui";

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotes"
        subtitle={`${quotes.length} total quotes`}
        actions={
          <Link href="/quotes/new">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Quote
            </Button>
          </Link>
        }
      />
      <QuoteList quotes={quotes} />
    </div>
  );
}
