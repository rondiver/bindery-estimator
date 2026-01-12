import { getRunList } from "../actions/runList";
import { RunListTable } from "./RunListTable";

export default async function RunListPage() {
  const items = await getRunList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Run List</h2>
          <p className="text-gray-600 text-sm mt-1">
            Click any row to edit. Click column headers to sort.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? "item" : "items"}
        </div>
      </div>

      <RunListTable items={items} />
    </div>
  );
}
