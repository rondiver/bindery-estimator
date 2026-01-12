import { getCustomers } from "../../actions/customers";
import { QuoteForm } from "../QuoteForm";

export default async function NewQuotePage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Quote</h2>
      <QuoteForm customers={customers} />
    </div>
  );
}
