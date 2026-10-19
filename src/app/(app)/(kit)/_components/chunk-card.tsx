"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SemanticChunk } from "@/server/services/coderev/coderev-types";
import { ImportanceBadge, getImportanceBorderColor } from "./importance-badge";
import { DiffView } from "./diff-view";

interface ChunkCardProps {
  chunk: SemanticChunk;
}

export const ChunkCard = ({ chunk }: ChunkCardProps) => {
  const [isOpen, setIsOpen] = useState(chunk.importance >= 7);

  return (
    <Card
      className={cn(
        "gap-0 border-l-4 py-0 transition-colors",
        getImportanceBorderColor(chunk.importance),
      )}
    >
      <CardHeader className="p-6 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{chunk.title}</CardTitle>
              <ImportanceBadge score={chunk.importance} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {chunk.explanation}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-6 pt-0">
        <div className="rounded-md bg-muted/30 p-3">
          <p className="text-sm">
            <span className="font-medium">Purpose: </span>
            {chunk.purpose}
          </p>
          {chunk.importanceReason && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium">Score rationale: </span>
              {chunk.importanceReason}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {chunk.files.map((file) => (
            <span
              key={file}
              className="rounded bg-muted px-2 py-0.5 font-mono text-xs"
            >
              {file}
            </span>
          ))}
        </div>

        {chunk.diff && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                {isOpen ? "Hide" : "Show"} diff
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <DiffView
                diff={chunk.diff}
                fileName={
                  chunk.files.length === 1 ? chunk.files[0] : undefined
                }
              />
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
