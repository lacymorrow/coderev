"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type {
  PRInfo,
  ReviewResult,
} from "@/server/services/coderev/coderev-types";
import { RepoSelector } from "./repo-selector";
import { PRSelector } from "./pr-selector";
import { PRHeader } from "./pr-header";
import { ChunkList } from "./chunk-list";
import { ReviewSkeleton } from "./review-skeleton";

export const ReviewDashboard = () => {
  const [owner, setOwner] = useQueryState("owner");
  const [repo, setRepo] = useQueryState("repo");
  const [prNumber, setPrNumber] = useQueryState("pr");

  const [selectedPR, setSelectedPR] = useState<PRInfo | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const handleRepoSelect = useCallback(
    (o: string, r: string) => {
      setOwner(o);
      setRepo(r);
      setPrNumber(null);
      setSelectedPR(null);
      setResult(null);
      setError(null);
    },
    [setOwner, setRepo, setPrNumber],
  );

  const handlePRSelect = useCallback(
    (pr: PRInfo) => {
      setPrNumber(pr.number.toString());
      setSelectedPR(pr);
      setResult(null);
      setError(null);
    },
    [setPrNumber],
  );

  const handleAnalyze = useCallback(async () => {
    if (!owner || !repo || !prNumber) return;

    const currentRequestId = ++requestIdRef.current;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/coderev/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          pr: parseInt(prNumber, 10),
        }),
      });

      if (currentRequestId !== requestIdRef.current) return;

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error(data.error || "Invalid response");
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setAnalyzing(false);
      }
    }
  }, [owner, repo, prNumber]);

  const repoValue = owner && repo ? `${owner}/${repo}` : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Code Review</h1>
        <p className="text-muted-foreground">
          Select a repository and pull request to analyze
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Repository</label>
          <RepoSelector value={repoValue} onSelect={handleRepoSelect} />
        </div>

        {owner && repo && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Pull Request</label>
            <PRSelector
              owner={owner}
              repo={repo}
              value={prNumber ? parseInt(prNumber, 10) : null}
              onSelect={handlePRSelect}
            />
          </div>
        )}

        {selectedPR && (
          <Button onClick={handleAnalyze} disabled={analyzing}>
            {analyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {analyzing ? "Analyzing..." : "Analyze PR"}
          </Button>
        )}
      </div>

      {selectedPR && <PRHeader pr={selectedPR} />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {analyzing && <ReviewSkeleton />}

      {result && <ChunkList result={result} />}
    </div>
  );
};
