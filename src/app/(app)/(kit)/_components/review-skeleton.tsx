"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export const ReviewSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <div>
          <p className="font-medium">Analyzing PR...</p>
          <p className="text-sm text-muted-foreground">
            The AI is reviewing your code changes and scoring importance
          </p>
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};
