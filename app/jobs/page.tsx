import { getJobs } from "../actions/jobs";
import { JobList } from "./JobList";

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Jobs</h2>
      </div>
      <JobList jobs={jobs} />
    </div>
  );
}
