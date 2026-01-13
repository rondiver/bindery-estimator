import { getRunList } from "../actions/runList";
import { RunListTable } from "./RunListTable";
import { PageHeader } from "../components/ui";

export default async function RunListPage() {
  const items = await getRunList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Run List"
        subtitle={`${items.length} ${items.length === 1 ? "item" : "items"} - Click any row to edit, click headers to sort`}
      />
      <RunListTable items={items} />
    </div>
  );
}
