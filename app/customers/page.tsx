import Link from "next/link";
import { getCustomers } from "../actions/customers";
import { CustomerList } from "./CustomerList";
import { PageHeader, Button } from "../components/ui";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} total customers`}
        actions={
          <Link href="/customers/new">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </Button>
          </Link>
        }
      />
      <CustomerList customers={customers} />
    </div>
  );
}
