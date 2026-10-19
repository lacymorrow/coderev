"use client";

import { useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

interface DiffViewProps {
  diff: string;
  fileName?: string;
}

/**
 * Parse a unified diff into old and new file content.
 * Strips diff headers and reconstructs the two sides.
 */
function parseDiff(diff: string): { oldText: string; newText: string } {
  const lines = diff.split("\n");
  const oldLines: string[] = [];
  const newLines: string[] = [];

  for (const line of lines) {
    // Skip diff headers
    if (
      line.startsWith("diff --git") ||
      line.startsWith("index ") ||
      line.startsWith("---") ||
      line.startsWith("+++") ||
      line.startsWith("@@")
    ) {
      continue;
    }

    if (line.startsWith("-")) {
      oldLines.push(line.slice(1));
    } else if (line.startsWith("+")) {
      newLines.push(line.slice(1));
    } else {
      // Context line (starts with space or is empty)
      const content = line.startsWith(" ") ? line.slice(1) : line;
      oldLines.push(content);
      newLines.push(content);
    }
  }

  return {
    oldText: oldLines.join("\n"),
    newText: newLines.join("\n"),
  };
}

const darkThemeStyles = {
  variables: {
    dark: {
      diffViewerBackground: "hsl(var(--card))",
      diffViewerColor: "hsl(var(--card-foreground))",
      addedBackground: "rgba(34, 197, 94, 0.1)",
      addedColor: "hsl(var(--card-foreground))",
      removedBackground: "rgba(239, 68, 68, 0.1)",
      removedColor: "hsl(var(--card-foreground))",
      wordAddedBackground: "rgba(34, 197, 94, 0.3)",
      wordRemovedBackground: "rgba(239, 68, 68, 0.3)",
      addedGutterBackground: "rgba(34, 197, 94, 0.15)",
      removedGutterBackground: "rgba(239, 68, 68, 0.15)",
      gutterBackground: "hsl(var(--card))",
      gutterBackgroundDark: "hsl(var(--card))",
      codeFoldGutterBackground: "hsl(var(--muted))",
      codeFoldBackground: "hsl(var(--muted))",
      emptyLineBackground: "hsl(var(--card))",
    },
  },
  line: {
    padding: "2px 10px",
    fontSize: "13px",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
  },
  gutter: {
    padding: "0 10px",
    fontSize: "12px",
    minWidth: "40px",
  },
};

const lightThemeStyles = {
  variables: {
    light: {
      diffViewerBackground: "hsl(var(--card))",
      diffViewerColor: "hsl(var(--card-foreground))",
      addedBackground: "rgba(34, 197, 94, 0.08)",
      addedColor: "hsl(var(--card-foreground))",
      removedBackground: "rgba(239, 68, 68, 0.08)",
      removedColor: "hsl(var(--card-foreground))",
      wordAddedBackground: "rgba(34, 197, 94, 0.2)",
      wordRemovedBackground: "rgba(239, 68, 68, 0.2)",
      addedGutterBackground: "rgba(34, 197, 94, 0.1)",
      removedGutterBackground: "rgba(239, 68, 68, 0.1)",
      gutterBackground: "hsl(var(--card))",
      gutterBackgroundDark: "hsl(var(--card))",
      codeFoldGutterBackground: "hsl(var(--muted))",
      codeFoldBackground: "hsl(var(--muted))",
      emptyLineBackground: "hsl(var(--card))",
    },
  },
  line: {
    padding: "2px 10px",
    fontSize: "13px",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
  },
  gutter: {
    padding: "0 10px",
    fontSize: "12px",
    minWidth: "40px",
  },
};

export const DiffView = ({ diff, fileName }: DiffViewProps) => {
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { oldText, newText } = parseDiff(diff);

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
        {fileName && (
          <span className="font-mono text-xs text-muted-foreground">
            {fileName}
          </span>
        )}
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as "unified" | "split")}
          className="ml-auto"
        >
          <TabsList className="h-7">
            <TabsTrigger value="unified" className="px-2 text-xs">
              Unified
            </TabsTrigger>
            <TabsTrigger value="split" className="px-2 text-xs">
              Split
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="max-h-[500px] overflow-auto">
        <ReactDiffViewer
          oldValue={oldText}
          newValue={newText}
          splitView={viewMode === "split"}
          useDarkTheme={isDark}
          compareMethod={DiffMethod.WORDS}
          styles={isDark ? darkThemeStyles : lightThemeStyles}
          hideLineNumbers={false}
        />
      </div>
    </div>
  );
};
