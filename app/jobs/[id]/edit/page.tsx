import { notFound } from "next/navigation";
import { getJob } from "../../../actions/jobs";
import { getQuote } from "../../../actions/quotes";
import { JobEditForm } from "./JobEditForm";
import { PageHeader } from "../../../components/ui";

interface PageProps {
  params: { id: string };
}

export default async function JobEditPage({ params }: PageProps) {
  const job = await getJob(params.id);

  if (!job) {
    notFound();
  }

  const quote = await getQuote(job.quoteId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Job ${job.jobNumber}`}
        subtitle={job.jobTitle}
        backHref={`/jobs/${job.id}`}
        backLabel="Back to Job"
      />
      <JobEditForm job={job} quote={quote} />
    </div>
  );
}
