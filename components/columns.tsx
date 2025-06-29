"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Job } from "../lib/definitions"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import React from "react"
import { VC_FIRMS } from "../helpers"

export const columns: ColumnDef<Job>[] = [
  {
    id: "logo",
    header: "",
    cell: ({ row }) => {
      const logoUrl = row.original.logo_url
      return logoUrl ? (
        <img
          src={logoUrl}
          alt={row.original.company_name + " logo"}
          className="w-8 h-8 rounded-full object-contain bg-white border"
          style={{ maxWidth: 32, maxHeight: 32 }}
        />
      ) : null
    },
    size: 40,
    minSize: 40,
    maxSize: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "company_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Source
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const source = row.getValue("source") as string;
      // Try to find a matching VC firm
      const firm = VC_FIRMS.find(f => f.name === source);
      let displayName;
      if (firm) {
        // Convert kebab-case to Title Case for display
        displayName = firm.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else {
        // Fallback: convert kebab-case to Title Case
        displayName = source.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      return <span>{displayName}</span>;
    },
  },
  {
    accessorKey: "location",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "posted_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Posted At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("posted_at")
      if (!date) return null
      // Format the date consistently to avoid hydration mismatches
      const dateObj = new Date(date as string)
      const formatted = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
      return <div>{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const job = row.original
      return (
        <a href={job.posting_link_url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="cursor-pointer inline-flex items-center gap-2">
            View <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </a>
      )
    },
  },
] 