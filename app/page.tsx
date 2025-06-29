import { fetchJobs } from "../lib/data"
import { FindJobsClient } from "@/components/FindJobsClient"

export default async function Page() {
  const jobs = fetchJobs();

  return (
    <div className="container mx-auto py-10">
      <FindJobsClient initialJobs={jobs} />
    </div>
  )
}
