import { CustomerForm } from "../CustomerForm";
import { PageHeader } from "../../components/ui";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Customer"
        backLink={{ href: "/customers", label: "Back to Customers" }}
      />
      <CustomerForm />
    </div>
  );
}
