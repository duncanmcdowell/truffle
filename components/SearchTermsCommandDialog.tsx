"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import { Button } from "./ui/button";
import { Trash2, Plus } from "lucide-react";

interface SearchTerm {
  id: number;
  term: string;
}

export function SearchTermsCommandDialog() {
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState<SearchTerm[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) fetchTerms();
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function fetchTerms() {
    try {
      const res = await fetch("/api/search-terms");
      const data = await res.json();
      setTerms(data.terms || []);
    } catch {
      setError("Failed to load search terms");
    }
  }

  async function addTerm(term: string) {
    setError(null);
    const res = await fetch("/api/search-terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term }),
    });
    if (!res.ok) {
      setError((await res.json()).error || "Failed to add");
      await fetchTerms(); // revert
    } else {
      await fetchTerms();
      setInput("");
    }
  }

  async function removeTerm(id: number) {
    setError(null);
    setTerms((prev) => prev.filter((t) => t.id !== id)); // optimistic
    const res = await fetch("/api/search-terms", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setError((await res.json()).error || "Failed to delete");
      fetchTerms(); // revert
    } else {
      fetchTerms();
    }
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && input.trim() && !isDuplicate) {
      addTerm(input.trim());
    }
  }

  const isAllSpaces = input.replace(/\s/g, '').length === 0;
  const isDuplicate = terms.some(
    (t) => t.term.trim().toLowerCase() === input.trim().toLowerCase()
  );

  // Filtered terms for display
  const filteredTerms = input
    ? terms.filter((t) => t.term.toLowerCase().includes(input.toLowerCase()))
    : terms;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Edit Search Terms
        <kbd className="ml-2 bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Add or search for a job title..."
          value={input}
          onValueChange={setInput}
          onKeyDown={handleInputKeyDown}
        />
        <CommandList>
          {/* Current search terms group */}
          {filteredTerms.length > 0 && (
            <CommandGroup heading="Current Search Terms">
              {filteredTerms.map((term) => (
                <CommandItem key={term.id}>
                  <span>{term.term}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto cursor-pointer"
                    onClick={() => removeTerm(term.id)}
                    aria-label={`Remove ${term.term}`}
                  >
                    <Trash2 className="w-4 h-4 cursor-pointer" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {/* Only show CommandEmpty if there are no filtered terms */}
          {filteredTerms.length === 0 && (
            <CommandEmpty>
              {/* {loading ? "Loading..." : "No search terms found."} */}
            </CommandEmpty>
          )}
        </CommandList>
        {/* Add affordance below the command list, styled to match CommandItem */}
        {!isAllSpaces && !isDuplicate && (
          <div className="px-2 pb-2 mt-2">
            <div className="text-xs ml-2 font-medium text-muted-foreground mb-1">
              Add New Search Term
            </div>
            <div
              className="flex items-center rounded-md border bg-accent px-2 py-3 text-sm mb-2 hover:bg-accent/80 transition-colors"
            >
              <span className="flex-1 text-md">{input}</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  addTerm(input);
                }}
                aria-label="Add search term"
              >
                <Plus className="w-4 h-4 cursor-pointer" />
              </Button>
            </div>
          </div>
        )}
        <CommandSeparator />
        {error && <div className="text-red-600 px-4 py-2 text-sm">{error}</div>}
      </CommandDialog>
    </>
  );
} 