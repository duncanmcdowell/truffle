"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/columns";
import { FindJobsDialog } from "@/components/FindJobsDialog";
import { SearchTermsCommandDialog } from "@/components/SearchTermsCommandDialog";
import type { Job } from "@/lib/definitions";

export function FindJobsClient({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  // Set default sorting to posted_at descending
  const [sorting, setSorting] = useState([
    { id: "posted_at", desc: true }
  ]);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Truffle <span className="text-4xl">🐖</span></h1>
          <div className="flex gap-4">
            <SearchTermsCommandDialog />
            <FindJobsDialog onJobsFetched={setJobs} />
          </div>
        </div>
      </div>
      <DataTable columns={columns} data={jobs} sorting={sorting} setSorting={setSorting} />
    </>
  );
} 