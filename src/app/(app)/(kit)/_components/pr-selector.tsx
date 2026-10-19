"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPullRequests } from "@/server/actions/coderev";
import type { PRInfo } from "@/server/services/coderev/coderev-types";

interface PRSelectorProps {
  owner: string;
  repo: string;
  value: number | null;
  onSelect: (pr: PRInfo) => void;
}

export const PRSelector = ({
  owner,
  repo,
  value,
  onSelect,
}: PRSelectorProps) => {
  const [prs, setPrs] = useState<PRInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPRs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPullRequests(owner, repo);
    if (result.success && result.data) {
      setPrs(result.data);
    } else {
      setError(result.error ?? "Failed to load pull requests");
    }
    setLoading(false);
  }, [owner, repo]);

  useEffect(() => {
    fetchPRs();
  }, [fetchPRs]);

  return (
    <div className="space-y-1">
      <Select
        value={value?.toString() ?? undefined}
        onValueChange={(v) => {
          const pr = prs.find((p) => p.number.toString() === v);
          if (pr) onSelect(pr);
        }}
      >
        <SelectTrigger className="w-[400px]">
          <SelectValue
            placeholder={loading ? "Loading PRs..." : "Select a pull request"}
          />
        </SelectTrigger>
        <SelectContent>
          {prs.length === 0 && !loading && !error && (
            <SelectItem value="_empty" disabled>
              No pull requests found
            </SelectItem>
          )}
          {prs.map((pr) => (
            <SelectItem key={pr.number} value={pr.number.toString()}>
              <div className="flex items-center gap-2">
                <span
                  className={
                    pr.state === "open" ? "text-green-500" : "text-muted-foreground"
                  }
                >
                  #{pr.number}
                </span>
                <span className="truncate">{pr.title}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};
