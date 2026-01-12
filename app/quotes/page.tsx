import { getQuotes } from "../actions/quotes";
import { QuoteList } from "./QuoteList";

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quotes</h2>
        <a
          href="/quotes/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Quote
        </a>
      </div>
      <QuoteList quotes={quotes} />
    </div>
  );
}
