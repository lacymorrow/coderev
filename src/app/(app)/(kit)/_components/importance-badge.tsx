"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImportanceBadgeProps {
  score: number;
  className?: string;
}

function getImportanceConfig(score: number) {
  if (score <= 2) {
    return {
      label: "Trivial",
      className: "border-muted text-muted-foreground bg-muted/5",
    };
  }
  if (score <= 4) {
    return {
      label: "Low",
      className: "border-blue-400 text-blue-500 bg-blue-500/5",
    };
  }
  if (score <= 6) {
    return {
      label: "Moderate",
      className: "border-yellow-400 text-yellow-500 bg-yellow-500/5",
    };
  }
  if (score <= 8) {
    return {
      label: "High",
      className: "border-orange-400 text-orange-500 bg-orange-500/5",
    };
  }
  return {
    label: "Critical",
    className: "border-red-400 text-red-500 bg-red-500/5",
  };
}

export function getImportanceBorderColor(score: number): string {
  if (score <= 2) return "border-l-muted";
  if (score <= 4) return "border-l-blue-400";
  if (score <= 6) return "border-l-yellow-400";
  if (score <= 8) return "border-l-orange-400";
  return "border-l-red-400";
}

export const ImportanceBadge = ({ score, className }: ImportanceBadgeProps) => {
  const config = getImportanceConfig(score);

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", config.className, className)}
    >
      {score}/10 {config.label}
    </Badge>
  );
};
