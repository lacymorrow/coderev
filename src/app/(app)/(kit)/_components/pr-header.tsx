"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { PRInfo } from "@/server/services/coderev/coderev-types";

interface PRHeaderProps {
  pr: PRInfo;
}

export const PRHeader = ({ pr }: PRHeaderProps) => {
  return (
    <div className="flex items-start gap-4 rounded-lg border bg-card p-4">
      {pr.authorAvatar && (
        <Image
          src={pr.authorAvatar}
          alt={pr.author}
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-lg font-semibold">{pr.title}</h2>
          <Badge
            variant={pr.state === "open" ? "default" : "secondary"}
            className="shrink-0"
          >
            {pr.state}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          #{pr.number} by {pr.author}
        </p>
        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
          <span className="text-green-500">+{pr.additions}</span>
          <span className="text-red-500">-{pr.deletions}</span>
          <span>{pr.changedFiles} files</span>
        </div>
      </div>
    </div>
  );
};
