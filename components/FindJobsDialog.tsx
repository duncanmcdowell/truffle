"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useScrapeJobsWithProgress } from "../app/actions/clientScrapeJobs";
import type { Job } from "@/lib/definitions";
import { Switch } from "./ui/switch";

const ALL_SENIORITY_OPTIONS = [
  "cxo",
  "vice_president",
  "director",
  "senior",
  "mid_senior",
  "associate",
  "entry_level",
  "internship"
];

// Function to convert machine-readable seniority to human-readable format
function formatSeniorityForDisplay(seniorityValue: string): string {
  return seniorityValue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function FindJobsDialog({ onJobsFetched }: { onJobsFetched: (jobs: Job[]) => void }) {
  const [open, setOpen] = useState(false);
  const [seniority, setSeniority] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState<{ isRunning: boolean; nextRun: string } | null>(null);

  const { scrapeJobs, isConnected } = useScrapeJobsWithProgress();

  useEffect(() => {
    if (open) {
      fetchSeniority();
      fetchScheduled();
      fetchSchedulerStatus();
    }
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function fetchSeniority() {
    const res = await fetch("/api/seniority-filters");
    const data = await res.json();
    setSeniority(data.values || []);
  }

  async function updateSeniority(newValues: string[]) {
    setSaving(true);
    setSeniority(newValues);
    await fetch("/api/seniority-filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: newValues }),
    });
    setSaving(false);
  }

  async function fetchScheduled() {
    const res = await fetch("/api/job-search-settings");
    const data = await res.json();
    setScheduled(!!data.scheduled);
  }

  async function updateScheduled(newValue: boolean) {
    setScheduled(newValue);
    await fetch("/api/job-search-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduled: newValue }),
    });
    // Refresh scheduler status after updating
    setTimeout(fetchSchedulerStatus, 1000);
  }

  async function fetchSchedulerStatus() {
    try {
      const res = await fetch("/api/scheduler");
      const data = await res.json();
      setSchedulerStatus(data);
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
    }
  }

  async function handleFindJobs() {
    setLoading(true);
    try {
      const result = await scrapeJobs();
      setOpen(false);
      onJobsFetched(result.jobs);
    } catch (error) {
      console.error('Job search failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!isConnected}>
          Find Jobs
          <kbd className="ml-2 bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Find Jobs</DialogTitle>
        </DialogHeader>
        {!isConnected && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            Connecting to progress server...
          </div>
        )}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Switch id="scheduled-switch" checked={scheduled} onCheckedChange={updateScheduled} />
            <label htmlFor="scheduled-switch" className="text-sm font-medium select-none cursor-pointer">Scheduled Search</label>
          </div>
          {scheduled && (
            <div className="text-xs text-muted-foreground mt-1 ml-1">
              New jobs will be automatically searched every hour
            </div>
          )}
          {schedulerStatus && (
            <div className="text-xs text-muted-foreground mt-1 ml-1">
              Status: {schedulerStatus.isRunning ? 'Running' : 'Stopped'} • {schedulerStatus.nextRun}
            </div>
          )}
        </div>
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                Seniority
                <span className="ml-2 text-xs text-muted-foreground">
                  {seniority.length === ALL_SENIORITY_OPTIONS.length
                    ? "All"
                    : seniority.length === 0
                    ? "None"
                    : seniority.map(formatSeniorityForDisplay).join(", ")}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Seniority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_SENIORITY_OPTIONS.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option}
                  checked={seniority.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...seniority, option]
                      : seniority.filter((v) => v !== option);
                    updateSeniority(newValues);
                  }}
                  disabled={saving}
                >
                  {option.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={handleFindJobs} disabled={loading || saving || !isConnected} className="w-full">
          {loading ? "Searching..." : "Search Jobs"}
        </Button>
      </DialogContent>
    </Dialog>
  );
} 