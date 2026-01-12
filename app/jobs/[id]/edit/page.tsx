import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "../../../actions/jobs";
import { getQuote } from "../../../actions/quotes";
import { JobEditForm } from "./JobEditForm";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edit Job {job.jobNumber}</h2>
          <p className="text-gray-600">{job.jobTitle}</p>
        </div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Back to Job
        </Link>
      </div>

      <JobEditForm job={job} quote={quote} />
    </div>
  );
}
