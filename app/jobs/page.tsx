import { getJobs } from "../actions/jobs";
import { JobList } from "./JobList";
import { PageHeader } from "../components/ui";

export default async function JobsPage() {
  const jobs = await getJobs();
  const activeJobs = jobs.filter(j => !["complete", "cancelled"].includes(j.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        subtitle={`${activeJobs.length} active jobs, ${jobs.length} total`}
      />
      <JobList jobs={jobs} />
    </div>
  );
}
