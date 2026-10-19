"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRepos } from "@/server/actions/coderev";
import type { RepoInfo } from "@/server/services/coderev/coderev-types";

interface RepoSelectorProps {
  value: string | null;
  onSelect: (owner: string, repo: string) => void;
}

export const RepoSelector = ({ value, onSelect }: RepoSelectorProps) => {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getRepos();
    if (result.success && result.data) {
      setRepos(result.data);
    } else {
      setError(result.error ?? "Failed to load repositories");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return (
    <div className="space-y-1">
      <Select
        value={value ?? undefined}
        onValueChange={(v) => {
          const [owner, repo] = v.split("/");
          if (owner && repo) onSelect(owner, repo);
        }}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder={loading ? "Loading repos..." : "Select a repository"} />
        </SelectTrigger>
        <SelectContent>
          {repos.map((r) => (
            <SelectItem key={r.fullName} value={r.fullName}>
              <div className="flex items-center gap-2">
                {r.isPrivate && (
                  <span className="text-xs text-muted-foreground">private</span>
                )}
                <span>{r.fullName}</span>
              </div>
            </SelectItem>
          ))}
          {repos.length === 0 && !loading && !error && (
            <SelectItem value="_empty" disabled>
              No repositories found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};
