import { getCustomers } from "../actions/customers";
import { CustomerList } from "./CustomerList";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customers</h2>
        <a
          href="/customers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Customer
        </a>
      </div>
      <CustomerList customers={customers} />
    </div>
  );
}
