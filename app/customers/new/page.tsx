import { CustomerForm } from "../CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">New Customer</h2>
      <CustomerForm />
    </div>
  );
}
