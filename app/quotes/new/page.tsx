import { getCustomers } from "../../actions/customers";
import { QuoteForm } from "../QuoteForm";
import { PageHeader } from "../../components/ui";

export default async function NewQuotePage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Quote"
        backHref="/quotes"
        backLabel="Back to Quotes"
      />
      <QuoteForm customers={customers} />
    </div>
  );
}
