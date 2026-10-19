"use client";

import type { ReviewResult } from "@/server/services/coderev/coderev-types";
import { ChunkCard } from "./chunk-card";

interface ChunkListProps {
  result: ReviewResult;
}

export const ChunkList = ({ result }: ChunkListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Review Summary</h3>
          <p className="text-sm text-muted-foreground">{result.summary}</p>
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>{result.chunks.length} chunks</span>
          <span>{result.stats.filesChanged} files</span>
          <span className="text-green-500">+{result.stats.additions}</span>
          <span className="text-red-500">-{result.stats.deletions}</span>
        </div>
      </div>

      <div className="space-y-3">
        {result.chunks.map((chunk) => (
          <ChunkCard key={chunk.id} chunk={chunk} />
        ))}
      </div>
    </div>
  );
};
